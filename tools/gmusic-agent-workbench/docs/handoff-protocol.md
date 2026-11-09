# Handoff Protocol

Session end must produce:

1. Updated `agent_state.json` (status, last event, pack version)
2. Trace JSONL of every tool attempt
3. Audit receipts for approvals and rejects
4. `outputs/evidence/handoff.md` with outcome and next action
5. Cost report (model + human review placeholders for offline demo)
