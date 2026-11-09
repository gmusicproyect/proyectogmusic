"""Planner unit tests (offline + live fallback)."""

from __future__ import annotations

import os
import unittest
from unittest import mock

from workbench.planner import plan_repair


BUGGY = '''"""Minimal Gmusic sample surface with a deliberate greeting bug."""


def greeting(name: str = "alumno") -> str:
    # BUG: wrong product name — workbench demo must repair this.
    return f"Hola {name}, bienvenido a Music School"


def health() -> dict[str, str]:
    return {"status": "ok", "product": "Gmusic Academy"}
'''

STDERR = (
    "AssertionError: 'Bienvenido a Gmusic Academy' not found in "
    "'Hola JP, bienvenido a Music School'\n"
)


class TestPlanner(unittest.TestCase):
    def test_offline_from_stderr(self) -> None:
        plan = plan_repair(
            path="app.py",
            content=BUGGY,
            stderr=STDERR,
            task_notes="",
            mode="offline",
        )
        self.assertEqual(plan.source, "offline")
        self.assertIn("Bienvenido a Gmusic Academy", plan.content)
        self.assertNotIn("Music School", plan.content)

    def test_offline_from_task_notes(self) -> None:
        plan = plan_repair(
            path="app.py",
            content=BUGGY,
            stderr="",
            task_notes="Expected greeting is 'Bienvenido a Gmusic Academy'.",
            mode="offline",
        )
        self.assertIn("Bienvenido a Gmusic Academy", plan.content)

    def test_live_without_key_falls_back(self) -> None:
        with mock.patch.dict(os.environ, {}, clear=True):
            plan = plan_repair(
                path="app.py",
                content=BUGGY,
                stderr=STDERR,
                mode="live",
            )
        self.assertEqual(plan.source, "offline")
        self.assertIn("fell back", plan.rationale)
        self.assertIn("Bienvenido a Gmusic Academy", plan.content)

    def test_live_invalid_response_falls_back(self) -> None:
        class FakeResp:
            def __enter__(self):
                return self

            def __exit__(self, *args):
                return False

            def read(self):
                return b'{"choices":[{"message":{"content":"{\\"path\\": \\"other.py\\"}"}}]}'

        with mock.patch.dict(os.environ, {"OPENAI_API_KEY": "sk-test"}, clear=False):
            with mock.patch("urllib.request.urlopen", return_value=FakeResp()):
                plan = plan_repair(
                    path="app.py",
                    content=BUGGY,
                    stderr=STDERR,
                    mode="live",
                )
        self.assertEqual(plan.source, "offline")

    def test_live_valid_json_used(self) -> None:
        body = {
            "choices": [
                {
                    "message": {
                        "content": json_dumps_plan(),
                    }
                }
            ],
            "usage": {"prompt_tokens": 10, "completion_tokens": 20},
        }

        class FakeResp:
            def __enter__(self):
                return self

            def __exit__(self, *args):
                return False

            def read(self):
                import json

                return json.dumps(body).encode()

        with mock.patch.dict(os.environ, {"OPENAI_API_KEY": "sk-test"}, clear=False):
            with mock.patch("urllib.request.urlopen", return_value=FakeResp()):
                plan = plan_repair(
                    path="app.py",
                    content=BUGGY,
                    stderr=STDERR,
                    mode="live",
                )
        self.assertEqual(plan.source, "live")
        self.assertEqual(plan.raw_prompt_tokens, 10)
        self.assertIn("Bienvenido a Gmusic Academy", plan.content)


def json_dumps_plan() -> str:
    import json

    return json.dumps(
        {
            "path": "app.py",
            "content": (
                'def greeting(name: str = "alumno") -> str:\n'
                '    return f"Hola {name}, Bienvenido a Gmusic Academy"\n'
                "\n"
                "def health() -> dict[str, str]:\n"
                '    return {"status": "ok", "product": "Gmusic Academy"}\n'
            ),
            "rationale": "unit-test live proposal",
        }
    )


if __name__ == "__main__":
    unittest.main()
