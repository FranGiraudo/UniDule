# CLAUDE.md

Project-specific instructions for Claude Code in this repo.

## Gobernanza del proyecto

Toda la gobernanza de este proyecto — arquitectura, prioridades, reglas generales, manejo de Supabase, convenciones de commits y ramas, protocolos de seguridad, gestión de documentación y deuda técnica, cobertura de testing, flujo QA y el reporte final obligatorio — vive en [AGENTS.md](./AGENTS.md) (compartido con Antigravity y cualquier otro agente compatible con AGENTS.md). Leé ese archivo completo antes de hacer cualquier cambio en este repo; no dupliques esas reglas acá.

## Skills

- `audit` (`.claude/skills/audit/`) — auditoría de código y consolidación de deuda técnica en `src/docs/technical-debt/tech-debt.md`. Ver AGENTS.md § "Gestión de Deuda Técnica".
- `improve` (`.claude/skills/improve/`) — detecta mejoras posibles (no bugs) y sugerencias de funcionalidad nueva, y genera planes de ejecución por etapas en `src/docs/improvements/`. Solo planifica, no toca código. Ver AGENTS.md § "Gestión de Mejoras Propuestas".
- `planific` (`.claude/skills/planific/`) — ejecuta por etapas un plan ya generado por `improve`, creando una rama de Git por etapa cuando es grande o de riesgo. Es la que sí modifica código. Ver AGENTS.md § "Gestión de Mejoras Propuestas".
- `graphify` (`.claude/skills/graphify/`) — grafo de conocimiento del código en `graphify-out/`; se actualiza solo vía git hooks. Ver AGENTS.md § "Grafo de Conocimiento (graphify)".
