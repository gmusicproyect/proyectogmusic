T-API-01 — Cómo auditar sin corruptar el diff
============================================

NO pegar el diff desde el chat de Cursor → GPT (Markdown trunca/mecla hunks).

Usar UNO de estos métodos:

1) Adjuntar archivo en GPT (recomendado)
   - docs/operations/T-API-01-diff-server-only.patch  (solo .ts, ~270 líneas)
   - docs/operations/T-API-01-diff-local-raw.patch     (4 archivos, ~320 líneas)
   - docs/operations/T-API-01-diff-phase3b2-test.patch (debe estar vacío, 0 bytes)

2) Copiar al portapapeles desde terminal (Mac)
   cd "Página de cursos de música"
   pbcopy < docs/operations/T-API-01-diff-server-only.patch

3) Abrir el .patch en Cursor y copiar TODO el texto plano (sin markdown alrededor)

Verificación local (ejecutor, 7 Jul 2026):
- api:typecheck OK
- npm run verify: 563 app + 160 api, 0 fail
- phase3b2.test.ts: git diff vacío

Nota sobre hunks confundidos:
En unified diff, "- return finalizeTransactionResult(result)" es REMOVIDO del
cuerpo viejo de completeLessonSession (fin del $transaction inline).
"+ return finalizeTransactionResult(result)" es AGREGADO dentro del retry loop.
NO están en loadCompletedTransactionResult — ver archivo fuente L296+.
