"""Role + path + single-use approval firewall for tool calls."""

from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


@dataclass
class ApprovalStore:
    """Single-use approvals bound to a request fingerprint."""

    used: set[str] = field(default_factory=set)
    pending: dict[str, dict[str, Any]] = field(default_factory=dict)

    def issue(self, request_id: str, tool: str, args: dict[str, Any]) -> str:
        fingerprint = _fingerprint(request_id, tool, args)
        self.pending[fingerprint] = {
            "request_id": request_id,
            "tool": tool,
            "args": args,
            "fingerprint": fingerprint,
        }
        return fingerprint

    def consume(self, fingerprint: str) -> dict[str, Any] | None:
        if fingerprint in self.used:
            return None
        receipt = self.pending.pop(fingerprint, None)
        if receipt is None:
            return None
        self.used.add(fingerprint)
        return receipt


@dataclass
class Firewall:
    roles: dict[str, Any]
    allowed_paths: set[str]
    workspace_root: Path
    approvals: ApprovalStore = field(default_factory=ApprovalStore)
    audit: list[dict[str, Any]] = field(default_factory=list)

    def check(
        self,
        *,
        role: str,
        tool: str,
        args: dict[str, Any],
        request_id: str,
        approval_token: str | None = None,
    ) -> tuple[bool, str]:
        role_cfg = self.roles.get(role)
        if role_cfg is None:
            return self._reject(request_id, tool, args, f"unknown role: {role}")

        allowed_tools = set(role_cfg.get("tools", []))
        if tool not in allowed_tools:
            return self._reject(request_id, tool, args, f"role {role} cannot use {tool}")

        path = args.get("path")
        if path is not None:
            ok, reason = self._path_ok(str(path))
            if not ok:
                return self._reject(request_id, tool, args, reason)

        needs_approval = tool in set(role_cfg.get("requires_approval", []))
        if needs_approval:
            if not approval_token:
                token = self.approvals.issue(request_id, tool, args)
                self.audit.append(
                    {
                        "decision": "needs_approval",
                        "request_id": request_id,
                        "tool": tool,
                        "args": args,
                        "approval_token": token,
                    }
                )
                return False, f"needs_approval:{token}"
            receipt = self.approvals.consume(approval_token)
            if receipt is None:
                return self._reject(request_id, tool, args, "invalid or reused approval")
            if receipt["tool"] != tool or receipt["args"] != args:
                return self._reject(request_id, tool, args, "approval does not match request")

        self.audit.append(
            {
                "decision": "allow",
                "request_id": request_id,
                "tool": tool,
                "args": args,
                "role": role,
            }
        )
        return True, "allow"

    def _path_ok(self, rel_path: str) -> tuple[bool, str]:
        candidate = Path(rel_path)
        if candidate.is_absolute() or ".." in candidate.parts:
            return False, "path escapes workspace"
        if rel_path not in self.allowed_paths and not any(
            rel_path.startswith(p.rstrip("/") + "/") for p in self.allowed_paths if p.endswith("/")
        ):
            # Exact allowlist for MVP files.
            if rel_path not in self.allowed_paths:
                return False, f"path not in scope: {rel_path}"
        resolved = (self.workspace_root / candidate).resolve()
        try:
            resolved.relative_to(self.workspace_root.resolve())
        except ValueError:
            return False, "path escapes workspace"
        return True, "ok"

    def _reject(
        self, request_id: str, tool: str, args: dict[str, Any], reason: str
    ) -> tuple[bool, str]:
        self.audit.append(
            {
                "decision": "reject",
                "request_id": request_id,
                "tool": tool,
                "args": args,
                "reason": reason,
            }
        )
        return False, reason


def _fingerprint(request_id: str, tool: str, args: dict[str, Any]) -> str:
    payload = json.dumps(
        {"request_id": request_id, "tool": tool, "args": args},
        sort_keys=True,
        separators=(",", ":"),
    )
    return hashlib.sha256(payload.encode()).hexdigest()[:24]


def load_roles(path: Path) -> dict[str, Any]:
    data = json.loads(path.read_text(encoding="utf-8"))
    return data["roles"]
