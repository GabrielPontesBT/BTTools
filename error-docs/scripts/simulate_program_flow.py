#!/usr/bin/env python
"""Linear GeneXus flow simulator.

This intentionally follows a small rule set:
  - input/inout/no-direction parms start as invalid
  - assignments propagate invalid state from right to left
  - invalid if conditions make errors inside them possible
  - literal mode/mode and LevelId comparisons can skip incompatible blocks
  - calls enqueue child programs carrying argument validity by position
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from collections import deque
from dataclasses import dataclass
from pathlib import Path

from catalog_btera_errors import literal_value, strip_line_comment
from extract_kb_source import (
    DEFAULT_SOURCE_TYPES,
    SOURCE_TYPE_IDS,
    find_object_records,
    find_record_by_key,
    gzip_payload_after_record,
    source_from_payload,
    source_from_record,
)
from extract_parm_rules import model_property_parms
from trace_program_error_catalog import (
    DEFAULT_KB_CONFIG,
    DEFAULT_OUTPUT_DIR,
    IGNORED_QUALIFIED_PREFIXES,
    KbCache,
    diagnose_program_resolution,
    find_matching_paren,
    kb_source_description,
    is_candidate_program,
    load_kbs,
    load_master_catalog,
    normalize_program_name,
    resolve_program,
    SourcePart,
    split_args,
)


VALID = "VALID"
INVALID = "MAYBE_INVALID"
SKIP_FULL_VALID_CALLS = False
SUBROUTINE_RETURN_MARKER = "__return_from_subroutine__:"
TECHNICAL_VALID_VARS = {
    "&pgmname",
    "&programname",
    "&callpgm",
    "&defaultparams",
    "&additionalparams",
    "&mode",
    "&modo",
    "&levelid",
}
IGNORED_CALLEE_NAMES = {
    "JSON",
    "XML",
    "UPPER",
    "LOWER",
    "TRIM",
    "LTRIM",
    "RTRIM",
    "STR",
}


VAR_RE = re.compile(r"&[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*")
PARM_RE = re.compile(r"\bparm\s*\(", re.IGNORECASE)
BLOCK_COMMENT_RE = re.compile(r"/\*.*?\*/", re.DOTALL)
DIRECTION_PREFIX_RE = re.compile(r"(?i)^(?:inout|in|out)\s*:\s*(?P<value>.+)$")
DIRECTION_PARAM_RE = re.compile(r"(?i)^(?P<direction>inout|in|out)\s*:\s*(?P<value>.+)$")
PARAM_NAME_RE = re.compile(r"&[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*")
ASSIGNMENT_RE = re.compile(r"\s*(?P<left>&[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*)\s*=\s*(?P<right>.+)")
COLLECTION_ADD_RE = re.compile(
    r"(?P<collection>&[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*)\.add\s*\(\s*(?P<item>&[A-Za-z_][A-Za-z0-9_]*)\s*\)",
    re.IGNORECASE,
)
COLLECTION_LOOP_RE = re.compile(
    r"\s*for\s+(?P<item>&[A-Za-z_][A-Za-z0-9_]*)\s+in\s+(?P<collection>&[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*)\b",
    re.IGNORECASE,
)
MODE_ASSIGNMENT_RE = re.compile(
    r"^\s*(?P<var>&?[A-Za-z_][A-Za-z0-9_]*)\s*=\s*['\"](?P<mode>[A-Za-z0-9]{3})['\"]",
    re.IGNORECASE,
)
MODE_CONDITION_RE = re.compile(
    r"(?P<var>&?[A-Za-z_][A-Za-z0-9_]*)\s*(?P<op>=|<>|!=)\s*['\"]?(?P<mode>[A-Za-z0-9]{3})['\"]?",
    re.IGNORECASE,
)
MODE_WORD_RE = re.compile(r"(?:modo|mode)", re.IGNORECASE)
MODE_COMPARISON_RE = re.compile(
    r"(?P<var>&?[A-Za-z_][A-Za-z0-9_]*)\s*(?P<op>=|<>|!=)\s*['\"]?(?P<mode>[A-Za-z0-9]{3})['\"]?",
    re.IGNORECASE,
)
LITERAL_MODE_RE = re.compile(r"[A-Za-z0-9]{3}")
CASE_LITERAL_MODE_RE = re.compile(r"\s*case\s+['\"]?(?P<mode>[A-Za-z0-9]{3})['\"]?\b", re.IGNORECASE)
LEVEL_ID_ASSIGNMENT_RE = re.compile(
    r"^\s*(?P<var>&?[A-Za-z_][A-Za-z0-9_]*)\s*=\s*['\"]?(?P<level_id>[A-Za-z0-9_]+)['\"]?",
    re.IGNORECASE,
)
LEVEL_ID_CONDITION_RE = re.compile(
    r"(?P<var>&?[A-Za-z_][A-Za-z0-9_]*)\s*(?P<op>=|<>|!=|>=|<=|>|<)\s*['\"]?(?P<level_id>[A-Za-z0-9_]+)['\"]?",
    re.IGNORECASE,
)
LEVEL_ID_COMPARISON_RE = re.compile(
    r"(?P<var>&?[A-Za-z_][A-Za-z0-9_]*)\s*(?P<op>=|<>|!=|>=|<=|>|<)\s*['\"]?(?P<level_id>[A-Za-z0-9_]+)['\"]?",
    re.IGNORECASE,
)
LITERAL_LEVEL_ID_RE = re.compile(r"[A-Za-z0-9_]+")
CASE_LITERAL_LEVEL_ID_RE = re.compile(r"\s*case\s+['\"]?(?P<level_id>[A-Za-z0-9_]+)['\"]?\b", re.IGNORECASE)
ERROR_CODE_RE = re.compile(r"=\s*(?P<code>\d{2,})\b")
ERROR_STRING_RE = re.compile(
    r"&?[A-Za-z0-9_]*err(?:or)?[A-Za-z0-9_]*string\s*=\s*(?P<value>'(?:''|[^'])*'|\"(?:\"\"|[^\"])*\")",
    re.IGNORECASE,
)
SUB_START_RE = re.compile(r"\s*sub\s+['\"](?P<name>[^'\"]+)['\"]", re.IGNORECASE)
SUB_END_RE = re.compile(r"\s*end\s*sub\b|\s*endsub\b", re.IGNORECASE)
DO_SUB_RE = re.compile(r"\s*do\s+['\"](?P<name>[^'\"]+)['\"]", re.IGNORECASE)
CALL_PREFIX_RE = re.compile(r"\b(?:[A-Za-z_][A-Za-z0-9_]*\.)?call\s*\(", re.IGNORECASE)
FUNCTION_CALL_RE = re.compile(r"(?<![\w&])(?P<name>[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*)\s*\(")
END_IF_RE = re.compile(r"^end\s*if\b|^endif\b")
CASE_BOUNDARY_RE = re.compile(r"^case\b|^otherwise\b|^end\s*case\b|^endcase\b")
END_CASE_RE = re.compile(r"^end\s*case\b|^endcase\b")
OTHERWISE_RE = re.compile(r"^otherwise\b")
END_FOR_RE = re.compile(r"^end\s*for\b|^endfor\b")
DO_CASE_RE = re.compile(r"^do\s+case\b")
CASE_RE = re.compile(r"^case\b")
IF_RE = re.compile(r"^if\b")
IF_PREFIX_RE = re.compile(r"^\s*if\s+", re.IGNORECASE)
THEN_SUFFIX_RE = re.compile(r"\bthen\b\s*$", re.IGNORECASE)
FOR_EACH_RE = re.compile(r"^for\s+each\b")
WHERE_RE = re.compile(r"^where\b")
WHEN_NONE_RE = re.compile(r"^when\s+none\b")


@dataclass
class SimError:
    root_program: str
    program: str
    model: str
    part: str
    line: int
    code: str
    message: str
    catalog_program: str
    catalog_model: str
    reason: str
    condition: str
    source_line: str
    returning_programs: str = ""


@dataclass
class SimCall:
    caller: str
    callee: str
    model: str
    part: str
    line: int
    call_text: str


@dataclass
class SourceAnalysis:
    source_lines: list[str]
    main_lines: list[tuple[int, str]]
    subroutines: dict[str, list[tuple[int, str]]]


_SOURCE_ANALYSIS_CACHE: dict[str, SourceAnalysis] = {}


def configure_output() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")


def uncomment_source(source: str) -> str:
    return "\n".join(strip_line_comment(line) for line in source.splitlines())


def clean_arg(value: str) -> str:
    value = value.strip()
    direction = DIRECTION_PREFIX_RE.match(value)
    return direction.group("value").strip() if direction else value


def variable_names(text: str) -> set[str]:
    names: set[str] = set()
    for match in VAR_RE.finditer(text):
        name = match.group(0).casefold()
        # Method calls like &X.IsEmpty() must track &X, while &Sdt.Field remains field-specific.
        if "." in name and match.end() < len(text) and text[match.end()] == "(":
            name = name.rsplit(".", 1)[0]
        names.add(name)
    return names


def expr_invalid_vars(expr: str, states: dict[str, str]) -> list[str]:
    invalid: set[str] = set()
    for name in variable_names(expr):
        if name in TECHNICAL_VALID_VARS:
            continue
        if "." not in name and any(
            key.startswith(f"{name}.") and value == INVALID for key, value in states.items()
        ):
            invalid.add(name)
            continue
        if "." in name and name not in states:
            base = name.split(".")[0]
            if base in TECHNICAL_VALID_VARS:
                continue
            if states.get(base, VALID) == INVALID:
                invalid.add(name)
            continue
        if states.get(name, VALID) == INVALID:
            invalid.add(name)
    return sorted(invalid)


def expr_state(expr: str, states: dict[str, str]) -> str:
    return INVALID if expr_invalid_vars(expr, states) else VALID


def inferred_composite_invalid(name: str, states: dict[str, str]) -> bool:
    local_name = name.casefold().lstrip("&")
    if not local_name.endswith("details"):
        return False
    family_prefix = local_name[:-len("details")]
    module_prefix = family_prefix[:5] if len(family_prefix) >= 5 else family_prefix
    if len(module_prefix) < 4:
        return False
    for key, value in states.items():
        if value != INVALID:
            continue
        base = key.split(".")[0].lstrip("&")
        if base == local_name:
            continue
        if base.startswith(family_prefix) or base.startswith(module_prefix):
            return True
    return False


def argument_state(expr: str, states: dict[str, str]) -> str:
    names = variable_names(expr)
    if names and any(inferred_composite_invalid(name, states) for name in names):
        return INVALID
    if names and not any(
        name in states
        or ("." in name and name.split(".")[0] in states)
        or any(key.startswith(f"{name}.") for key in states)
        for name in names
    ):
        return VALID
    return expr_state(expr, states)


def parse_parms(source: str) -> list[tuple[str, str]]:
    text = uncomment_source(source)
    for match in PARM_RE.finditer(text):
        open_index = text.find("(", match.start())
        close_index = find_matching_paren(text, open_index)
        if close_index < 0:
            continue

        parms: list[tuple[str, str]] = []
        for raw in split_args(text[open_index + 1 : close_index]):
            value = BLOCK_COMMENT_RE.sub("", raw).strip()
            direction = "in"
            direction_match = DIRECTION_PARAM_RE.match(value)
            if direction_match:
                direction = direction_match.group("direction").casefold()
                value = direction_match.group("value").strip()
            if PARAM_NAME_RE.fullmatch(value):
                parms.append((value.casefold(), direction))
        if parms:
            return parms
    return []


def is_mode_param(param: str) -> bool:
    name = param.casefold().lstrip("&").split(".")[-1]
    return "mode" in name or "modo" in name


def is_level_id_param(param: str) -> bool:
    name = param.casefold().lstrip("&").split(".")[-1].replace("_", "")
    return "levelid" in name


def is_context_param(param: str) -> bool:
    return is_mode_param(param) or is_level_id_param(param)


def initialize_states(
    parms: list[tuple[str, str]],
    incoming_states: list[str],
    incoming_mode: str,
    incoming_level_id: str,
) -> dict[str, str]:
    states: dict[str, str] = {}
    for index, (param, direction) in enumerate(parms):
        incoming = incoming_states[index] if index < len(incoming_states) else VALID
        if param in TECHNICAL_VALID_VARS:
            states[param] = VALID
        elif incoming_mode and is_mode_param(param):
            states[param] = VALID
        elif incoming_level_id and is_level_id_param(param):
            states[param] = VALID
        elif incoming_states:
            if incoming == VALID:
                states[param] = VALID
            elif direction == "in":
                states[param] = INVALID
            else:
                states[param] = VALID
        elif direction == "out":
            states[param] = VALID
        else:
            states[param] = INVALID
    return states


def rule_parms_by_model(parts: list[object]) -> dict[str, list[tuple[str, str]]]:
    result: dict[str, list[tuple[str, str]]] = {}
    for part in parts:
        if "rules" in part.part.casefold():
            parms = parse_parms(part.source)
            if parms:
                result.setdefault(part.model, parms)
    return result


def property_parms_by_model(kbs: list[KbCache], program: str) -> dict[str, list[tuple[str, str]]]:
    result: dict[str, list[tuple[str, str]]] = {}
    for kb in kbs:
        entries = model_property_parms(kb, program)
        if not entries:
            continue
        first_block = entries[0].parm_text
        parms = [
            (entry.parameter.casefold(), entry.direction)
            for entry in entries
            if entry.parm_text == first_block
        ]
        if parms:
            result[kb.model] = parms
    return result


def accepts_mode_input(parms_by_model: dict[str, list[tuple[str, str]]]) -> bool:
    for parms in parms_by_model.values():
        if any(is_mode_param(param) and direction in {"in", "inout"} for param, direction in parms):
            return True
    return False


def accepts_level_id_input(parms_by_model: dict[str, list[tuple[str, str]]]) -> bool:
    for parms in parms_by_model.values():
        if any(is_level_id_param(param) and direction in {"in", "inout"} for param, direction in parms):
            return True
    return False


def fallback_source_parts(kbs: list[KbCache], program: str) -> list[SourcePart]:
    parts: list[SourcePart] = []
    seen: set[tuple[str, int, int, int]] = set()
    for kb in kbs:
        objects = find_object_records(kb.entity_version, program)
        for obj in objects:
            for key in kb.child_index.get(obj.key, []):
                if key.type_id not in DEFAULT_SOURCE_TYPES:
                    continue
                marker = (kb.model, key.type_id, key.entity_id, key.version_id)
                if marker in seen:
                    continue
                seen.add(marker)
                record = kb.record_index.get(key) or find_record_by_key(kb.entity_version, key)
                if not record:
                    continue
                source = source_from_record(record) or source_from_payload(gzip_payload_after_record(kb.entity_version, record))
                if not source:
                    continue
                parts.append(
                    SourcePart(
                        model=kb.model,
                        kb_data=str(kb.path),
                        object_name=obj.name,
                        object_description=obj.description,
                        part=SOURCE_TYPE_IDS.get(record.key.type_id, f"Type {record.key.type_id}"),
                        source=source,
                    )
                )
    return parts


def resolve_program_parts(kbs: list[KbCache], program: str) -> list[SourcePart]:
    parts = resolve_program(kbs, program)
    if parts:
        return parts
    return fallback_source_parts(kbs, program)


def first_parm_signature(parms_by_model: dict[str, list[tuple[str, str]]]) -> list[tuple[str, str]]:
    for parms in parms_by_model.values():
        if parms:
            return parms
    return []


def apply_callee_directions(arg_states: list[str], callee_parms: list[tuple[str, str]]) -> list[str]:
    if not callee_parms:
        return arg_states
    adjusted = list(arg_states)
    for index, (_, direction) in enumerate(callee_parms):
        if index >= len(adjusted):
            break
        if direction != "in":
            adjusted[index] = VALID
    return adjusted


def mark_return_args_valid(args: list[str], callee_parms: list[tuple[str, str]], states: dict[str, str]) -> None:
    for index, arg in enumerate(args):
        if index >= len(callee_parms):
            break
        _, direction = callee_parms[index]
        if direction == "in":
            continue
        value = clean_arg(arg).strip()
        if PARAM_NAME_RE.fullmatch(value):
            states[value.casefold()] = VALID


def functional_params(parms: list[tuple[str, str]]) -> list[str]:
    return [
        param
        for param, direction in parms
        if direction in {"in", "inout"} and param not in TECHNICAL_VALID_VARS and not is_context_param(param)
    ]


def source_matches_parms(source: str, parms: list[tuple[str, str]]) -> bool:
    functional = functional_params(parms)
    if not functional:
        return True
    source_lower = source.casefold()
    return any(param in source_lower for param in functional)


def assignment(line: str) -> tuple[str, str] | None:
    match = ASSIGNMENT_RE.match(line)
    if not match:
        return None
    return match.group("left").casefold(), match.group("right").strip()


def update_assignment(line: str, states: dict[str, str]) -> None:
    parsed = assignment(line)
    if not parsed:
        return
    left, right = parsed
    states[left] = expr_state(right, states)


def update_collection_add(line: str, states: dict[str, str]) -> None:
    match = COLLECTION_ADD_RE.search(line)
    if not match:
        return
    collection = match.group("collection").casefold()
    item = match.group("item").casefold()
    if states.get(item) == INVALID:
        states[collection] = INVALID
    prefix = f"{item}."
    for key, value in list(states.items()):
        if key.startswith(prefix) and value == INVALID:
            states[f"{collection}.{key[len(prefix):]}"] = INVALID


def update_collection_loop_alias(line: str, states: dict[str, str]) -> None:
    match = COLLECTION_LOOP_RE.match(line)
    if not match:
        return
    item = match.group("item").casefold()
    collection = match.group("collection").casefold()
    if states.get(collection) == INVALID:
        states[item] = INVALID
    prefix = f"{collection}."
    for key, value in list(states.items()):
        if key.startswith(prefix) and value == INVALID:
            states[f"{item}.{key[len(prefix):]}"] = INVALID


def update_assignment_with_context(
    line: str,
    states: dict[str, str],
    invalid_contexts: list[tuple[str, list[str]]],
) -> None:
    parsed = assignment(line)
    if parsed and invalid_contexts and "." in parsed[0]:
        states[parsed[0]] = INVALID
        return
    update_assignment(line, states)


def mode_assignment(line: str) -> str:
    match = MODE_ASSIGNMENT_RE.search(line)
    if not match or not line_mentions_mode(match.group("var")):
        return ""
    return match.group("mode").upper() if match else ""


def level_id_assignment(line: str) -> str:
    match = LEVEL_ID_ASSIGNMENT_RE.search(line)
    if not match or not line_mentions_level_id(match.group("var")):
        return ""
    return match.group("level_id").upper() if match else ""


def literal_mode(value: str) -> str:
    value = clean_arg(value).strip().strip("'\"")
    return value.upper() if LITERAL_MODE_RE.fullmatch(value) else ""


def literal_level_id(value: str) -> str:
    value = clean_arg(value).strip().strip("'\"")
    return value.upper() if LITERAL_LEVEL_ID_RE.fullmatch(value) else ""


def mode_from_condition(line: str) -> str:
    match = MODE_CONDITION_RE.search(line)
    if not match or not line_mentions_mode(match.group("var")):
        return ""
    if match.group("op") != "=":
        return ""
    return match.group("mode").upper() if match else ""


def level_id_from_condition(line: str) -> str:
    match = LEVEL_ID_CONDITION_RE.search(line)
    if not match or not line_mentions_level_id(match.group("var")):
        return ""
    if match.group("op") != "=":
        return ""
    return match.group("level_id").upper() if match else ""


def mode_from_call_args(args: list[str], callee_parms: list[tuple[str, str]], saved_mode: str) -> str:
    for index, arg in enumerate(args):
        if index >= len(callee_parms):
            break
        param, direction = callee_parms[index]
        if direction not in {"in", "inout"} or not is_mode_param(param):
            continue
        mode = literal_mode(arg)
        if mode:
            return mode
    for arg in args:
        mode = literal_mode(arg)
        if mode:
            return mode
    return saved_mode


def level_id_from_call_args(args: list[str], callee_parms: list[tuple[str, str]], saved_level_id: str) -> str:
    for index, arg in enumerate(args):
        if index >= len(callee_parms):
            break
        param, direction = callee_parms[index]
        if direction not in {"in", "inout"} or not is_level_id_param(param):
            continue
        level_id = literal_level_id(arg)
        if level_id:
            return level_id
    return saved_level_id


def line_mentions_mode(line: str) -> bool:
    return bool(MODE_WORD_RE.search(line))


def line_mentions_level_id(line: str) -> bool:
    return "levelid" in line.casefold().replace("_", "")


def mode_mismatch(line: str, saved_mode: str) -> bool:
    if not saved_mode:
        return False
    comparisons = MODE_COMPARISON_RE.finditer(line)
    for match in comparisons:
        if not line_mentions_mode(match.group("var")):
            continue
        mode = match.group("mode").upper()
        op = match.group("op")
        if op == "=" and mode != saved_mode:
            return True
        if op in {"<>", "!="} and mode == saved_mode:
            return True
    return False


def numeric_text(value: str) -> int | None:
    return int(value) if value.isdigit() else None


def comparison_mismatch(saved_value: str, op: str, compared_value: str) -> bool:
    if op == "=":
        return compared_value != saved_value
    if op in {"<>", "!="}:
        return compared_value == saved_value

    saved_number = numeric_text(saved_value)
    compared_number = numeric_text(compared_value)
    if saved_number is None or compared_number is None:
        return False
    if op == ">":
        return not saved_number > compared_number
    if op == ">=":
        return not saved_number >= compared_number
    if op == "<":
        return not saved_number < compared_number
    if op == "<=":
        return not saved_number <= compared_number
    return False


def level_id_mismatch(line: str, saved_level_id: str) -> bool:
    if not saved_level_id:
        return False
    comparisons = LEVEL_ID_COMPARISON_RE.finditer(line)
    for match in comparisons:
        if not line_mentions_level_id(match.group("var")):
            continue
        level_id = match.group("level_id").upper()
        op = match.group("op")
        if comparison_mismatch(saved_level_id, op, level_id):
            return True
    return False


def case_mode_mismatch(line: str, saved_mode: str, selector_is_mode: bool) -> bool:
    if not saved_mode or not selector_is_mode:
        return False
    match = CASE_LITERAL_MODE_RE.match(line)
    return bool(match and match.group("mode").upper() != saved_mode)


def case_level_id_mismatch(line: str, saved_level_id: str, selector_is_level_id: bool) -> bool:
    if not saved_level_id or not selector_is_level_id:
        return False
    match = CASE_LITERAL_LEVEL_ID_RE.match(line)
    return bool(match and match.group("level_id").upper() != saved_level_id)


def parse_error_codes(line: str) -> list[str]:
    if "err" not in line.casefold():
        return []
    if CASE_RE.match(line.strip().casefold()):
        return []
    return [match.group("code") for match in ERROR_CODE_RE.finditer(line)]


def parse_error_message_near(lines: list[str], start_index: int) -> str:
    for line in lines[start_index + 1 : min(len(lines), start_index + 6)]:
        match = ERROR_STRING_RE.search(line)
        if match:
            return literal_value(match.group("value"))
    return ""


def split_subroutines(lines: list[str]) -> tuple[list[tuple[int, str]], dict[str, list[tuple[int, str]]]]:
    main: list[tuple[int, str]] = []
    subs: dict[str, list[tuple[int, str]]] = {}
    current_name = ""
    current_lines: list[tuple[int, str]] = []

    for line_no, line in enumerate(lines, start=1):
        sub_match = SUB_START_RE.match(line)
        if sub_match and not current_name:
            current_name = sub_match.group("name").casefold()
            current_lines = []
            continue
        if current_name:
            if SUB_END_RE.match(line):
                subs[current_name] = current_lines
                current_name = ""
                current_lines = []
            else:
                current_lines.append((line_no, line))
            continue
        main.append((line_no, line))

    return main, subs


def logical_lines(lines: list[tuple[int, str]]) -> list[tuple[int, str]]:
    result: list[tuple[int, str]] = []
    pending_line = 0
    pending_text = ""
    depth = 0

    for line_no, line in lines:
        text = line.rstrip()
        if pending_text:
            pending_text += " " + text.strip()
        else:
            pending_line = line_no
            pending_text = text

        depth += text.count("(") - text.count(")")
        if depth <= 0:
            result.append((pending_line, pending_text))
            pending_line = 0
            pending_text = ""
            depth = 0

    if pending_text:
        result.append((pending_line, pending_text))
    return result


def analyze_source(source: str) -> SourceAnalysis:
    cached = _SOURCE_ANALYSIS_CACHE.get(source)
    if cached is not None:
        return cached
    source_lines = uncomment_source(source).splitlines()
    main_lines, raw_subroutines = split_subroutines(source_lines)
    analysis = SourceAnalysis(
        source_lines=source_lines,
        main_lines=logical_lines(main_lines),
        subroutines={name: logical_lines(lines) for name, lines in raw_subroutines.items()},
    )
    _SOURCE_ANALYSIS_CACHE[source] = analysis
    return analysis


def subroutine_call(line: str) -> str:
    match = DO_SUB_RE.match(line)
    return match.group("name").casefold() if match else ""


def call_details(line: str) -> list[tuple[str, list[str], str]]:
    text = strip_line_comment(line)
    results: list[tuple[str, list[str], str]] = []
    seen: set[tuple[str, str]] = set()

    for match in CALL_PREFIX_RE.finditer(text):
        open_index = text.find("(", match.start())
        close_index = find_matching_paren(text, open_index)
        if close_index < 0:
            continue
        args = split_args(text[open_index + 1 : close_index])
        if not args:
            continue
        callee = normalize_program_name(clean_arg(args[0]))
        if not is_candidate_program(callee):
            continue
        call_text = text[match.start() : close_index + 1].strip()
        key = (callee.casefold(), call_text)
        if key not in seen:
            seen.add(key)
            results.append((callee, args[1:], call_text))

    for match in FUNCTION_CALL_RE.finditer(text):
        name = match.group("name")
        if name.casefold().endswith(".call"):
            continue
        prefix = name.split(".")[0]
        if "." in name and prefix in IGNORED_QUALIFIED_PREFIXES:
            continue
        callee = normalize_program_name(name)
        if not is_candidate_program(callee):
            continue
        open_index = text.find("(", match.start())
        close_index = find_matching_paren(text, open_index)
        if close_index < 0:
            continue
        args = split_args(text[open_index + 1 : close_index])
        call_text = text[match.start() : close_index + 1].strip()
        key = (callee.casefold(), call_text)
        if key not in seen:
            seen.add(key)
            results.append((callee, args, call_text))

    return results


def is_ignored_call(call_text: str, callee: str) -> bool:
    if callee.upper() in IGNORED_CALLEE_NAMES:
        return True
    if callee.upper().startswith("BTERA"):
        return True
    return call_text.lstrip().casefold().startswith("debug.debugapi.")


def catalog_lookup(master_catalog: dict[str, list[dict[str, str]]], code: str, program: str, model: str) -> tuple[str, str, str]:
    rows = master_catalog.get(code) or []
    if not rows:
        return "", "", ""
    for row in rows:
        if (row.get("object_name") or "").casefold() == program.casefold() and (row.get("model") or "").casefold() == model.casefold():
            return row.get("message", ""), row.get("object_name", ""), row.get("model", "")
    row = rows[0]
    return row.get("message", ""), row.get("object_name", ""), row.get("model", "")


def simulate_source(
    root_program: str,
    program: str,
    model: str,
    part: str,
    source: str,
    parms: list[tuple[str, str]],
    incoming_states: list[str],
    incoming_mode: str,
    incoming_level_id: str,
    master_catalog: dict[str, list[dict[str, str]]],
    get_program_parms,
) -> tuple[list[SimError], list[tuple[str, list[str], str, str]], list[SimCall]]:
    analysis = analyze_source(source)
    source_lines = analysis.source_lines
    work_items = deque(analysis.main_lines)
    subroutines = analysis.subroutines
    states = initialize_states(parms, incoming_states, incoming_mode, incoming_level_id)
    errors: list[SimError] = []
    backlog: list[tuple[str, list[str], str, str]] = []
    calls: list[SimCall] = []
    if_stack: list[tuple[str, list[str]] | None] = []
    foreach_stack: list[tuple[str, list[str]] | None] = []
    when_none_stack: list[tuple[str, list[str]] | None] = []
    case_matched_stack: list[bool] = []
    active_subroutines: set[str] = set()
    skip_until: str | None = None
    skip_case_depth = 0
    saved_mode = incoming_mode
    saved_level_id = incoming_level_id
    case_selector_is_mode = False
    case_selector_is_level_id = False

    while work_items:
        line_no, raw_line = work_items.popleft()
        if raw_line.startswith(SUBROUTINE_RETURN_MARKER):
            active_subroutines.discard(raw_line[len(SUBROUTINE_RETURN_MARKER) :])
            continue
        line = raw_line.strip()
        lower = line.casefold()

        if skip_until == "endif":
            if END_IF_RE.match(lower):
                skip_until = None
            continue
        if skip_until == "case":
            if DO_CASE_RE.match(lower):
                skip_case_depth += 1
                continue
            if END_CASE_RE.match(lower) and skip_case_depth > 0:
                skip_case_depth -= 1
                continue
            if skip_case_depth == 0 and CASE_BOUNDARY_RE.match(lower):
                skip_until = None
            else:
                continue

        if END_IF_RE.match(lower):
            if if_stack:
                if_stack.pop()
            continue
        if END_CASE_RE.match(lower):
            case_selector_is_mode = False
            case_selector_is_level_id = False
            if case_matched_stack:
                case_matched_stack.pop()
            continue
        if END_FOR_RE.match(lower):
            if foreach_stack:
                foreach_stack.pop()
            if when_none_stack:
                when_none_stack.pop()
            continue

        sub_name = subroutine_call(line)
        if sub_name and sub_name in subroutines:
            if sub_name in active_subroutines:
                continue
            active_subroutines.add(sub_name)
            work_items.appendleft((0, f"{SUBROUTINE_RETURN_MARKER}{sub_name}"))
            for item in reversed(subroutines[sub_name]):
                work_items.appendleft(item)
            continue

        new_mode = mode_assignment(line)
        if new_mode:
            saved_mode = new_mode
        new_level_id = level_id_assignment(line)
        if new_level_id:
            saved_level_id = new_level_id

        if DO_CASE_RE.match(lower):
            case_selector_is_mode = line_mentions_mode(line)
            case_selector_is_level_id = line_mentions_level_id(line)
            case_matched_stack.append(False)
            continue
        if CASE_RE.match(lower):
            if case_matched_stack and case_matched_stack[-1]:
                skip_until = "case"
                continue
            if (
                case_mode_mismatch(line, saved_mode, case_selector_is_mode)
                or case_level_id_mismatch(line, saved_level_id, case_selector_is_level_id)
                or mode_mismatch(line, saved_mode)
                or level_id_mismatch(line, saved_level_id)
            ):
                skip_until = "case"
                continue
            if case_matched_stack:
                case_matched_stack[-1] = True
            context_mode = mode_from_condition(line)
            if context_mode:
                saved_mode = context_mode
            context_level_id = level_id_from_condition(line)
            if context_level_id:
                saved_level_id = context_level_id
        if OTHERWISE_RE.match(lower):
            if case_matched_stack and case_matched_stack[-1]:
                skip_until = "case"
                continue
            if case_matched_stack:
                case_matched_stack[-1] = True

        if IF_RE.match(lower):
            condition = IF_PREFIX_RE.sub("", line)
            condition = THEN_SUFFIX_RE.sub("", condition).strip()
            if (
                (line_mentions_mode(condition) and mode_mismatch(condition, saved_mode))
                or (line_mentions_level_id(condition) and level_id_mismatch(condition, saved_level_id))
            ):
                skip_until = "endif"
                continue
            context_mode = mode_from_condition(condition)
            if context_mode:
                saved_mode = context_mode
            context_level_id = level_id_from_condition(condition)
            if context_level_id:
                saved_level_id = context_level_id
            invalid_vars = expr_invalid_vars(condition, states)
            if_stack.append((condition, invalid_vars) if invalid_vars else None)

        if FOR_EACH_RE.match(lower):
            foreach_stack.append(None)
        else:
            update_collection_loop_alias(line, states)

        if WHERE_RE.match(lower) and foreach_stack:
            invalid_vars = expr_invalid_vars(line, states)
            if invalid_vars and foreach_stack[-1] is None:
                foreach_stack[-1] = (line, invalid_vars)

        if WHEN_NONE_RE.match(lower) and foreach_stack:
            when_none_stack.append(foreach_stack[-1])

        active_invalid = [item for item in if_stack if item]
        assignment_invalid_contexts = list(active_invalid)
        assignment_invalid_contexts.extend(item for item in foreach_stack if item)
        active_invalid.extend(item for item in when_none_stack if item)
        in_when_none = bool(when_none_stack)
        emitted_contextual_error = False
        if active_invalid:
            condition_text = " AND ".join(item[0] for item in active_invalid)
            invalid_text = ",".join(sorted({var for _, vars_ in active_invalid for var in vars_}))
            for code in parse_error_codes(line):
                emitted_contextual_error = True
                message, catalog_program, catalog_model = catalog_lookup(master_catalog, code, program, model)
                errors.append(
                    SimError(
                        root_program=root_program,
                        program=program,
                        model=model,
                        part=part,
                        line=line_no,
                        code=code,
                        message=message or parse_error_message_near(source_lines, line_no - 1),
                        catalog_program=catalog_program,
                        catalog_model=catalog_model,
                        reason=f"invalid_params:{invalid_text}",
                        condition=condition_text,
                        source_line=line,
                    )
                )
        elif in_when_none:
            for code in parse_error_codes(line):
                emitted_contextual_error = True
                message, catalog_program, catalog_model = catalog_lookup(master_catalog, code, program, model)
                errors.append(
                    SimError(
                        root_program=root_program,
                        program=program,
                        model=model,
                        part=part,
                        line=line_no,
                        code=code,
                        message=message or parse_error_message_near(source_lines, line_no - 1),
                        catalog_program=catalog_program,
                        catalog_model=catalog_model,
                        reason="when_none",
                        condition="when none",
                        source_line=line,
                    )
                )
        if program.casefold() == root_program.casefold() and not emitted_contextual_error:
            for code in parse_error_codes(line):
                message, catalog_program, catalog_model = catalog_lookup(master_catalog, code, program, model)
                errors.append(
                    SimError(
                        root_program=root_program,
                        program=program,
                        model=model,
                        part=part,
                        line=line_no,
                        code=code,
                        message=message or parse_error_message_near(source_lines, line_no - 1),
                        catalog_program=catalog_program,
                        catalog_model=catalog_model,
                        reason="root_program",
                        condition="root program",
                        source_line=line,
                    )
                )

        for callee, args, call_text in call_details(line):
            if is_ignored_call(call_text, callee):
                continue
            callee_parms_by_model = get_program_parms(callee)
            callee_parms = first_parm_signature(callee_parms_by_model)
            raw_arg_states = [argument_state(clean_arg(arg), states) for arg in args]
            arg_states = apply_callee_directions(raw_arg_states, callee_parms)
            call_mode = mode_from_call_args(args, callee_parms, saved_mode)
            call_level_id = level_id_from_call_args(args, callee_parms, saved_level_id)
            calls.append(SimCall(program, callee, model, part, line_no, call_text))
            mark_return_args_valid(args, callee_parms, states)
            if SKIP_FULL_VALID_CALLS and all(state == VALID for state in arg_states):
                continue
            backlog.append((callee, arg_states, call_mode, call_level_id))

        update_assignment_with_context(line, states, assignment_invalid_contexts)
        update_collection_add(line, states)

    return errors, backlog, calls


def dedupe_errors(errors: list[SimError]) -> list[SimError]:
    best: dict[str, SimError] = {}
    programs_by_code: dict[str, set[str]] = {}
    for error in errors:
        programs_by_code.setdefault(error.code, set()).add(error.program)
        previous = best.get(error.code)
        if previous is None or (not previous.message and error.message):
            best[error.code] = error
    for code, error in best.items():
        error.returning_programs = ", ".join(sorted(programs_by_code.get(code, set())))
    return sorted(best.values(), key=lambda error: (int(error.code) if error.code.isdigit() else 10**18, error.code))


def simulate(
    root_program: str,
    kbs: list[KbCache],
    master_catalog: dict[str, list[dict[str, str]]],
    max_programs: int,
    verbose: bool,
) -> tuple[list[SimError], list[SimCall], list[str]]:
    queue: deque[tuple[str, list[str], str, str]] = deque([(root_program, [], "", "")])
    processed: set[tuple[str, str, str]] = set()
    source_cache: dict[str, list] = {}
    parm_cache: dict[str, dict[str, list[tuple[str, str]]]] = {}
    all_errors: list[SimError] = []
    all_calls: list[SimCall] = []
    unresolved: list[str] = []

    while queue and len(processed) < max_programs:
        program, incoming_states, incoming_mode, incoming_level_id = queue.popleft()
        key = (program.casefold(), incoming_mode, incoming_level_id)
        if key in processed:
            continue
        processed.add(key)
        if verbose:
            mode_text = f" mode={incoming_mode}" if incoming_mode else ""
            level_id_text = f" LevelId={incoming_level_id}" if incoming_level_id else ""
            print(f"Simulando {program}{mode_text}{level_id_text}", file=sys.stderr)

        parts = source_cache.get(program.casefold())
        if parts is None:
            parts = resolve_program_parts(kbs, program)
            source_cache[program.casefold()] = parts
        if not parts:
            unresolved.append(program)
            continue

        def get_program_parms(target_program: str) -> dict[str, list[tuple[str, str]]]:
            cached = parm_cache.get(target_program.casefold())
            if cached is not None:
                return cached
            target_parts = source_cache.get(target_program.casefold())
            if target_parts is None:
                target_parts = resolve_program_parts(kbs, target_program)
                source_cache[target_program.casefold()] = target_parts
            property_parms = property_parms_by_model(kbs, target_program)
            rule_parms = rule_parms_by_model(target_parts)
            cached = {**property_parms, **rule_parms}
            parm_cache[target_program.casefold()] = cached
            return cached

        parms_by_model = parm_cache.get(program.casefold())
        if parms_by_model is None:
            parms_by_model = get_program_parms(program)

        for part in parts:
            part_parms = parms_by_model.get(part.model) or first_parm_signature(parms_by_model)
            if part.part.casefold() in {"proceduresource", "dataprovidersource"} and not source_matches_parms(part.source, part_parms):
                continue
            errors, backlog, calls = simulate_source(
                root_program,
                part.object_name,
                part.model,
                part.part,
                part.source,
                part_parms,
                incoming_states,
                incoming_mode,
                incoming_level_id,
                master_catalog,
                get_program_parms,
            )
            all_errors.extend(errors)
            all_calls.extend(calls)
            for callee, arg_states, call_mode, call_level_id in backlog:
                if call_mode:
                    callee_parms = get_program_parms(callee)
                    if not accepts_mode_input(callee_parms):
                        call_mode = ""
                if call_level_id:
                    callee_parms = get_program_parms(callee)
                    if not accepts_level_id_input(callee_parms):
                        call_level_id = ""
                next_key = (callee.casefold(), call_mode, call_level_id)
                if next_key not in processed:
                    queue.append((callee, arg_states, call_mode, call_level_id))

    return dedupe_errors(all_errors), all_calls, unresolved


def write_csv(path: Path, rows: list[object]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not rows:
        path.write_text("", encoding="utf-8-sig")
        return
    fieldnames = list(rows[0].__dataclass_fields__)
    with path.open("w", newline="", encoding="utf-8-sig") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow(row.__dict__)


def md_cell(value: str) -> str:
    return value.replace("|", "\\|")


def simple_markdown(errors: list[SimError]) -> str:
    lines = ["| cod_err | err_msg | programas |", "|---:|---|---|"]
    for error in errors:
        lines.append(f"| {error.code} | {md_cell(error.message)} | {md_cell(error.returning_programs)} |")
    lines.append("")
    return "\n".join(lines)


def detail_markdown(errors: list[SimError], calls: list[SimCall], unresolved: list[str]) -> str:
    lines = [
        "# Simulacion estatica de flujo",
        "",
        "## Errores posibles",
        "",
        "| Codigo | Mensaje | Programas | Programa ejemplo | Modelo | Parte | Linea | Motivo | Condicion |",
        "|---:|---|---|---|---|---|---:|---|---|",
    ]
    for error in errors:
        lines.append(
            f"| {error.code} | {md_cell(error.message)} | {md_cell(error.returning_programs)} | {error.program} | {error.model} | "
            f"{error.part} | {error.line} | {md_cell(error.reason)} | {md_cell(error.condition)} |"
        )

    lines.extend(["", "## Llamados simulados", "", "| Caller | Callee | Modelo | Parte | Linea | Llamado |", "|---|---|---|---|---:|---|"])
    for call in calls:
        lines.append(f"| {call.caller} | {call.callee} | {call.model} | {call.part} | {call.line} | {md_cell(call.call_text)} |")

    if unresolved:
        lines.extend(["", "## No resueltos", ""])
        for program in sorted(set(unresolved)):
            lines.append(f"- {program}")
    lines.append("")
    return "\n".join(lines)


def call_tree_markdown(root_program: str, calls: list[SimCall], unresolved: list[str]) -> str:
    adjacency: dict[str, list[str]] = {}
    seen_edges: set[tuple[str, str]] = set()
    for call in calls:
        edge = (call.caller, call.callee)
        if edge in seen_edges:
            continue
        seen_edges.add(edge)
        adjacency.setdefault(call.caller, []).append(call.callee)

    lines = ["# Arbol de llamados", "", f"- {root_program}"]
    expanded: set[str] = set()

    def add_children(program: str, depth: int, path: set[str]) -> None:
        if program in expanded:
            return
        expanded.add(program)
        for callee in adjacency.get(program, []):
            suffix = ""
            if callee in path:
                suffix = " (ciclo)"
            elif callee in expanded:
                suffix = " (ya listado)"
            lines.append(f"{'  ' * depth}- {callee}{suffix}")
            if suffix:
                continue
            add_children(callee, depth + 1, path | {callee})

    add_children(root_program, 1, {root_program})

    if unresolved:
        lines.extend(["", "## No resueltos", ""])
        for program in sorted(set(unresolved)):
            lines.append(f"- {program}")
    lines.append("")
    return "\n".join(lines)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Simulate a GeneXus program flow and catalog possible errors.")
    parser.add_argument("program")
    parser.add_argument("--kb-config", type=Path, default=DEFAULT_KB_CONFIG, help="File with the Models root path")
    parser.add_argument("--models", type=Path, help="Optional Models root folder. Overrides --kb-config")
    parser.add_argument("--master-catalog", type=Path, default=DEFAULT_OUTPUT_DIR / "btera_errors.csv")
    parser.add_argument("--csv", type=Path, default=DEFAULT_OUTPUT_DIR / "simulated_error_catalog.csv")
    parser.add_argument("--calls-csv", type=Path, default=DEFAULT_OUTPUT_DIR / "simulated_calls.csv")
    parser.add_argument("--call-tree", type=Path, default=DEFAULT_OUTPUT_DIR / "simulated_call_tree.md")
    parser.add_argument("--diagnostics", type=Path, default=DEFAULT_OUTPUT_DIR / "unresolved_diagnostics.md")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUTPUT_DIR / "simulated_flow.md")
    parser.add_argument("--errors-md", type=Path, default=DEFAULT_OUTPUT_DIR / "simulated_errors_simple.md")
    parser.add_argument("--json", type=Path)
    parser.add_argument("--max-programs", type=int, default=500)
    parser.add_argument("--verbose", action="store_true")
    return parser


def main() -> int:
    configure_output()
    args = build_parser().parse_args()

    if args.models is not None and not args.models.exists():
        print(f"No existe la carpeta de modelos: {args.models}", file=sys.stderr)
        return 2

    if args.models is None and not args.kb_config.exists():
        print(f"No existe el archivo config: {args.kb_config}", file=sys.stderr)
        return 2

    kbs = load_kbs(args.models, args.kb_config)
    if not kbs:
        print(f"No encontre kb.data usando {kb_source_description(args.models, args.kb_config)}", file=sys.stderr)
        return 2

    master_catalog = load_master_catalog(args.master_catalog)
    errors, calls, unresolved = simulate(args.program, kbs, master_catalog, args.max_programs, args.verbose)

    write_csv(args.csv, errors)
    write_csv(args.calls_csv, calls)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.errors_md.parent.mkdir(parents=True, exist_ok=True)
    args.call_tree.parent.mkdir(parents=True, exist_ok=True)
    args.diagnostics.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(detail_markdown(errors, calls, unresolved), encoding="utf-8-sig")
    args.errors_md.write_text(simple_markdown(errors), encoding="utf-8-sig")
    args.call_tree.write_text(call_tree_markdown(args.program, calls, unresolved), encoding="utf-8-sig")
    diagnostic_blocks: list[str] = []
    for program in sorted(set(unresolved)):
        diagnostic_blocks.extend(diagnose_program_resolution(kbs, program))
        diagnostic_blocks.append("")
    args.diagnostics.write_text("\n".join(diagnostic_blocks), encoding="utf-8-sig")
    if args.json:
        args.json.parent.mkdir(parents=True, exist_ok=True)
        args.json.write_text(
            json.dumps(
                {"errors": [error.__dict__ for error in errors], "calls": [call.__dict__ for call in calls], "unresolved": unresolved},
                ensure_ascii=False,
                indent=2,
            ),
            encoding="utf-8",
        )

    print(f"Errores posibles: {len(errors)}")
    print(f"Llamados simulados: {len(calls)}")
    print(f"No resueltos: {len(set(unresolved))}")
    if unresolved:
        names = sorted(set(unresolved))
        preview = ", ".join(names[:20])
        suffix = "..." if len(names) > 20 else ""
        print(f"Programas no resueltos: {preview}{suffix}")
        print(f"Diagnostico no resueltos: {args.diagnostics}")
    print(f"CSV errores: {args.csv}")
    print(f"Markdown simple: {args.errors_md}")
    print(f"Arbol de llamados: {args.call_tree}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
