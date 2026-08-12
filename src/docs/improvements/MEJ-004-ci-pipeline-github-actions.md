# MEJ-004 — Pipeline de CI en GitHub Actions

**Estado:** Propuesta
**Categoría:** Developer Experience
**Impacto estimado:** Medio
**Esfuerzo estimado:** Bajo
**Fecha de creación:** 2026-08-11

## Contexto y motivación

No existe ningún archivo bajo `.github/workflows/` en este repo. `package.json` ya define `lint`, `format:check`, y `test:run` (además de `build`, que corre `tsc -b` antes de `vite build`), pero nada los ejecuta automáticamente. AGENTS.md § "Pre-commit" ya documenta esta brecha explícitamente: *"No hay Husky/lint-staged configurado todavía en este proyecto. Hasta que se configure, correr manualmente los pasos del 'Flujo QA' antes de cada commit"*. Eso depende de que cada sesión (humana o de IA) se acuerde de correrlo — un PR puede mergearse a `develop` con TypeScript roto, ESLint en rojo, o tests fallando, sin que nada lo bloquee ni lo señale visiblemente en GitHub.

## Objetivo

Que todo push y pull request contra `main` o `develop` dispare un workflow de GitHub Actions que corra `lint`, `tsc -b` y `test:run`, y que ese workflow aparezca como check en la UI de PRs de GitHub — verificado abriendo un PR de prueba (o revisando la pestaña "Actions" del repo) y confirmando que el workflow corrió y reportó su resultado.

## Fuera de alcance

- Bloquear el merge si el CI falla (branch protection rules) — requiere permisos de administración del repo en GitHub que exceden lo que se resuelve en este plan; queda como paso manual a cargo del usuario después de que el workflow exista y se haya visto correr exitosamente al menos una vez.
- Configurar `test:coverage` con thresholds bloqueantes — AGENTS.md § "Cobertura de Testing" es explícito en que todavía no hay thresholds bloqueantes mientras la cobertura sube progresivamente desde la base.
- Deploy automático (CD) — esta mejora es solo integración continua (lint/tsc/tests), no despliegue.
- Configurar Husky/lint-staged para hooks locales de pre-commit — es un mecanismo distinto (local, no en CI); si se quiere en el futuro es una mejora aparte.

## Riesgos y consideraciones

- No toca autenticación, permisos, schema de Supabase, ni contratos de datos compartidos — no aplica el protocolo de confirmación previa de AGENTS.md § "Protocolo antes de implementar funcionalidades grandes".
- El workflow no necesita secrets de Supabase: `tsc -b`, `eslint` y `vitest run` (con jsdom, sin llamadas de red reales — no hay tests de integración contra Supabase en el repo) no requieren `VITE_SUPABASE_URL` ni `VITE_SUPABASE_ANON_KEY` para pasar. Si en el futuro se agregan tests que sí las necesiten, esa mejora deberá agregar los secrets correspondientes al workflow.
- Uso de minutos de GitHub Actions: repo aparentemente privado o público sin datos de facturación conocidos en este plan — si el usuario tiene un plan con minutos limitados, confirmar antes de habilitarlo en runners que no sean `ubuntu-latest` (que es gratuito para repos públicos y el runner por defecto más barato para privados).

## Rama sugerida

`feature/mej-004-ci-pipeline-github-actions`

## Plan por etapas

### Etapa 1 — Crear el workflow de CI

- **Objetivo:** Un único workflow que instale dependencias y corra lint, typecheck y tests en cada push/PR.
- **Pasos:**
  1. Crear `.github/workflows/ci.yml` con el siguiente contenido exacto:
     ```yaml
     name: CI

     on:
       push:
         branches: [main, develop]
       pull_request:
         branches: [main, develop]

     jobs:
       check:
         runs-on: ubuntu-latest
         steps:
           - uses: actions/checkout@v4
           - uses: actions/setup-node@v4
             with:
               node-version: 22
               cache: npm
           - run: npm ci
           - run: npm run lint
           - run: npx tsc -b
           - run: npm run test:run
     ```
  2. No agregar step de `build` (`vite build`) en esta etapa: `vite build` falla en CI porque `src/shared/lib/supabase.ts:6-8` lanza si faltan `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`, y este plan no incluye configurar esos secrets (ver "Riesgos"). Si se quiere validar el build en CI, es una etapa futura que primero defina cómo proveer esas env vars de forma segura (secrets de GitHub, no committeadas).
- **Archivos:** `.github/workflows/ci.yml` (crear)
- **Verificación (Definition of Done):**
  - Hacer push de la rama a GitHub y abrir un PR de prueba contra `develop` (o revisar la pestaña "Actions" tras el push): el workflow `CI` debe dispararse y sus 3 steps (`lint`, `tsc -b`, `test:run`) deben completarse — en verde si el estado actual del repo pasa esos 3 checks localmente, lo cual se confirma corriendo `npm run lint`, `npx tsc -b` y `npm run test:run` en local antes de pushear.
  - No es necesario que el PR de prueba se mergee — sirve solo para confirmar que el workflow corre; puede cerrarse sin mergear una vez verificado.

## Cierre

Al completar la etapa: generar el reporte en `src/docs/reports/<YYYY-MM-DD>-mej-004-ci-pipeline-github-actions.md` según AGENTS.md § "Reportes de Implementación" (indicando el link al run de Actions que sirvió de verificación), y actualizar el **Estado** de este ítem a `Completada` tanto acá como en `src/docs/improvements/mejoras.md`.
