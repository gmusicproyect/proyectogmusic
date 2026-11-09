"""Disposable workspace helpers."""

from __future__ import annotations

import shutil
from pathlib import Path


def materialize(fixture_dir: Path, dest: Path) -> Path:
    if dest.exists():
        shutil.rmtree(dest)
    shutil.copytree(fixture_dir, dest)
    return dest.resolve()


def resolve_inside(root: Path, rel: str) -> Path:
    candidate = (root / rel).resolve()
    candidate.relative_to(root.resolve())
    return candidate
