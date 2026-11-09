"""Durable local job queue: enqueue, lease claim, complete, reclaim, recover.

Filesystem store for cooperating workers on one machine. Not a distributed
queue and not safe on NFS. Effects are content-bound receipts (SHA-256).
"""

from __future__ import annotations

import hashlib
import json
import os
import time
import uuid
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Callable


@dataclass
class JobRecord:
    id: str
    payload_hash: str
    text: str
    status: str  # queued | running | completed | failed
    version: int
    attempts: int
    lease_owner: str | None = None
    lease_until_ms: int | None = None
    receipt_path: str | None = None
    error: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @staticmethod
    def from_dict(data: dict[str, Any]) -> "JobRecord":
        return JobRecord(**data)


class JobStore:
    def __init__(self, root: Path) -> None:
        self.root = root
        self.jobs_dir = root / "jobs"
        self.receipts_dir = root / "receipts"
        self.jobs_dir.mkdir(parents=True, exist_ok=True)
        self.receipts_dir.mkdir(parents=True, exist_ok=True)

    def _job_path(self, job_id: str) -> Path:
        safe = job_id.replace("/", "_").replace("\\", "_")
        return self.jobs_dir / f"{safe}.json"

    def _read(self, job_id: str) -> JobRecord | None:
        path = self._job_path(job_id)
        if not path.exists():
            return None
        return JobRecord.from_dict(json.loads(path.read_text(encoding="utf-8")))

    def _write_atomic(self, job: JobRecord) -> None:
        path = self._job_path(job.id)
        tmp = path.with_suffix(".json.tmp")
        tmp.write_text(json.dumps(job.to_dict(), indent=2) + "\n", encoding="utf-8")
        os.replace(tmp, path)

    def enqueue(self, job_id: str, text: str) -> dict[str, Any]:
        payload_hash = _sha256(text)
        existing = self._read(job_id)
        if existing is not None:
            if existing.payload_hash != payload_hash:
                return {
                    "ok": False,
                    "conflict": True,
                    "id": job_id,
                    "reason": "payload hash mismatch for existing job id",
                }
            return {"ok": True, "idempotent": True, "job": existing.to_dict()}
        job = JobRecord(
            id=job_id,
            payload_hash=payload_hash,
            text=text,
            status="queued",
            version=1,
            attempts=0,
        )
        self._write_atomic(job)
        return {"ok": True, "idempotent": False, "job": job.to_dict()}

    def list_jobs(self) -> list[JobRecord]:
        jobs = []
        for path in sorted(self.jobs_dir.glob("*.json")):
            jobs.append(JobRecord.from_dict(json.loads(path.read_text(encoding="utf-8"))))
        return jobs

    def status(self) -> dict[str, Any]:
        jobs = self.list_jobs()
        counts: dict[str, int] = {}
        for job in jobs:
            counts[job.status] = counts.get(job.status, 0) + 1
        return {
            "store": str(self.root),
            "counts": counts,
            "jobs": [j.to_dict() for j in jobs],
        }

    def claim(
        self,
        *,
        worker_id: str,
        now_ms: int | None = None,
        lease_ms: int = 30_000,
    ) -> JobRecord | None:
        now = _now_ms(now_ms)
        # Reclaim expired running jobs first.
        for job in self.list_jobs():
            if job.status == "running" and job.lease_until_ms is not None and job.lease_until_ms <= now:
                job.status = "queued"
                job.lease_owner = None
                job.lease_until_ms = None
                job.version += 1
                self._write_atomic(job)

        for job in self.list_jobs():
            if job.status != "queued":
                continue
            job.status = "running"
            job.lease_owner = worker_id
            job.lease_until_ms = now + lease_ms
            job.version += 1
            job.attempts += 1
            self._write_atomic(job)
            return job
        return None

    def complete(
        self,
        job_id: str,
        *,
        worker_id: str,
        expected_version: int,
        now_ms: int | None = None,
        effect_fn: Callable[[str], str] | None = None,
    ) -> dict[str, Any]:
        now = _now_ms(now_ms)
        job = self._read(job_id)
        if job is None:
            return {"ok": False, "reason": "missing job"}
        if job.status == "completed":
            return {
                "ok": True,
                "already_completed": True,
                "reused_effect": True,
                "job": job.to_dict(),
            }
        if job.status != "running":
            return {"ok": False, "reason": f"not running ({job.status})"}
        if job.lease_owner != worker_id:
            return {"ok": False, "reason": "lease owner mismatch"}
        if job.version != expected_version:
            return {"ok": False, "reason": "stale version"}
        if job.lease_until_ms is not None and job.lease_until_ms < now:
            return {"ok": False, "reason": "lease expired"}

        receipt_path = self.receipts_dir / f"{job.id}.json"
        reused = False
        if receipt_path.exists():
            reused = True
            receipt = json.loads(receipt_path.read_text(encoding="utf-8"))
        else:
            effect = (effect_fn or default_effect)(job.text)
            receipt = {
                "job_id": job.id,
                "payload_hash": job.payload_hash,
                "effect_sha256": _sha256(effect),
                "bytes": len(effect.encode("utf-8")),
                "words": len(effect.split()),
                "effect": effect,
            }
            tmp = receipt_path.with_suffix(".json.tmp")
            tmp.write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
            os.replace(tmp, receipt_path)

        job.status = "completed"
        job.lease_owner = None
        job.lease_until_ms = None
        job.receipt_path = str(receipt_path)
        job.version += 1
        self._write_atomic(job)
        return {
            "ok": True,
            "reused_effect": reused,
            "receipt": receipt,
            "job": job.to_dict(),
        }

    def fail(
        self,
        job_id: str,
        *,
        worker_id: str,
        expected_version: int,
        error: str,
    ) -> dict[str, Any]:
        job = self._read(job_id)
        if job is None:
            return {"ok": False, "reason": "missing job"}
        if job.lease_owner != worker_id or job.version != expected_version:
            return {"ok": False, "reason": "stale claim"}
        job.status = "failed"
        job.error = error
        job.lease_owner = None
        job.lease_until_ms = None
        job.version += 1
        self._write_atomic(job)
        return {"ok": True, "job": job.to_dict()}


def default_effect(text: str) -> str:
    """Deterministic report-like effect for the portfolio queue."""
    words = len(text.split())
    digest = _sha256(text)[:12]
    return f"Gmusic job receipt\nwords={words}\ndigest={digest}\nbody:\n{text.strip()}\n"


def _sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _now_ms(now_ms: int | None) -> int:
    return int(now_ms if now_ms is not None else time.time() * 1000)


def enqueue_many(store: JobStore, jobs: list[dict[str, str]]) -> list[dict[str, Any]]:
    return [store.enqueue(j["id"], j["text"]) for j in jobs]


def run_worker(
    store: JobStore,
    *,
    worker_id: str | None = None,
    max_jobs: int = 10,
    lease_ms: int = 30_000,
    now_ms: int | None = None,
    crash_after: str | None = None,
    clock_step_ms: int = 0,
) -> dict[str, Any]:
    worker_id = worker_id or f"worker-{uuid.uuid4().hex[:8]}"
    clock = _now_ms(now_ms)
    processed: list[dict[str, Any]] = []
    for _ in range(max_jobs):
        job = store.claim(worker_id=worker_id, now_ms=clock, lease_ms=lease_ms)
        if job is None:
            break
        if crash_after == "claim":
            return {
                "worker_id": worker_id,
                "crashed_after": "claim",
                "processed": processed,
                "hanging_job": job.to_dict(),
                "exit_hint": 86,
            }
        # Simulate effect persistence before completion.
        if crash_after == "effect":
            receipt_path = store.receipts_dir / f"{job.id}.json"
            if not receipt_path.exists():
                effect = default_effect(job.text)
                receipt = {
                    "job_id": job.id,
                    "payload_hash": job.payload_hash,
                    "effect_sha256": _sha256(effect),
                    "bytes": len(effect.encode("utf-8")),
                    "words": len(effect.split()),
                    "effect": effect,
                }
                receipt_path.write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
            return {
                "worker_id": worker_id,
                "crashed_after": "effect",
                "processed": processed,
                "hanging_job": job.to_dict(),
                "exit_hint": 86,
            }
        result = store.complete(
            job.id,
            worker_id=worker_id,
            expected_version=job.version,
            now_ms=clock,
        )
        processed.append(result)
        if clock_step_ms:
            clock += clock_step_ms
        crash_after = None  # only first job in crash demos
    return {"worker_id": worker_id, "processed": processed, "crashed_after": None}


def run_jobs_demo(root: Path) -> dict[str, Any]:
    """Crash after effect, then recover with reused_effect=true."""
    store_path = root / "outputs" / "job-store"
    if store_path.exists():
        # Fresh demo store each run.
        for path in store_path.rglob("*"):
            if path.is_file():
                path.unlink()
    store = JobStore(store_path)
    samples = [
        {"id": "incident-summary", "text": "Student refund delayed after cancel; needs policy cite."},
        {"id": "tuning-faq", "text": "How do I tune guitar strings to standard EADGBE?"},
    ]
    enqueued = enqueue_many(store, samples)
    crash = run_worker(
        store,
        worker_id="w-crash",
        max_jobs=1,
        lease_ms=10,
        now_ms=100,
        crash_after="effect",
    )
    mid = store.status()
    recover = run_worker(
        store,
        worker_id="w-recover",
        max_jobs=10,
        lease_ms=10,
        now_ms=111,
    )
    final = store.status()
    reused = any(p.get("reused_effect") for p in recover.get("processed", []))
    evidence = root / "outputs" / "evidence" / "jobs-demo.json"
    evidence.parent.mkdir(parents=True, exist_ok=True)
    report = {
        "schema_version": 1,
        "enqueued": enqueued,
        "crash": crash,
        "status_after_crash": mid,
        "recover": recover,
        "status_final": final,
        "reused_effect": reused,
        "pass": final["counts"].get("completed", 0) == 2 and reused,
    }
    evidence.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    report["evidence_path"] = str(evidence)
    return report
