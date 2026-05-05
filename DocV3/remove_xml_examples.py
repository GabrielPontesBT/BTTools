from __future__ import annotations

import argparse
import re
from pathlib import Path


XML_TAB_RE = re.compile(
    r"(?mis)^(?P<indent>\s*)(?:::\s*)?@tab\s*\(?xml\)?\s*\r?\n"
    r"\s*```\s*xml\s*\r?\n.*?^\s*```\s*\r?\n?",
)


def transform_markdown(content: str) -> tuple[str, int]:
    replacements = 0

    def replace_match(match: re.Match[str]) -> str:
        nonlocal replacements
        replacements += 1
        return ""

    updated = XML_TAB_RE.sub(replace_match, content)
    updated = re.sub(r"\n{3,}", "\n\n", updated)
    return updated, replacements


def process_file(path: Path, apply_changes: bool) -> int:
    original = path.read_text(encoding="utf-8")
    updated, replacements = transform_markdown(original)

    if apply_changes and replacements > 0 and updated != original:
        path.write_text(updated, encoding="utf-8", newline="\n")

    return replacements


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Elimina ejemplos XML de invocación y respuesta en archivos Markdown."
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
            print(f"{path}: {replacements} bloque(s) XML eliminado(s)")

    action = "Detectados" if args.dry_run else "Aplicados"
    print(
        f"{action} {total_replacements} eliminación(es) en {changed_files} archivo(s) .md."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
