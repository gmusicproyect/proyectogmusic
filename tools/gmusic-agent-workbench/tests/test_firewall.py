"""Firewall unit tests."""

from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from workbench.firewall import ApprovalStore, Firewall


class TestFirewall(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        (self.root / "app.py").write_text("x", encoding="utf-8")
        self.fw = Firewall(
            roles={
                "repairer": {
                    "tools": ["read_file", "write_file"],
                    "requires_approval": ["write_file"],
                },
                "reader": {"tools": ["read_file"]},
            },
            allowed_paths={"app.py"},
            workspace_root=self.root,
        )

    def tearDown(self) -> None:
        self.tmp.cleanup()

    def test_reader_cannot_write(self) -> None:
        ok, reason = self.fw.check(
            role="reader",
            tool="write_file",
            args={"path": "app.py", "content": "y"},
            request_id="a1",
        )
        self.assertFalse(ok)
        self.assertIn("cannot use", reason)

    def test_write_needs_approval_then_allows_once(self) -> None:
        ok, reason = self.fw.check(
            role="repairer",
            tool="write_file",
            args={"path": "app.py", "content": "y"},
            request_id="a2",
        )
        self.assertFalse(ok)
        token = reason.split(":", 1)[1]
        ok2, reason2 = self.fw.check(
            role="repairer",
            tool="write_file",
            args={"path": "app.py", "content": "y"},
            request_id="a2",
            approval_token=token,
        )
        self.assertTrue(ok2)
        ok3, _ = self.fw.check(
            role="repairer",
            tool="write_file",
            args={"path": "app.py", "content": "y"},
            request_id="a2",
            approval_token=token,
        )
        self.assertFalse(ok3)

    def test_rejects_path_escape(self) -> None:
        ok, reason = self.fw.check(
            role="repairer",
            tool="read_file",
            args={"path": "../outside.txt"},
            request_id="a3",
        )
        self.assertFalse(ok)
        self.assertIn("escape", reason)

    def test_rejects_out_of_scope(self) -> None:
        ok, reason = self.fw.check(
            role="repairer",
            tool="read_file",
            args={"path": "secrets.env"},
            request_id="a4",
        )
        self.assertFalse(ok)
        self.assertIn("not in scope", reason)

    def test_approval_store_fingerprint_stable(self) -> None:
        store = ApprovalStore()
        t1 = store.issue("r", "write_file", {"path": "app.py"})
        t2 = store.issue("r", "write_file", {"path": "app.py"})
        self.assertEqual(t1, t2)


if __name__ == "__main__":
    unittest.main()
