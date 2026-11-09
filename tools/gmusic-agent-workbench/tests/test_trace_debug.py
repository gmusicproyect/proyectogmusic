"""Trace debugger tests."""

from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from workbench.trace_debug import (
    debug_trace,
    diff_summaries,
    parse_trace,
    summarize,
)

ROOT = Path(__file__).resolve().parent.parent


def _write_trace(path: Path, events: list[dict]) -> None:
    path.write_text(
        "\n".join(json.dumps(e) for e in events) + "\n",
        encoding="utf-8",
    )


class TestTraceDebug(unittest.TestCase):
    def test_parse_and_own_time(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp) / "t.jsonl"
            _write_trace(
                p,
                [
                    {"ts": "2026-01-01T00:00:00+00:00", "kind": "session_start", "task_id": "T"},
                    {"ts": "2026-01-01T00:00:00.100+00:00", "kind": "verify", "phase": "before", "exit_code": 1},
                    {"ts": "2026-01-01T00:00:00.200+00:00", "kind": "session_end", "outcome": "fail"},
                ],
            )
            events = parse_trace(p)
            self.assertEqual(len(events), 3)
            self.assertAlmostEqual(events[0].duration_ms, 100.0, places=3)
            summary = summarize(events)
            self.assertAlmostEqual(summary["wall_ms"], 200.0, places=3)
            self.assertEqual(summary["outcome"], "fail")

    def test_detects_reject_and_approval_gap(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp) / "t.jsonl"
            _write_trace(
                p,
                [
                    {"ts": "2026-01-01T00:00:00+00:00", "kind": "session_start"},
                    {
                        "ts": "2026-01-01T00:00:00.010+00:00",
                        "kind": "tool",
                        "tool": "write_file",
                        "path": "app.py",
                        "decision": "needs_approval",
                        "approval_token": "abc",
                    },
                    {
                        "ts": "2026-01-01T00:00:00.020+00:00",
                        "kind": "tool",
                        "tool": "write_file",
                        "path": "secrets.env",
                        "decision": "reject",
                        "reason": "path not in scope",
                    },
                    {"ts": "2026-01-01T00:00:00.030+00:00", "kind": "session_end", "outcome": "fail"},
                ],
            )
            codes = {a["code"] for a in summarize(parse_trace(p))["anomalies"]}
            self.assertIn("tool_rejected", codes)
            self.assertIn("approval_never_consumed", codes)

    def test_diff_flags_more_rejects(self) -> None:
        base = {
            "event_count": 4,
            "wall_ms": 10.0,
            "tool_count": 1,
            "verify_count": 1,
            "by_decision": {"allow": 1},
            "outcome": "pass",
            "anomalies": [],
        }
        cand = {
            "event_count": 5,
            "wall_ms": 12.0,
            "tool_count": 2,
            "verify_count": 1,
            "by_decision": {"allow": 1, "reject": 1},
            "outcome": "pass",
            "anomalies": [],
        }
        diff = diff_summaries(base, cand)
        self.assertFalse(diff["pass"])
        self.assertIn("more_rejects", diff["regressions"])

    def test_debug_writes_html_and_json(self) -> None:
        sample = ROOT / "outputs" / "evidence" / "trace.jsonl"
        if not sample.exists():
            self.skipTest("demo trace not present")
        with tempfile.TemporaryDirectory() as tmp:
            out_json = Path(tmp) / "report.json"
            out_html = Path(tmp) / "trace.html"
            report = debug_trace(sample, out_json=out_json, out_html=out_html)
            self.assertTrue(out_json.exists())
            self.assertTrue(out_html.exists())
            self.assertIn("<table>", out_html.read_text(encoding="utf-8"))
            self.assertGreaterEqual(report["summary"]["event_count"], 5)
            # Happy-path demo should note the intentional reject probe.
            codes = {a["code"] for a in report["summary"]["anomalies"]}
            self.assertIn("tool_rejected", codes)

    def test_rejects_empty_trace(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp) / "empty.jsonl"
            p.write_text("", encoding="utf-8")
            with self.assertRaises(ValueError):
                parse_trace(p)


if __name__ == "__main__":
    unittest.main()
