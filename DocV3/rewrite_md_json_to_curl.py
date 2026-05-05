from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


BASE_URL = (
    "http://btd-bantotal.eastus2.cloudapp.azure.com:4462/"
    "btdeveloper/servlet/com.dlya.bantotal.odwsbt_{service}_v1?{method}"
)

CODE_BLOCK_RE = re.compile(r"```json\r?\n(.*?)\r?\n```", re.DOTALL)


def build_curl_block(service_name: str, method_name: str, payload: dict) -> str:
    url = BASE_URL.format(service=service_name, method=method_name)
    payload_json = json.dumps(payload, indent=2, ensure_ascii=False)
    payload_lines = payload_json.splitlines()

    curl_lines = [
        "```json",
        "curl -X POST \\",
        f"  '{url}' \\",
        "  -H 'cache-control: no-cache' \\",
        "  -H 'content-type: application/json' \\",
        f"  -d '{payload_lines[0]}",
    ]

    if len(payload_lines) > 1:
        curl_lines.extend(payload_lines[1:-1])
        curl_lines.append(f"{payload_lines[-1]}'")
    else:
        curl_lines[-1] += "'"

    curl_lines.append("```")
    return "\n".join(curl_lines)


def transform_json_block(block_text: str) -> str | None:
    try:
        data = json.loads(block_text)
    except json.JSONDecodeError:
        return None

    if not isinstance(data, dict):
        return None

    envelope = data.get("Envelope")
    if not isinstance(envelope, dict):
        return None

    body = envelope.get("Body")
    if not isinstance(body, dict) or len(body) != 1:
        return None

    operation_name, payload = next(iter(body.items()))
    if not isinstance(operation_name, str) or "." not in operation_name:
        return None
    if operation_name.endswith("Response"):
        return None
    if not isinstance(payload, dict):
        return None

    service_name, method_name = operation_name.rsplit(".", 1)
    return build_curl_block(service_name, method_name, payload)


def transform_markdown(content: str) -> tuple[str, int]:
    replacements = 0

    def replace_match(match: re.Match[str]) -> str:
        nonlocal replacements
        replacement = transform_json_block(match.group(1))
        if replacement is None:
            return match.group(0)
        replacements += 1
        return replacement

    updated = CODE_BLOCK_RE.sub(replace_match, content)
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
            "Reemplaza bloques JSON de invocación Envelope/Header/Body/Service.Method "
            "por un ejemplo curl en archivos Markdown."
        )
    )
    parser.add_argument(
        "root",
        nargs="?",
        default=".",
        help="Directorio raíz desde el cual buscar archivos .md",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="No escribe cambios; solo muestra qué archivos serían modificados.",
    )
    args = parser.parse_args()

    root = Path(args.root).resolve()
    files = sorted(root.rglob("*.md"))

    changed_files = 0
    total_replacements = 0

    for path in files:
        replacements = process_file(path, apply_changes=not args.dry_run)
        if replacements > 0:
            changed_files += 1
            total_replacements += replacements
            print(f"{path}: {replacements} reemplazo(s)")

    action = "Detectados" if args.dry_run else "Aplicados"
    print(
        f"{action} {total_replacements} reemplazo(s) en {changed_files} archivo(s) .md."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
