#!/usr/bin/env python
"""Catalog GeneXus error(...) calls for BTERA* objects under Models/.

The script recursively finds kb.data files under a models folder, searches for
objects whose name starts with BTERA, extracts source-like parts, and writes a
catalog of error(...) calls.

Examples:
    python catalog_btera_errors.py
    python catalog_btera_errors.py --models ../Models --csv ../output/btera_errors.csv
    python catalog_btera_errors.py --prefix BTERALIES --out ../output/bteralies_errors.md
"""

from __future__ import annotations

import argparse
import csv
import gzip
import html
import json
import re
import sys
import xml.etree.ElementTree as ET
import zipfile
from dataclasses import dataclass
from pathlib import Path

from extract_kb_source import (
    DEFAULT_SOURCE_TYPES,
    EntityRecord,
    SOURCE_TYPE_IDS,
    child_keys_for,
    configure_output,
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


@dataclass
class SourcePart:
    object_name: str
    object_description: str
    part_name: str
    source: str


@dataclass
class ErrorHit:
    model: str
    kb_data: str
    object_name: str
    object_description: str
    part: str
    line: int
    code: str
    message: str
    expression: str
    source_line: str


def normalize_path(path: Path) -> str:
    return str(path.resolve())


def find_objects_by_prefix(entity_version: bytes, prefix: str) -> list[EntityRecord]:
    needle = prefix.encode("utf-16le")
    records: dict[tuple[int, int, int, int], EntityRecord] = {}

    pos = entity_version.find(needle)
    while pos >= 0:
        for candidate in range(max(0, pos - 100), pos + 1):
            record = parse_record_at(entity_version, candidate)
            if not record:
                continue
            if record.name.casefold().startswith(prefix.casefold()):
                key = (
                    record.key.type_id,
                    record.key.entity_id,
                    record.key.version_id,
                    record.offset,
                )
                records[key] = record
        pos = entity_version.find(needle, pos + 2)

    return sorted(records.values(), key=lambda item: (item.name, item.key.type_id, item.key.entity_id, item.key.version_id))


def extract_source_parts(entity_version: bytes, composition: bytes, objects: list[EntityRecord]) -> list[SourcePart]:
    links = read_composition(composition)
    parts: list[SourcePart] = []
    seen: set[tuple[str, int, int, int]] = set()

    for obj in objects:
        child_keys = child_keys_for([obj], links)
        obj_parts = [key for key in child_keys if key.type_id in DEFAULT_SOURCE_TYPES]

        # Some KB variants store source directly under the object record.
        direct_source = source_from_record(obj) or source_from_payload(gzip_payload_after_record(entity_version, obj))
        if direct_source:
            parts.append(
                SourcePart(
                    object_name=obj.name,
                    object_description=obj.description,
                    part_name=SOURCE_TYPE_IDS.get(obj.key.type_id, f"Type {obj.key.type_id}"),
                    source=direct_source,
                )
            )

        for key in obj_parts:
            marker = (obj.name, key.type_id, key.entity_id, key.version_id)
            if marker in seen:
                continue
            seen.add(marker)

            record = find_record_by_key(entity_version, key)
            if not record:
                continue
            source = source_from_record(record) or source_from_payload(gzip_payload_after_record(entity_version, record))
            if not source:
                continue
            parts.append(
                SourcePart(
                    object_name=obj.name,
                    object_description=obj.description,
                    part_name=SOURCE_TYPE_IDS.get(record.key.type_id, f"Type {record.key.type_id}"),
                    source=source,
                )
            )

    return parts


def strip_line_comment(line: str) -> str:
    in_quote: str | None = None
    index = 0
    while index < len(line):
        char = line[index]
        if in_quote:
            if char == in_quote:
                if index + 1 < len(line) and line[index + 1] == in_quote:
                    index += 2
                    continue
                in_quote = None
        elif char in ("'", '"'):
            in_quote = char
        elif char == "/" and index + 1 < len(line) and line[index + 1] == "/":
            return line[:index]
        index += 1
    return line


def uncomment_source(source: str) -> str:
    return "\n".join(strip_line_comment(line) for line in source.splitlines())


def find_matching_paren(text: str, open_index: int) -> int:
    depth = 0
    in_quote: str | None = None
    index = open_index
    while index < len(text):
        char = text[index]
        if in_quote:
            if char == in_quote:
                if index + 1 < len(text) and text[index + 1] == in_quote:
                    index += 2
                    continue
                in_quote = None
        elif char in ("'", '"'):
            in_quote = char
        elif char == "(":
            depth += 1
        elif char == ")":
            depth -= 1
            if depth == 0:
                return index
        index += 1
    return -1


def first_argument(expression: str) -> str:
    depth = 0
    in_quote: str | None = None
    for index, char in enumerate(expression):
        if in_quote:
            if char == in_quote:
                if index + 1 < len(expression) and expression[index + 1] == in_quote:
                    continue
                in_quote = None
        elif char in ("'", '"'):
            in_quote = char
        elif char == "(":
            depth += 1
        elif char == ")":
            depth -= 1
        elif char == "," and depth == 0:
            return expression[:index].strip()
    return expression.strip()


def literal_value(argument: str) -> str:
    argument = argument.strip()
    if len(argument) >= 2 and argument[0] in ("'", '"') and argument[-1] == argument[0]:
        quote = argument[0]
        value = argument[1:-1]
        return value.replace(quote + quote, quote)
    return argument


def line_number_at(text: str, index: int) -> int:
    return text.count("\n", 0, index) + 1


def source_line_at(source: str, line: int) -> str:
    lines = source.splitlines()
    if 1 <= line <= len(lines):
        return lines[line - 1].strip()
    return ""


def find_error_calls(source: str) -> list[tuple[int, str, str, str]]:
    uncommented = uncomment_source(source)
    hits: list[tuple[int, str, str, str]] = []
    pattern = re.compile(r"\berror\s*\(", re.IGNORECASE)

    for match in pattern.finditer(uncommented):
        open_index = uncommented.find("(", match.start())
        close_index = find_matching_paren(uncommented, open_index)
        if close_index < 0:
            continue
        expression = uncommented[open_index + 1 : close_index].strip()
        argument = first_argument(expression)
        line = line_number_at(uncommented, match.start())
        hits.append((line, literal_value(argument), expression, source_line_at(source, line)))

    return hits


def find_case_error_catalog(source: str) -> list[tuple[int, str, str, str]]:
    uncommented = uncomment_source(source)
    lines = uncommented.splitlines()
    hits: list[tuple[int, str, str, str]] = []
    pending_code: tuple[int, str, str] | None = None

    case_pattern = re.compile(
        r"\bcase\s+&?errorcode\s*={1,2}\s*(?P<code>\d+)\b",
        re.IGNORECASE,
    )
    string_pattern = re.compile(
        r"&?errorstring\s*=\s*(?P<value>'(?:''|[^'])*'|\"(?:\"\"|[^\"])*\")",
        re.IGNORECASE,
    )

    for index, line in enumerate(lines, start=1):
        case_match = case_pattern.search(line)
        if case_match:
            pending_code = (index, case_match.group("code"), line.strip())
            continue

        if not pending_code:
            continue

        string_match = string_pattern.search(line)
        if string_match:
            _, code, case_line = pending_code
            raw_message = string_match.group("value")
            message = literal_value(raw_message)
            expression = f"{case_line} / {line.strip()}"
            hits.append((index, code, message, expression))
            pending_code = None

    return hits


def read_sql_connection_info(kb_dir: Path) -> dict[str, str] | None:
    path = kb_dir / "knowledgebase.connection"
    if not path.exists():
        return None
    try:
        root = ET.fromstring(path.read_text(encoding="utf-8-sig"))
    except (OSError, ET.ParseError):
        return None
    return {child.tag: (child.text or "").strip() for child in root}


def sql_mdf_path(kb_dir: Path, info: dict[str, str]) -> Path | None:
    data_file = info.get("DataFile", "")
    if data_file:
        data_path = kb_dir / data_file
        if data_path.is_file():
            return data_path
    mdf_files = sorted(kb_dir.glob("*.mdf"))
    return mdf_files[0] if mdf_files else None


def sql_server_for_connection(info: dict[str, str]) -> str:
    server = info.get("ServerInstance") or r".\SQLEXPRESS"
    host = info.get("HostName", "")
    if host and server.casefold().startswith(host.casefold() + "\\"):
        return "." + server[len(host):]
    return server


def sql_server_candidates(info: dict[str, str]) -> list[str]:
    candidates: list[str] = []

    def add(value: str) -> None:
        if value and value.casefold() not in {c.casefold() for c in candidates}:
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


def sql_attach_database(master_conn, database: str, mdf_path: Path) -> None:
    if master_conn.cursor().execute("SELECT DB_ID(?)", database).fetchone()[0] is not None:
        return
    ldf_path = mdf_path.with_suffix(".ldf")
    mdf_part = f"(FILENAME = {sql_literal(str(mdf_path))})"
    if ldf_path.is_file():
        ldf_part = f"(FILENAME = {sql_literal(str(ldf_path))})"
        sql = f"CREATE DATABASE {sql_identifier(database)} ON {mdf_part}, {ldf_part} FOR ATTACH"
    else:
        sql = f"CREATE DATABASE {sql_identifier(database)} ON {mdf_part} FOR ATTACH_REBUILD_LOG"
    master_conn.cursor().execute(sql)


def sql_connect(info: dict[str, str], mdf_path: Path | None = None):
    try:
        import pyodbc
    except ImportError:
        return None

    database = info.get("DBName", "")
    if not database:
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
            except pyodbc.Error:
                if mdf_path is None:
                    continue
            try:
                master = pyodbc.connect(common + "DATABASE=master;", timeout=5, autocommit=True)
                try:
                    sql_attach_database(master, database, mdf_path)
                finally:
                    master.close()
                return pyodbc.connect(common + f"DATABASE={database};", timeout=5)
            except pyodbc.Error:
                continue
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


def sql_source_parts(kb_data: Path, prefix: str) -> list[SourcePart]:
    kb_dir = kb_data.parent
    info = read_sql_connection_info(kb_dir)
    if not info:
        return []
    mdf_path = sql_mdf_path(kb_dir, info)
    connection = sql_connect(info, mdf_path)
    if connection is None:
        return []

    parts: list[SourcePart] = []
    try:
        cursor = connection.cursor()
        objects = cursor.execute(
            """
            SELECT EntityTypeId, EntityId, EntityVersionId,
                   EntityVersionName, EntityVersionDescription
            FROM dbo.EntityVersion
            WHERE EntityVersionName LIKE ?
              AND EntityVersionName NOT LIKE '%,%'
            ORDER BY EntityVersionName, EntityVersionId DESC
            """,
            prefix + "%",
        ).fetchall()

        seen_objects: set[tuple[int, int, int]] = set()
        for obj in objects:
            key = (obj.EntityTypeId, obj.EntityId, obj.EntityVersionId)
            if key in seen_objects:
                continue
            seen_objects.add(key)

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
                obj.EntityTypeId,
                obj.EntityId,
                obj.EntityVersionId,
            ).fetchall()

            for child in children:
                part = sql_part_name(child.EntityVersionName)
                if part.casefold() not in {"procedure", "rules", "events", "conditions"}:
                    continue
                raw = bytes(child.EntityVersionData or b"")
                source = token_data_xml_to_source(decompress_entity_version_data(raw))
                if not source:
                    continue
                parts.append(
                    SourcePart(
                        object_name=obj.EntityVersionName,
                        object_description=obj.EntityVersionDescription or "",
                        part_name=part,
                        source=source,
                    )
                )
    finally:
        connection.close()

    return parts


def catalog_kb(kb_data: Path, prefix: str) -> list[ErrorHit]:
    with zipfile.ZipFile(kb_data) as archive:
        entity_version = archive.read("EntityVersion.dat")
        composition = archive.read("EntityVersionComposition.dat")

    objects = find_objects_by_prefix(entity_version, prefix)
    parts = extract_source_parts(entity_version, composition, objects)

    mdf_parts = sql_source_parts(kb_data, prefix)
    if mdf_parts:
        zip_names = {p.object_name.casefold() for p in parts}
        for sp in mdf_parts:
            if sp.object_name.casefold() not in zip_names:
                parts.append(sp)

    model = kb_data.parent.name
    hits: list[ErrorHit] = []

    for part in parts:
        for line, code, message, expression in find_case_error_catalog(part.source):
            hits.append(
                ErrorHit(
                    model=model,
                    kb_data=normalize_path(kb_data),
                    object_name=part.object_name,
                    object_description=part.object_description,
                    part=part.part_name,
                    line=line,
                    code=code,
                    message=message,
                    expression=expression,
                    source_line=source_line_at(part.source, line),
                )
            )

        for line, message, expression, source_line in find_error_calls(part.source):
            hits.append(
                ErrorHit(
                    model=model,
                    kb_data=normalize_path(kb_data),
                    object_name=part.object_name,
                    object_description=part.object_description,
                    part=part.part_name,
                    line=line,
                    code="",
                    message=message,
                    expression=expression,
                    source_line=source_line,
                )
            )

    return hits


def write_csv(path: Path, hits: list[ErrorHit]) -> None:
    with path.open("w", newline="", encoding="utf-8-sig") as file:
        writer = csv.DictWriter(file, fieldnames=list(ErrorHit.__dataclass_fields__))
        writer.writeheader()
        for hit in hits:
            writer.writerow(hit.__dict__)


def format_markdown(hits: list[ErrorHit]) -> str:
    if not hits:
        return "No se encontraron llamadas error(...) para el prefijo indicado.\n"

    lines = [
        "# Catalogo de errores BTERA",
        "",
        "| Modelo | Programa | Parte | Linea | Codigo | Mensaje |",
        "|---|---|---:|---:|---:|---|",
    ]
    for hit in hits:
        message = hit.message.replace("|", "\\|").replace("\n", " ")
        lines.append(
            f"| {hit.model} | {hit.object_name} | {hit.part} | {hit.line} | {hit.code} | {message} |"
        )
    lines.append("")
    return "\n".join(lines)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Catalog error(...) calls in BTERA* programs.")
    parser.add_argument("--kb-config", type=Path, default=DEFAULT_KB_CONFIG, help="File with the Models root path")
    parser.add_argument("--models", type=Path, help="Optional Models root folder. Overrides --kb-config")
    parser.add_argument("--prefix", default="BTERA", help="Object prefix. Default: BTERA")
    parser.add_argument("--csv", type=Path, default=DEFAULT_OUTPUT_DIR / "btera_errors.csv", help="CSV output path")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUTPUT_DIR / "btera_errors.md", help="Markdown output path")
    parser.add_argument("--json", type=Path, help="Optional JSON output path")
    return parser


def main() -> int:
    configure_output()
    args = build_parser().parse_args()

    if args.models is not None and not args.models.exists():
        print(f"No existe la carpeta de modelos: {args.models}", file=sys.stderr)
        return 2

    if args.models is None and not args.kb_config.exists():
        print(f"No existe el archivo config: {args.kb_config}", file=sys.stderr)
        return 2

    kb_files = find_kb_files(args.models, args.kb_config)
    if not kb_files:
        print(f"No encontre kb.data usando: {kb_source_description(args.models, args.kb_config)}", file=sys.stderr)
        return 2

    all_hits: list[ErrorHit] = []
    for kb_data in kb_files:
        print(f"Procesando {kb_data}...", file=sys.stderr)
        try:
            all_hits.extend(catalog_kb(kb_data, args.prefix))
        except KeyError as exc:
            print(f"  Salteado, falta tabla {exc}", file=sys.stderr)
        except zipfile.BadZipFile:
            print("  Salteado, no es ZIP valido", file=sys.stderr)

    all_hits.sort(key=lambda hit: (hit.model, hit.object_name, hit.part, hit.line, hit.message))
    args.csv.parent.mkdir(parents=True, exist_ok=True)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    if args.json:
        args.json.parent.mkdir(parents=True, exist_ok=True)
    write_csv(args.csv, all_hits)
    args.out.write_text(format_markdown(all_hits), encoding="utf-8-sig")

    if args.json:
        args.json.write_text(
            json.dumps([hit.__dict__ for hit in all_hits], ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    print(f"Errores encontrados: {len(all_hits)}")
    print(f"CSV: {args.csv}")
    print(f"Markdown: {args.out}")
    if args.json:
        print(f"JSON: {args.json}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
