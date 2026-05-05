from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any


JSON_BLOCK_RE = re.compile(r"```json\r?\n(?P<code>.*?)\r?\n```", re.DOTALL)
CURL_DATA_RE = re.compile(r"(?P<prefix>-d\s+')(?P<payload>\{.*\})(?P<suffix>')", re.DOTALL)


def flatten_text_wrappers(value: Any) -> tuple[Any, int]:
    changes = 0

    if isinstance(value, dict):
        keys = set(value.keys())
        if "__text" in value and keys.issubset({"__text", "__type"}):
            return value["__text"], 1

        updated: dict[str, Any] = {}
        for key, child in value.items():
            flattened_child, child_changes = flatten_text_wrappers(child)
            updated[key] = flattened_child
            changes += child_changes
        return updated, changes

    if isinstance(value, list):
        updated_list = []
        for item in value:
            flattened_item, item_changes = flatten_text_wrappers(item)
            updated_list.append(flattened_item)
            changes += item_changes
        return updated_list, changes

    return value, 0


def normalize_json_text(text: str) -> tuple[str | None, int]:
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        return None, 0

    flattened, changes = flatten_text_wrappers(data)
    if changes == 0:
        return None, 0

    return json.dumps(flattened, indent=2, ensure_ascii=False), changes


def normalize_json_block(block_text: str) -> tuple[str | None, int]:
    normalized_json, changes = normalize_json_text(block_text)
    if normalized_json is not None:
        return normalized_json, changes

    curl_match = CURL_DATA_RE.search(block_text)
    if curl_match:
        normalized_payload, payload_changes = normalize_json_text(curl_match.group("payload"))
        if normalized_payload is None:
            return None, 0
        rebuilt = (
            block_text[: curl_match.start("prefix")]
            + curl_match.group("prefix")
            + normalized_payload
            + curl_match.group("suffix")
            + block_text[curl_match.end("suffix") :]
        )
        return rebuilt, payload_changes

    return None, 0


def transform_markdown(content: str) -> tuple[str, int]:
    replacements = 0

    def replace_match(match: re.Match[str]) -> str:
        nonlocal replacements
        normalized, changes = normalize_json_block(match.group("code"))
        if not normalized:
            return match.group(0)
        replacements += changes
        return f"```json\n{normalized}\n```"

    updated = JSON_BLOCK_RE.sub(replace_match, content)
    return updated, replacements


def process_file(path: Path, apply_changes: bool) -> int:
    original = path.read_text(encoding="utf-8")
    updated, replacements = transform_markdown(original)

    if apply_changes and replacements > 0 and updated != original:
        path.write_text(updated, encoding="utf-8", newline="\n")

    return replacements


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Convierte objetos JSON del tipo {'__text': valor, '__type': ...} o "
            "{'__text': valor} en valores directos dentro de archivos Markdown."
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
            print(f"{path}: {replacements} valor(es) simplificado(s)")

    action = "Detectados" if args.dry_run else "Aplicados"
    print(
        f"{action} {total_replacements} cambio(s) en {changed_files} archivo(s) .md."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
