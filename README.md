# Academia GMusic — proyectogmusic

Plataforma de aprendizaje musical de **Academia GMusic** (Gmusic Estudio): cursos, práctica guiada, Mi Estudio / Mi Camino, biblioteca y API local-first.

Repositorio: [github.com/gmusicproyect/proyectogmusic](https://github.com/gmusicproyect/proyectogmusic)

## Estructura del repo

| Ruta | Contenido |
|------|-----------|
| [`Página de cursos de música/`](./Página%20de%20cursos%20de%20música/) | **App principal** (Vite + React, API Node, Prisma) |
| [`instruccionesAgentes/`](./instruccionesAgentes/) | Prompts / reglas / plantillas para agentes |
| [`.github/`](./.github/) | Workflows y plantillas de GitHub |

La carpeta de la app conserva el nombre acentuado original.

## Requisitos

- Node.js 20+ (recomendado)
- PostgreSQL (local o Docker — ver `docker-compose.yml` dentro de la app)
- npm

## Arranque rápido

```bash
cd "Página de cursos de música"
cp .env.example .env          # ajustar DATABASE_URL y secretos locales
npm install
npm run prisma:generate
npm run db:migrate:deploy    # o db:migrate en desarrollo
npm run api:dev              # API (terminal 1)
npm run dev                  # frontend Vite (terminal 2)
```

Verificación:

```bash
npm run typecheck
npm test
npm run build
```

Detalle de estado, decisiones y handoffs: carpeta oculta  
`Página de cursos de música/.agents/` (`PROJECT_STATUS.md`, `DECISIONS.md`, `MEMORY.md`).

## Documentación

Dentro de la app:

- `docs/` — roadmap, flows, skills, evidencias
- `AGENTS.md` / `CLAUDE.md` — contexto para agentes
- `DESIGN.md` — dirección visual

## Seguridad

- **No** commits de `.env` reales (están en `.gitignore` de la app).
- Usa solo `.env.example` como plantilla.
- No subas claves, tokens ni dumps de base de datos.

## Licencia

Copyright © 2026 Academia GMusic / gmusicproyect.  
Ver [LICENSE](./LICENSE). Código y marca: **todos los derechos reservados** salvo acuerdo escrito.

## Organización local

En el disco de trabajo, este repo vive bajo:

`Academia GMusic/01-Producto/proyectogmusic/`

No mezclar con proyectos Logic / audio (`Academia GMusic` excluye producción musical).
