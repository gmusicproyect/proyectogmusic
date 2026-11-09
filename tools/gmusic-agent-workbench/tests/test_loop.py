"""End-to-end offline demo tests."""

from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path
import shutil

from workbench.loop import run_demo

ROOT = Path(__file__).resolve().parent.parent


class TestLoop(unittest.TestCase):
    def test_demo_passes_and_writes_evidence(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            dest = Path(tmp) / "wb"
            shutil.copytree(
                ROOT,
                dest,
                ignore=shutil.ignore_patterns("outputs", "__pycache__", ".pytest_cache"),
            )
            result = run_demo(dest)
            self.assertEqual(result["outcome"], "pass")
            self.assertEqual(result["before_exit"], 1)
            self.assertEqual(result["after_exit"], 0)
            evidence = Path(result["evidence"])
            for name in ("trace.jsonl", "audit.json", "verify.json", "cost.json", "handoff.md", "decision.json"):
                self.assertTrue((evidence / name).exists(), name)
            audit = json.loads((evidence / "audit.json").read_text(encoding="utf-8"))
            decisions = [row["decision"] for row in audit]
            self.assertIn("needs_approval", decisions)
            self.assertIn("allow", decisions)
            self.assertIn("reject", decisions)


if __name__ == "__main__":
    unittest.main()
