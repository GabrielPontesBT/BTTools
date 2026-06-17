#!/usr/bin/env python
"""Helpers to resolve configured GeneXus KB locations."""

from __future__ import annotations

import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[1]
DEFAULT_MODELS_DIR = BASE_DIR / "Models"
DEFAULT_KB_CONFIG = BASE_DIR / "kb_paths.config"


def normalize_configured_path(value: str, base_dir: Path) -> Path:
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
        value = value[1:-1].strip()
    value = os.path.expandvars(value)
    path = Path(value).expanduser()
    if not path.is_absolute():
        path = base_dir / path
    return path


def read_models_root(config_path: Path = DEFAULT_KB_CONFIG) -> Path:
    """Read the root directory that contains model folders."""
    base_dir = config_path.parent

    for raw_line in config_path.read_text(encoding="utf-8-sig").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        return normalize_configured_path(line, base_dir)

    return DEFAULT_MODELS_DIR


def find_kb_data_files(models_root: Path) -> list[Path]:
    if not models_root.exists():
        return []
    return sorted(path for path in models_root.rglob("*") if path.is_file() and path.name.casefold() == "kb.data")


def kb_files_from_config(config_path: Path = DEFAULT_KB_CONFIG) -> list[Path]:
    models_root = read_models_root(config_path)
    return find_kb_data_files(models_root)


def find_kb_files(models_dir: Path | None = None, config_path: Path = DEFAULT_KB_CONFIG) -> list[Path]:
    if models_dir is not None:
        return find_kb_data_files(models_dir)
    if config_path.exists():
        return kb_files_from_config(config_path)
    return find_kb_data_files(DEFAULT_MODELS_DIR)


def kb_source_description(models_dir: Path | None = None, config_path: Path = DEFAULT_KB_CONFIG) -> str:
    if models_dir is not None:
        return str(models_dir)
    if config_path.exists():
        return f"{config_path} -> {read_models_root(config_path)}"
    return str(DEFAULT_MODELS_DIR)
