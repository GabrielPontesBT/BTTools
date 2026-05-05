from __future__ import annotations

import argparse
import json
import re
from collections import OrderedDict
from pathlib import Path
from typing import Any


REQUEST_DETAILS_RE = re.compile(
    r"(?ms)<!-- ABRE EJEMPLO DE INVOCACI[ÓO]N -->.*?```(?:json|bash)\s*\n(?P<code>.*?)\n```"
)
RESPONSE_DETAILS_RE = re.compile(
    r"(?ms)<!-- ABRE EJEMPLO DE RESPUESTA -->.*?```json\s*\n(?P<code>.*?)\n```"
)
STRUCTURED_SECTION_RE = re.compile(r"(?ms)\n## \*\*Tipos de Dato Estructurado\*\*.*$")
PUBLICATION_RE = re.compile(r"\*\*Nombre publicaci\S*:\*\*\s*([A-Za-z0-9_.]+)")


def normalize_identifier(name: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9_]", "", name.strip())
    return cleaned or "Estructura"


def singularize_name(name: str) -> str:
    base = normalize_identifier(name)
    if base.lower().endswith("ies") and len(base) > 3:
        return base[:-3] + "y"
    if base.lower().endswith("s") and len(base) > 1:
        return base[:-1]
    return base


def to_type_name(key: str, item: bool = False) -> str:
    base = normalize_identifier(key)
    if item and not base.lower().endswith("item"):
        base += "Item"
    return base


def infer_scalar_type(value: Any) -> str:
    if isinstance(value, bool):
        return "Boolean"
    if isinstance(value, int) and not isinstance(value, bool):
        return "Long"
    if isinstance(value, float):
        return "Decimal"
    if isinstance(value, str):
        lowered = value.lower()
        if re.fullmatch(r"-?\d{4}-\d{2}-\d{2}", value):
            return "Date"
        if re.fullmatch(r"-?\d{4}-\d{2}-\d{2}[t ]\d{2}:\d{2}:\d{2}.*", lowered):
            return "DateTime"
        return "String"
    if value is None:
        return "String"
    return "String"


def merge_field_maps(target: OrderedDict[str, str], source: OrderedDict[str, str]) -> None:
    for key, value in source.items():
        target.setdefault(key, value)


def parse_json_loose(raw: str) -> Any | None:
    text = raw.strip()
    if not text:
        return None

    if text.startswith("'") and text.endswith("'"):
        text = text[1:-1].strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return None


def extract_request_json(code: str) -> Any | None:
    payload_match = re.search(r"-d\s+'(?P<payload>\{.*\})'\s*$", code.strip(), re.DOTALL)
    if payload_match:
        return parse_json_loose(payload_match.group("payload"))
    return parse_json_loose(code)


def extract_response_json(code: str) -> Any | None:
    return parse_json_loose(code)


def should_skip_root_key(key: str) -> bool:
    return key in {"Btinreq", "Btoutreq", "BusinessErrors", "Erroresnegocio"}


def register_structure(
    structures: OrderedDict[str, OrderedDict[str, str]],
    type_name: str,
    fields: OrderedDict[str, str],
) -> None:
    current = structures.setdefault(type_name, OrderedDict())
    merge_field_maps(current, fields)


def analyze_value(
    key: str,
    value: Any,
    structures: OrderedDict[str, OrderedDict[str, str]],
) -> str:
    if isinstance(value, dict):
        if len(value) == 1:
            only_child_key, only_child_value = next(iter(value.items()))
            if isinstance(only_child_value, list):
                item_type = singularize_name(key)
                if not only_child_value:
                    return f"List[{item_type}]"
                if not all(isinstance(item, dict) for item in only_child_value):
                    return f"List[{infer_scalar_type(only_child_value[0])}]"
                merged_fields: OrderedDict[str, str] = OrderedDict()
                for item in only_child_value:
                    item_fields: OrderedDict[str, str] = OrderedDict()
                    for child_key, child_value in item.items():
                        child_type = analyze_value(child_key, child_value, structures)
                        item_fields[child_key] = child_type
                    merge_field_maps(merged_fields, item_fields)
                register_structure(structures, item_type, merged_fields)
                return f"List[{item_type}]"
            if isinstance(only_child_value, dict) and normalize_identifier(only_child_key).lower().endswith("item"):
                return analyze_value(only_child_key, only_child_value, structures)

        type_name = to_type_name(key)
        fields: OrderedDict[str, str] = OrderedDict()
        for child_key, child_value in value.items():
            child_type = analyze_value(child_key, child_value, structures)
            fields[child_key] = child_type
        register_structure(structures, type_name, fields)
        return type_name

    if isinstance(value, list):
        if value and all(isinstance(item, dict) for item in value):
            item_type = singularize_name(key)
            merged_fields: OrderedDict[str, str] = OrderedDict()
            for item in value:
                item_fields: OrderedDict[str, str] = OrderedDict()
                for child_key, child_value in item.items():
                    child_type = analyze_value(child_key, child_value, structures)
                    item_fields[child_key] = child_type
                merge_field_maps(merged_fields, item_fields)
            register_structure(structures, item_type, merged_fields)
            return f"List[{item_type}]"
        if value:
            return f"List[{infer_scalar_type(value[0])}]"
        return "List"

    return infer_scalar_type(value)


def collect_structures_from_payload(
    payload: Any,
    structures: OrderedDict[str, OrderedDict[str, str]],
) -> None:
    if not isinstance(payload, dict):
        return
    for key, value in payload.items():
        if should_skip_root_key(key):
            continue
        analyze_value(key, value, structures)


def build_structured_docs(structures: OrderedDict[str, OrderedDict[str, str]]) -> str:
    if not structures:
        return ""

    sections = ["## **Tipos de Dato Estructurado**", ""]

    for type_name, fields in structures.items():
        sections.extend(
            [
                "<!-- ABRE SDT -->",
                f"::: details {type_name}",
                "",
                f"### {type_name}",
                "",
                "::: center",
                f"Los campos del tipo de dato estructurado {type_name} son los siguientes:",
                "",
                "Nombre | Tipo | Comentarios",
                ":--------- | :----------- | :-----------",
            ]
        )

        for field_name, field_type in fields.items():
            sections.append(f"{field_name} | {field_type} |")

        sections.extend([":::", "<!-- CIERRA SDT -->", ""])

    return "\n".join(sections).rstrip() + "\n"


def transform_markdown(content: str) -> tuple[str, int]:
    structures: OrderedDict[str, OrderedDict[str, str]] = OrderedDict()

    request_match = REQUEST_DETAILS_RE.search(content)
    if request_match:
        request_payload = extract_request_json(request_match.group("code"))
        collect_structures_from_payload(request_payload, structures)

    response_match = RESPONSE_DETAILS_RE.search(content)
    if response_match:
        response_payload = extract_response_json(response_match.group("code"))
        collect_structures_from_payload(response_payload, structures)

    if not structures:
        return content, 0

    generated = build_structured_docs(structures)
    base_content = STRUCTURED_SECTION_RE.sub("", content).rstrip()
    updated = base_content + "\n\n" + generated
    return updated, 1 if updated != content else 0


def process_file(path: Path, apply_changes: bool) -> int:
    original = path.read_text(encoding="utf-8")
    updated, replacements = transform_markdown(original)

    if apply_changes and replacements > 0 and updated != original:
        path.write_text(updated, encoding="utf-8", newline="\n")

    return replacements


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Genera documentación de tipos de dato estructurado a partir de los ejemplos "
            "JSON de request y response en archivos Markdown."
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
            print(f"{path}: {replacements} sección(es) generada(s)")

    action = "Detectados" if args.dry_run else "Aplicados"
    print(f"{action} {total_replacements} cambio(s) en {changed_files} archivo(s) .md.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
