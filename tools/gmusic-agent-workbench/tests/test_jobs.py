"""Durable job queue tests."""

from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from workbench.jobs import JobStore, enqueue_many, run_jobs_demo, run_worker

ROOT = Path(__file__).resolve().parent.parent


class TestJobs(unittest.TestCase):
    def test_enqueue_idempotent_and_conflict(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            store = JobStore(Path(tmp))
            a = store.enqueue("j1", "hello")
            b = store.enqueue("j1", "hello")
            c = store.enqueue("j1", "other")
            self.assertTrue(a["ok"] and not a["idempotent"])
            self.assertTrue(b["ok"] and b["idempotent"])
            self.assertFalse(c["ok"])
            self.assertTrue(c["conflict"])

    def test_claim_complete_happy_path(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            store = JobStore(Path(tmp))
            store.enqueue("j1", "report body")
            job = store.claim(worker_id="w1", now_ms=1000, lease_ms=5000)
            self.assertIsNotNone(job)
            assert job is not None
            result = store.complete(
                job.id, worker_id="w1", expected_version=job.version, now_ms=1100
            )
            self.assertTrue(result["ok"])
            self.assertFalse(result["reused_effect"])
            self.assertEqual(store._read("j1").status, "completed")

    def test_expired_lease_reclaimed(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            store = JobStore(Path(tmp))
            store.enqueue("j1", "body")
            first = store.claim(worker_id="w1", now_ms=100, lease_ms=10)
            assert first is not None
            # Lease expired; another worker can reclaim.
            second = store.claim(worker_id="w2", now_ms=120, lease_ms=10)
            self.assertIsNotNone(second)
            assert second is not None
            self.assertEqual(second.lease_owner, "w2")
            self.assertGreater(second.attempts, first.attempts)
            stale = store.complete(
                first.id, worker_id="w1", expected_version=first.version, now_ms=130
            )
            self.assertFalse(stale["ok"])

    def test_crash_after_effect_then_reuse(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            # Minimal workbench-shaped tree for demo helper.
            (root / "outputs" / "evidence").mkdir(parents=True)
            report = run_jobs_demo(root)
            self.assertTrue(report["pass"])
            self.assertTrue(report["reused_effect"])
            self.assertEqual(report["status_final"]["counts"].get("completed"), 2)

    def test_worker_processes_sample_fixture(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            store = JobStore(Path(tmp))
            samples = json.loads(
                (ROOT / "fixtures" / "jobs" / "sample.json").read_text(encoding="utf-8")
            )
            enqueue_many(store, samples)
            out = run_worker(store, worker_id="w", max_jobs=10, now_ms=1, lease_ms=1000)
            self.assertEqual(len(out["processed"]), 2)
            self.assertTrue(all(p["ok"] for p in out["processed"]))


if __name__ == "__main__":
    unittest.main()
