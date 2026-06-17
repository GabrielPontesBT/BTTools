#!/usr/bin/env python
"""Read ASAM MDF/MF4 measurement files.

Install dependencies:
    pip install asammdf pandas

Examples:
    python read_mdf.py data.mf4 --list
    python read_mdf.py data.mdf --channels RPM Speed --rows 20
    python read_mdf.py data.mf4 --channels RPM Speed --csv output.csv
    python read_mdf.py data.mf4 --csv output.csv
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    from asammdf import MDF
except ImportError:
    print(
        "Missing dependency: asammdf\n"
        "Install it with: pip install asammdf pandas",
        file=sys.stderr,
    )
    raise SystemExit(1)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Read ASAM MDF/MF4 files.")
    parser.add_argument("file", type=Path, help="Path to .mdf, .mf4, or .dat file")
    parser.add_argument(
        "--list",
        action="store_true",
        help="List available channel names and exit",
    )
    parser.add_argument(
        "--channels",
        nargs="+",
        help="Channel names to read. If omitted, all channels are loaded.",
    )
    parser.add_argument(
        "--rows",
        type=int,
        default=10,
        help="Rows to print when previewing data. Default: 10",
    )
    parser.add_argument(
        "--csv",
        type=Path,
        help="Export selected data to a CSV file",
    )
    return parser


def list_channels(mdf: MDF) -> None:
    names = sorted(set(mdf.channels_db))
    if not names:
        print("No channels found.")
        return

    for name in names:
        print(name)


def read_dataframe(mdf: MDF, channels: list[str] | None):
    if channels:
        missing = [name for name in channels if name not in mdf.channels_db]
        if missing:
            available = ", ".join(sorted(set(mdf.channels_db))[:20])
            raise ValueError(
                "Channels not found: "
                + ", ".join(missing)
                + f"\nFirst available channels: {available}"
            )
        return mdf.to_dataframe(channels=channels)

    return mdf.to_dataframe()


def main() -> int:
    args = build_parser().parse_args()

    if not args.file.exists():
        print(f"File not found: {args.file}", file=sys.stderr)
        return 2

    with MDF(args.file) as mdf:
        if args.list:
            list_channels(mdf)
            return 0

        try:
            df = read_dataframe(mdf, args.channels)
        except ValueError as exc:
            print(str(exc), file=sys.stderr)
            return 2

        if args.csv:
            df.to_csv(args.csv, index=True)
            print(f"CSV written: {args.csv}")
            return 0

        print(df.head(args.rows).to_string())
        print(f"\nRows: {len(df)} | Columns: {len(df.columns)}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
