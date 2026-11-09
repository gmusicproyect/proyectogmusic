"""Retrieval regression gate for the Gmusic workbench.

Compares baseline vs candidate rankings with graded judgments.
Fails the release gate when any query loses NDCG.
"""

from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Any


def validate(ranking: list[str], judgments: dict[str, int], k: int) -> None:
    if not isinstance(k, int) or isinstance(k, bool) or k < 1:
        raise ValueError("k must be a positive int")
    if not ranking or any(not isinstance(d, str) or not d for d in ranking):
        raise ValueError("ranking needs non-empty string doc ids")
    if len(set(ranking)) != len(ranking):
        raise ValueError("ranking doc ids must be unique")
    for grade in judgments.values():
        if not isinstance(grade, int) or isinstance(grade, bool) or not 0 <= grade <= 3:
            raise ValueError("grades must be ints in 0..3")


def precision_recall(ranking: list[str], judgments: dict[str, int], k: int) -> dict[str, float]:
    validate(ranking, judgments, k)
    relevant = {doc for doc, g in judgments.items() if g > 0}
    hits = len(set(ranking[:k]) & relevant)
    return {
        "precision": hits / k,
        "recall": hits / len(relevant) if relevant else 0.0,
    }


def rank_metrics(ranking: list[str], judgments: dict[str, int], k: int) -> dict[str, float]:
    validate(ranking, judgments, k)
    rr = next(
        (1 / (i + 1) for i, doc in enumerate(ranking[:k]) if judgments.get(doc, 0) > 0),
        0.0,
    )
    dcg = sum(
        (2 ** judgments.get(doc, 0) - 1) / math.log2(i + 2)
        for i, doc in enumerate(ranking[:k])
    )
    ideal = sum(
        (2**g - 1) / math.log2(i + 2)
        for i, g in enumerate(sorted(judgments.values(), reverse=True)[:k])
    )
    return {"rr": rr, "ndcg": (dcg / ideal) if ideal else 0.0}


def score_system(
    rankings: dict[str, list[str]],
    judgments: dict[str, dict[str, int]],
    k: int,
) -> dict[str, Any]:
    if set(rankings) != set(judgments):
        raise ValueError("systems must cover identical judged queries")
    rows: dict[str, dict[str, float]] = {}
    for query, ranking in rankings.items():
        rows[query] = {
            **precision_recall(ranking, judgments[query], k),
            **rank_metrics(ranking, judgments[query], k),
            "unjudged": float(sum(1 for d in ranking[:k] if d not in judgments[query])),
        }
    means = {
        m: sum(row[m] for row in rows.values()) / len(rows)
        for m in ("precision", "recall", "rr", "ndcg")
    }
    return {"queries": rows, "mean": means}


def compare(
    baseline: dict[str, list[str]],
    candidate: dict[str, list[str]],
    judgments: dict[str, dict[str, int]],
    k: int = 3,
) -> dict[str, Any]:
    base = score_system(baseline, judgments, k)
    cand = score_system(candidate, judgments, k)
    deltas = {}
    regressions = []
    for query in judgments:
        delta = cand["queries"][query]["ndcg"] - base["queries"][query]["ndcg"]
        deltas[query] = {
            "baseline_ndcg": base["queries"][query]["ndcg"],
            "candidate_ndcg": cand["queries"][query]["ndcg"],
            "delta_ndcg": delta,
        }
        if delta < -1e-12:
            regressions.append(query)
    return {
        "schema_version": 1,
        "k": k,
        "baseline": base,
        "candidate": cand,
        "deltas": deltas,
        "regressions": regressions,
        "pass": len(regressions) == 0,
        "mean_delta_ndcg": cand["mean"]["ndcg"] - base["mean"]["ndcg"],
    }


def run_gate(
    root: Path,
    *,
    candidate_name: str = "candidate_ok.json",
    k: int = 3,
    out_name: str = "retrieval-diff.json",
) -> dict[str, Any]:
    fixture = root / "fixtures" / "retrieval"
    baseline = json.loads((fixture / "baseline.json").read_text(encoding="utf-8"))
    candidate = json.loads((fixture / candidate_name).read_text(encoding="utf-8"))
    judgments = json.loads((fixture / "judgments.json").read_text(encoding="utf-8"))
    report = compare(baseline, candidate, judgments, k=k)
    out = root / "outputs" / "evidence" / out_name
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    report["evidence_path"] = str(out)
    return report
