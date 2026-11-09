"""Paso 3 — corpus Gmusic real + RAG gate over product queries."""

from __future__ import annotations

import json
import unittest
from pathlib import Path

from workbench.mcp_server import handle_catalog_search, load_catalog
from workbench.rag_eval import compare, run_gate

ROOT = Path(__file__).resolve().parent.parent
REPO = ROOT.parent.parent  # proyectogmusic-cursor
CORPUS = ROOT / "fixtures" / "gmusic-corpus" / "documents.json"


class TestGmusicCorpus(unittest.TestCase):
    def test_corpus_sources_exist_in_repo(self) -> None:
        data = json.loads(CORPUS.read_text(encoding="utf-8"))
        self.assertGreaterEqual(len(data["documents"]), 5)
        for doc in data["documents"]:
            rel = doc["source_path"]
            path = REPO / rel
            self.assertTrue(path.exists(), f"missing source: {rel}")
            self.assertTrue(doc["id"].startswith("doc-"))
            self.assertGreaterEqual(len(doc["text"]), 40)

    def test_mcp_catalog_uses_gmusic_corpus(self) -> None:
        docs = load_catalog(ROOT)
        ids = {d["id"] for d in docs}
        self.assertIn("doc-access-subscription", ids)
        self.assertIn("doc-clase-gratuita", ids)

    def test_catalog_search_finds_subscription_access(self) -> None:
        out = handle_catalog_search(
            {"query": "suscripcion activa zona alumno", "max_chars": 800, "k": 3},
            ROOT,
        )
        self.assertGreaterEqual(len(out["results"]), 1)
        self.assertEqual(out["results"][0]["id"], "doc-access-subscription")

    def test_rag_ok_passes_and_regress_fails(self) -> None:
        fixture = ROOT / "fixtures" / "retrieval"
        baseline = json.loads((fixture / "baseline.json").read_text(encoding="utf-8"))
        ok = json.loads((fixture / "candidate_ok.json").read_text(encoding="utf-8"))
        bad = json.loads((fixture / "candidate_regress.json").read_text(encoding="utf-8"))
        judgments = json.loads((fixture / "judgments.json").read_text(encoding="utf-8"))
        self.assertTrue(compare(baseline, ok, judgments, k=3)["pass"])
        regress = compare(baseline, bad, judgments, k=3)
        self.assertFalse(regress["pass"])
        self.assertGreaterEqual(len(regress["regressions"]), 1)

    def test_run_gate_writes_gmusic_diff(self) -> None:
        report = run_gate(ROOT, candidate_name="candidate_ok.json", out_name="gmusic-retrieval-diff.json")
        self.assertTrue(report["pass"])
        self.assertTrue(Path(report["evidence_path"]).exists())
        # Query set must be the Spanish product queries.
        self.assertIn("acceso-zona-alumno", report["baseline"]["queries"])
        self.assertIn("garantia-reembolso", report["baseline"]["queries"])


if __name__ == "__main__":
    unittest.main()
