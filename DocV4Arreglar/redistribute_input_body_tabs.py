from __future__ import annotations

import argparse
import re
from pathlib import Path


ENTRY_TAB_RE = re.compile(
    r"(?ms)^@tab\s+.*Entrada\s*\n(?P<entry>.*?)(?=^@tab\s+(?:Body|.*Salida)\s*$)"
)
BODY_TAB_RE = re.compile(
    r"(?ms)^@tab\s+Body\s*\n(?P<body>.*?)(?=^@tab\s+.*Salida\s*$)"
)
OUTPUT_TAB_RE = re.compile(r"(?m)^@tab\s+.*Salida\s*$")
PUBLICATION_RE = re.compile(r"\*\*Nombre publicaci\S*:\*\*\s*([A-Za-z0-9_.]+)")


def detect_method_name(content: str, path: Path) -> str | None:
    match = PUBLICATION_RE.search(content)
    publication = match.group(1) if match else path.stem
    if "." not in publication:
        return None
    return publication.rsplit(".", 1)[-1].lower()


def split_lines(block: str) -> list[str]:
    stripped = block.strip("\n")
    if not stripped:
        return []
    return stripped.splitlines()


def is_table_header(line: str) -> bool:
    normalized = line.strip().lower()
    return "nombre" in normalized and "tipo" in normalized and "comentarios" in normalized


def is_separator(line: str) -> bool:
    normalized = line.replace(" ", "").strip()
    return normalized.startswith(":") or normalized.startswith("|:")


def extract_table(block: str) -> tuple[list[str], list[str]] | None:
    lines = split_lines(block)
    if len(lines) < 2:
        return None
    if not is_table_header(lines[0]) or not is_separator(lines[1]):
        return None
    return [lines[0], lines[1]], [line for line in lines[2:] if line.strip()]


def extract_cells(row: str) -> list[str]:
    stripped = row.strip()
    if stripped.startswith("|"):
        return [cell.strip() for cell in stripped.strip("|").split("|")]
    return [cell.strip() for cell in stripped.split("|")]


def extract_first_column(row: str) -> str:
    cells = extract_cells(row)
    return cells[0] if cells else ""


def extract_second_column(row: str) -> str:
    cells = extract_cells(row)
    return cells[1] if len(cells) > 1 else ""


def is_basic_type(type_name: str) -> bool:
    normalized = type_name.strip().lower()
    normalized = normalized.replace("(guid)", "").strip()
    normalized = normalized.replace("datetime", "date")
    normalized = normalized.replace("date/time", "date")
    normalized = normalized.replace(" / ", "/")

    basic_markers = (
        "string",
        "integer",
        "int",
        "long",
        "decimal",
        "double",
        "float",
        "boolean",
        "bool",
        "date",
        "uuid",
        "guid",
    )
    complex_markers = ("object", "array", "list", "map", "[]")

    if any(marker in normalized for marker in complex_markers):
        return False
    return any(marker in normalized for marker in basic_markers)


def build_section(rows: list[str], header: list[str]) -> str:
    if not rows:
        return "No aplica.\n\n"
    return "\n".join(header + rows) + "\n\n"


def transform_tabs(content: str, method_name: str) -> tuple[str, int]:
    entry_match = ENTRY_TAB_RE.search(content)
    if not entry_match:
        return content, 0

    body_match = BODY_TAB_RE.search(content)
    output_match = OUTPUT_TAB_RE.search(content)
    if not output_match:
        return content, 0

    entry_table = extract_table(entry_match.group("entry"))
    body_table = extract_table(body_match.group("body")) if body_match else None

    header = None
    entry_rows: list[str] = []
    body_rows: list[str] = []

    if entry_table:
        header, entry_rows = entry_table
    if body_table and header is None:
        header, body_rows = body_table
    elif body_table:
        _, body_rows = body_table

    if header is None:
        return content, 0

    source_rows = entry_rows + body_rows
    normalized_method = method_name.lower()

    if normalized_method.startswith(("get", "delete")):
        new_entry_rows = [
            row for row in source_rows if is_basic_type(extract_second_column(row))
        ]
        new_body_rows = [
            row for row in source_rows if not is_basic_type(extract_second_column(row))
        ]
    elif normalized_method.startswith(("create", "update")):
        new_entry_rows = [
            row for row in source_rows if extract_first_column(row).endswith("GUID")
        ]
        new_body_rows = [
            row for row in source_rows if not extract_first_column(row).endswith("GUID")
        ]
    else:
        return content, 0

    new_entry_block = build_section(new_entry_rows, header)
    new_body_block = build_section(new_body_rows, header)

    updated = (
        content[: entry_match.start("entry")]
        + new_entry_block
        + content[entry_match.end("entry") :]
    )

    body_match = BODY_TAB_RE.search(updated)
    if body_match:
        updated = (
            updated[: body_match.start("body")]
            + new_body_block
            + updated[body_match.end("body") :]
        )
    else:
        output_match = OUTPUT_TAB_RE.search(updated)
        if not output_match:
            return content, 0
        body_tab_text = "@tab Body\n\n" + new_body_block
        updated = (
            updated[: output_match.start()]
            + body_tab_text
            + updated[output_match.start() :]
        )

    return updated, 1 if updated != content else 0


def process_file(path: Path, apply_changes: bool) -> int:
    original = path.read_text(encoding="utf-8")
    method_name = detect_method_name(original, path)
    if method_name is None:
        return 0

    updated, replacements = transform_tabs(original, method_name)

    if apply_changes and replacements > 0 and updated != original:
        path.write_text(updated, encoding="utf-8", newline="\n")

    return replacements


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Redistribuye filas entre los tabs de entrada y body según el tipo de método "
            "documentado en archivos Markdown."
        )
    )
    parser.add_argument(
        "root",
        nargs="?",
        default=".",
        help="Directorio raíz o archivo .md a procesar.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="No escribe cambios; solo muestra qué archivos serían modificados.",
    )
    args = parser.parse_args()

    root = Path(args.root).resolve()
    if root.is_file():
        files = [root] if root.suffix.lower() == ".md" else []
    else:
        files = sorted(root.rglob("*.md"))

    changed_files = 0
    total_replacements = 0

    for path in files:
        replacements = process_file(path, apply_changes=not args.dry_run)
        if replacements > 0:
            changed_files += 1
            total_replacements += replacements
            print(f"{path}: {replacements} ajuste(s)")

    action = "Detectados" if args.dry_run else "Aplicados"
    print(f"{action} {total_replacements} ajuste(s) en {changed_files} archivo(s) .md.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
