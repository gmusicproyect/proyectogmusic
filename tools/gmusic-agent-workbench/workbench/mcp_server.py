"""Minimal MCP-subset server over newline JSON-RPC (stdio or in-process).

Implements initialize, tools/list, and tools/call for Gmusic read tools.
Not a claim of full MCP conformance — portfolio wire evidence only.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any, Callable

from workbench.planner import plan_repair
from workbench.rag_eval import run_gate

PROTOCOL_VERSION = "2025-06-18"
SERVER_INFO = {"name": "gmusic-agent-workbench", "version": "0.8.0"}


ToolHandler = Callable[[dict[str, Any], Path], Any]


def load_catalog(root: Path) -> list[dict[str, Any]]:
    """Prefer Gmusic corpus (Paso 3); fall back to legacy MCP catalog."""
    corpus = root / "fixtures" / "gmusic-corpus" / "documents.json"
    legacy = root / "fixtures" / "mcp" / "docs_catalog.json"
    path = corpus if corpus.exists() else legacy
    data = json.loads(path.read_text(encoding="utf-8"))
    return list(data["documents"])


def tool_schemas() -> list[dict[str, Any]]:
    return [
        {
            "name": "catalog_search",
            "description": "Search Gmusic docs by query under a character budget.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "max_chars": {"type": "integer", "minimum": 40},
                    "k": {"type": "integer", "minimum": 1, "maximum": 10},
                },
                "required": ["query"],
            },
        },
        {
            "name": "get_document",
            "description": "Fetch one catalog document by id.",
            "inputSchema": {
                "type": "object",
                "properties": {"id": {"type": "string"}},
                "required": ["id"],
            },
        },
        {
            "name": "rag_compare",
            "description": "Run the offline NDCG regression gate for a candidate file.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "candidate": {
                        "type": "string",
                        "description": "Filename under fixtures/retrieval/",
                    },
                    "k": {"type": "integer", "minimum": 1},
                },
                "required": [],
            },
        },
        {
            "name": "plan_repair",
            "description": "Propose a repair plan without writing files.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "path": {"type": "string"},
                    "content": {"type": "string"},
                    "stderr": {"type": "string"},
                    "task_notes": {"type": "string"},
                    "mode": {"type": "string", "enum": ["offline", "live"]},
                },
                "required": ["path", "content"],
            },
        },
    ]


def handle_catalog_search(args: dict[str, Any], root: Path) -> dict[str, Any]:
    query = str(args.get("query", "")).strip().lower()
    max_chars = int(args.get("max_chars", 500))
    k = int(args.get("k", 3))
    if not query:
        raise ValueError("query required")
    docs = load_catalog(root)
    scored = []
    for doc in docs:
        hay = f"{doc['id']} {doc['title']} {' '.join(doc.get('tags', []))} {doc['text']}".lower()
        score = sum(1 for token in query.split() if token in hay)
        if score:
            scored.append((score, doc))
    scored.sort(key=lambda x: (-x[0], x[1]["id"]))
    selected: list[dict[str, str]] = []
    for _, doc in scored:
        text = doc["text"]
        placed = False
        for limit in (120, 60, 0):
            snippet = {"id": doc["id"], "title": doc["title"]}
            if limit > 0:
                snippet["text"] = text if len(text) <= limit else text[: limit - 3] + "..."
            candidate = selected + [snippet]
            used = len(json.dumps(candidate, ensure_ascii=False))
            if used <= max_chars:
                selected = candidate
                placed = True
                break
        if not placed:
            break
        if len(selected) >= k:
            break
    return {
        "query": query,
        "max_chars": max_chars,
        "chars_used": len(json.dumps(selected, ensure_ascii=False)),
        "results": selected,
    }


def handle_get_document(args: dict[str, Any], root: Path) -> dict[str, Any]:
    doc_id = str(args.get("id", ""))
    for doc in load_catalog(root):
        if doc["id"] == doc_id:
            return doc
    raise ValueError(f"unknown document id: {doc_id}")


def handle_rag_compare(args: dict[str, Any], root: Path) -> dict[str, Any]:
    candidate = str(args.get("candidate", "candidate_ok.json"))
    k = int(args.get("k", 3))
    # Only allow known fixture filenames (no path traversal).
    if "/" in candidate or "\\" in candidate or candidate.startswith("."):
        raise ValueError("candidate must be a bare filename")
    report = run_gate(root, candidate_name=candidate, k=k)
    return {
        "pass": report["pass"],
        "regressions": report["regressions"],
        "mean_delta_ndcg": report["mean_delta_ndcg"],
        "evidence_path": report.get("evidence_path"),
    }


def handle_plan_repair(args: dict[str, Any], root: Path) -> dict[str, Any]:
    plan = plan_repair(
        path=str(args["path"]),
        content=str(args["content"]),
        stderr=str(args.get("stderr", "")),
        task_notes=str(args.get("task_notes", "")),
        mode=str(args.get("mode", "offline")),
    )
    return plan.to_dict()


HANDLERS: dict[str, ToolHandler] = {
    "catalog_search": handle_catalog_search,
    "get_document": handle_get_document,
    "rag_compare": handle_rag_compare,
    "plan_repair": handle_plan_repair,
}


class McpServer:
    def __init__(self, root: Path) -> None:
        self.root = root
        self.initialized = False

    def handle(self, message: dict[str, Any]) -> dict[str, Any] | None:
        if "method" not in message:
            return _error(message.get("id"), -32600, "Invalid Request")
        method = message["method"]
        msg_id = message.get("id")
        params = message.get("params") or {}

        if method == "initialize":
            self.initialized = True
            return {
                "jsonrpc": "2.0",
                "id": msg_id,
                "result": {
                    "protocolVersion": PROTOCOL_VERSION,
                    "capabilities": {"tools": {}},
                    "serverInfo": SERVER_INFO,
                },
            }
        if method == "notifications/initialized":
            return None
        if method == "tools/list":
            if not self.initialized:
                return _error(msg_id, -32002, "server not initialized")
            return {
                "jsonrpc": "2.0",
                "id": msg_id,
                "result": {"tools": tool_schemas()},
            }
        if method == "tools/call":
            if not self.initialized:
                return _error(msg_id, -32002, "server not initialized")
            name = params.get("name")
            arguments = params.get("arguments") or {}
            if name not in HANDLERS:
                return _error(msg_id, -32601, f"Unknown tool: {name}")
            try:
                result = HANDLERS[name](arguments, self.root)
            except Exception as exc:  # noqa: BLE001 — surface as tool error
                return {
                    "jsonrpc": "2.0",
                    "id": msg_id,
                    "result": {
                        "content": [{"type": "text", "text": str(exc)}],
                        "isError": True,
                    },
                }
            return {
                "jsonrpc": "2.0",
                "id": msg_id,
                "result": {
                    "content": [
                        {
                            "type": "text",
                            "text": json.dumps(result, ensure_ascii=False),
                        }
                    ],
                    "isError": False,
                    "structuredContent": result,
                },
            }
        if msg_id is None:
            return None
        return _error(msg_id, -32601, f"Method not found: {method}")


def _error(msg_id: Any, code: int, message: str) -> dict[str, Any]:
    return {
        "jsonrpc": "2.0",
        "id": msg_id,
        "error": {"code": code, "message": message},
    }


def serve_stdio(root: Path) -> int:
    server = McpServer(root)
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            message = json.loads(line)
        except json.JSONDecodeError:
            sys.stdout.write(
                json.dumps(_error(None, -32700, "Parse error"), ensure_ascii=False) + "\n"
            )
            sys.stdout.flush()
            continue
        response = server.handle(message)
        if response is not None:
            sys.stdout.write(json.dumps(response, ensure_ascii=False) + "\n")
            sys.stdout.flush()
    return 0


def run_inprocess_session(root: Path) -> dict[str, Any]:
    """Deterministic client session used by demo/tests (no subprocess)."""
    server = McpServer(root)
    transcript: list[dict[str, Any]] = []

    def call(method: str, params: dict[str, Any] | None = None, msg_id: int | None = 1) -> Any:
        req: dict[str, Any] = {"jsonrpc": "2.0", "method": method}
        if msg_id is not None:
            req["id"] = msg_id
        if params is not None:
            req["params"] = params
        resp = server.handle(req)
        transcript.append({"request": req, "response": resp})
        return resp

    init = call("initialize", {"protocolVersion": PROTOCOL_VERSION, "capabilities": {}, "clientInfo": {"name": "workbench-demo", "version": "0.5.0"}}, 1)
    call("notifications/initialized", {}, None)
    listed = call("tools/list", {}, 2)
    search = call(
        "tools/call",
        {
            "name": "catalog_search",
            "arguments": {"query": "suscripcion activa mi camino", "max_chars": 500, "k": 3},
        },
        3,
    )
    rag = call(
        "tools/call",
        {"name": "rag_compare", "arguments": {"candidate": "candidate_ok.json"}},
        4,
    )
    tools = (listed or {}).get("result", {}).get("tools", [])
    return {
        "protocolVersion": (init or {}).get("result", {}).get("protocolVersion"),
        "tool_count": len(tools),
        "tool_names": [t["name"] for t in tools],
        "search_is_error": (search or {}).get("result", {}).get("isError", True),
        "rag_pass": (rag or {}).get("result", {}).get("structuredContent", {}).get("pass"),
        "transcript_path_hint": "outputs/evidence/mcp-session.json",
        "transcript": transcript,
    }
