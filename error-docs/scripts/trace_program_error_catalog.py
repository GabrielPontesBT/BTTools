#!/usr/bin/env python
"""Build a recursive unified error catalog starting from one GeneXus program.

For each queued program, the script:
  - searches it in all Models/**/kb.data files
  - extracts source-like parts
  - finds error codes on lines that contain "err" and a number after "="
  - finds calls to other programs:
      MODULE.SUBMODULE.PGM(...)
      call(PGM, ...)
      something.call(PGM, ...)
  - queues newly discovered programs and repeats until the queue is empty

Examples:
    python trace_program_error_catalog.py BTERALIES
    python trace_program_error_catalog.py BTA0000000 --csv ../output/trace.csv --out ../output/trace.md
"""

from __future__ import annotations

import argparse
import csv
import gzip
import hashlib
import html
import json
import pickle
import re
import sys
import zipfile
from collections import deque
from dataclasses import dataclass
from pathlib import Path
import xml.etree.ElementTree as ET

from catalog_btera_errors import strip_line_comment
from catalog_btera_errors import literal_value
from extract_kb_source import (
    DEFAULT_SOURCE_TYPES,
    EntityRecord,
    EntityKey,
    SOURCE_TYPE_IDS,
    configure_output,
    find_object_records,
    find_record_by_key,
    gzip_payload_after_record,
    parse_record_at,
    read_composition,
    source_from_payload,
    source_from_record,
)
from kb_config import DEFAULT_KB_CONFIG, DEFAULT_MODELS_DIR, find_kb_files, kb_source_description


BASE_DIR = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT_DIR = BASE_DIR / "output"
DEFAULT_CACHE_DIR = DEFAULT_OUTPUT_DIR / "cache" / "kb_index"
KB_INDEX_CACHE_VERSION = 1


IGNORED_QUALIFIED_PREFIXES = {
    "GUID",
    "DateTime",
    "String",
    "Math",
    "HttpClient",
    "Regex",
    "File",
    "Directory",
}

IGNORED_CALLEE_PREFIXES = ("BTERA",)


@dataclass
class KbCache:
    model: str
    path: Path
    entity_version: bytes
    composition: bytes
    links: list
    object_index: dict[str, list[EntityRecord]]
    record_index: dict[EntityKey, EntityRecord]
    child_index: dict[EntityKey, list[EntityKey]]


@dataclass
class SourcePart:
    model: str
    kb_data: str
    object_name: str
    object_description: str
    part: str
    source: str


_SQL_SOURCE_CACHE: dict[tuple[str, str], list[SourcePart]] = {}
_SQL_UNAVAILABLE_DIRS: set[str] = set()
_SQL_UNAVAILABLE_REASONS: dict[str, str] = {}
_SQL_CONNECTION_ERRORS: dict[str, list[str]] = {}


@dataclass
class ErrorEntry:
    root_program: str
    program: str
    model: str
    part: str
    line: int
    code: str
    message: str
    catalog_program: str
    catalog_model: str
    catalog_part: str
    catalog_line: str
    source_line: str


@dataclass
class CallEntry:
    caller: str
    caller_model: str
    callee: str
    call_text: str
    part: str
    line: int


def build_entity_indexes(entity_version: bytes) -> tuple[dict[str, list[EntityRecord]], dict[EntityKey, EntityRecord]]:
    xml_marker = "<Properties".encode("utf-16le")
    object_index: dict[str, list[EntityRecord]] = {}
    record_index: dict[EntityKey, EntityRecord] = {}
    seen_offsets: set[int] = set()

    marker_at = entity_version.find(xml_marker)
    while marker_at >= 0:
        for candidate in range(marker_at, max(0, marker_at - 768) - 1, -1):
            if candidate in seen_offsets:
                continue
            record = parse_record_at(entity_version, candidate)
            if not record:
                continue
            seen_offsets.add(record.offset)
            record_index.setdefault(record.key, record)
            object_index.setdefault(record.name.casefold(), []).append(record)
            break
        marker_at = entity_version.find(xml_marker, marker_at + len(xml_marker))

    return object_index, record_index


def build_child_index(links: list[tuple[EntityKey, EntityKey]]) -> dict[EntityKey, list[EntityKey]]:
    child_index: dict[EntityKey, list[EntityKey]] = {}
    for left, right in links:
        if right.type_id in SOURCE_TYPE_IDS:
            child_index.setdefault(left, []).append(right)
        if left.type_id in SOURCE_TYPE_IDS:
            child_index.setdefault(right, []).append(left)
    return child_index


def kb_index_cache_path(kb_data: Path, cache_dir: Path = DEFAULT_CACHE_DIR) -> Path:
    digest = hashlib.sha1(str(kb_data.resolve()).encode("utf-8")).hexdigest()[:16]
    return cache_dir / f"{kb_data.parent.name}_{digest}.pickle"


def kb_index_fingerprint(kb_data: Path) -> dict[str, object]:
    stat = kb_data.stat()
    return {
        "version": KB_INDEX_CACHE_VERSION,
        "path": str(kb_data.resolve()),
        "size": stat.st_size,
        "mtime_ns": stat.st_mtime_ns,
    }


def load_kb_index_cache(kb_data: Path) -> tuple[
    dict[str, list[EntityRecord]],
    dict[EntityKey, EntityRecord],
    list[tuple[EntityKey, EntityKey]],
    dict[EntityKey, list[EntityKey]],
] | None:
    cache_path = kb_index_cache_path(kb_data)
    if not cache_path.exists():
        return None
    try:
        with cache_path.open("rb") as file:
            payload = pickle.load(file)
    except (OSError, pickle.PickleError, EOFError, AttributeError, ValueError):
        return None
    if not isinstance(payload, dict):
        return None
    if payload.get("fingerprint") != kb_index_fingerprint(kb_data):
        return None
    try:
        return (
            payload["object_index"],
            payload["record_index"],
            payload["links"],
            payload["child_index"],
        )
    except KeyError:
        return None


def save_kb_index_cache(
    kb_data: Path,
    object_index: dict[str, list[EntityRecord]],
    record_index: dict[EntityKey, EntityRecord],
    links: list[tuple[EntityKey, EntityKey]],
    child_index: dict[EntityKey, list[EntityKey]],
) -> None:
    cache_path = kb_index_cache_path(kb_data)
    payload = {
        "fingerprint": kb_index_fingerprint(kb_data),
        "object_index": object_index,
        "record_index": record_index,
        "links": links,
        "child_index": child_index,
    }
    try:
        cache_path.parent.mkdir(parents=True, exist_ok=True)
        with cache_path.open("wb") as file:
            pickle.dump(payload, file, protocol=pickle.HIGHEST_PROTOCOL)
    except OSError:
        return


def load_kbs(models_dir: Path | None = None, config_path: Path = DEFAULT_KB_CONFIG) -> list[KbCache]:
    caches: list[KbCache] = []
    for kb_data in find_kb_files(models_dir, config_path):
        with zipfile.ZipFile(kb_data) as archive:
            entity_version = archive.read("EntityVersion.dat")
            composition = archive.read("EntityVersionComposition.dat")
        cached_index = load_kb_index_cache(kb_data)
        if cached_index:
            object_index, record_index, links, child_index = cached_index
        else:
            object_index, record_index = build_entity_indexes(entity_version)
            links = read_composition(composition)
            child_index = build_child_index(links)
            save_kb_index_cache(kb_data, object_index, record_index, links, child_index)
        caches.append(
            KbCache(
                model=kb_data.parent.name,
                path=kb_data.resolve(),
                entity_version=entity_version,
                composition=composition,
                links=links,
                object_index=object_index,
                record_index=record_index,
                child_index=child_index,
            )
        )
    return caches


def extract_source_parts(kb: KbCache, program: str) -> list[SourcePart]:
    objects = kb.object_index.get(program.casefold(), [])
    if not objects:
        objects = find_object_records(kb.entity_version, program)
    parts: list[SourcePart] = []
    seen: set[tuple[int, int, int, str]] = set()

    for obj in objects:
        direct = source_from_record(obj) or source_from_payload(
            gzip_payload_after_record(kb.entity_version, obj)
        )
        if direct and obj.key.type_id in DEFAULT_SOURCE_TYPES:
            parts.append(
                SourcePart(
                    model=kb.model,
                    kb_data=str(kb.path),
                    object_name=obj.name,
                    object_description=obj.description,
                    part=SOURCE_TYPE_IDS.get(obj.key.type_id, f"Type {obj.key.type_id}"),
                    source=direct,
                )
            )

        for key in kb.child_index.get(obj.key, []):
            if key.type_id not in DEFAULT_SOURCE_TYPES:
                continue
            marker = (key.type_id, key.entity_id, key.version_id, obj.name)
            if marker in seen:
                continue
            seen.add(marker)

            record = kb.record_index.get(key) or find_record_by_key(kb.entity_version, key)
            if not record:
                continue
            source = source_from_record(record) or source_from_payload(
                gzip_payload_after_record(kb.entity_version, record)
            )
            if not source:
                continue
            parts.append(
                SourcePart(
                    model=kb.model,
                    kb_data=str(kb.path),
                    object_name=obj.name,
                    object_description=obj.description,
                    part=SOURCE_TYPE_IDS.get(record.key.type_id, f"Type {record.key.type_id}"),
                    source=source,
                )
            )

    return parts


def uncomment_source(source: str) -> str:
    return "\n".join(strip_line_comment(line) for line in source.splitlines())


def message_after_error_code(lines: list[str], start_index: int) -> str:
    message_pattern = re.compile(
        r"&?[A-Za-z0-9_]*err(?:or)?[A-Za-z0-9_]*string\s*=\s*(?P<value>'(?:''|[^'])*'|\"(?:\"\"|[^\"])*\")",
        re.IGNORECASE,
    )
    for line in lines[start_index + 1 : min(len(lines), start_index + 6)]:
        match = message_pattern.search(line)
        if match:
            return literal_value(match.group("value"))
        if re.search(r"\bcase\b|\bif\b|\bendif\b|\bendcase\b", line, re.IGNORECASE):
            break
    return ""


def find_error_codes(source: str) -> list[tuple[int, str, str, str]]:
    hits: list[tuple[int, str, str, str]] = []
    pattern = re.compile(r"=\s*(?P<code>\d{2,})\b")
    lines = uncomment_source(source).splitlines()

    for index, line in enumerate(lines):
        if "err" not in line.casefold():
            continue
        for match in pattern.finditer(line):
            hits.append(
                (
                    index + 1,
                    match.group("code"),
                    message_after_error_code(lines, index),
                    line.strip(),
                )
            )

    return hits


def split_args(args: str) -> list[str]:
    result: list[str] = []
    start = 0
    depth = 0
    quote: str | None = None
    index = 0
    while index < len(args):
        char = args[index]
        if quote:
            if char == quote:
                if index + 1 < len(args) and args[index + 1] == quote:
                    index += 2
                    continue
                quote = None
        elif char in ("'", '"'):
            quote = char
        elif char == "(":
            depth += 1
        elif char == ")":
            depth -= 1
        elif char == "," and depth == 0:
            result.append(args[start:index].strip())
            start = index + 1
        index += 1
    tail = args[start:].strip()
    if tail:
        result.append(tail)
    return result


def find_matching_paren(text: str, open_index: int) -> int:
    depth = 0
    quote: str | None = None
    index = open_index
    while index < len(text):
        char = text[index]
        if quote:
            if char == quote:
                if index + 1 < len(text) and text[index + 1] == quote:
                    index += 2
                    continue
                quote = None
        elif char in ("'", '"'):
            quote = char
        elif char == "(":
            depth += 1
        elif char == ")":
            depth -= 1
            if depth == 0:
                return index
        index += 1
    return -1


def normalize_program_name(value: str) -> str:
    value = value.strip().strip("'\"")
    if "." in value:
        value = value.split(".")[-1]
    return value.strip()


def is_candidate_program(name: str) -> bool:
    if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", name):
        return False
    if len(name) < 3:
        return False
    if name.casefold() in {"newguid", "toString".casefold(), "trim", "now", "today"}:
        return False
    return any(char.isdigit() for char in name) or name.upper() == name or name.startswith(("BT", "BTR", "BTE", "PP", "PR", "GX"))


def find_program_calls(source: str) -> list[tuple[int, str, str]]:
    text = uncomment_source(source)
    calls: dict[tuple[int, str, str], tuple[int, str, str]] = {}

    call_pattern = re.compile(r"\b(?:[A-Za-z_][A-Za-z0-9_]*\.)?call\s*\(", re.IGNORECASE)
    for match in call_pattern.finditer(text):
        open_index = text.find("(", match.start())
        close_index = find_matching_paren(text, open_index)
        if close_index < 0:
            continue
        args = split_args(text[open_index + 1 : close_index])
        if not args:
            continue
        callee = normalize_program_name(args[0])
        if not is_candidate_program(callee):
            continue
        line = text.count("\n", 0, match.start()) + 1
        call_text = text[match.start() : close_index + 1].strip()
        calls[(line, callee.casefold(), call_text)] = (line, callee, call_text)

    qualified_pattern = re.compile(
        r"\b(?P<qualified>[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)+)\s*\("
    )
    for match in qualified_pattern.finditer(text):
        qualified = match.group("qualified")
        prefix = qualified.split(".")[0]
        if prefix in IGNORED_QUALIFIED_PREFIXES:
            continue
        if qualified.lower().endswith(".call"):
            continue
        callee = normalize_program_name(qualified)
        if not is_candidate_program(callee):
            continue
        open_index = text.find("(", match.start())
        close_index = find_matching_paren(text, open_index)
        if close_index < 0:
            continue
        line = text.count("\n", 0, match.start()) + 1
        call_text = text[match.start() : close_index + 1].strip()
        calls[(line, callee.casefold(), call_text)] = (line, callee, call_text)

    return sorted(calls.values(), key=lambda item: (item[0], item[1].casefold(), item[2]))


def possible_sql_kb_dirs(kb: KbCache) -> list[Path]:
    return [kb.path.parent]


def sql_mdf_path(kb_dir: Path, info: dict[str, str]) -> Path | None:
    data_file = info.get("DataFile", "")
    if data_file:
        data_path = kb_dir / data_file
        if data_path.is_file():
            return data_path
    mdf_files = sorted(kb_dir.glob("*.mdf"))
    return mdf_files[0] if mdf_files else None


def read_sql_connection_info(kb_dir: Path) -> dict[str, str] | None:
    path = kb_dir / "knowledgebase.connection"
    if not path.exists():
        return None
    try:
        root = ET.fromstring(path.read_text(encoding="utf-8-sig"))
    except (OSError, ET.ParseError):
        return None
    return {child.tag: (child.text or "").strip() for child in root}


def sql_server_for_connection(info: dict[str, str]) -> str:
    server = info.get("ServerInstance") or r".\SQLEXPRESS"
    host = info.get("HostName", "")
    if host and server.casefold().startswith(host.casefold() + "\\"):
        return "." + server[len(host) :]
    return server


def sql_server_candidates(info: dict[str, str]) -> list[str]:
    candidates: list[str] = []

    def add(value: str) -> None:
        if value and value.casefold() not in {item.casefold() for item in candidates}:
            candidates.append(value)

    server = sql_server_for_connection(info)
    add(server)
    if "\\" in server:
        instance = server.split("\\", 1)[1]
        add(".\\" + instance)
        add("(local)\\" + instance)
    add(r".\SQLEXPRESS")
    add(r"(localdb)\MSSQLLocalDB")
    return candidates


def sql_driver_candidates(pyodbc) -> list[str]:
    available = set(pyodbc.drivers())
    preferred = ["ODBC Driver 18 for SQL Server", "ODBC Driver 17 for SQL Server"]
    drivers = [driver for driver in preferred if driver in available]
    return drivers or preferred


def sql_literal(value: str) -> str:
    return "N'" + value.replace("'", "''") + "'"


def sql_identifier(value: str) -> str:
    return "[" + value.replace("]", "]]") + "]"


def sql_attach_database(master_connection, database: str, mdf_path: Path) -> None:
    if master_connection.cursor().execute("SELECT DB_ID(?)", database).fetchone()[0] is not None:
        return
    ldf_path = mdf_path.with_suffix(".ldf")
    mdf_part = f"(FILENAME = {sql_literal(str(mdf_path))})"
    if ldf_path.is_file():
        ldf_part = f"(FILENAME = {sql_literal(str(ldf_path))})"
        sql = f"CREATE DATABASE {sql_identifier(database)} ON {mdf_part}, {ldf_part} FOR ATTACH"
    else:
        sql = f"CREATE DATABASE {sql_identifier(database)} ON {mdf_part} FOR ATTACH_REBUILD_LOG"
    master_connection.cursor().execute(sql)


def sql_connect(info: dict[str, str], mdf_path: Path | None = None, error_key: str = ""):
    errors: list[str] = []
    try:
        import pyodbc
    except ImportError as exc:
        if error_key:
            _SQL_CONNECTION_ERRORS[error_key] = [f"No se pudo importar pyodbc: {exc}"]
        return None

    database = info.get("DBName", "")
    if not database:
        if error_key:
            _SQL_CONNECTION_ERRORS[error_key] = ["knowledgebase.connection no tiene DBName"]
        return None
    for driver in sql_driver_candidates(pyodbc):
        for server in sql_server_candidates(info):
            common = (
                f"DRIVER={{{driver}}};"
                f"SERVER={server};"
                "Trusted_Connection=yes;"
                "Encrypt=no;"
                "TrustServerCertificate=yes;"
            )
            try:
                return pyodbc.connect(common + f"DATABASE={database};", timeout=5)
            except pyodbc.Error as exc:
                errors.append(f"{driver} / {server} / DB {database}: {exc}")
                if mdf_path is None:
                    continue
            try:
                master = pyodbc.connect(common + "DATABASE=master;", timeout=5, autocommit=True)
                try:
                    sql_attach_database(master, database, mdf_path)
                finally:
                    master.close()
                return pyodbc.connect(common + f"DATABASE={database};", timeout=5)
            except pyodbc.Error as exc:
                errors.append(f"{driver} / {server} / attach {mdf_path}: {exc}")
                continue
    if error_key:
        _SQL_CONNECTION_ERRORS[error_key] = errors[:8]
    return None


def decompress_entity_version_data(data: bytes) -> str:
    if not data:
        return ""
    gzip_at = data.find(b"\x1f\x8b")
    payload = data[gzip_at:] if gzip_at >= 0 else data
    try:
        payload = gzip.decompress(payload)
    except OSError:
        pass
    for encoding in ("utf-8", "utf-16le", "latin1"):
        try:
            text = payload.decode(encoding)
        except UnicodeDecodeError:
            continue
        printable = sum(char.isprintable() or char in "\r\n\t" for char in text) / max(1, len(text))
        if printable > 0.80:
            return text
    return ""


def token_data_xml_to_source(text: str) -> str:
    if not text.lstrip().startswith("<TokenDataList"):
        return text
    try:
        root = ET.fromstring(text)
    except ET.ParseError:
        return text
    pieces: list[str] = []
    for token_data in root.findall(".//TokenData"):
        word = token_data.findtext("Word")
        if word:
            pieces.append(html.unescape(word))
    return "".join(pieces)


def sql_part_name(entity_version_name: str) -> str:
    if "," not in entity_version_name:
        return entity_version_name
    return entity_version_name.split(",", 1)[1].strip()


def sql_source_parts_from_connection(kb: KbCache, kb_dir: Path, program: str) -> list[SourcePart]:
    cache_key = (str(kb_dir.resolve()).casefold(), program.casefold())
    kb_dir_key = str(kb_dir.resolve()).casefold()
    if cache_key in _SQL_SOURCE_CACHE:
        return _SQL_SOURCE_CACHE[cache_key]
    if kb_dir_key in _SQL_UNAVAILABLE_DIRS:
        return []

    info = read_sql_connection_info(kb_dir)
    if not info:
        _SQL_UNAVAILABLE_DIRS.add(kb_dir_key)
        _SQL_UNAVAILABLE_REASONS[kb_dir_key] = "No existe o no se pudo leer knowledgebase.connection"
        return []

    source_path = sql_mdf_path(kb_dir, info)
    if source_path is None:
        _SQL_UNAVAILABLE_DIRS.add(kb_dir_key)
        _SQL_UNAVAILABLE_REASONS[kb_dir_key] = "No se encontro ningun .mdf al mismo nivel que kb.data"
        return []
    source_name = str(source_path)

    connection = sql_connect(info, source_path, kb_dir_key)
    if connection is None:
        _SQL_UNAVAILABLE_DIRS.add(kb_dir_key)
        _SQL_UNAVAILABLE_REASONS[kb_dir_key] = "No se pudo conectar/adjuntar el MDF con SQL Server local"
        return []

    parts: list[SourcePart] = []
    try:
        cursor = connection.cursor()
        object_row = cursor.execute(
            """
            SELECT TOP 1 EntityTypeId, EntityId, EntityVersionId,
                   EntityVersionName, EntityVersionDescription
            FROM dbo.EntityVersion
            WHERE LOWER(EntityVersionName) = LOWER(?)
            ORDER BY EntityVersionId DESC
            """,
            program,
        ).fetchone()
        if not object_row:
            _SQL_SOURCE_CACHE[cache_key] = []
            return []

        children = cursor.execute(
            """
            SELECT ev.EntityVersionName, ev.EntityVersionData
            FROM dbo.EntityVersionComposition c
            JOIN dbo.EntityVersion ev
              ON ev.EntityTypeId = c.ComponentEntityTypeId
             AND ev.EntityId = c.ComponentEntityId
             AND ev.EntityVersionId = c.ComponentEntityVersionId
            WHERE c.CompoundEntityTypeId = ?
              AND c.CompoundEntityId = ?
              AND c.CompoundEntityVersionId = ?
            ORDER BY c.ComponentEntityTypeId, c.ComponentEntityId, c.ComponentEntityVersionId
            """,
            object_row.EntityTypeId,
            object_row.EntityId,
            object_row.EntityVersionId,
        ).fetchall()

        for child in children:
            part = sql_part_name(child.EntityVersionName)
            if part.casefold() not in {"procedure", "rules", "events", "conditions", "documentation", "help"}:
                continue
            raw = bytes(child.EntityVersionData or b"")
            source = token_data_xml_to_source(decompress_entity_version_data(raw))
            if not source:
                continue
            parts.append(
                SourcePart(
                    model=kb.model,
                    kb_data=source_name,
                    object_name=object_row.EntityVersionName,
                    object_description=object_row.EntityVersionDescription,
                    part=part,
                    source=source,
                )
            )
    finally:
        connection.close()

    _SQL_SOURCE_CACHE[cache_key] = parts
    return parts


def extract_sql_source_parts(kb: KbCache, program: str) -> list[SourcePart]:
    for kb_dir in possible_sql_kb_dirs(kb):
        parts = sql_source_parts_from_connection(kb, kb_dir, program)
        if parts:
            return parts
    return []


def resolve_program(kbs: list[KbCache], program: str) -> list[SourcePart]:
    parts: list[SourcePart] = []
    for kb in kbs:
        parts.extend(extract_source_parts(kb, program))
    if parts:
        return parts
    for kb in kbs:
        parts.extend(extract_sql_source_parts(kb, program))
    return parts


def diagnose_program_resolution(kbs: list[KbCache], program: str) -> list[str]:
    lines: list[str] = []
    key = program.casefold()
    raw_needles = [
        program.encode("ascii", errors="ignore"),
        program.upper().encode("ascii", errors="ignore"),
        program.casefold().encode("ascii", errors="ignore"),
        program.encode("utf-16le"),
        program.upper().encode("utf-16le"),
        program.casefold().encode("utf-16le"),
    ]
    raw_needles = [value for value in raw_needles if value]

    def raw_entry_hits(kb: KbCache) -> list[str]:
        hits: list[str] = []
        try:
            with zipfile.ZipFile(kb.path) as archive:
                for name in archive.namelist():
                    if not name.casefold().endswith(".dat"):
                        continue
                    data = archive.read(name)
                    if any(value in data for value in raw_needles):
                        hits.append(name)
        except (OSError, zipfile.BadZipFile):
            return hits
        return hits

    lines.append(f"Programa: {program}")
    lines.append(f"KBs cargadas: {len(kbs)}")
    lines.append("Diagnostico version: data-raw-search-v2")
    if not kbs:
        lines.append("No se cargo ningun kb.data.")
        return lines

    data_hits = [kb for kb in kbs if kb.object_index.get(key) or find_object_records(kb.entity_version, program)]
    raw_hits = [kb for kb in kbs if raw_entry_hits(kb)]
    if data_hits:
        lines.append("Encontrado por nombre en kb.data:")
        for kb in data_hits:
            lines.append(f"- {kb.model}: {kb.path}")
    elif raw_hits:
        lines.append("El texto del programa aparece dentro del kb.data, pero no se pudo parsear como objeto fuente:")
        for kb in raw_hits:
            lines.append(f"- {kb.model}: {kb.path} ({', '.join(raw_entry_hits(kb))})")
    else:
        lines.append("No aparece por nombre exacto en ningun kb.data cargado.")

    prefix = program[: max(3, min(len(program), 6))].casefold()
    similar: list[tuple[str, str]] = []
    for kb in kbs:
        names = sorted(
            {records[0].name for name, records in kb.object_index.items() if name.startswith(prefix)},
            key=str.casefold,
        )
        for name in names[:10]:
            similar.append((kb.model, name))
    if similar:
        lines.append(f"Nombres indexados que empiezan con {program[: max(3, min(len(program), 6))]}:")
        for model, name in similar[:50]:
            lines.append(f"- {model}: {name}")
    else:
        lines.append(f"No hay nombres indexados que empiecen con {program[: max(3, min(len(program), 6))]}.")

    lines.append("Resumen de indices kb.data:")
    for kb in kbs:
        entry_hits = raw_entry_hits(kb)
        raw = ", ".join(entry_hits) if entry_hits else "no"
        parsed = "si" if (kb.object_index.get(key) or find_object_records(kb.entity_version, program)) else "no"
        lines.append(f"- {kb.model}: objetos_indexados={len(kb.object_index)} texto_crudo={raw} objeto_parseado={parsed}")

    lines.append("Fallback MDF revisado por KB:")
    for kb in data_hits or kbs:
        kb_dir = kb.path.parent
        info = read_sql_connection_info(kb_dir)
        mdf = sql_mdf_path(kb_dir, info or {})
        reason = _SQL_UNAVAILABLE_REASONS.get(str(kb_dir.resolve()).casefold(), "")
        connection_errors = _SQL_CONNECTION_ERRORS.get(str(kb_dir.resolve()).casefold(), [])
        lines.append(f"- {kb.model}:")
        lines.append(f"  kb.data: {kb.path}")
        lines.append(f"  carpeta: {kb_dir}")
        lines.append(f"  knowledgebase.connection: {'si' if info else 'no'}")
        lines.append(f"  mdf: {mdf if mdf else 'no'}")
        if reason:
            lines.append(f"  SQL: {reason}")
        for error in connection_errors:
            lines.append(f"  detalle: {error}")
    return lines


def load_master_catalog(path: Path) -> dict[str, list[dict[str, str]]]:
    if not path.exists():
        return {}
    with path.open("r", encoding="utf-8-sig", newline="") as file:
        rows = list(csv.DictReader(file))
    catalog: dict[str, list[dict[str, str]]] = {}
    for row in rows:
        code = (row.get("code") or "").strip()
        if not code:
            continue
        catalog.setdefault(code, []).append(row)
    return catalog


def matching_catalog_rows(
    master_catalog: dict[str, list[dict[str, str]]],
    code: str,
    current_program: str,
    current_model: str,
    include_all_matches: bool,
) -> list[dict[str, str]]:
    rows = master_catalog.get(code) or []
    if include_all_matches:
        return rows

    same_program = [
        row for row in rows
        if (row.get("object_name") or "").casefold() == current_program.casefold()
        and (row.get("model") or "").casefold() == current_model.casefold()
    ]
    if same_program:
        rows = same_program

    deduped: list[dict[str, str]] = []
    seen: set[tuple[str, str, str]] = set()
    for row in rows:
        marker = (
            row.get("message", ""),
            row.get("object_name", ""),
            row.get("model", ""),
        )
        if marker in seen:
            continue
        seen.add(marker)
        deduped.append(row)
    return deduped[:1]


def trace(
    root_program: str,
    kbs: list[KbCache],
    master_catalog: dict[str, list[dict[str, str]]],
    max_programs: int,
    include_all_catalog_matches: bool,
    verbose: bool,
) -> tuple[list[ErrorEntry], list[CallEntry], list[str]]:
    queue = deque([root_program])
    queued = {root_program.casefold()}
    processed: set[str] = set()
    unresolved: list[str] = []
    errors: list[ErrorEntry] = []
    calls: list[CallEntry] = []
    seen_errors: set[tuple[str, str, str, int, str]] = set()
    seen_calls: set[tuple[str, str, str]] = set()

    while queue:
        program = queue.popleft()
        key = program.casefold()
        if key in processed:
            continue
        if len(processed) >= max_programs:
            break
        processed.add(key)

        if verbose:
            print(f"Procesando {program}...", file=sys.stderr)
        parts = resolve_program(kbs, program)
        if not parts:
            unresolved.append(program)
            continue

        for part in parts:
            for line, code, message, source_line in find_error_codes(part.source):
                catalog_rows = matching_catalog_rows(
                    master_catalog,
                    code,
                    part.object_name,
                    part.model,
                    include_all_catalog_matches,
                )
                if catalog_rows:
                    for catalog_row in catalog_rows:
                        marker = (
                            part.model,
                            part.object_name.casefold(),
                            part.part,
                            line,
                            code,
                            catalog_row.get("object_name", ""),
                            catalog_row.get("model", ""),
                        )
                        if marker in seen_errors:
                            continue
                        seen_errors.add(marker)
                        errors.append(
                            ErrorEntry(
                                root_program=root_program,
                                program=part.object_name,
                                model=part.model,
                                part=part.part,
                                line=line,
                                code=code,
                                message=catalog_row.get("message", "") or message,
                                catalog_program=catalog_row.get("object_name", ""),
                                catalog_model=catalog_row.get("model", ""),
                                catalog_part=catalog_row.get("part", ""),
                                catalog_line=catalog_row.get("line", ""),
                                source_line=source_line,
                            )
                        )
                else:
                    marker = (part.model, part.object_name.casefold(), part.part, line, code)
                    if marker in seen_errors:
                        continue
                    seen_errors.add(marker)
                    errors.append(
                        ErrorEntry(
                            root_program=root_program,
                            program=part.object_name,
                            model=part.model,
                            part=part.part,
                            line=line,
                            code=code,
                            message=message,
                            catalog_program="",
                            catalog_model="",
                            catalog_part="",
                            catalog_line="",
                            source_line=source_line,
                        )
                    )

            for line, callee, call_text in find_program_calls(part.source):
                if callee.upper().startswith(IGNORED_CALLEE_PREFIXES):
                    continue

                call_marker = (part.object_name.casefold(), callee.casefold(), call_text)
                if call_marker not in seen_calls:
                    seen_calls.add(call_marker)
                    calls.append(
                        CallEntry(
                            caller=part.object_name,
                            caller_model=part.model,
                            callee=callee,
                            call_text=call_text,
                            part=part.part,
                            line=line,
                        )
                    )
                callee_key = callee.casefold()
                if callee_key not in queued and callee_key not in processed:
                    queued.add(callee_key)
                    queue.append(callee)

    return errors, calls, unresolved


def dedupe_errors_by_code(errors: list[ErrorEntry]) -> list[ErrorEntry]:
    def score(item: ErrorEntry) -> tuple[int, int, int]:
        same_catalog_program = int(item.catalog_program.casefold() == item.program.casefold())
        has_message = int(bool(item.message))
        has_catalog = int(bool(item.catalog_program))
        return same_catalog_program, has_message, has_catalog

    best: dict[str, ErrorEntry] = {}
    for item in errors:
        current = best.get(item.code)
        if current is None or score(item) > score(current):
            best[item.code] = item
    return sorted(best.values(), key=lambda item: (int(item.code) if item.code.isdigit() else 10**18, item.code))


def write_csv(path: Path, rows: list[object]) -> None:
    if not rows:
        path.write_text("", encoding="utf-8-sig")
        return
    fieldnames = list(rows[0].__dataclass_fields__)
    with path.open("w", newline="", encoding="utf-8-sig") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow(row.__dict__)


def markdown(errors: list[ErrorEntry], calls: list[CallEntry], unresolved: list[str]) -> str:
    lines = ["# Catalogo recursivo de errores", ""]
    lines.extend([
        "## Errores",
        "",
        "| Modelo | Programa | Parte | Linea | Codigo | Mensaje catalogado | Catalogo | Linea fuente |",
        "|---|---|---|---:|---:|---|---|---|",
    ])
    for item in errors:
        source_line = item.source_line.replace("|", "\\|")
        message = item.message.replace("|", "\\|")
        catalog = f"{item.catalog_model}/{item.catalog_program}".strip("/")
        lines.append(f"| {item.model} | {item.program} | {item.part} | {item.line} | {item.code} | {message} | {catalog} | {source_line} |")

    lines.extend(["", "## Llamados", "", "| Caller | Modelo | Parte | Linea | Callee | Llamado |", "|---|---|---|---:|---|---|"])
    for item in calls:
        call_text = item.call_text.replace("|", "\\|")
        lines.append(f"| {item.caller} | {item.caller_model} | {item.part} | {item.line} | {item.callee} | {call_text} |")

    if unresolved:
        lines.extend(["", "## No Resueltos", ""])
        for item in unresolved:
            lines.append(f"- {item}")

    lines.append("")
    return "\n".join(lines)


def error_message_markdown(errors: list[ErrorEntry]) -> str:
    lines = [
        "| cod_err | err_msg |",
        "|---:|---|",
    ]
    for item in dedupe_errors_by_code(errors):
        message = item.message.replace("|", "\\|")
        lines.append(f"| {item.code} | {message} |")
    lines.append("")
    return "\n".join(lines)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Trace program calls and build a unified error-code catalog.")
    parser.add_argument("program", help="Initial program name")
    parser.add_argument("--kb-config", type=Path, default=DEFAULT_KB_CONFIG, help="File with the Models root path")
    parser.add_argument("--models", type=Path, help="Optional Models root folder. Overrides --kb-config")
    parser.add_argument("--csv", type=Path, default=DEFAULT_OUTPUT_DIR / "recursive_error_catalog.csv")
    parser.add_argument("--calls-csv", type=Path, default=DEFAULT_OUTPUT_DIR / "recursive_calls.csv")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUTPUT_DIR / "recursive_error_catalog.md")
    parser.add_argument("--errors-md", type=Path, default=DEFAULT_OUTPUT_DIR / "recursive_errors_simple.md")
    parser.add_argument(
        "--master-catalog",
        type=Path,
        default=DEFAULT_OUTPUT_DIR / "btera_errors.csv",
        help="Catalogo maestro generado por catalog_btera_errors.py",
    )
    parser.add_argument("--json", type=Path, help="Optional JSON output with errors/calls/unresolved")
    parser.add_argument("--max-programs", type=int, default=500, help="Safety limit. Default: 500")
    parser.add_argument("--verbose", action="store_true", help="Print every processed program")
    parser.add_argument(
        "--all-catalog-matches",
        action="store_true",
        help="Include every master-catalog row with the same code. Default keeps the best single match.",
    )
    return parser


def main() -> int:
    configure_output()
    args = build_parser().parse_args()

    if args.models is not None and not args.models.exists():
        print(f"No existe la carpeta: {args.models}", file=sys.stderr)
        return 2

    if args.models is None and not args.kb_config.exists():
        print(f"No existe el archivo config: {args.kb_config}", file=sys.stderr)
        return 2

    kbs = load_kbs(args.models, args.kb_config)
    if not kbs:
        print(f"No encontre kb.data usando {kb_source_description(args.models, args.kb_config)}", file=sys.stderr)
        return 2

    master_catalog = load_master_catalog(args.master_catalog)
    if not master_catalog:
        print(
            f"Advertencia: no pude cargar catalogo maestro {args.master_catalog}; "
            "los mensajes saldran solo desde el source local si existen.",
            file=sys.stderr,
        )

    errors, calls, unresolved = trace(
        args.program,
        kbs,
        master_catalog,
        args.max_programs,
        args.all_catalog_matches,
        args.verbose,
    )
    errors = dedupe_errors_by_code(errors)
    calls.sort(key=lambda item: (item.caller, item.callee, item.part, item.line))

    args.csv.parent.mkdir(parents=True, exist_ok=True)
    args.calls_csv.parent.mkdir(parents=True, exist_ok=True)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.errors_md.parent.mkdir(parents=True, exist_ok=True)
    if args.json:
        args.json.parent.mkdir(parents=True, exist_ok=True)

    write_csv(args.csv, errors)
    write_csv(args.calls_csv, calls)
    args.out.write_text(markdown(errors, calls, unresolved), encoding="utf-8-sig")
    args.errors_md.write_text(error_message_markdown(errors), encoding="utf-8-sig")

    if args.json:
        args.json.write_text(
            json.dumps(
                {
                    "errors": [item.__dict__ for item in errors],
                    "calls": [item.__dict__ for item in calls],
                    "unresolved": unresolved,
                },
                ensure_ascii=False,
                indent=2,
            ),
            encoding="utf-8",
        )

    print(f"Programas con llamados detectados: {len({item.caller for item in calls} | {item.callee for item in calls})}")
    print(f"Errores catalogados: {len(errors)}")
    print(f"Llamados catalogados: {len(calls)}")
    print(f"No resueltos: {len(unresolved)}")
    print(f"CSV errores: {args.csv}")
    print(f"CSV llamados: {args.calls_csv}")
    print(f"Markdown: {args.out}")
    print(f"Markdown errores simple: {args.errors_md}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
