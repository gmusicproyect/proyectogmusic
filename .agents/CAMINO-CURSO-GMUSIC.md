# Camino curso → Gmusic

Las ~542 lecciones / 20 fases del curso *AI Engineering from Scratch* no se
copian como páginas. Se **portan como capacidades**. Este documento es el mapa
de integración en la copia `proyectogmusic-cursor`.

Canvas vivo (abrir al lado del chat): ver `camino-curso-gmusic.canvas.tsx` en
canvases del proyecto Cursor.

## Idea central

| Curso | Gmusic |
|-------|--------|
| Cómo construir agentes seguros y auditables | Dónde aplicarlos (corpus, alumno, admin) |
| Firewall, RAG, traces, planner, MCP, jobs | Lab en `tools/gmusic-agent-workbench` |
| Responder con evidencia | Primera cara visible: `/tutor` |

## Qué aportó cada superficie

| Superficie | Aporte | Dónde | Estado |
|------------|--------|-------|--------|
| Agent loop + approvals | No escribe sin OK | Workbench lab | Lab |
| Firewall / roles | Tutor solo lee | `roles.json` + API | Producto (tutor) |
| RAG + NDCG | Corpus real; detecta regresiones | `gmusic-corpus` | Lab + API |
| Traces / evidence | Auditoría sin chat | `outputs/evidence` | Lab |
| Planner | Propone patch gobernado | `planner.py` | Lab |
| MCP subset | Tools de catálogo read-only | `mcp-serve` | Lab |
| Durable jobs | Crash/recover idempotente | `jobs-demo` | Lab |
| Grounded tutor | Citas o abstain | `/tutor` + API | **Visible** |

## Pasos hechos (0–8)

0 Base copia · 1 Workbench · 2 Smoke Track A · 3 Corpus RAG · 4 Tutor lab ·  
5 API · 5b UI · 6 Harden · 7 Entradas producto · **8 Deploy prod** (`PASO-8-DEPLOY.md`)

Último push tutor producto: `44618c8`. Smoke prod tutor PASS 2026-11-09.

## Siguiente (recomendado)

9 Evidence en admin (aporte traces)  
10 Repair acotado (aporte agent loop)  
11 LLM live (mismo contrato)  
12 Jobs de producto  

## Cómo verificar

**Prod**
- https://proyectogmusic.vercel.app/tutor  
- https://proyectogmusic.vercel.app/clase-gratuita → *Preguntas con citas*

**Local**
- http://127.0.0.1:5173/tutor  
- Lab: `cd tools/gmusic-agent-workbench && python3 -m workbench tutor-demo`
