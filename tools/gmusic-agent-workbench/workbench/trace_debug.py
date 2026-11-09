"""Trace debugger for Gmusic workbench JSONL events.

Parses session events, computes wall/own timings, flags anomalies, and can
diff two traces. Emits JSON + a small HTML timeline for reviewers.
"""

from __future__ import annotations

import html
import json
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any


@dataclass
class Event:
    index: int
    ts: datetime
    kind: str
    raw: dict[str, Any]
    duration_ms: float = 0.0  # own time until next event (last = 0)


def parse_trace(path: Path) -> list[Event]:
    events: list[Event] = []
    for i, line in enumerate(path.read_text(encoding="utf-8").splitlines()):
        line = line.strip()
        if not line:
            continue
        raw = json.loads(line)
        if "ts" not in raw or "kind" not in raw:
            raise ValueError(f"line {i+1}: event needs ts and kind")
        ts = datetime.fromisoformat(raw["ts"])
        events.append(Event(index=i, ts=ts, kind=raw["kind"], raw=raw))
    if not events:
        raise ValueError("trace is empty")
    for i, ev in enumerate(events[:-1]):
        ev.duration_ms = (events[i + 1].ts - ev.ts).total_seconds() * 1000.0
    events[-1].duration_ms = 0.0
    return events


def summarize(events: list[Event]) -> dict[str, Any]:
    wall_ms = (events[-1].ts - events[0].ts).total_seconds() * 1000.0
    tools = [e for e in events if e.kind == "tool"]
    verifies = [e for e in events if e.kind == "verify"]
    by_decision: dict[str, int] = {}
    by_tool: dict[str, int] = {}
    for e in tools:
        decision = str(e.raw.get("decision", "unknown"))
        by_decision[decision] = by_decision.get(decision, 0) + 1
        tool = str(e.raw.get("tool", "unknown"))
        by_tool[tool] = by_tool.get(tool, 0) + 1

    anomalies = _find_anomalies(events)
    outcome = next(
        (e.raw.get("outcome") for e in events if e.kind == "session_end"),
        None,
    )
    return {
        "schema_version": 1,
        "event_count": len(events),
        "wall_ms": wall_ms,
        "own_ms_total": sum(e.duration_ms for e in events),
        "tool_count": len(tools),
        "verify_count": len(verifies),
        "by_decision": by_decision,
        "by_tool": by_tool,
        "outcome": outcome,
        "anomalies": anomalies,
        "timeline": [
            {
                "index": e.index,
                "kind": e.kind,
                "ts": e.ts.isoformat(),
                "own_ms": round(e.duration_ms, 3),
                "label": _label(e),
                "decision": e.raw.get("decision"),
                "tool": e.raw.get("tool"),
                "phase": e.raw.get("phase"),
                "exit_code": e.raw.get("exit_code"),
            }
            for e in events
        ],
    }


def _label(e: Event) -> str:
    if e.kind == "tool":
        return f"{e.raw.get('tool')} → {e.raw.get('decision')} ({e.raw.get('path', '')})"
    if e.kind == "plan":
        return f"plan[{e.raw.get('source')}] {e.raw.get('path')}: {e.raw.get('rationale', '')[:80]}"
    if e.kind == "verify":
        return f"verify {e.raw.get('phase')} exit={e.raw.get('exit_code')}"
    if e.kind == "session_start":
        return f"start {e.raw.get('task_id')}"
    if e.kind == "session_end":
        return f"end outcome={e.raw.get('outcome')}"
    return e.kind


def _find_anomalies(events: list[Event]) -> list[dict[str, Any]]:
    found: list[dict[str, Any]] = []
    before = next(
        (e for e in events if e.kind == "verify" and e.raw.get("phase") == "before"),
        None,
    )
    after = next(
        (e for e in events if e.kind == "verify" and e.raw.get("phase") == "after"),
        None,
    )
    if before and before.raw.get("exit_code") == 0:
        found.append(
            {
                "code": "before_already_green",
                "message": "before verify already passed; repair may be unnecessary",
                "index": before.index,
            }
        )
    if after and after.raw.get("exit_code") not in (0, None):
        found.append(
            {
                "code": "after_still_red",
                "message": "after verify still failing",
                "index": after.index,
            }
        )
    if before and after and before.raw.get("exit_code") != 0 and after.raw.get("exit_code") == 0:
        # expected happy path — not an anomaly
        pass

    rejects = [e for e in events if e.kind == "tool" and e.raw.get("decision") == "reject"]
    for e in rejects:
        found.append(
            {
                "code": "tool_rejected",
                "message": f"{e.raw.get('tool')} rejected: {e.raw.get('reason')}",
                "index": e.index,
            }
        )

    needs = [e for e in events if e.kind == "tool" and e.raw.get("decision") == "needs_approval"]
    for e in needs:
        token = e.raw.get("approval_token")
        later_allow = any(
            x.index > e.index
            and x.kind == "tool"
            and x.raw.get("decision") == "allow"
            and x.raw.get("tool") == e.raw.get("tool")
            and x.raw.get("path") == e.raw.get("path")
            for x in events
        )
        if not later_allow:
            found.append(
                {
                    "code": "approval_never_consumed",
                    "message": f"approval requested but never applied (token={token})",
                    "index": e.index,
                }
            )

    end = next((e for e in events if e.kind == "session_end"), None)
    if end is None:
        found.append({"code": "missing_session_end", "message": "trace has no session_end", "index": -1})
    return found


def diff_summaries(baseline: dict[str, Any], candidate: dict[str, Any]) -> dict[str, Any]:
    keys = ("event_count", "wall_ms", "tool_count", "verify_count")
    deltas = {k: candidate[k] - baseline[k] for k in keys}
    base_dec = baseline.get("by_decision", {})
    cand_dec = candidate.get("by_decision", {})
    decision_keys = sorted(set(base_dec) | set(cand_dec))
    decision_deltas = {
        d: cand_dec.get(d, 0) - base_dec.get(d, 0) for d in decision_keys
    }
    regressions: list[str] = []
    if decision_deltas.get("reject", 0) > 0:
        regressions.append("more_rejects")
    if candidate.get("outcome") == "fail" and baseline.get("outcome") == "pass":
        regressions.append("outcome_pass_to_fail")
    if any(a["code"] == "after_still_red" for a in candidate.get("anomalies", [])):
        if not any(a["code"] == "after_still_red" for a in baseline.get("anomalies", [])):
            regressions.append("new_after_still_red")
    return {
        "deltas": deltas,
        "decision_deltas": decision_deltas,
        "regressions": regressions,
        "pass": len(regressions) == 0,
    }


def render_html(summary: dict[str, Any], title: str = "Gmusic Trace Debugger") -> str:
    rows = []
    max_own = max((row["own_ms"] for row in summary["timeline"]), default=1.0) or 1.0
    for row in summary["timeline"]:
        width = max(2.0, (row["own_ms"] / max_own) * 100.0)
        color = {
            "allow": "#2f6fed",
            "needs_approval": "#c47d00",
            "reject": "#b42318",
        }.get(row.get("decision") or "", "#555")
        if row["kind"] == "verify":
            color = "#0a7a3e" if row.get("exit_code") == 0 else "#b42318"
        rows.append(
            "<tr>"
            f"<td>{row['index']}</td>"
            f"<td>{html.escape(row['kind'])}</td>"
            f"<td>{html.escape(row['label'])}</td>"
            f"<td>{row['own_ms']:.3f}</td>"
            f"<td><div style='height:10px;width:{width:.1f}%;background:{color};'></div></td>"
            "</tr>"
        )
    anomalies = "".join(
        f"<li><code>{html.escape(a['code'])}</code>: {html.escape(a['message'])}</li>"
        for a in summary.get("anomalies", [])
    ) or "<li>none</li>"
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>{html.escape(title)}</title>
  <style>
    body {{ font-family: ui-sans-serif, system-ui, sans-serif; margin: 2rem; color: #111; }}
    table {{ border-collapse: collapse; width: 100%; }}
    th, td {{ border-bottom: 1px solid #ddd; padding: 0.4rem 0.5rem; text-align: left; font-size: 0.92rem; }}
    th {{ font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.04em; color: #555; }}
    .meta {{ margin-bottom: 1.5rem; }}
  </style>
</head>
<body>
  <h1>{html.escape(title)}</h1>
  <div class="meta">
    <div>events: {summary['event_count']} · wall_ms: {summary['wall_ms']:.3f} · outcome: {html.escape(str(summary.get('outcome')))}</div>
    <div>decisions: {html.escape(json.dumps(summary.get('by_decision', {})))}</div>
  </div>
  <h2>Anomalies</h2>
  <ul>{anomalies}</ul>
  <h2>Timeline</h2>
  <table>
    <thead><tr><th>#</th><th>kind</th><th>label</th><th>own_ms</th><th>bar</th></tr></thead>
    <tbody>
      {''.join(rows)}
    </tbody>
  </table>
</body>
</html>
"""


def debug_trace(
    trace_path: Path,
    *,
    out_json: Path,
    out_html: Path,
    baseline_path: Path | None = None,
) -> dict[str, Any]:
    events = parse_trace(trace_path)
    summary = summarize(events)
    report: dict[str, Any] = {"trace": str(trace_path), "summary": summary}
    if baseline_path is not None:
        base = summarize(parse_trace(baseline_path))
        report["baseline"] = str(baseline_path)
        report["diff"] = diff_summaries(base, summary)
    out_json.parent.mkdir(parents=True, exist_ok=True)
    out_json.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    out_html.write_text(render_html(summary), encoding="utf-8")
    report["json_path"] = str(out_json)
    report["html_path"] = str(out_html)
    report["pass"] = True
    if baseline_path is not None:
        report["pass"] = bool(report["diff"]["pass"])
    # Standalone debug of a failed session is still a successful analysis.
    if summary.get("outcome") == "fail" and baseline_path is None:
        report["pass"] = True
    return report


def run_on_workbench(root: Path, *, baseline: Path | None = None) -> dict[str, Any]:
    evidence = root / "outputs" / "evidence"
    return debug_trace(
        evidence / "trace.jsonl",
        out_json=evidence / "trace-report.json",
        out_html=evidence / "trace.html",
        baseline_path=baseline,
    )
