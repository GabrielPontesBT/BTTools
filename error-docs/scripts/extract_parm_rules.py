#!/usr/bin/env python
"""Extract GeneXus Parm(...) rules for one program from Models/**/kb.data.

The script intentionally prefers Rules/SDRules parts. Use --fallback-any-part
only as a diagnostic when a KB extraction does not expose Rules for an object.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import html
import pickle
import re
import sys
import zipfile
from dataclasses import dataclass
from pathlib import Path

from trace_program_error_catalog import (
    DEFAULT_KB_CONFIG,
    DEFAULT_OUTPUT_DIR,
    KbCache,
    find_matching_paren,
    kb_index_fingerprint,
    load_kbs,
    resolve_program,
    split_args,
)


DEFAULT_PROPERTY_PARM_CACHE_DIR = DEFAULT_OUTPUT_DIR / "cache" / "property_parms"
PROPERTY_PARM_CACHE_VERSION = 1
_MODEL_PROPERTY_DATA_CACHE: dict[str, bytes | None] = {}
_MODEL_PROPERTY_PARMS_CACHE: dict[tuple[str, str], list["ParmEntry"]] = {}


@dataclass
class ParmEntry:
    program: str
    model: str
    part: str
    source_kind: str
    parm_index: int
    position: int
    direction: str
    parameter: str
    parm_text: str


def property_parm_cache_path(kb: KbCache, program: str) -> Path:
    key = f"{kb.path.resolve()}::{program.casefold()}"
    digest = hashlib.sha1(key.encode("utf-8")).hexdigest()[:24]
    return DEFAULT_PROPERTY_PARM_CACHE_DIR / f"{kb.model}_{digest}.pickle"


def parm_entry_to_tuple(entry: ParmEntry) -> tuple[str, str, str, str, int, int, str, str, str]:
    return (
        entry.program,
        entry.model,
        entry.part,
        entry.source_kind,
        entry.parm_index,
        entry.position,
        entry.direction,
        entry.parameter,
        entry.parm_text,
    )


def tuple_to_parm_entry(value: tuple[str, str, str, str, int, int, str, str, str]) -> ParmEntry:
    return ParmEntry(
        program=value[0],
        model=value[1],
        part=value[2],
        source_kind=value[3],
        parm_index=value[4],
        position=value[5],
        direction=value[6],
        parameter=value[7],
        parm_text=value[8],
    )


def property_parm_cache_fingerprint(kb: KbCache, program: str) -> dict[str, object]:
    fingerprint = kb_index_fingerprint(kb.path)
    fingerprint["version"] = PROPERTY_PARM_CACHE_VERSION
    fingerprint["program"] = program.casefold()
    return fingerprint


def load_property_parm_cache(kb: KbCache, program: str) -> list[ParmEntry] | None:
    cache_path = property_parm_cache_path(kb, program)
    if not cache_path.exists():
        return None
    try:
        with cache_path.open("rb") as file:
            payload = pickle.load(file)
    except (OSError, pickle.PickleError, EOFError, AttributeError, ValueError):
        return None
    if not isinstance(payload, dict):
        return None
    if payload.get("fingerprint") != property_parm_cache_fingerprint(kb, program):
        return None
    entries = payload.get("entries")
    if not isinstance(entries, list):
        return None
    try:
        return [tuple_to_parm_entry(entry) for entry in entries]
    except (IndexError, TypeError):
        return None


def save_property_parm_cache(kb: KbCache, program: str, entries: list[ParmEntry]) -> None:
    cache_path = property_parm_cache_path(kb, program)
    payload = {
        "fingerprint": property_parm_cache_fingerprint(kb, program),
        "entries": [parm_entry_to_tuple(entry) for entry in entries],
    }
    try:
        cache_path.parent.mkdir(parents=True, exist_ok=True)
        with cache_path.open("wb") as file:
            pickle.dump(payload, file, protocol=pickle.HIGHEST_PROTOCOL)
    except OSError:
        return


def model_property_data(kb: KbCache) -> bytes | None:
    cache_key = str(kb.path.resolve())
    if cache_key in _MODEL_PROPERTY_DATA_CACHE:
        return _MODEL_PROPERTY_DATA_CACHE[cache_key]
    try:
        with zipfile.ZipFile(kb.path) as archive:
            data = archive.read("ModelEntityProperty.dat")
    except (KeyError, OSError, zipfile.BadZipFile):
        data = None
    _MODEL_PROPERTY_DATA_CACHE[cache_key] = data
    return data


def configure_output() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")


def clean_source(source: str) -> str:
    return html.unescape(source).replace("\r\n", "\n").replace("\r", "\n")


def find_parm_blocks(source: str) -> list[str]:
    text = clean_source(source)
    blocks: list[str] = []
    for match in re.finditer(r"\bparm\s*\(", text, re.IGNORECASE):
        open_index = text.find("(", match.start())
        close_index = find_matching_paren(text, open_index)
        if close_index < 0:
            continue
        blocks.append(text[match.start() : close_index + 1].strip())
    return blocks


def parse_parm_block(block: str) -> list[tuple[int, str, str]]:
    open_index = block.find("(")
    close_index = find_matching_paren(block, open_index)
    if open_index < 0 or close_index < 0:
        return []

    params: list[tuple[int, str, str]] = []
    for position, raw in enumerate(split_args(block[open_index + 1 : close_index]), start=1):
        value = re.sub(r"/\*.*?\*/", "", raw, flags=re.DOTALL).strip()
        direction = "in"
        match = re.match(r"(?i)^(?P<direction>inout|in|out)\s*:\s*(?P<value>.+)$", value)
        if match:
            direction = match.group("direction").casefold()
            value = match.group("value").strip()
        if re.fullmatch(r"&[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*", value):
            params.append((position, direction, value))
    return params


def parm_signature(entries: list[ParmEntry]) -> tuple[tuple[int, str, str], ...]:
    return tuple((entry.position, entry.direction, entry.parameter.casefold()) for entry in entries)


def source_kind(part_name: str) -> str:
    lower = part_name.casefold()
    if "rules" in lower:
        return "rules"
    return "fallback"


def signature_parm_text(params: list[tuple[int, str, str]]) -> str:
    parts: list[str] = []
    for _, direction, parameter in params:
        if direction == "in":
            parts.append(f"in:{parameter}")
        elif direction == "out":
            parts.append(f"out:{parameter}")
        elif direction == "inout":
            parts.append(f"inout:{parameter}")
        else:
            parts.append(parameter)
    return "Parm(" + ", ".join(parts) + ");"


def decode_utf16_blob(data: bytes) -> str:
    return data.decode("utf-16le", errors="replace").replace("\x00", "")


def access_to_direction(access: str) -> str:
    access = access.strip().upper()
    if access == "PARM_OUT":
        return "out"
    if access == "PARM_INOUT":
        return "inout"
    return "in"


def extract_signature_params(xml_fragment: str) -> list[tuple[int, str, str]]:
    params: list[tuple[int, str, str]] = []
    for position, block in enumerate(re.findall(r"<parameter\b.*?</parameter>", xml_fragment, flags=re.IGNORECASE | re.DOTALL), start=1):
        access_match = re.search(r"<access>(?P<access>.*?)</access>", block, flags=re.IGNORECASE | re.DOTALL)
        name_match = re.search(r"<name>(?P<name>.*?)</name>", block, flags=re.IGNORECASE | re.DOTALL)
        if not name_match:
            continue
        name = html.unescape(re.sub(r"\s+", "", name_match.group("name")))
        if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*", name):
            continue
        direction = access_to_direction(access_match.group("access") if access_match else "PARM_IN")
        params.append((position, direction, f"&{name}"))
    return params


def model_property_parms(kb: KbCache, program: str) -> list[ParmEntry]:
    cache_key = (str(kb.path.resolve()), program.casefold())
    cached = _MODEL_PROPERTY_PARMS_CACHE.get(cache_key)
    if cached is not None:
        return list(cached)

    persisted = load_property_parm_cache(kb, program)
    if persisted is not None:
        _MODEL_PROPERTY_PARMS_CACHE[cache_key] = persisted
        return list(persisted)

    data = model_property_data(kb)
    if not data:
        _MODEL_PROPERTY_PARMS_CACHE[cache_key] = []
        save_property_parm_cache(kb, program, [])
        return []

    marker = program.encode("utf-16le")
    pos = data.find(marker)
    entries: list[ParmEntry] = []
    seen_blocks: set[str] = set()

    while pos >= 0:
        window = decode_utf16_blob(data[pos : min(len(data), pos + 250_000)])
        start = window.find("<signatures")
        end = window.find("</signatures>", start)
        if start >= 0 and end >= 0:
            fragment = window[start : end + len("</signatures>")]
            params = extract_signature_params(fragment)
            if params:
                parm_text = signature_parm_text(params)
                if parm_text not in seen_blocks:
                    seen_blocks.add(parm_text)
                    for position, direction, parameter in params:
                        entries.append(
                            ParmEntry(
                                program=program,
                                model=kb.model,
                                part="ModelEntityProperty",
                                source_kind="model_property",
                                parm_index=len(seen_blocks),
                                position=position,
                                direction=direction,
                                parameter=parameter,
                                parm_text=parm_text,
                            )
                        )
        pos = data.find(marker, pos + len(marker))

    _MODEL_PROPERTY_PARMS_CACHE[cache_key] = entries
    save_property_parm_cache(kb, program, entries)
    return entries


def extract_program_parms(kbs: list[KbCache], program: str, fallback_any_part: bool, include_duplicates: bool) -> list[ParmEntry]:
    rules_entries: list[ParmEntry] = []
    for kb in kbs:
        parts = resolve_program([kb], program)
        selected = [part for part in parts if "rules" in part.part.casefold()]
        for part in selected:
            for parm_index, block in enumerate(find_parm_blocks(part.source), start=1):
                parsed = parse_parm_block(block)
                if not parsed:
                    continue
                rules_entries.extend(
                    ParmEntry(
                        program=part.object_name,
                        model=part.model,
                        part=part.part,
                        source_kind=source_kind(part.part),
                        parm_index=parm_index,
                        position=position,
                        direction=direction,
                        parameter=parameter,
                        parm_text=block,
                    )
                    for position, direction, parameter in parsed
                )

    source_entries = rules_entries
    if not source_entries:
        for kb in kbs:
            source_entries.extend(model_property_parms(kb, program))

    if fallback_any_part and not source_entries:
        for kb in kbs:
            for part in resolve_program([kb], program):
                for parm_index, block in enumerate(find_parm_blocks(part.source), start=1):
                    parsed = parse_parm_block(block)
                    if not parsed:
                        continue
                    source_entries.extend(
                        ParmEntry(
                            program=part.object_name,
                            model=part.model,
                            part=part.part,
                            source_kind=source_kind(part.part),
                            parm_index=parm_index,
                            position=position,
                            direction=direction,
                            parameter=parameter,
                            parm_text=block,
                        )
                        for position, direction, parameter in parsed
                    )

    entries: list[ParmEntry] = []
    seen_signatures: set[tuple[tuple[int, str, str], ...]] = set()
    for _, group in group_entries_by_block(source_entries):
        block_entries = list(group)
        signature = parm_signature(block_entries)
        if not include_duplicates and signature in seen_signatures:
            continue
        seen_signatures.add(signature)
        entries.extend(block_entries)
    return entries


def group_entries_by_block(entries: list[ParmEntry]) -> list[tuple[tuple[str, str, str, int], list[ParmEntry]]]:
    grouped: dict[tuple[str, str, str, int], list[ParmEntry]] = {}
    for entry in entries:
        key = (entry.model, entry.part, entry.source_kind, entry.parm_index)
        grouped.setdefault(key, []).append(entry)
    return list(grouped.items())


def write_csv(path: Path, entries: list[ParmEntry]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8-sig") as file:
        fieldnames = list(ParmEntry.__dataclass_fields__)
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        for entry in entries:
            writer.writerow(entry.__dict__)


def markdown(entries: list[ParmEntry], program: str) -> str:
    lines = [
        f"# Parm rules: {program}",
        "",
        "| Modelo | Parte | Origen | Pos | Direccion | Parametro |",
        "|---|---|---|---:|---|---|",
    ]
    for entry in entries:
        lines.append(
            f"| {entry.model} | {entry.part} | {entry.source_kind} | "
            f"{entry.position} | {entry.direction} | {entry.parameter} |"
        )
    if not entries:
        lines.extend(["", "No se encontraron reglas Parm(...) en partes Rules/SDRules."])
    lines.append("")
    return "\n".join(lines)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Extract Parm(...) rules for one GeneXus program.")
    parser.add_argument("program")
    parser.add_argument("--kb-config", type=Path, default=DEFAULT_KB_CONFIG, help="File with the Models root path")
    parser.add_argument("--models", type=Path, help="Optional Models root folder. Overrides --kb-config")
    parser.add_argument("--csv", type=Path)
    parser.add_argument("--out", type=Path)
    parser.add_argument(
        "--fallback-any-part",
        action="store_true",
        help="If no Rules/SDRules part is found, also search any extracted part. Diagnostic only.",
    )
    parser.add_argument("--include-duplicates", action="store_true", help="Show duplicate Parm signatures found in multiple models/parts.")
    return parser


def main() -> int:
    configure_output()
    args = build_parser().parse_args()
    csv_path = args.csv or DEFAULT_OUTPUT_DIR / f"{args.program.lower()}_parm_rules.csv"
    md_path = args.out or DEFAULT_OUTPUT_DIR / f"{args.program.lower()}_parm_rules.md"

    kbs = load_kbs(args.models, args.kb_config)
    entries = extract_program_parms(kbs, args.program, args.fallback_any_part, args.include_duplicates)
    write_csv(csv_path, entries)
    md_path.parent.mkdir(parents=True, exist_ok=True)
    md_path.write_text(markdown(entries, args.program), encoding="utf-8-sig")

    print(f"Parametros encontrados: {len(entries)}")
    print(f"CSV: {csv_path}")
    print(f"Markdown: {md_path}")
    if not entries and not args.fallback_any_part:
        print("Tip: use --fallback-any-part para diagnosticar Parm(...) fuera de Rules/SDRules.", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
