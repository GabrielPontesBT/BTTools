#!/usr/bin/env python
"""List configured kb.data files with size and hash for comparing machines."""

from __future__ import annotations

import argparse
import hashlib
import sys
from pathlib import Path

from kb_config import DEFAULT_KB_CONFIG, find_kb_files, kb_source_description


def configure_output() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def file_sha1(path: Path) -> str:
    digest = hashlib.sha1()
    with path.open("rb") as file:
        for chunk in iter(lambda: file.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="List kb.data files resolved from config.")
    parser.add_argument("--kb-config", type=Path, default=DEFAULT_KB_CONFIG)
    parser.add_argument("--models", type=Path)
    parser.add_argument("--hash", action="store_true", help="Include SHA1 hash. Slower but useful for comparing machines.")
    return parser


def main() -> int:
    configure_output()
    args = build_parser().parse_args()
    files = find_kb_files(args.models, args.kb_config)
    print(f"Fuente: {kb_source_description(args.models, args.kb_config)}")
    print(f"kb.data encontrados: {len(files)}")
    for path in files:
        stat = path.stat()
        hash_part = f" sha1={file_sha1(path)}" if args.hash else ""
        print(f"{path} size={stat.st_size}{hash_part}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
