"""CLI for the Gmusic Agent Workbench."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

from workbench.jobs import JobStore, enqueue_many, run_jobs_demo, run_worker
from workbench.loop import run_demo
from workbench.mcp_server import run_inprocess_session, serve_stdio
from workbench.planner import plan_repair
from workbench.rag_eval import run_gate
from workbench.trace_debug import debug_trace, run_on_workbench
from workbench.tutor import ask, run_tutor_demo


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="workbench", description="Gmusic Agent Workbench")
    sub = parser.add_subparsers(dest="cmd", required=True)
    default_root = Path(__file__).resolve().parent.parent

    run_p = sub.add_parser("run", help="Run an agent session")
    run_p.add_argument("--demo", action="store_true")
    run_p.add_argument("--planner", choices=("offline", "live"), default="offline")
    run_p.add_argument("--with-rag-gate", action="store_true")
    run_p.add_argument("--with-trace-debug", action="store_true")
    run_p.add_argument("--with-mcp", action="store_true")
    run_p.add_argument("--with-jobs", action="store_true", help="Also run durable jobs crash/recover demo")
    run_p.add_argument("--with-tutor", action="store_true", help="Also run grounded tutor demo")
    run_p.add_argument("--root", type=Path, default=default_root)

    rag_p = sub.add_parser("rag-eval")
    rag_p.add_argument("--candidate", default="candidate_ok.json")
    rag_p.add_argument("--k", type=int, default=3)
    rag_p.add_argument("--root", type=Path, default=default_root)

    tr_p = sub.add_parser("trace-debug")
    tr_p.add_argument("--trace", type=Path, default=None)
    tr_p.add_argument("--baseline", type=Path, default=None)
    tr_p.add_argument("--root", type=Path, default=default_root)

    plan_p = sub.add_parser("plan")
    plan_p.add_argument("--planner", choices=("offline", "live"), default="offline")
    plan_p.add_argument("--root", type=Path, default=default_root)

    sub.add_parser("mcp-serve").add_argument("--root", type=Path, default=default_root)
    sub.add_parser("mcp-demo").add_argument("--root", type=Path, default=default_root)

    jobs_demo = sub.add_parser("jobs-demo", help="Crash-after-effect then recover with reused receipt")
    jobs_demo.add_argument("--root", type=Path, default=default_root)

    jobs_enq = sub.add_parser("jobs-enqueue")
    jobs_enq.add_argument("--store", type=Path, required=True)
    jobs_enq.add_argument("--input", type=Path, required=True)

    jobs_worker = sub.add_parser("jobs-worker")
    jobs_worker.add_argument("--store", type=Path, required=True)
    jobs_worker.add_argument("--max-jobs", type=int, default=100)
    jobs_worker.add_argument("--lease-ms", type=int, default=30_000)
    jobs_worker.add_argument("--now-ms", type=int, default=None)
    jobs_worker.add_argument("--crash-after", choices=("claim", "effect"), default=None)
    jobs_worker.add_argument("--worker-id", default=None)

    jobs_status = sub.add_parser("jobs-status")
    jobs_status.add_argument("--store", type=Path, required=True)

    ask_p = sub.add_parser("ask", help="Grounded tutor: answer only with corpus citations")
    ask_p.add_argument("question", nargs="+", help="Question in Spanish or English")
    ask_p.add_argument("--root", type=Path, default=default_root)

    tutor_demo = sub.add_parser("tutor-demo", help="Answer / abstain battery for the grounded tutor")
    tutor_demo.add_argument("--root", type=Path, default=default_root)

    args = parser.parse_args(argv)

    if args.cmd == "run":
        if not args.demo:
            print("Only --demo is implemented in MVP 0.8.x", file=sys.stderr)
            return 2
        result = run_demo(args.root, planner_mode=args.planner)
        print(json.dumps(result, indent=2))
        print(f"\nEvidence: {result['evidence']}")
        code = 0 if result["outcome"] == "pass" else 1
        if args.with_rag_gate:
            gate = run_gate(args.root, candidate_name="candidate_ok.json")
            print("\nRAG gate:")
            print(
                json.dumps(
                    {
                        "pass": gate["pass"],
                        "regressions": gate["regressions"],
                        "mean_delta_ndcg": gate["mean_delta_ndcg"],
                        "evidence_path": gate["evidence_path"],
                    },
                    indent=2,
                )
            )
            if not gate["pass"]:
                code = 1
        if args.with_trace_debug:
            report = run_on_workbench(args.root)
            print("\nTrace debug:")
            print(
                json.dumps(
                    {
                        "pass": report["pass"],
                        "anomalies": report["summary"]["anomalies"],
                        "wall_ms": report["summary"]["wall_ms"],
                        "html_path": report["html_path"],
                        "json_path": report["json_path"],
                    },
                    indent=2,
                )
            )
        if args.with_mcp:
            code = _write_mcp_session(args.root, code)
        if args.with_jobs:
            code = _write_jobs_demo(args.root, code)
        if args.with_tutor:
            code = _write_tutor_demo(args.root, code)
        return code

    if args.cmd == "rag-eval":
        report = run_gate(args.root, candidate_name=args.candidate, k=args.k)
        print(json.dumps(report, indent=2))
        return 0 if report["pass"] else 1

    if args.cmd == "trace-debug":
        trace = args.trace or (args.root / "outputs" / "evidence" / "trace.jsonl")
        evidence = args.root / "outputs" / "evidence"
        report = debug_trace(
            trace,
            out_json=evidence / "trace-report.json",
            out_html=evidence / "trace.html",
            baseline_path=args.baseline,
        )
        print(json.dumps(report, indent=2))
        return 0 if report["pass"] else 1

    if args.cmd == "plan":
        fixture = args.root / "fixtures" / "sample_app" / "app.py"
        board = json.loads((args.root / "task_board.json").read_text(encoding="utf-8"))
        task = next(t for t in board["tasks"] if t["id"] == board["active_task_id"])
        proc = subprocess.run(
            [sys.executable, "-m", "unittest", "test_app", "-v"],
            cwd=args.root / "fixtures" / "sample_app",
            capture_output=True,
            text=True,
            timeout=60,
        )
        plan = plan_repair(
            path="app.py",
            content=fixture.read_text(encoding="utf-8"),
            stderr=proc.stderr or "",
            task_notes=str(task.get("notes", "")),
            mode=args.planner,
        )
        print(json.dumps(plan.to_dict(), indent=2, ensure_ascii=False))
        return 0

    if args.cmd == "mcp-serve":
        return serve_stdio(args.root)

    if args.cmd == "mcp-demo":
        return _write_mcp_session(args.root, 0)

    if args.cmd == "jobs-demo":
        return _write_jobs_demo(args.root, 0)

    if args.cmd == "jobs-enqueue":
        jobs = json.loads(args.input.read_text(encoding="utf-8"))
        store = JobStore(args.store)
        print(json.dumps(enqueue_many(store, jobs), indent=2))
        return 0

    if args.cmd == "jobs-worker":
        store = JobStore(args.store)
        out = run_worker(
            store,
            worker_id=args.worker_id,
            max_jobs=args.max_jobs,
            lease_ms=args.lease_ms,
            now_ms=args.now_ms,
            crash_after=args.crash_after,
        )
        print(json.dumps(out, indent=2))
        return 86 if out.get("crashed_after") else 0

    if args.cmd == "jobs-status":
        print(json.dumps(JobStore(args.store).status(), indent=2))
        return 0

    if args.cmd == "ask":
        answer = ask(args.root, " ".join(args.question))
        print(json.dumps(answer.to_dict(), indent=2, ensure_ascii=False))
        return 0 if answer.status == "answered" else 1

    if args.cmd == "tutor-demo":
        return _write_tutor_demo(args.root, 0)

    return 2


def _write_mcp_session(root: Path, code: int) -> int:
    session = run_inprocess_session(root)
    out = root / "outputs" / "evidence" / "mcp-session.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    summary = {k: v for k, v in session.items() if k != "transcript"}
    out.write_text(json.dumps(session, indent=2) + "\n", encoding="utf-8")
    print("\nMCP session:")
    print(json.dumps({**summary, "evidence_path": str(out)}, indent=2))
    if session.get("search_is_error") or not session.get("rag_pass"):
        return 1
    return code


def _write_jobs_demo(root: Path, code: int) -> int:
    report = run_jobs_demo(root)
    print("\nJobs demo:")
    print(
        json.dumps(
            {
                "pass": report["pass"],
                "reused_effect": report["reused_effect"],
                "counts": report["status_final"]["counts"],
                "evidence_path": report["evidence_path"],
            },
            indent=2,
        )
    )
    return code if report["pass"] else 1


def _write_tutor_demo(root: Path, code: int) -> int:
    summary = run_tutor_demo(root)
    print("\nTutor demo:")
    print(
        json.dumps(
            {
                "pass": summary["pass"],
                "answered": summary["answered"],
                "abstained": summary["abstained"],
                "evidence_path": summary["evidence_path"],
            },
            indent=2,
        )
    )
    return code if summary["pass"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
