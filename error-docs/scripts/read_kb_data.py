#!/usr/bin/env python
"""Read GeneXus-like kb.data ZIP files and search entities by name.

The kb.data file is a ZIP that contains binary .dat tables. This script reads
EntityVersion.dat, decodes the UTF-16LE strings and the embedded XML properties,
then filters entities by the name passed on the command line.

Examples:
    python read_kb_data.py kb.data Cliente
    python read_kb_data.py kb.data Cliente --exact
    python read_kb_data.py kb.data Cliente --json
    python read_kb_data.py kb.data Cliente --type Transaction --limit 5
    python read_kb_data.py kb.data --list-types
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
import zipfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from xml.etree import ElementTree


PROPERTIES_MARKER = "<Properties".encode("utf-16le")
PROPERTIES_CLOSE_MARKER = "</Properties>".encode("utf-16le")
SELF_CLOSE_MARKER = "/>".encode("utf-16le")


@dataclass
class EntityVersionRecord:
    entity_id: int
    version_id: int
    type_id: int
    kind: str
    subtype: str
    properties: dict[str, Any]
    offset: int
    raw_header_hex: str

    @property
    def display_name(self) -> str:
        return first_text(
            self.properties,
            "Name",
            "ObjectName",
            "QualifiedName",
            "Description",
        ) or self.subtype

    @property
    def description(self) -> str:
        return first_text(self.properties, "Description", "Title", "Caption")

    @property
    def guid(self) -> str:
        return first_text(self.properties, "GUID", "Guid", "Id")

    def to_dict(self) -> dict[str, Any]:
        return {
            "entity_id": self.entity_id,
            "version_id": self.version_id,
            "type_id": self.type_id,
            "kind": self.kind,
            "subtype": self.subtype,
            "name": self.display_name,
            "description": self.description,
            "guid": self.guid,
            "offset": self.offset,
            "properties": self.properties,
        }


def first_text(values: dict[str, Any], *names: str) -> str:
    for name in names:
        value = values.get(name)
        if isinstance(value, list):
            value = next((item for item in value if item not in (None, "")), "")
        if value not in (None, ""):
            return str(value)
    return ""


def read_u32(data: bytes, offset: int) -> tuple[int, int]:
    if offset + 4 > len(data):
        raise EOFError
    return int.from_bytes(data[offset : offset + 4], "little", signed=False), offset + 4


def read_len_string(data: bytes, offset: int) -> tuple[str, int]:
    if offset + 2 > len(data):
        raise EOFError

    byte_len = int.from_bytes(data[offset : offset + 2], "little", signed=False)
    offset += 2
    end = offset + byte_len
    if end > len(data):
        raise EOFError

    text = data[offset:end].decode("utf-16le", errors="replace")
    return text, end


def parse_properties(xml_text: str) -> dict[str, Any]:
    xml_text = xml_text.strip("\ufeff\x00\r\n\t ")
    if not xml_text:
        return {}

    try:
        root = ElementTree.fromstring(xml_text)
    except ElementTree.ParseError:
        return parse_properties_with_regex(xml_text)

    result: dict[str, Any] = {}
    for prop in root.findall(".//Property"):
        name = prop.findtext("Name")
        if not name:
            continue

        value_node = prop.find("Value")
        value = "".join(value_node.itertext()).strip() if value_node is not None else ""
        add_property(result, name.strip(), value)

    return result


def text_quality(value: str) -> float:
    if not value:
        return 0.0
    good = 0
    for char in value:
        code = ord(char)
        if char in "\r\n\t" or 32 <= code < 0xD800:
            good += 1
    return good / len(value)


def find_xml_end(data: bytes, marker_at: int) -> int | None:
    close_at = data.find(PROPERTIES_CLOSE_MARKER, marker_at)
    close_end = close_at + len(PROPERTIES_CLOSE_MARKER) if close_at >= marker_at else None

    self_at = data.find(SELF_CLOSE_MARKER, marker_at, marker_at + 120)
    self_end = self_at + len(SELF_CLOSE_MARKER) if self_at >= marker_at else None

    candidates = [value for value in (close_end, self_end) if value is not None]
    return min(candidates) if candidates else None


def find_header_start(data: bytes, marker_at: int) -> tuple[int, int, int, int, str, str, bytes] | None:
    xml_len_at = marker_at - 4
    best: tuple[float, int, int, int, int, str, str, bytes] | None = None
    window_start = max(0, marker_at - 768)

    for start in range(window_start, max(window_start, marker_at - 18)):
        try:
            offset = start
            entity_id, offset = read_u32(data, offset)
            version_id, offset = read_u32(data, offset)
            type_id, offset = read_u32(data, offset)
            kind, offset = read_len_string(data, offset)
            subtype, offset = read_len_string(data, offset)
        except EOFError:
            continue

        raw_header_len = xml_len_at - offset
        if raw_header_len < 0 or raw_header_len > 512:
            continue
        if not (0 < entity_id < 10_000_000 and 0 <= version_id < 10_000_000):
            continue
        if not (0 <= type_id < 100_000):
            continue
        if not (0 < len(kind) <= 200 and 0 <= len(subtype) <= 200):
            continue

        quality = (text_quality(kind) + text_quality(subtype or kind)) / 2
        if quality < 0.92:
            continue

        # Real headers usually end shortly before the XML length field. Prefer
        # candidates with clean text and a compact unknown header section.
        score = quality * 1000 - raw_header_len
        if best is None or score > best[0]:
            best = (
                score,
                start,
                entity_id,
                version_id,
                type_id,
                kind,
                subtype,
                data[offset:xml_len_at],
            )

    if best is None:
        return None

    _, start, entity_id, version_id, type_id, kind, subtype, raw_header = best
    return start, entity_id, version_id, type_id, kind, subtype, raw_header


def parse_properties_with_regex(xml_text: str) -> dict[str, Any]:
    result: dict[str, Any] = {}
    pattern = re.compile(
        r"<Property>\s*<Name>(?P<name>.*?)</Name>\s*<Value>(?P<value>.*?)</Value>\s*</Property>",
        re.IGNORECASE | re.DOTALL,
    )
    for match in pattern.finditer(xml_text):
        name = strip_xml(match.group("name"))
        value = strip_xml(match.group("value"))
        add_property(result, name, value)
    return result


def strip_xml(value: str) -> str:
    value = re.sub(r"<[^>]+>", "", value)
    return value.strip()


def add_property(result: dict[str, Any], name: str, value: str) -> None:
    existing = result.get(name)
    if existing is None:
        result[name] = value
    elif isinstance(existing, list):
        existing.append(value)
    else:
        result[name] = [existing, value]


def parse_entity_versions(data: bytes) -> list[EntityVersionRecord]:
    records: list[EntityVersionRecord] = []
    marker_at = data.find(PROPERTIES_MARKER)
    seen_offsets: set[int] = set()

    while marker_at >= 0:
        xml_end = find_xml_end(data, marker_at)
        header = find_header_start(data, marker_at)
        if xml_end is not None and header is not None:
            start, entity_id, version_id, type_id, kind, subtype, raw_header = header
            if start not in seen_offsets:
                seen_offsets.add(start)
                xml_text = data[marker_at:xml_end].decode("utf-16le", errors="replace")
                records.append(
                    EntityVersionRecord(
                        entity_id=entity_id,
                        version_id=version_id,
                        type_id=type_id,
                        kind=kind,
                        subtype=subtype,
                        properties=parse_properties(xml_text),
                        offset=start,
                        raw_header_hex=raw_header.hex(" "),
                    )
                )

        marker_at = data.find(PROPERTIES_MARKER, marker_at + len(PROPERTIES_MARKER))

    return records


def read_entity_versions(kb_data: Path) -> list[EntityVersionRecord]:
    with zipfile.ZipFile(kb_data) as archive:
        try:
            data = archive.read("EntityVersion.dat")
        except KeyError as exc:
            raise RuntimeError("EntityVersion.dat was not found inside kb.data") from exc
    return parse_entity_versions(data)


def searchable_text(record: EntityVersionRecord) -> str:
    parts = [
        record.kind,
        record.subtype,
        record.display_name,
        record.description,
        first_text(record.properties, "QualifiedName", "ObjectName"),
    ]
    return "\n".join(part for part in parts if part)


def filter_records(
    records: list[EntityVersionRecord],
    name: str | None,
    exact: bool,
    type_filter: str | None,
) -> list[EntityVersionRecord]:
    filtered = records

    if type_filter:
        needle = type_filter.casefold()
        filtered = [
            record
            for record in filtered
            if needle in record.kind.casefold() or needle in record.subtype.casefold()
        ]

    if name:
        needle = name.casefold()
        if exact:
            filtered = [
                record
                for record in filtered
                if record.display_name.casefold() == needle
                or first_text(record.properties, "Name").casefold() == needle
            ]
        else:
            filtered = [
                record
                for record in filtered
                if needle in searchable_text(record).casefold()
            ]

    return filtered


def print_table(records: list[EntityVersionRecord], show_properties: bool) -> None:
    if not records:
        print("No entities found.")
        return

    for record in records:
        print(
            f"{record.display_name} | {record.kind}/{record.subtype} | "
            f"entity_id={record.entity_id} version_id={record.version_id}"
        )
        if record.description:
            print(f"  description: {record.description}")
        if record.guid:
            print(f"  guid: {record.guid}")
        if show_properties:
            for key in sorted(record.properties):
                print(f"  {key}: {record.properties[key]}")
        print()


def write_csv(path: Path, records: list[EntityVersionRecord]) -> None:
    with path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(
            file,
            fieldnames=[
                "entity_id",
                "version_id",
                "type_id",
                "kind",
                "subtype",
                "name",
                "description",
                "guid",
                "offset",
            ],
        )
        writer.writeheader()
        for record in records:
            row = record.to_dict()
            row.pop("properties", None)
            writer.writerow(row)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Search entities in a kb.data ZIP file.")
    parser.add_argument("kb_data", type=Path, help="Path to kb.data")
    parser.add_argument("name", nargs="?", help="Entity name or text to search")
    parser.add_argument("--exact", action="store_true", help="Match the entity name exactly")
    parser.add_argument("--type", help="Filter by kind/subtype, for example Transaction")
    parser.add_argument("--limit", type=int, default=20, help="Maximum results to print")
    parser.add_argument("--json", action="store_true", help="Print full decoded records as JSON")
    parser.add_argument("--csv", type=Path, help="Write a summary CSV")
    parser.add_argument(
        "--properties",
        action="store_true",
        help="Print all decoded properties in table mode",
    )
    parser.add_argument("--list-types", action="store_true", help="List entity types and exit")
    return parser


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")

    args = build_parser().parse_args()

    if not args.kb_data.exists():
        print(f"File not found: {args.kb_data}", file=sys.stderr)
        return 2

    try:
        records = read_entity_versions(args.kb_data)
    except (zipfile.BadZipFile, RuntimeError) as exc:
        print(str(exc), file=sys.stderr)
        return 1

    if args.list_types:
        for value in sorted({f"{record.kind}/{record.subtype}" for record in records}):
            print(value)
        return 0

    matches = filter_records(records, args.name, args.exact, args.type)
    limited = matches[: args.limit] if args.limit and args.limit > 0 else matches

    if args.csv:
        write_csv(args.csv, matches)
        print(f"CSV written: {args.csv}")
        return 0

    if args.json:
        print(json.dumps([record.to_dict() for record in limited], ensure_ascii=False, indent=2))
    else:
        print_table(limited, args.properties)
        if len(matches) > len(limited):
            print(f"Showing {len(limited)} of {len(matches)} matches. Use --limit 0 for all.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
