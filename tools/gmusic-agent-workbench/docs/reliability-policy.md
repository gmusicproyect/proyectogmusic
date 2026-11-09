# Reliability Policy

1. Hallucinated action — blocked by firewall + scope contract.
2. Scope creep — blocked by path allowlist.
3. Cascading errors — loop stops on first failed verify or budget.
4. Context loss — repo files are source of truth; chat is not.
5. Tool misuse — roles + single-use approvals + audit trail.

Override path: human approval only. Agents cannot self-override.
