"""MCP subset server tests."""

from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path
import shutil

from workbench.mcp_server import McpServer, handle_catalog_search, run_inprocess_session

ROOT = Path(__file__).resolve().parent.parent


class TestMcp(unittest.TestCase):
    def test_initialize_and_list_tools(self) -> None:
        server = McpServer(ROOT)
        init = server.handle(
            {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "initialize",
                "params": {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "t", "version": "0"}},
            }
        )
        self.assertEqual(init["result"]["protocolVersion"], "2025-06-18")
        listed = server.handle({"jsonrpc": "2.0", "id": 2, "method": "tools/list"})
        names = {t["name"] for t in listed["result"]["tools"]}
        self.assertEqual(
            names,
            {"catalog_search", "get_document", "rag_compare", "plan_repair"},
        )

    def test_tools_list_before_init_errors(self) -> None:
        server = McpServer(ROOT)
        resp = server.handle({"jsonrpc": "2.0", "id": 1, "method": "tools/list"})
        self.assertIn("error", resp)

    def test_catalog_search_respects_budget(self) -> None:
        out = handle_catalog_search(
            {"query": "reembolso garantia", "max_chars": 220, "k": 5},
            ROOT,
        )
        self.assertLessEqual(out["chars_used"], 220)
        self.assertGreaterEqual(len(out["results"]), 1)
        ids = [r["id"] for r in out["results"]]
        self.assertTrue(any(i.startswith("doc-") for i in ids))

    def test_get_document_and_unknown(self) -> None:
        server = McpServer(ROOT)
        server.handle({"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {}})
        ok = server.handle(
            {
                "jsonrpc": "2.0",
                "id": 2,
                "method": "tools/call",
                "params": {"name": "get_document", "arguments": {"id": "doc-clase-gratuita"}},
            }
        )
        self.assertFalse(ok["result"]["isError"])
        self.assertIn("/clase-gratuita", ok["result"]["structuredContent"]["text"])
        bad = server.handle(
            {
                "jsonrpc": "2.0",
                "id": 3,
                "method": "tools/call",
                "params": {"name": "get_document", "arguments": {"id": "missing"}},
            }
        )
        self.assertTrue(bad["result"]["isError"])

    def test_rag_compare_rejects_path_traversal(self) -> None:
        server = McpServer(ROOT)
        server.handle({"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {}})
        resp = server.handle(
            {
                "jsonrpc": "2.0",
                "id": 2,
                "method": "tools/call",
                "params": {
                    "name": "rag_compare",
                    "arguments": {"candidate": "../secret.json"},
                },
            }
        )
        self.assertTrue(resp["result"]["isError"])

    def test_inprocess_session(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            dest = Path(tmp) / "wb"
            shutil.copytree(
                ROOT,
                dest,
                ignore=shutil.ignore_patterns("outputs", "__pycache__"),
            )
            session = run_inprocess_session(dest)
            self.assertEqual(session["tool_count"], 4)
            self.assertFalse(session["search_is_error"])
            self.assertTrue(session["rag_pass"])
            out = dest / "outputs" / "evidence" / "mcp-session.json"
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_text(json.dumps(session, indent=2) + "\n", encoding="utf-8")
            self.assertTrue(out.exists())


if __name__ == "__main__":
    unittest.main()
