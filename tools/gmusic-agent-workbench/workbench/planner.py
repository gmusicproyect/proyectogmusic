"""Repair planners: offline heuristic first, optional live model hook.

The planner only proposes a patch. The firewall still decides allow/reject.
Live mode never runs unless explicitly requested and a key is present.
"""

from __future__ import annotations

import json
import os
import re
import urllib.error
import urllib.request
from dataclasses import asdict, dataclass
from typing import Any


@dataclass
class Plan:
    path: str
    content: str
    rationale: str
    source: str  # offline | live | offline
    model: str | None = None
    raw_prompt_tokens: int | None = None
    raw_completion_tokens: int | None = None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


_ASSERT_IN = re.compile(
    r"AssertionError:\s+'(?P<expected>(?:\\'|[^'])*)'\s+not found in\s+'(?P<actual>(?:\\'|[^'])*)'",
    re.MULTILINE,
)
_EXPECTED_NOTE = re.compile(
    r"Expected[^\n]*'([^']+)'",
    re.IGNORECASE,
)


def plan_repair(
    *,
    path: str,
    content: str,
    stderr: str,
    task_notes: str = "",
    mode: str = "offline",
) -> Plan:
    """Return a proposed file rewrite for the failing fixture."""
    mode = mode.lower().strip()
    if mode == "live":
        live = _try_live_plan(path=path, content=content, stderr=stderr, task_notes=task_notes)
        if live is not None:
            return live
        offline = _offline_plan(path=path, content=content, stderr=stderr, task_notes=task_notes)
        offline.source = "offline"
        offline.rationale = (
            "live unavailable or invalid; fell back to offline heuristic. "
            + offline.rationale
        )
        return offline
    return _offline_plan(path=path, content=content, stderr=stderr, task_notes=task_notes)


def _offline_plan(*, path: str, content: str, stderr: str, task_notes: str) -> Plan:
    expected = None
    m = _ASSERT_IN.search(stderr or "")
    if m:
        expected = _unescape(m.group("expected"))
        actual_snip = _unescape(m.group("actual"))
        # Prefer replacing the wrong product phrase inside the source.
        patched = _patch_greeting(content, expected, actual_snip)
        if patched != content:
            return Plan(
                path=path,
                content=patched,
                rationale=f"assertIn expected '{expected}' missing from runtime string; rewrote greeting.",
                source="offline",
            )
    note = _EXPECTED_NOTE.search(task_notes or "")
    if note:
        expected = note.group(1)
        patched = _patch_greeting(content, expected, None)
        if patched != content:
            return Plan(
                path=path,
                content=patched,
                rationale=f"task note expected '{expected}'; rewrote greeting.",
                source="offline",
            )
    if expected:
        # Last resort: inject a known-good greeting function body.
        return Plan(
            path=path,
            content=_canonical_app(expected),
            rationale=f"could not surgically patch; wrote canonical app with '{expected}'.",
            source="offline",
        )
    raise ValueError("offline planner could not infer expected string from stderr or notes")


def _patch_greeting(content: str, expected: str, actual_snip: str | None) -> str:
    # Common buggy product names in the fixture.
    replacements = [
        "bienvenido a Music School",
        "Bienvenido a Music School",
        "Music School",
    ]
    if actual_snip:
        # Pull a distinctive wrong fragment from the actual string.
        for frag in ("Music School", "music school"):
            if frag.lower() in actual_snip.lower():
                replacements.insert(0, frag)
    out = content
    for old in replacements:
        if old in out:
            # If replacing a full phrase that already includes bienvenido, use expected as-is
            # when expected already starts with Bienvenido; else substitute product only.
            if "bienvenido" in old.lower() and expected.lower().startswith("bienvenido"):
                out = out.replace(old, expected)
            elif old == "Music School" and "Gmusic Academy" in expected:
                out = out.replace(old, "Gmusic Academy")
            else:
                out = out.replace(old, expected)
    # Normalize f-string greeting to include expected brand phrase.
    out = re.sub(
        r'return f"Hola \{name\}, [^"]+"',
        f'return f"Hola {{name}}, {expected}"',
        out,
        count=1,
    )
    return out


def _canonical_app(expected_phrase: str) -> str:
    return (
        '"""Minimal Gmusic sample surface repaired by planner."""\n'
        "\n"
        "\n"
        "def greeting(name: str = \"alumno\") -> str:\n"
        f'    return f"Hola {{name}}, {expected_phrase}"\n'
        "\n"
        "\n"
        "def health() -> dict[str, str]:\n"
        "    return {\"status\": \"ok\", \"product\": \"Gmusic Academy\"}\n"
    )


def _unescape(s: str) -> str:
    return s.replace("\\'", "'").replace('\\"', '"')


def _try_live_plan(
    *, path: str, content: str, stderr: str, task_notes: str
) -> Plan | None:
    """Optional OpenAI-compatible chat call. Stdlib urllib only."""
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not api_key:
        return None
    model = os.environ.get("GMUSIC_PLANNER_MODEL", "gpt-4o-mini").strip()
    base = os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
    prompt = {
        "model": model,
        "temperature": 0,
        "response_format": {"type": "json_object"},
        "messages": [
            {
                "role": "system",
                "content": (
                    "You repair a single Python file. Reply JSON with keys "
                    "path, content, rationale. content must be the full new file. "
                    "Do not invent secrets. Keep health() returning Gmusic Academy."
                ),
            },
            {
                "role": "user",
                "content": json.dumps(
                    {
                        "path": path,
                        "content": content,
                        "stderr_tail": (stderr or "")[-1500:],
                        "task_notes": task_notes,
                    },
                    ensure_ascii=False,
                ),
            },
        ],
    }
    req = urllib.request.Request(
        f"{base}/chat/completions",
        data=json.dumps(prompt).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
        return None

    try:
        choice = payload["choices"][0]["message"]["content"]
        data = json.loads(choice) if isinstance(choice, str) else choice
        new_path = str(data["path"])
        new_content = str(data["content"])
        rationale = str(data.get("rationale", "live model proposal"))
    except (KeyError, TypeError, ValueError, json.JSONDecodeError):
        return None
    if new_path != path or "def greeting" not in new_content:
        return None
    usage = payload.get("usage") or {}
    return Plan(
        path=new_path,
        content=new_content if new_content.endswith("\n") else new_content + "\n",
        rationale=rationale,
        source="live",
        model=model,
        raw_prompt_tokens=usage.get("prompt_tokens"),
        raw_completion_tokens=usage.get("completion_tokens"),
    )
