"""Grounded tutor tests (Paso 4)."""

from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path
import shutil

from workbench.tutor import ask, run_tutor_demo

ROOT = Path(__file__).resolve().parent.parent


class TestTutor(unittest.TestCase):
    def test_answers_access_with_citations(self) -> None:
        out = ask(ROOT, "¿Necesito suscripción activa para entrar a Mi Camino?")
        self.assertEqual(out.status, "answered")
        self.assertGreaterEqual(len(out.citations), 1)
        self.assertTrue(any(c["id"] == "doc-access-subscription" for c in out.citations))
        for c in out.citations:
            self.assertIn(f"[{c['id']}]", out.answer)

    def test_answers_whatsapp_with_citations(self) -> None:
        out = ask(ROOT, "¿Cómo funciona la inscripción por WhatsApp?")
        self.assertEqual(out.status, "answered")
        self.assertTrue(any(c["id"] == "doc-whatsapp-inscripcion" for c in out.citations))

    def test_abstains_without_evidence(self) -> None:
        out = ask(ROOT, "¿Cuál es el precio secreto del plan oculto en dólares?")
        self.assertEqual(out.status, "abstain")
        self.assertEqual(out.refusal_reason, "no_evidence")

    def test_tutor_cannot_write_file(self) -> None:
        from workbench.firewall import Firewall, load_roles

        fw = Firewall(
            roles=load_roles(ROOT / "policy" / "roles.json"),
            allowed_paths={"app.py"},
            workspace_root=ROOT,
        )
        ok, reason = fw.check(
            role="tutor",
            tool="write_file",
            args={"path": "app.py", "content": "x"},
            request_id="x1",
        )
        self.assertFalse(ok)
        self.assertIn("cannot use", reason)

    def test_demo_pass_shape(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            dest = Path(tmp) / "wb"
            shutil.copytree(
                ROOT,
                dest,
                ignore=shutil.ignore_patterns("outputs", "__pycache__"),
            )
            summary = run_tutor_demo(dest)
            self.assertTrue(summary["pass"], summary)
            self.assertEqual(summary["answered"], 2)
            self.assertEqual(summary["abstained"], 1)
            saved = json.loads(Path(summary["evidence_path"]).read_text(encoding="utf-8"))
            self.assertEqual(saved["answered"], 2)


if __name__ == "__main__":
    unittest.main()
