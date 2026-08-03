# Runbook WS3 — Higiene docs features 06/07 (ejecuta Cursor)

**Fecha:** 2026-08-02 · **Autor:** Fable (copiloto, sin disco) · **Ejecutor:** Cursor · **Alcance:** solo `.md` (docs + referencias). Cero runtime. Cero `MEMORY.md`. Cuarentena solo-lectura.

**Regla de decisión por archivo:** portar VERBATIM solo si pasa el gate de secretos **y** el de contradicción; ante cualquier duda → Route R (corregir referencia con nota). Si un doc necesitaría banner o edición para no mentir, **no** se porta.

```bash
CUAR="/Volumes/Juan lizama h/Academia GMusic/90-Legado/repos-git/_cuarentena-originales-2026-07-31/proyectogmusic-wip-2026-07-18-bf986db"
CANON="/Volumes/Juan lizama h/Academia GMusic/01-Producto/proyectogmusic"
APP="$CANON/Página de cursos de música"
```

## 0. Precondiciones (solo lectura)

```bash
git -C "$CANON" status --porcelain        # vacío (tree limpio)
git -C "$CANON" log --oneline -1          # tip esperado: 2311295 (o posterior conocido por Juan)
git -C "$CUAR"  log --oneline -1          # HEAD: bf986db
```

Prohibido en `$CUAR`: checkout / reset / clean / gc / fetch / borrar. Solo `ls-tree` y `show`.

## 1. Referencias rotas en main

```bash
cd "$APP"
grep -rn --include="*.md" "docs/features/0[67]" docs/ .agents/ | grep -v node_modules
ls docs/features/ 2>/dev/null || echo "docs/features/ no existe en main"
```

Anotar cada archivo:línea que referencia 06/07 (esperado: `PROJECT_STATUS.md`; posible: índice flows).

## 2. Extraer los históricos (read-only → staging fuera del repo)

```bash
git -C "$CUAR" ls-tree -r bf986db --name-only | grep -Ei "features/0(6|7)"
mkdir -p /tmp/ws3-docs
git -C "$CUAR" show "bf986db:<PATH-06-del-ls-tree>" > /tmp/ws3-docs/06-mi-camino.md
git -C "$CUAR" show "bf986db:<PATH-07-del-ls-tree>" > /tmp/ws3-docs/07-mi-progreso.md
```

(Paths con acentos/espacios: siempre entre comillas, tal cual salen del `ls-tree`. Si `ls-tree` C-quotea UTF-8, usar `git -c core.quotePath=false ls-tree`.)

## 3. Gate de secretos (obligatorio antes de que algo entre a Academia)

```bash
grep -HnEi 'secret|token|password|passwd|bearer|api[_-]?key|mongodb(\+srv)?://|postgres://|mysql://|amqps?://|https?://[^ ]*@' /tmp/ws3-docs/*.md
```

Match real → ese doc NO se porta (Route R). Matches inocuos en prosa los juzga Cursor/Juan a la vista. Nada de `/tmp/ws3-docs` se copia a Academia salvo lo aprobado en el paso 4.

## 4. Gate de contradicción (leer ambos docs completos)

Rechazar (→ Route R) el doc que afirme como **estado vigente** cualquiera de:

- Tab/página «Mi Progreso» en zona real (veredicto 2026-08-02: no existe; el progreso vive dentro de Mi Estudio / `GmusicWelcome`).
- Demo nav de 4 tabs o «Mi Estudio» demo como dashboard (hoy: Inicio · Mi Camino · Inscribirme).
- Comunidad bloqueada/candado como estado actual (hoy: abierta B+, `D-COMM-BPLUS-001`).
- Cualquier otra afirmación que contradiga `DECISIONS.md` / `PROJECT_STATUS` vigentes.

Pronóstico: `07-mi-progreso.md` probablemente cae aquí → Route R para 07. Menciones claramente históricas/de plan viejo: evaluar; en duda, R.

## 5A. Route P — portar (solo docs que pasaron ambos gates)

```bash
mkdir -p "$APP/docs/features"
cp /tmp/ws3-docs/06-mi-camino.md "$APP/docs/features/06-mi-camino.md"
```

Verbatim, sin reescrituras.

## 5B. Route R — corregir referencia (docs no portados)

En cada archivo:línea del paso 1, tocar **solo esa línea**, dejando la referencia así:

`docs/features/07-mi-progreso.md — ausente en main; histórico en cuarentena trabajo/wip-2026-07-18 @ bf986db (90-Legado/repos-git/_cuarentena-originales-2026-07-31/)`

(adaptar 06 vs 07 según el archivo)

## 6. Verificación

```bash
cd "$APP"
grep -rn --include="*.md" "docs/features/0[67]" docs/ .agents/ | grep -v node_modules   # toda referencia: existe o lleva nota
git -C "$CANON" diff --stat                                                             # SOLO .md (docs/features + PROJECT_STATUS/índice)
# Suite + guards según costumbre del repo (docs-only, but se corre igual): tests verdes (cifra vigente) + guards PASS
rm -rf /tmp/ws3-docs
```

## 7. Entrega y frases de control

1. Mostrar a Juan: diff completo + resultado por doc (P o R) + salida del paso 6.
2. Mensaje de commit propuesto (elegir según resultado):
   - Solo R: `docs(status): corregir referencias rotas a features 06/07 (ausentes en main; histórico en cuarentena bf986db)`
   - Mixto P+R: `docs(features): portar 06-mi-camino desde wip bf986db y anotar 07 como histórico en cuarentena`
3. **STOP:** sin `OK commit` no hay commit; sin `OK push` no hay push. La cuarentena queda byte a byte intacta.

## DoD WS3 (del brief)

- [ ] Ninguna referencia canónica en docs activos apunta a path inexistente sin nota.
- [ ] Si se portó algo: no contradice el veredicto nav 2026-08-02 ni B+/`D-COMM-BPLUS-001`.
- [ ] Diff solo docs (o docs + índice); cero lógica de runtime.
- [ ] Cero secretos exfiltrados desde rama/cuarentena.

*Fin del runbook. Cualquier hallazgo fuera de este alcance: reportar, no actuar.*
