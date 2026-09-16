#!/usr/bin/env bash
# Read-only, consistent snapshot. Does not load app .env or print credentials.
set -euo pipefail
: "${COUNT_DATABASE_URL:?Explicit read-only database URL required}"
psql "$COUNT_DATABASE_URL" -X -qAt -v ON_ERROR_STOP=1 <<'SQL'
BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;
SELECT format('SELECT json_build_object(''table'', %L, ''rows'', count(*)) FROM %I.%I;', tablename, schemaname, tablename)
FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
\gexec
COMMIT;
SQL
