"""Evidence bundle writer for reviewer handoff."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def write_bundle(
    out_dir: Path,
    *,
    task_id: str,
    outcome: str,
    audit: list[dict[str, Any]],
    verify: dict[str, Any],
    steps: int,
    residual_risk: str,
) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "audit.json").write_text(
        json.dumps(audit, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    (out_dir / "verify.json").write_text(
        json.dumps(verify, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    # Offline demo: model cost = 0; one review minute placeholder.
    cost = {
        "schema_version": 1,
        "task_id": task_id,
        "model_usd": 0.0,
        "infra_usd": 0.0,
        "human_review_hours": 0.02,
        "human_hourly_rate_usd": 20.0,
        "human_review_usd": 0.4,
        "attempts": steps,
        "accepted_outcomes": 1 if outcome == "pass" else 0,
        "cost_per_successful_outcome_usd": 0.4 if outcome == "pass" else None,
        "accounting_window": "offline-demo",
    }
    (out_dir / "cost.json").write_text(
        json.dumps(cost, indent=2) + "\n", encoding="utf-8"
    )

    handoff = f"""# Handoff — {task_id}

- Generated: {datetime.now(timezone.utc).isoformat()}
- Outcome: **{outcome}**
- Steps: {steps}
- Residual risk: {residual_risk}

## Decision needed
{"Merge the disposable workspace patch into the target repo after human review." if outcome == "pass" else "Do not merge. Inspect audit.json and re-run with a corrected proposal."}

## Artifacts
- `trace.jsonl`
- `audit.json`
- `verify.json`
- `cost.json`
"""
    (out_dir / "handoff.md").write_text(handoff, encoding="utf-8")

    decision = {
        "task_id": task_id,
        "recommendation": "merge_after_review" if outcome == "pass" else "stop",
        "evidence": ["trace.jsonl", "audit.json", "verify.json", "cost.json"],
        "unresolved_risk": residual_risk,
    }
    (out_dir / "decision.json").write_text(
        json.dumps(decision, indent=2) + "\n", encoding="utf-8"
    )
    return out_dir
