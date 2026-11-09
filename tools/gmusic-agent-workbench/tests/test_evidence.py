"""Evidence bundle tests."""

from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from workbench.evidence import write_bundle


class TestEvidence(unittest.TestCase):
    def test_bundle_shapes(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            out = write_bundle(
                Path(tmp),
                task_id="T-1",
                outcome="pass",
                audit=[{"decision": "allow"}],
                verify={"after": {"exit_code": 0}},
                steps=3,
                residual_risk="none",
            )
            cost = json.loads((out / "cost.json").read_text(encoding="utf-8"))
            self.assertEqual(cost["accepted_outcomes"], 1)
            self.assertIsNotNone(cost["cost_per_successful_outcome_usd"])
            decision = json.loads((out / "decision.json").read_text(encoding="utf-8"))
            self.assertEqual(decision["recommendation"], "merge_after_review")


if __name__ == "__main__":
    unittest.main()
