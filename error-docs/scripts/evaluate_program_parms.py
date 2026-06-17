#!/usr/bin/env python
"""Evaluate a program Parm(...) signature against positional true/false flags."""

from __future__ import annotations

import argparse
import csv
import sys
from dataclasses import dataclass
from pathlib import Path

from extract_parm_rules import ParmEntry, extract_program_parms
from trace_program_error_catalog import DEFAULT_KB_CONFIG, DEFAULT_OUTPUT_DIR, load_kbs


VALID = "VALID"
POSSIBLE_ERROR = "POSSIBLE_ERROR"


@dataclass
class ParmEvaluation:
    program: str
    model: str
    part: str
    position: int
    direction: str
    parameter: str
    input_flag: str
    result: str


def configure_output() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")


def parse_bool_list(value: str) -> list[bool]:
    result: list[bool] = []
    for raw in value.split(","):
        item = raw.strip().casefold()
        if item in {"true", "t", "1", "yes", "y", "si", "sí", "verdadero", "v"}:
            result.append(True)
        elif item in {"false", "f", "0", "no", "n", "falso"}:
            result.append(False)
        elif item:
            raise ValueError(f"Valor booleano invalido: {raw!r}")
    return result


def group_by_signature(entries: list[ParmEntry]) -> list[list[ParmEntry]]:
    groups: dict[str, list[ParmEntry]] = {}
    for entry in entries:
        groups.setdefault(entry.parm_text, []).append(entry)
    return list(groups.values())


def evaluate(entries: list[ParmEntry], flags: list[bool]) -> list[ParmEvaluation]:
    rows: list[ParmEvaluation] = []
    for entry in sorted(entries, key=lambda item: item.position):
        flag = flags[entry.position - 1] if entry.position <= len(flags) else False
        if not flag and entry.direction == "in":
            result = POSSIBLE_ERROR
        else:
            result = VALID
        rows.append(
            ParmEvaluation(
                program=entry.program,
                model=entry.model,
                part=entry.part,
                position=entry.position,
                direction=entry.direction,
                parameter=entry.parameter,
                input_flag=str(flag).lower(),
                result=result,
            )
        )
    return rows


def write_csv(path: Path, rows: list[ParmEvaluation]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8-sig") as file:
        fieldnames = list(ParmEvaluation.__dataclass_fields__)
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow(row.__dict__)


def markdown(rows: list[ParmEvaluation]) -> str:
    lines = [
        "| Pos | Direccion | Parametro | Flag | Resultado |",
        "|---:|---|---|---|---|",
    ]
    for row in rows:
        lines.append(f"| {row.position} | {row.direction} | {row.parameter} | {row.input_flag} | {row.result} |")
    lines.append("")
    return "\n".join(lines)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Evaluate Parm(...) positions with true/false flags.")
    parser.add_argument("program")
    parser.add_argument("flags", help="Comma-separated booleans, e.g. true,false,true")
    parser.add_argument("--kb-config", type=Path, default=DEFAULT_KB_CONFIG, help="File with the Models root path")
    parser.add_argument("--models", type=Path, help="Optional Models root folder. Overrides --kb-config")
    parser.add_argument("--csv", type=Path)
    parser.add_argument("--out", type=Path)
    return parser


def main() -> int:
    configure_output()
    args = build_parser().parse_args()
    flags = parse_bool_list(args.flags)
    csv_path = args.csv or DEFAULT_OUTPUT_DIR / f"{args.program.lower()}_parm_eval.csv"
    md_path = args.out or DEFAULT_OUTPUT_DIR / f"{args.program.lower()}_parm_eval.md"

    kbs = load_kbs(args.models, args.kb_config)
    entries = extract_program_parms(kbs, args.program, fallback_any_part=False, include_duplicates=False)
    groups = group_by_signature(entries)
    if not groups:
        print(f"No encontre Parm(...) para {args.program}", file=sys.stderr)
        return 1
    if len(groups) > 1:
        print(f"Advertencia: encontre {len(groups)} firmas distintas; uso la primera.", file=sys.stderr)

    rows = evaluate(groups[0], flags)
    write_csv(csv_path, rows)
    md_path.parent.mkdir(parents=True, exist_ok=True)
    md_path.write_text(markdown(rows), encoding="utf-8-sig")

    for row in rows:
        print(f"{row.position:>2} {row.direction:<5} {row.parameter:<45} {row.input_flag:<5} {row.result}")
    print(f"CSV: {csv_path}")
    print(f"Markdown: {md_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
