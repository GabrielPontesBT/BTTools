#!/usr/bin/env python
"""Find information for a specific program/object inside a GeneXus kb.data file.

This script is intentionally targeted: instead of decoding the whole KB, it
searches the ZIP entries for the requested object name and prints nearby decoded
UTF-16LE text plus XML property blocks when available.

Examples:
    python find_kb_program.py kb.data FSD011
    python find_kb_program.py kb.data BTCCF001 --json
    python find_kb_program.py kb.data Cliente --entries OBJECT.dat EntityVersion.dat
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree


DEFAULT_ENTRIES = [
    "OBJECT.dat",
    "EntityVersion.dat",
    "Entity.dat",
    "ModelEntityProperty.dat",
    "ModelEntityOutput.dat",
    "ModelCrossReference.dat",
]


def configure_output() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")


def utf16_bytes(value: str) -> bytes:
    return value.encode("utf-16le")


def printable_text(value: str) -> str:
    value = value.replace("\x00", "")
    value = re.sub(r"[\x01-\x08\x0b\x0c\x0e-\x1f]+", " ", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def decode_window(data: bytes, center: int, before: int, after: int) -> str:
    start = max(0, center - before)
    end = min(len(data), center + after)
    if start % 2:
        start += 1
    if end % 2:
        end -= 1
    return printable_text(data[start:end].decode("utf-16le", errors="replace"))


def parse_len_string(data: bytes, offset: int) -> tuple[str, int] | None:
    if offset + 2 > len(data):
        return None

    length = int.from_bytes(data[offset : offset + 2], "little")
    end = offset + 2 + length
    if length <= 0 or length > 500 or end > len(data) or length % 2:
        return None

    text = data[offset + 2 : end].decode("utf-16le", errors="replace")
    if not text or sum(ch.isprintable() for ch in text) / len(text) < 0.85:
        return None

    return text, end


def extract_local_strings(data: bytes, center: int, radius: int = 350) -> list[str]:
    start = max(0, center - radius)
    end = min(len(data), center + radius)
    strings: list[str] = []
    seen: set[str] = set()

    for offset in range(start, end):
        parsed = parse_len_string(data, offset)
        if not parsed:
            continue
        text, _ = parsed
        text = printable_text(text)
        if len(text) >= 2 and text not in seen:
            seen.add(text)
            strings.append(text)

    return strings


def extract_properties_xml(data: bytes, center: int, radius: int = 20000) -> tuple[str, dict[str, str]] | None:
    start = max(0, center - radius)
    end = min(len(data), center + radius)
    marker = "<Properties".encode("utf-16le")
    close = "</Properties>".encode("utf-16le")
    self_close = "/>".encode("utf-16le")

    marker_at = data.rfind(marker, start, center + 1)
    if marker_at < 0:
        marker_at = data.find(marker, center, end)
    if marker_at < 0:
        return None

    close_at = data.find(close, marker_at, end)
    self_at = data.find(self_close, marker_at, min(end, marker_at + 200))
    candidates = []
    if close_at >= 0:
        candidates.append(close_at + len(close))
    if self_at >= 0:
        candidates.append(self_at + len(self_close))
    if not candidates:
        return None

    xml = data[marker_at : min(candidates)].decode("utf-16le", errors="replace")
    return xml, parse_properties(xml)


def parse_properties(xml: str) -> dict[str, str]:
    try:
        root = ElementTree.fromstring(xml)
    except ElementTree.ParseError:
        return {}

    properties: dict[str, str] = {}
    for prop in root.findall(".//Property"):
        name = prop.findtext("Name")
        value_node = prop.find("Value")
        if not name:
            continue
        value = "".join(value_node.itertext()).strip() if value_node is not None else ""
        properties[name.strip()] = value
    return properties


def find_matches(data: bytes, name: str) -> list[int]:
    needles = [utf16_bytes(name)]
    lower = name.lower()
    if lower != name:
        needles.append(utf16_bytes(lower))
    upper = name.upper()
    if upper != name:
        needles.append(utf16_bytes(upper))

    offsets: set[int] = set()
    for needle in needles:
        offset = data.find(needle)
        while offset >= 0:
            offsets.add(offset)
            offset = data.find(needle, offset + 2)
    return sorted(offsets)


def inspect_entry(entry_name: str, data: bytes, name: str, max_hits: int) -> list[dict[str, object]]:
    results = []
    for offset in find_matches(data, name)[:max_hits]:
        properties = extract_properties_xml(data, offset)
        result: dict[str, object] = {
            "entry": entry_name,
            "offset": offset,
            "strings": extract_local_strings(data, offset),
            "context": decode_window(data, offset, before=220, after=500),
        }
        if properties:
            xml, parsed = properties
            result["properties"] = parsed
            result["properties_xml"] = xml
        results.append(result)
    return results


def print_results(results: list[dict[str, object]]) -> None:
    if not results:
        print("No encontré coincidencias.")
        return

    for item in results:
        print(f"{item['entry']} @ offset {item['offset']}")

        strings = item.get("strings") or []
        if strings:
            print("  strings:")
            for value in strings[:20]:
                print(f"    - {value}")

        properties = item.get("properties") or {}
        if properties:
            print("  properties:")
            for key, value in properties.items():
                print(f"    {key}: {value}")

        print(f"  context: {item['context']}")
        print()


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Find a program/object in kb.data.")
    parser.add_argument("kb_data", type=Path, help="Path to kb.data")
    parser.add_argument("name", help="Program/object name to search")
    parser.add_argument("--json", action="store_true", help="Print results as JSON")
    parser.add_argument("--max-hits", type=int, default=10, help="Max hits per entry")
    parser.add_argument(
        "--entries",
        nargs="+",
        default=DEFAULT_ENTRIES,
        help="ZIP entries to inspect",
    )
    return parser


def main() -> int:
    configure_output()
    args = build_parser().parse_args()

    if not args.kb_data.exists():
        print(f"No existe: {args.kb_data}", file=sys.stderr)
        return 2

    results: list[dict[str, object]] = []
    try:
        with zipfile.ZipFile(args.kb_data) as archive:
            available = set(archive.namelist())
            for entry in args.entries:
                if entry not in available:
                    continue
                data = archive.read(entry)
                results.extend(inspect_entry(entry, data, args.name, args.max_hits))
    except zipfile.BadZipFile:
        print("El archivo no es un ZIP válido.", file=sys.stderr)
        return 1

    if args.json:
        print(json.dumps(results, ensure_ascii=False, indent=2))
    else:
        print_results(results)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
