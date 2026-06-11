# ADR-001 — Estructura Yousician + Estrategia Web Embudo

Fecha: 2026-06-10  
Estado: Aprobado (documentado desde sesión de arquitectura; pendiente revisión Fable antes de commit permanente)

---

## Contexto

Gmusic Estudio es una academia online de guitarra gamificada. El equipo adoptó referencias de producto (Duolingo, Yousician, Perfect Ear) pero la **estrategia de entrega** es una web embudo que valide conversión antes de invertir en auth real, pagos e infraestructura móvil.

Al 10 Jun 2026 el funnel público principal está implementado: demo de 5 clases, puerta de inscripción y bridge WhatsApp temporal. Auth real y Flow están **pausados** a propósito.

---

## Decisiones tomadas

### 1. Web embudo primero, app después

**Decisión:** Priorizar landing + demo + inscripción en web responsive.  
**Razón:** Validar interés y conversión con costo mínimo antes de app nativa o motor musical avanzado.  
**Consecuencia:** No iniciar Electron, React Native, Capacitor ni Tauri sin nueva ADR.

### 2. Auth propia vs. Supabase Auth

**Decisión:** Auth propia con Express + Prisma + bcrypt + JWT en cookie httpOnly (`gmusic_session`).  
**Razón:** Control total del funnel, sin vendor lock-in de auth, alineado con backend Express ya existente.  
**Estado:** Diseño en `.agents/skills/gmusic-auth-email-verification/SKILL.md`; **implementación Fase 4 pausada**.  
**Dev actual:** `devStudentAuth` + cookie HMAC + `POST /dev/activate-semestral` (solo local).

### 3. Bridge WhatsApp antes de auth real (Pre-Fase 4)

**Decisión:** `InscripcionRegistroPage` como bridge manual a WhatsApp antes de Fase 4.  
**Razón:** Medir conversión real con costo cero de backend antes de semanas de auth/email.  
**Estado:** Implementado en working tree; número `569XXXXXXXXX` es placeholder (`InscripcionRegistroPage.tsx` L9).

### 4. String-based routing (no React Router)

**Decisión:** Mantener `currentPage` + `handlePageChange` en `App.tsx`.  
**Razón:** Simplicidad, código ya estable, URLs parciales vía `student-zone-routing.ts` para zona alumno.  
**Consecuencia:** Toda ruta nueva debe actualizar exclusiones Navbar/MusicPlayer en App.

### 5. Demo: 5 clases con Video + Ejercicio

**Decisión:** Funnel demo = `PathDemoPage` (5 nodos) → `demo-clase-N` → video (YouTube temporal) → ejercicio → éxito → `inscripcion-gate`.  
**Razón:** Replica loop Yousician (mira + practica) sin backend. Progreso en `gmusic:demo_v1`.  
**Evolución futura:** Mira → Fundamento → Técnica → Crea → Logro (no implementado).

### 6. Inspiraciones de producto (no copia)

| Referencia | Qué tomamos |
|------------|-------------|
| Duolingo | Ruta, XP, racha, desbloqueos |
| Yousician | Video, microtarjetas, práctica guiada |
| Perfect Ear / OpenEar | Ritmo, oído, ejercicios musicales |
| Gmusic propia | Metodología Fundamento → Técnica → Crea |

**Regla:** No copiar assets ni marca de terceros.

### 7. Precios y planes

**Decisión original (10 Jun 2026):** Tres planes flat (`monthly`, `semester`, `annual`) con `price: null`.  
**Supersedida por `cf3343c`:** Modelo 3 tiers × 3 períodos con `PRICE_TABLE` CLP y 9 `flowPlanIds`.  
**Estado:** Precios visibles en gate/registro; conversión vía WhatsApp hasta Fase 4/5.

### 8. Gap curricular Clase 4 (pendiente decisión PO)

**Observación:** Video Clase 4 trata notas/sostenidos; ejercicio cableado es `ex4-calidad-acorde`.  
**Estado:** Pendiente de verificación con Juan — no bloquea demo técnico.

---

## Fuera de scope 2026 (explícito)

- App móvil o de escritorio
- Afinador / micrófono real (Web Audio API)
- Motor musical avanzado (Tonal.js, teoría profunda)
- OAuth / Supabase Auth como sistema principal
- Rediseño total de landing o Mi Estudio sin fase dedicada
- Pagos Flow + Resend (Fase 5) antes de cerrar Fase 4

---

## Consecuencias para agentes

- Cursor implementa solo con brief + Skill + autorización Juan.
- Fable edita `.agents/skills/` y `.agents/MEMORY.md`.
- Cambios en zonas listadas en `.agents/DO_NOT_TOUCH.md` requieren OK explícito.

---

## Referencias

- `.agents/ROADMAP.md`
- `.agents/PROJECT_STATUS.md`
- `.agents/skills/gmusic-funnel-conversion/SKILL.md`
- `.agents/skills/gmusic-auth-email-verification/SKILL.md`
