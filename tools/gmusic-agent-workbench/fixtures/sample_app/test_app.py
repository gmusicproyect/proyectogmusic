"""Acceptance tests for the disposable sample app."""

from __future__ import annotations

import unittest

from app import greeting, health


class TestApp(unittest.TestCase):
    def test_greeting_uses_gmusic_brand(self) -> None:
        text = greeting("JP")
        self.assertIn("Bienvenido a Gmusic Academy", text)
        self.assertIn("JP", text)

    def test_health(self) -> None:
        self.assertEqual(health()["status"], "ok")
        self.assertEqual(health()["product"], "Gmusic Academy")


if __name__ == "__main__":
    unittest.main()
