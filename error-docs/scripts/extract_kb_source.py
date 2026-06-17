#!/usr/bin/env python
"""Extract source-like parts for one object from a GeneXus kb.data file.

The kb.data file is a ZIP with binary .dat tables. This script keeps the scan
bounded and prints only parts that look like source/rules/events/procedure text.

Usage:
    python extract_kb_source.py kb.data FSD011
    python extract_kb_source.py kb.data FSD011 --part Rules
    python extract_kb_source.py kb.data FSD011 --out FSD011.txt
"""

from __future__ import annotations

import argparse
import gzip
import html
import re
import struct
import sys
import zipfile
import zlib
from dataclasses import dataclass
from pathlib import Path
from xml.etree import ElementTree


SOURCE_TYPE_IDS = {
    70: "Conditions",
    78: "Events",
    80: "DataProviderSource",
    81: "ProcedureSource",
    83: "Rules",
    86: "Variables",
    87: "WinForm",
    88: "WebForm",
    113: "Parameters",
    114: "SDConditions",
    115: "SDEvents",
    116: "SDVariables",
    117: "SDRules",
}

DEFAULT_SOURCE_TYPES = {78, 80, 81, 83, 115, 117}

XML_OPEN = "<Properties".encode("utf-16le")
XML_CLOSE = "</Properties>".encode("utf-16le")
XML_SELF_CLOSE = "/>".encode("utf-16le")


@dataclass(frozen=True)
class EntityKey:
    type_id: int
    entity_id: int
    version_id: int


@dataclass
class EntityRecord:
    key: EntityKey
    name: str
    description: str
    properties: dict[str, str]
    offset: int


def configure_output() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")


def read_len_string(data: bytes, offset: int) -> tuple[str, int] | None:
    if offset + 2 > len(data):
        return None
    length = int.from_bytes(data[offset : offset + 2], "little")
    if length <= 0 or length > 1000 or length % 2:
        return None
    start = offset + 2
    end = start + length
    if end > len(data):
        return None
    text = data[start:end].decode("utf-16le", errors="replace")
    if not sane_text(text):
        return None
    return text, end


def read_optional_len_string(data: bytes, offset: int) -> tuple[str, int] | None:
    if offset + 2 > len(data):
        return None
    length = int.from_bytes(data[offset : offset + 2], "little")
    if length == 0:
        return "", offset + 2
    return read_len_string(data, offset)


def sane_text(text: str) -> bool:
    if not text:
        return False
    good = sum(ch in "\r\n\t" or 32 <= ord(ch) < 0xD800 for ch in text)
    return good / len(text) >= 0.9


def find_xml_end(data: bytes, start: int) -> int | None:
    close = data.find(XML_CLOSE, start)
    self_close = data.find(XML_SELF_CLOSE, start, min(len(data), start + 200))
    candidates = []
    if close >= 0:
        candidates.append(close + len(XML_CLOSE))
    if self_close >= 0:
        candidates.append(self_close + len(XML_SELF_CLOSE))
    return min(candidates) if candidates else None


def parse_properties(xml_text: str) -> dict[str, str]:
    try:
        root = ElementTree.fromstring(xml_text)
    except ElementTree.ParseError:
        return {}

    values: dict[str, str] = {}
    for prop in root.findall(".//Property"):
        name = prop.findtext("Name")
        value_node = prop.find("Value")
        if not name:
            continue
        value = "".join(value_node.itertext()).strip() if value_node is not None else ""
        values[name.strip()] = value
    return values


def parse_record_at(data: bytes, offset: int) -> EntityRecord | None:
    if offset < 0 or offset + 16 > len(data):
        return None
    try:
        type_id, entity_id, version_id = struct.unpack_from("<III", data, offset)
    except struct.error:
        return None
    if not (0 < type_id < 500 and 0 <= entity_id < 10_000_000 and 0 <= version_id < 10_000_000):
        return None

    pos = offset + 12
    parsed_name = read_len_string(data, pos)
    if not parsed_name:
        return None
    name, pos = parsed_name

    parsed_desc = read_optional_len_string(data, pos)
    if not parsed_desc:
        return None
    description, pos = parsed_desc

    xml_start = data.find(XML_OPEN, pos, min(len(data), pos + 512))
    properties: dict[str, str] = {}
    if xml_start >= 0:
        xml_end = find_xml_end(data, xml_start)
        if xml_end:
            xml_text = data[xml_start:xml_end].decode("utf-16le", errors="replace")
            properties = parse_properties(xml_text)

    return EntityRecord(
        key=EntityKey(type_id=type_id, entity_id=entity_id, version_id=version_id),
        name=name,
        description=description,
        properties=properties,
        offset=offset,
    )


def find_object_records(data: bytes, object_name: str) -> list[EntityRecord]:
    needle = object_name.encode("utf-16le")
    offsets: set[int] = set()
    records: list[EntityRecord] = []

    pos = data.find(needle)
    while pos >= 0:
        for candidate in range(max(0, pos - 80), pos + 1):
            record = parse_record_at(data, candidate)
            if not record:
                continue
            if record.name.casefold() == object_name.casefold():
                if record.offset not in offsets:
                    offsets.add(record.offset)
                    records.append(record)
        pos = data.find(needle, pos + 2)

    return records


def read_composition(data: bytes) -> list[tuple[EntityKey, EntityKey]]:
    links: list[tuple[EntityKey, EntityKey]] = []
    for offset in range(0, len(data) - 23, 24):
        a_type, a_id, a_ver, b_type, b_id, b_ver = struct.unpack_from("<6I", data, offset)
        a = EntityKey(a_type, a_id, a_ver)
        b = EntityKey(b_type, b_id, b_ver)
        links.append((a, b))
    return links


def child_keys_for(objects: list[EntityRecord], links: list[tuple[EntityKey, EntityKey]]) -> list[EntityKey]:
    object_keys = {record.key for record in objects}
    children: list[EntityKey] = []
    seen: set[EntityKey] = set()

    for left, right in links:
        candidate = None
        if left in object_keys and right.type_id in SOURCE_TYPE_IDS:
            candidate = right
        elif right in object_keys and left.type_id in SOURCE_TYPE_IDS:
            candidate = left

        if candidate and candidate not in seen:
            seen.add(candidate)
            children.append(candidate)

    return children


def find_record_by_key(data: bytes, key: EntityKey) -> EntityRecord | None:
    pattern = struct.pack("<III", key.type_id, key.entity_id, key.version_id)
    pos = data.find(pattern)
    while pos >= 0:
        record = parse_record_at(data, pos)
        if record and record.key == key:
            return record
        pos = data.find(pattern, pos + 1)
    return None


def clean_source(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def source_from_record(record: EntityRecord) -> str:
    for key in ("Source", "Text", "Code", "Rules", "Events", "Procedure", "Content"):
        value = record.properties.get(key)
        if value:
            return clean_source(value)

    candidates = [record.description, record.name]
    for value in candidates:
        if "\n" in value or any(token in value.lower() for token in ("parm(", "for each", "sub ", "event ")):
            return clean_source(value)
    return ""


def gzip_payload_after_record(data: bytes, record: EntityRecord) -> bytes:
    start = record.offset
    search_end = min(len(data), start + 2_000_000)
    gzip_at = data.find(b"\x1f\x8b\x08", start, search_end)
    if gzip_at < 0:
        return b""
    chunk = data[gzip_at:search_end]
    try:
        decompressor = zlib.decompressobj(16 + zlib.MAX_WBITS)
        return decompressor.decompress(chunk)
    except zlib.error:
        try:
            return gzip.decompress(chunk)
        except (EOFError, OSError):
            return b""


def decode_payload(payload: bytes) -> str:
    if not payload:
        return ""
    if payload.startswith(b"\xff\xfe") or payload.startswith(b"<\x00"):
        return payload.decode("utf-16le", errors="replace")
    return payload.decode("utf-8", errors="replace")


def token_data_to_source(xml_text: str) -> str:
    try:
        root = ElementTree.fromstring(xml_text)
    except ElementTree.ParseError:
        return ""
    if root.tag != "TokenDataList":
        return ""
    parts: list[str] = []
    for item in root.findall(".//TokenData"):
        word = item.findtext("Word")
        if word is not None:
            parts.append(html.unescape(word))
    return clean_source("".join(parts))


def source_from_payload(payload: bytes) -> str:
    text = decode_payload(payload)
    if not text:
        return ""
    token_source = token_data_to_source(text)
    if token_source:
        return token_source
    return clean_source(text)


def extract_sources(kb_data: Path, object_name: str, include_layout: bool) -> tuple[list[EntityRecord], list[tuple[EntityRecord, str]]]:
    with zipfile.ZipFile(kb_data) as archive:
        entity_version = archive.read("EntityVersion.dat")
        composition = archive.read("EntityVersionComposition.dat")

    objects = find_object_records(entity_version, object_name)
    links = read_composition(composition)
    child_keys = child_keys_for(objects, links)
    wanted_types = set(SOURCE_TYPE_IDS) if include_layout else DEFAULT_SOURCE_TYPES

    sources: list[tuple[EntityRecord, str]] = []
    for key in child_keys:
        if key.type_id not in wanted_types:
            continue
        record = find_record_by_key(entity_version, key)
        if not record:
            continue
        source = source_from_record(record)
        if not source:
            source = source_from_payload(gzip_payload_after_record(entity_version, record))
        if source:
            sources.append((record, source))

    return objects, sources


def format_output(object_name: str, objects: list[EntityRecord], sources: list[tuple[EntityRecord, str]], part: str | None) -> str:
    lines: list[str] = []
    if not objects:
        return f"No encontre el objeto {object_name!r} en EntityVersion.dat."

    lines.append(f"Objeto: {object_name}")
    for record in objects:
        lines.append(
            f"  key: type={record.key.type_id} id={record.key.entity_id} version={record.key.version_id} "
            f"name={record.name!r} desc={record.description!r}"
        )

    filtered = sources
    if part:
        needle = part.casefold()
        filtered = [
            item for item in sources
            if needle in SOURCE_TYPE_IDS.get(item[0].key.type_id, "").casefold()
            or needle in item[0].name.casefold()
            or needle in item[0].description.casefold()
        ]

    if not filtered:
        lines.append("")
        lines.append("No encontre partes de source asociadas por EntityVersionComposition.dat.")
        lines.append("Esto puede pasar si el source esta en otro blob/tabla no enlazado de forma simple.")
        return "\n".join(lines)

    for record, source in filtered:
        title = SOURCE_TYPE_IDS.get(record.key.type_id, f"Type {record.key.type_id}")
        lines.append("")
        lines.append(f"--- {title}: {record.name or record.description} ---")
        lines.append(source)

    return "\n".join(lines)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Extract source for one object from kb.data.")
    parser.add_argument("kb_data", type=Path)
    parser.add_argument("object_name")
    parser.add_argument("--part", help="Filter part name, e.g. Source, Rules, Events")
    parser.add_argument(
        "--include-layout",
        action="store_true",
        help="Also include forms/layout/variables XML. By default only source/rules/events are printed.",
    )
    parser.add_argument("--out", type=Path, help="Write output to a text file")
    return parser


def main() -> int:
    configure_output()
    args = build_parser().parse_args()

    if not args.kb_data.exists():
        print(f"No existe: {args.kb_data}", file=sys.stderr)
        return 2

    try:
        objects, sources = extract_sources(args.kb_data, args.object_name, args.include_layout)
    except KeyError as exc:
        print(f"Falta una tabla dentro del ZIP: {exc}", file=sys.stderr)
        return 1
    except zipfile.BadZipFile:
        print("El archivo no es un ZIP valido.", file=sys.stderr)
        return 1

    output = format_output(args.object_name, objects, sources, args.part)
    if args.out:
        args.out.write_text(output, encoding="utf-8")
        print(f"Escrito: {args.out}")
    else:
        print(output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
