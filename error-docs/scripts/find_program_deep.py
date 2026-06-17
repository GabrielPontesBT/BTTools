#!/usr/bin/env python
"""Find a program name in every suspicious file under the configured Models root."""

from __future__ import annotations

import argparse
import sys
import zipfile
from pathlib import Path

from kb_config import DEFAULT_KB_CONFIG, read_models_root


SUSPICIOUS_SUFFIXES = {
    "",
    ".data",
    ".dat",
    ".mdf",
    ".xml",
    ".xpz",
    ".txt",
    ".gxw",
    ".gxp",
    ".sql",
}


def configure_output() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")


def needles(program: str) -> list[bytes]:
    values = {
        program.encode("ascii", errors="ignore"),
        program.casefold().encode("ascii", errors="ignore"),
        program.upper().encode("ascii", errors="ignore"),
        program.encode("utf-16le"),
        program.upper().encode("utf-16le"),
    }
    return [value for value in values if value]


def contains_program(data: bytes, search_values: list[bytes]) -> bool:
    lower_data = data.lower()
    for value in search_values:
        if value in data or value.lower() in lower_data:
            return True
    return False


def scan_zip(path: Path, search_values: list[bytes]) -> list[str]:
    hits: list[str] = []
    try:
        with zipfile.ZipFile(path) as archive:
            for name in archive.namelist():
                try:
                    data = archive.read(name)
                except (OSError, RuntimeError, zipfile.BadZipFile):
                    continue
                if contains_program(data, search_values):
                    hits.append(f"{path}!{name}")
    except (OSError, zipfile.BadZipFile):
        return hits
    return hits


def scan_file(path: Path, search_values: list[bytes]) -> bool:
    try:
        data = path.read_bytes()
    except OSError:
        return False
    return contains_program(data, search_values)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Deep-search a program name under the configured Models root.")
    parser.add_argument("program")
    parser.add_argument("--kb-config", type=Path, default=DEFAULT_KB_CONFIG)
    parser.add_argument("--models", type=Path)
    parser.add_argument("--all-files", action="store_true", help="Scan every file, not only suspicious extensions.")
    return parser


def main() -> int:
    configure_output()
    args = build_parser().parse_args()
    models_root = args.models if args.models is not None else read_models_root(args.kb_config)
    search_values = needles(args.program)

    print(f"Models root: {models_root}")
    if not models_root.exists():
        print("No existe la carpeta configurada.", file=sys.stderr)
        return 2

    hits: list[str] = []
    scanned = 0
    for path in models_root.rglob("*"):
        if not path.is_file():
            continue
        if not args.all_files and path.suffix.casefold() not in SUSPICIOUS_SUFFIXES:
            continue
        scanned += 1
        if path.suffix.casefold() in {".data", ".xpz", ".zip"}:
            hits.extend(scan_zip(path, search_values))
        if scan_file(path, search_values):
            hits.append(str(path))

    print(f"Archivos escaneados: {scanned}")
    print(f"Coincidencias: {len(hits)}")
    for hit in hits:
        print(hit)
    return 0 if hits else 1


if __name__ == "__main__":
    raise SystemExit(main())
