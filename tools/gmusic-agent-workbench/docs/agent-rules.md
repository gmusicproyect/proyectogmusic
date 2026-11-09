# Agent Rules

## startup/state-file-fresh
Read `agent_state.json` before any tool call.

## forbidden/no-out-of-scope-writes
Never write outside the active scope contract paths.

## forbidden/no-secrets
Never invent, print, or commit secrets. Credentials live outside the repo.

## done/tests-pass
A task is done only when every acceptance command exits 0.

## approval/mutating-tools
`write_file` and `run_shell` require a single-use, request-bound approval.

## uncertainty/open-question
If confidence is low, open a question note instead of guessing.
