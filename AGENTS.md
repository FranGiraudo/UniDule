# Agent Instructions — UniDule

Cross-tool rules file (read by Claude Code, Antigravity, and any other AGENTS.md-compatible agent). Este archivo es la fuente única de gobernanza del proyecto — `CLAUDE.md` solo apunta acá.

## Proyecto

UniDule es una aplicación de gestión académica personal (materias, tareas, carrera/plan de estudios, horario) construida con React 19 + TypeScript + Vite, estado con Zustand, y Supabase como backend (auth, base de datos, RLS). No hay un repositorio de backend separado — Supabase es un servicio gestionado al que se accede vía `@supabase/supabase-js` y las herramientas MCP de Supabase.

## Antes de cualquier cambio

1. Analizar la arquitectura existente (`src/features/<name>/{components,lib}`, `src/pages`, `src/shared`).
2. Revisar los archivos de `.claude/`, `.agent/` y `.agents/` (skills disponibles, configuración) para no reinventar algo que ya existe como skill. `audit` e `improve` usan la convención legacy `.agent/`; `graphify` se instaló con la convención actual de Antigravity, `.agents/` (ambas siguen siendo válidas — Antigravity mantiene compatibilidad retroactiva con `.agent/`).
3. Comprender el flujo completo afectado (UI → hook/store → `lib/api.ts` → Supabase) antes de tocar una sola capa.
4. Evitar cambios innecesarios — no tocar código fuera del alcance pedido.

## Prioridades

1. Seguridad
2. Experiencia de usuario
3. Rendimiento
4. Testing
5. Escalabilidad
6. Mantenibilidad

## Reglas generales

- No eliminar funcionalidades existentes.
- No romper compatibilidad.
- Todo código nuevo debe incluir tests (ver "Cobertura de Testing").
- No reducir la cobertura existente.
- Mantener los thresholds de Vitest una vez que se configuren (ver "Cobertura de Testing" para el estado actual).
- Reutilizar componentes existentes antes de crear nuevos (ver "Componentes").
- Evitar duplicación de código.
- Mantener TypeScript estricto — no introducir `any` nuevo (el `no-explicit-any` de ESLint ya está en `warn`; los casos existentes son deuda técnica conocida, no un permiso para sumar más).
- Mantener consistencia visual en toda la aplicación.
- Documentar decisiones técnicas importantes en `src/docs/decisions/` (ver "Gestión de documentación").

## Supabase como backend

UniDule no tiene un repo de backend que proteger, pero Supabase cumple ese rol y merece el mismo cuidado:

- **Sí está permitido**: leer `supabase/schema.sql`, consultar tablas/políticas con las herramientas MCP de solo lectura (`list_tables`, `get_advisors`, `get_logs`, `execute_sql` para `SELECT`), para entender contratos de datos.
- **Requiere confirmación explícita del usuario antes de ejecutarse**: aplicar migraciones (`apply_migration`), cualquier `execute_sql` que escriba o altere schema, cambios a políticas RLS, o cualquier acción de las herramientas MCP de Supabase marcada como irreversible (pausar/restaurar proyecto, crear/borrar branches de Supabase, etc.).
- Cuando una tarea requiera un cambio de este tipo:
  1. Detenerse y explicar el riesgo concreto (qué tabla/política se toca, qué se rompe si sale mal).
  2. Proponer el SQL/migración exacto para que el usuario lo revise.
  3. Esperar confirmación antes de aplicarlo.

## Git Commit Conventions

This project follows [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <short summary>

<optional body>

<optional footer>
```

### Types

- `feat` — new feature
- `fix` — bug fix
- `refactor` — code change that neither fixes a bug nor adds a feature
- `style` — formatting/whitespace, no logic change
- `docs` — documentation only
- `test` — adding or fixing tests
- `perf` — performance improvement
- `chore` — tooling, dependencies, config
- `build` — build system changes
- `ci` — CI configuration changes
- `revert` — reverts a previous commit

### Scope

Name the feature or area touched: `subjects`, `tasks`, `career`, `schedule`, `dashboard`, `settings`, `auth`, `shared`, `db`, `deps`, etc. Matches the `src/features/<name>` and `src/shared` folder names where applicable.

### Rules

- Subject line in imperative mood ("add", not "added"/"adds"), lowercase after the colon, no trailing period, ≤72 characters.
- One logical change per commit — don't bundle unrelated changes just because they happened in the same session.
- Body (when needed) explains **why**, not what — the diff already shows what changed.
- Reference issues/PRs in the footer when relevant (`Refs #12`, `Closes #34`).
- Never commit secrets (`.env`, API keys, credentials).
- Only commit when explicitly asked; don't commit proactively mid-task.

### Examples

```
feat(subjects): add notes tab with markdown rendering
fix(dashboard): compute real attendance alerts instead of hardcoded zero
refactor(shared): split lib/api.ts into per-feature api modules
chore(deps): bump vite to 8.2.1
docs(agents): document git commit conventions
```

## Estructura de ramas (Git)

### Formato

```
<tipo>/<descripcion-en-kebab-case>
```

### Tipos permitidos

| Tipo       | Cuándo usarlo                  |
| ---------- | ------------------------------- |
| `feature/` | Nueva funcionalidad o módulo    |
| `fix/`     | Corrección de un bug o defecto  |

### Flujo de ramas

- **`main`** — producción, **nunca se toca directamente**. Solo recibe merges desde `develop`.
- **`develop`** — rama de integración. Toda rama nueva se crea desde acá.
- **`feature/` / `fix/`** — se crean desde `develop` y se mergean de vuelta a `develop`.

### Reglas

- Usar **kebab-case** (minúsculas, palabras separadas por `-`).
- Descripciones en español o inglés, ser consistente dentro de la misma feature.
- Las ramas mergeadas deben eliminarse tanto local como remotamente.

### Ejemplos

- `feature/notas-markdown` — soporte de notas en markdown para materias
- `feature/plan-simulacion` — simulador de plan de carrera
- `fix/sync-tareas-materias` — corrección de datos desincronizados entre tasks y subjects

## Protocolo antes de implementar funcionalidades grandes

Antes de empezar a implementar cualquier funcionalidad que implique:

- Múltiples archivos nuevos o cambios en más de 3 archivos existentes.
- Nuevas tablas, columnas o políticas RLS en Supabase.
- Cambios en el sistema de autenticación (`AuthProvider`) o en permisos.
- Nuevas páginas o features completas en el frontend.

**Se debe:**

Si no existe una rama activa para la funcionalidad, sugerir una rama siguiendo la convención del proyecto.

Solo solicitar confirmación cuando:

- afecte autenticación,
- afecte permisos,
- afecte el schema o las políticas RLS de Supabase,
- afecte contratos de datos que ya consumen otras features (`lib/api.ts` compartidos, tipos en `shared/types`).

Si la funcionalidad ya tiene una rama creada y activa, no es necesario pedir permiso para crear una nueva.

## Protocolo de seguridad antes de cambios riesgosos

Si durante el desarrollo se detecta un cambio que podría **romper funcionalidad existente** (por ejemplo: modificar una tabla/entidad core de Supabase, cambiar una política RLS, tocar `AuthProvider` o el flujo de sesión, cambiar la forma de un objeto que ya consumen varias features), se debe:

1. **Detener el trabajo** y avisar al usuario explicando el riesgo.
2. **Proponer crear una rama de seguridad** (`fix/` o `feature/` según corresponda) si no hay una activa adecuada.
3. **Dar los pasos para verificar que lo existente sigue funcionando** antes de continuar:
   - Flujos a verificar manualmente en la app (qué páginas/tabs tocar).
   - Qué mirar en los logs de Supabase (`get_logs`) o en la consola del navegador.
   - Qué otras features del frontend podrían verse afectadas por depender del mismo dato.
4. **Esperar confirmación** del usuario de que todo sigue funcionando antes de continuar con el siguiente cambio.

No asumir que algo "debería funcionar igual" sin verificarlo.

## Gestión de documentación

Toda documentación generada (auditorías, análisis, planes, reportes, decisiones) debe almacenarse en `src/docs/` con la siguiente estructura:

```
src/docs/
├── audits/          # Auditorías de código y calidad (ver skill `audit`)
├── architecture/    # Reportes de arquitectura
├── implementations/ # Documentación de features/implementaciones relevantes
├── improvements/    # Mejoras propuestas y sus planes por etapas (MEJ-xxx, ver skill `improve`)
├── security/        # Reportes de seguridad (RLS, auth, hallazgos)
├── testing/         # Estrategias y evolución de cobertura
├── reports/         # Reportes de progreso por tarea
├── decisions/       # Decision records (ADR)
└── technical-debt/  # Deuda técnica (TD-RFxxx / TD-RNFxxx, ver skill `audit`)
```

Reglas:

- **No crear archivos `.md` sueltos en la raíz del proyecto ni en `src/`** (excepción: `README.md` en la raíz). Toda documentación va dentro de `src/docs/<categoría>/`.
- Antes de crear un documento, verificar si ya existe uno relacionado para actualizar en lugar de duplicar.
- Nombres descriptivos y consistentes: MAYÚSCULAS para reportes formales (`AUDIT_REPORT.md`, `SECURITY_REPORT.md`), minúsculas con fecha para documentos de trabajo (`2026-08-11-plan-pruebas.md`).
- Crear automáticamente las subcarpetas necesarias si no existen.
- Incluir fecha de creación y última actualización en el encabezado del documento.

Ejemplos de rutas correctas:

- `src/docs/audits/2026-08-11.md`
- `src/docs/architecture/ARCHITECTURE_REPORT.md`
- `src/docs/security/SECURITY_REPORT.md`
- `src/docs/reports/2026-08-11-notas-markdown.md`
- `src/docs/decisions/0001-usar-zustand-para-estado-global.md`

## Calidad Arquitectural

### Dependencias

Antes de instalar una nueva dependencia:

1. Verificar si ya existe una solución equivalente en el proyecto.
2. Justificar el beneficio técnico.
3. Evaluar impacto en bundle size.
4. Evaluar impacto en testing y mantenimiento.

No agregar dependencias para resolver problemas que puedan solucionarse con herramientas ya presentes. Las dependencias sin uso deben eliminarse durante tareas de mantenimiento.

## Gestión de Deuda Técnica

UniDule usa la skill `audit` (`.claude/skills/audit/` y `.agent/skills/audit/`) para detectar y registrar deuda técnica de forma sistemática. Fuera de una corrida completa de esa skill, si durante una implementación puntual se detecta deuda técnica nueva:

1. No mezclar la corrección con el scope de la tarea actual.
2. Registrarla en `src/docs/technical-debt/tech-debt.md`.
3. Clasificar:
   - **Crítica**
   - **Alta**
   - **Media**
   - **Baja**
4. Cada ítem se identifica como `TD-RFxxx` (deuda funcional, atada a una feature/página concreta) o `TD-RNFxxx` (deuda no funcional, transversal: seguridad, performance, tipado, accesibilidad, mantenibilidad), con numeración correlativa independiente por prefijo, y debe incluir:
   - Archivo(s) afectado(s).
   - Descripción.
   - Riesgo.
   - Recomendación.

Ver `.claude/skills/audit/SKILL.md` para el criterio completo de clasificación RF/RNF y el formato exacto.

## Gestión de Mejoras Propuestas

UniDule usa la skill `improve` (`.claude/skills/improve/` y `.agent/skills/improve/`) para proponer mejoras que no son deuda técnica — código que funciona pero podría ser mejor en arquitectura, performance, developer experience, testing estratégico, seguridad proactiva o producto/UX — y también sugerencias de funcionalidad nueva: capacidades que UniDule todavía no tiene pero que encajan con su dominio (gestión académica) y con lo que el código o el modelo de datos ya anticipan (ej. una columna de Supabase sin usar, un campo del tipo de dominio sin consumir). A diferencia de `audit`, cada mejora o funcionalidad se documenta en un archivo propio bajo `src/docs/improvements/` con una planificación por etapas explícita y verificable, no solo una recomendación corta. `improve` solo planifica — nunca modifica código.

Se ejecuta solo a pedido explícito del usuario, nunca como parte de una tarea puntual sin relación (ver "Scope Control"). Cada ítem se identifica como `MEJ-xxx`, secuencia correlativa única que nunca se reutiliza. El índice general vive en `src/docs/improvements/mejoras.md`; el plan detallado de cada mejora, en `src/docs/improvements/MEJ-xxx-<slug>.md`.

Ver `.claude/skills/improve/SKILL.md` para el criterio completo de categorización y el formato exacto de los planes.

### Ejecución de mejoras planificadas

Una vez que una mejora tiene su plan por etapas, se implementa con la skill `planific` (`.claude/skills/planific/` y `.agent/skills/planific/`) — a diferencia de `improve`, esta skill sí modifica código. Recorre el plan etapa por etapa, corre la verificación de cada una (`tsc -b`, `lint`, `test:run`, y los pasos de QA manual que el plan describa, confirmados por el usuario) y crea una rama de Git dedicada para las etapas que el plan marcó como punto de confirmación obligatoria o que tocan más de 3 archivos — mismos criterios de riesgo/tamaño que ya definen § "Protocolo antes de implementar funcionalidades grandes" y § "Protocolo de seguridad antes de cambios riesgosos" de este documento. Las etapas chicas y sin riesgo se aplican directo sobre la rama general de la mejora (la "Rama sugerida" del plan). Al terminar todas las etapas, sigue el mismo cierre que cualquier tarea de código: reporte en `src/docs/reports/` y el bloque `REPORTE_INICIO`/`REPORTE_FIN` de § "Reporte Final Obligatorio".

Ver `.claude/skills/planific/SKILL.md` para el flujo completo de ejecución, resolución de rama por etapa, y manejo de corridas parciales/reanudación.

## Grafo de Conocimiento (graphify)

UniDule usa `graphify` (`.claude/skills/graphify/` y `.agents/skills/graphify/`) para mantener un grafo de conocimiento del código en `graphify-out/` (nodos, comunidades, relaciones entre archivos). Reglas:

1. Antes de leer archivos a ciegas o hacer `grep` exploratorio para responder preguntas sobre arquitectura o relaciones entre archivos, si existe `graphify-out/graph.json` correr `graphify query "<pregunta>"` (o `graphify path "A" "B"` / `graphify explain "<concepto>"`) en vez de recorrer el código manualmente.
2. El grafo se regenera solo:
   - Un hook `post-commit`/`post-checkout` en `.git/hooks/` reconstruye la parte AST del grafo automáticamente después de cada commit/checkout (sin costo de LLM).
   - Un hook `PreToolUse` en `.claude/settings.json` (Claude Code) y una regla `always_on` en `.agents/rules/graphify.md` (Antigravity) recuerdan consultar el grafo antes de leer archivos sueltos.
3. Tras cambios de código dentro de una misma sesión, correr `graphify update .` para refrescar el grafo sin esperar al commit.
4. `graphify-out/` no debe versionarse a mano — es un artefacto regenerable; agregarlo a `.gitignore` si el equipo no quiere trackear el output binario/HTML.

Ver `.claude/skills/graphify/SKILL.md` para el pipeline completo (`/graphify`, `/graphify query`, `/graphify path`, `/graphify explain`).

## Cobertura de Testing

El proyecto usa **Vitest** + **React Testing Library** (`npm run test`, `npm run test:run`, `npm run test:coverage`), configurados en `vite.config.ts`. Setup global en `src/test/setup.ts`.

Estado al configurar esto (2026-08-11): sin suite previa, cobertura base ≈1%. Por eso, a diferencia de un proyecto maduro, **todavía no hay `thresholds` bloqueantes en Vitest** — se agregan progresivamente a medida que la cobertura sube, para no bloquear trabajo funcional no relacionado con testing.

Todo cambio nuevo debe:

- Incluir tests para el código que agrega o modifica.
- No reducir la cobertura existente.
- Incluir tests de comportamiento, no únicamente tests de implementación.
- Evitar tests de mocks estáticos sin valor funcional.

Objetivos de cobertura:

- **Actual**: subir progresivamente desde la base (~1%) hacia 30% mediante tareas específicas de testing.
- **Final para producción**: 80%.

No bloquear implementaciones funcionales por no alcanzar el objetivo final de cobertura si:

- los tests nuevos fueron agregados,
- la cobertura no disminuye,
- la brecha se encuentra documentada en `src/docs/technical-debt/tech-debt.md` (como `TD-RNFxxx`).

La cobertura debe mejorarse mediante tareas específicas de testing planificadas, no como efecto secundario de implementaciones funcionales no relacionadas.

Prioridades de testing (en este orden):

1. Bugs corregidos.
2. Contexts (`AuthProvider`, `ThemeProvider`).
3. APIs (`features/<name>/lib/api.ts`).
4. Hooks (`useDataSync`, otros hooks compartidos).
5. Componentes compartidos (`shared/components`).
6. Páginas completas (`src/pages`).

## Componentes

No crear nuevos componentes compartidos si ya existe uno equivalente.

Antes de crear un componente nuevo:

1. Buscar en `src/shared/components`.
2. Buscar implementaciones inline reutilizables dentro de las features.
3. Verificar si existe una variante configurable.

Objetivos: reducir duplicación, mantener consistencia visual, centralizar comportamiento.

## Límites de Complejidad

Objetivos recomendados:

- Componentes: ~300 líneas.
- Hooks: ~200 líneas.
- Funciones: ~80 líneas.

No realizar refactors únicamente para cumplir estos números si la implementación sigue siendo clara y mantenible. Si un archivo supera significativamente estos límites:

1. Registrar deuda técnica (`TD-RNFxxx` en `src/docs/technical-debt/tech-debt.md`).
2. Proponer estrategia de descomposición.
3. Evitar seguir agregando lógica en el mismo archivo.

## Uso de Datos Mock

Código de producción no debe importar desde archivos `*.mock.ts`. Las constantes de negocio viven en `features/<name>/lib/constants.ts` o en módulos compartidos, no en mocks.

Los mocks (`vi.mock()` de Vitest) se usan únicamente para testing.

## Reportes de Implementación

Al finalizar una tarea relevante se debe generar:

```
src/docs/reports/<YYYY-MM-DD>-<nombre-tarea>.md
```

El reporte debe incluir:

- Objetivo.
- Archivos modificados / creados / eliminados.
- Riesgos detectados.
- Tests agregados.
- Estado de TypeScript (`npx tsc -b`).
- Estado de ESLint (`npm run lint`).
- Estado de Vitest (`npm run test:run`).
- Próximos pasos.

No marcar una tarea como completada sin evidencia verificable.

## Pragmatismo

Priorizar siempre:

1. Funcionalidad correcta.
2. Seguridad.
3. Mantenibilidad.
4. Testing.
5. Optimización.

Evitar refactors extensos, cambios arquitectónicos o creación de documentación adicional cuando no aporten valor directo al objetivo solicitado.

## Scope Control

Resolver únicamente el problema solicitado. No realizar cambios adicionales aunque se detecten mejoras posibles.

Si se identifica deuda técnica fuera del alcance:

- registrarla en `src/docs/technical-debt/tech-debt.md`,
- mencionarla brevemente,
- no implementarla.

No mezclar refactors, mejoras de UX, optimizaciones o cambios arquitectónicos con correcciones puntuales o tareas pequeñas.

## Flujo QA

No se puede marcar una tarea de código como terminada sin haber corrido esto.

### Al crear o modificar un componente

1. Crear/actualizar `src/features/<feature>/components/__tests__/NombreComponente.test.tsx` (o `src/shared/components/.../__tests__/...` según corresponda) con:
   - Smoke test (renderiza sin errores).
   - Test de props vacíos/null cuando aplique.
   - Test de interacción si tiene handlers (`fireEvent.click`, `fireEvent.change` / `userEvent`).
   - Test de estado loading y error si los tiene.
2. Si el componente o hook llama a `lib/api.ts` → mockear el módulo con `vi.mock()`.
3. `npx tsc -b` → corregir si falla antes de continuar.
4. `npm run test:run` → todos deben pasar.
5. `npm run lint` → 0 errores nuevos (warnings preexistentes de `any` no bloquean, pero no se agregan nuevos).

### Al crear una feature nueva completa (página + API + hooks)

1. **Tests por capa** (en este orden):
   - `src/features/<feature>/lib/__tests__/api.test.ts` — happy path + errores.
   - `src/features/<feature>/hooks/__tests__/use<Feature>.test.ts` si aplica — estado inicial, éxito, error.
   - `src/features/<feature>/components/__tests__/*.test.tsx` — un archivo por componente.
2. `npm run test:coverage` → verificar que statements/branches/functions/lines no bajan respecto al baseline previo.
3. `npm run lint` → 0 errores nuevos.
4. Reportar cobertura antes y después (ver "Reporte Final").

### Pre-commit

No hay Husky/lint-staged configurado todavía en este proyecto. Hasta que se configure, correr manualmente los pasos del "Flujo QA" antes de cada commit que toque código.

## Reporte Final Obligatorio

Al terminar cada sesión de trabajo que modifique código, se debe incluir este bloque al final de la última respuesta. Sin este bloque la sesión no está completa.

```
REPORTE_INICIO
{
  "fecha": "<ISO 8601>",
  "rama": "<rama activa>",
  "archivos_modificados": [
    { "archivo": "ruta/relativa", "cambio": "descripción breve", "estado": "OK|ERROR" }
  ],
  "tests_nuevos": {
    "cantidad": 0,
    "archivos": []
  },
  "suite_completa": {
    "total": 0,
    "pasados": 0,
    "fallidos": 0
  },
  "cobertura": {
    "antes": "X%",
    "despues": "X%",
    "objetivo_actual": "30%"
  },
  "typescript_limpio": true,
  "proximos_pasos": []
}
REPORTE_FIN
```

Reglas del reporte:

- `cobertura.antes` y `cobertura.despues` son **obligatorios** cuando la sesión tocó código de `src/`. Correr `npm run test:coverage` al inicio de la sesión (antes de tocar código) y al final (tras todos los cambios).
- Si la sesión no tocó código (solo documentación, por ejemplo), el bloque de cobertura puede omitirse y debe indicarse explícitamente por qué.
- `proximos_pasos` lista máximo 3 ítems concretos y accionables.
- Si `typescript_limpio` es `false`, debe explicarse en `archivos_modificados` con `"estado": "ERROR"`.
