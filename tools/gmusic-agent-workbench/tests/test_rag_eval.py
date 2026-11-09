"""Retrieval evaluation gate tests."""

from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path
import shutil

from workbench.rag_eval import compare, precision_recall, rank_metrics, run_gate, validate

ROOT = Path(__file__).resolve().parent.parent


class TestRagEval(unittest.TestCase):
    def test_validate_rejects_duplicates(self) -> None:
        with self.assertRaises(ValueError):
            validate(["a", "a"], {"a": 1}, 1)

    def test_precision_recall(self) -> None:
        out = precision_recall(["a", "b"], {"a": 2, "c": 1}, 2)
        self.assertEqual(out["precision"], 0.5)
        self.assertEqual(out["recall"], 0.5)

    def test_ndcg_prefers_high_grades_early(self) -> None:
        good = rank_metrics(["a", "b"], {"a": 3, "b": 1}, 2)["ndcg"]
        bad = rank_metrics(["b", "a"], {"a": 3, "b": 1}, 2)["ndcg"]
        self.assertGreater(good, bad)

    def test_ok_candidate_passes_gate(self) -> None:
        fixture = ROOT / "fixtures" / "retrieval"
        baseline = json.loads((fixture / "baseline.json").read_text(encoding="utf-8"))
        candidate = json.loads((fixture / "candidate_ok.json").read_text(encoding="utf-8"))
        judgments = json.loads((fixture / "judgments.json").read_text(encoding="utf-8"))
        report = compare(baseline, candidate, judgments, k=3)
        self.assertTrue(report["pass"])
        self.assertEqual(report["regressions"], [])

    def test_regress_candidate_fails_gate(self) -> None:
        fixture = ROOT / "fixtures" / "retrieval"
        baseline = json.loads((fixture / "baseline.json").read_text(encoding="utf-8"))
        candidate = json.loads((fixture / "candidate_regress.json").read_text(encoding="utf-8"))
        judgments = json.loads((fixture / "judgments.json").read_text(encoding="utf-8"))
        report = compare(baseline, candidate, judgments, k=3)
        self.assertFalse(report["pass"])
        self.assertGreaterEqual(len(report["regressions"]), 1)

    def test_run_gate_writes_evidence(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            dest = Path(tmp) / "wb"
            shutil.copytree(
                ROOT,
                dest,
                ignore=shutil.ignore_patterns("outputs", "__pycache__"),
            )
            ok = run_gate(dest, candidate_name="candidate_ok.json")
            bad = run_gate(
                dest,
                candidate_name="candidate_regress.json",
                out_name="retrieval-diff-regress.json",
            )
            self.assertTrue(ok["pass"])
            self.assertFalse(bad["pass"])
            self.assertTrue(Path(ok["evidence_path"]).exists())


if __name__ == "__main__":
    unittest.main()
