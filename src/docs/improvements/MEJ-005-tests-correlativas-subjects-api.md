# MEJ-005 — Tests para la lógica de correlativas y la capa de API de `subjects`

**Estado:** Propuesta
**Categoría:** Testing
**Impacto estimado:** Alto
**Esfuerzo estimado:** Medio
**Fecha de creación:** 2026-08-11

## Contexto y motivación

Todo el repo tiene un único archivo de test: `src/shared/lib/__tests__/utils.test.ts` (cobertura base ≈1%, según AGENTS.md § "Cobertura de Testing"). Dos módulos concretos son de alto riesgo/alto impacto y no tienen ningún test:

1. **`src/features/career/lib/utils.ts:3-11` (`getComputedStatus`)** — decide si una materia `pendiente` está `disponible` o `bloqueada` evaluando sus correlativas contra el estado de las demás materias. La consumen `GridTab.tsx`, `FinalsTab.tsx` y `StatsTab.tsx:16` (para contar "Disponibles" en el mini-grid). Es exactamente la clase de lógica donde ya hubo un bug real: TD-RF001 (`src/docs/technical-debt/tech-debt.md`) documenta que `MapTab.tsx` implementó su propia versión divergente de este cálculo y terminó mostrando materias bloqueadas como "Disponible". Un test de `getComputedStatus` no arregla TD-RF001 (que es un bug en `MapTab`, no en esta función), pero sí evita que un cambio futuro en la función real rompa a los 3 tabs que sí la usan, sin que nadie se entere hasta producción.
2. **`src/features/subjects/lib/api.ts`** — la única capa que escribe en `user_active_subjects`, `user_tasks`, `user_grades` y `user_notes` (5 funciones exportadas: `saveActiveSubject`, `deleteActiveSubject`, `syncGrades`, `saveNote`, `deleteNote`). La consumen `Settings.tsx` (import/export de backups, compartir horario), `GradesModal.tsx`, `NoteModal.tsx` y `SubjectModal.tsx` (indirectamente, vía `Subjects.tsx`). Un error introducido acá (ej. un campo mal mapeado en el `payload` de `saveActiveSubject`, líneas 32-46) se propaga silenciosamente a la sincronización de estado local (`updateSubjectInCareer`) y a la base de datos real del usuario.

## Objetivo

- `src/features/career/lib/__tests__/utils.test.ts` existe y cubre `getComputedStatus` con, como mínimo, los 4 casos descritos en la Etapa 1.
- `src/features/subjects/lib/__tests__/api.test.ts` existe y cubre las 5 funciones exportadas de `api.ts` con happy path + error de Supabase, como mínimo los casos descritos en la Etapa 2.
- `npm run test:coverage` reporta un `%` de cobertura para ambos archivos mayor a 0 (hoy es 0%), sin que la cobertura de ningún otro archivo baje respecto al baseline actual.

## Fuera de alcance

- Tests para `GridTab`, `FinalsTab`, `StatsTab`, `MapTab` (los componentes que consumen `getComputedStatus`) — esta mejora cubre la función pura, no sus consumidores; son candidatos para una mejora de testing futura si se prioriza cobertura de componentes de Career.
- Tests para `saveTask`/`deleteTask` (`features/tasks/lib/api.ts`) o `features/career/lib/api.ts` — mismo patrón de riesgo que `subjects/lib/api.ts`, pero fuera del alcance acotado de este plan; candidatos para un MEJ propio si se decide extenderlo.
- Arreglar TD-RF001 (el bug de `MapTab`) — eso lo resuelve la skill `audit` en su propia corrida, no esta mejora.
- Subir la cobertura global del proyecto a un número objetivo — el objetivo progresivo (1%→30%→80%) ya está definido en AGENTS.md y se persigue con tareas de testing sucesivas, no en un solo plan.

## Riesgos y consideraciones

- No toca código de producción, solo agrega tests — no aplica el protocolo de confirmación previa de AGENTS.md (no hay cambios a schema, RLS, `AuthProvider` ni contratos de datos).
- `src/features/subjects/lib/api.ts` importa `supabase` desde `../../../shared/lib/supabase.ts`, que en su import de módulo (línea 3-8) lanza si faltan las env vars `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`. El test debe mockear ese módulo con `vi.mock('../../../shared/lib/supabase')` **antes** de que se importe `api.ts`, para no depender de esas env vars en el entorno de test.

## Rama sugerida

`feature/mej-005-tests-correlativas-subjects-api`

## Plan por etapas

### Etapa 1 — Tests de `getComputedStatus`

- **Objetivo:** Cubrir la función pura de correlativas con los 4 casos que determinan su comportamiento.
- **Pasos:**
  1. Crear `src/features/career/lib/__tests__/utils.test.ts`.
  2. Implementar los siguientes casos con `describe('getComputedStatus', ...)`, construyendo objetos `Subject` mínimos (`{ id, name: '', year: 1, period: 1, correlatives: [...], status: ... }`, casteados con `as Subject` donde falten campos opcionales):
     - Caso 1: `sub.status` es `'aprobada'` → devuelve `'aprobada'` sin evaluar correlativas (cubre la guarda de la línea 4: `if (sub.status !== 'pendiente') return sub.status`).
     - Caso 2: `sub.status` es `undefined` → devuelve `'pendiente'` (cubre el fallback `sub.status || 'pendiente'` de la línea 4).
     - Caso 3: `sub.status === 'pendiente'`, `correlatives: ['A']`, y en `allSubjects` la materia `id: 'A'` tiene `status: 'aprobada'` → devuelve `'disponible'`.
     - Caso 4: `sub.status === 'pendiente'`, `correlatives: ['A']`, y en `allSubjects` la materia `id: 'A'` tiene `status: 'pendiente'` (o no existe en `allSubjects`) → devuelve `'bloqueada'`.
     - Caso 5: `sub.status === 'pendiente'`, `correlatives: ['A', 'B']`, `A` con `status: 'regular'` y `B` con `status: 'aprobada'` → devuelve `'disponible'` (cubre que `.every()` acepta tanto `'regular'` como `'aprobada'` como correlativa cumplida, línea 8).
     - Caso 6: `sub.status === 'pendiente'`, `correlatives: []` → devuelve `'disponible'` (array vacío, `.every()` sobre `[]` es `true`).
- **Archivos:** `src/features/career/lib/__tests__/utils.test.ts` (crear)
- **Verificación (Definition of Done):**
  - `npx tsc -b` sin errores.
  - `npm run test:run` en verde, incluyendo los 6 casos nuevos.
  - `npm run lint` sin errores nuevos.

### Etapa 2 — Tests de `features/subjects/lib/api.ts`

- **Objetivo:** Cubrir las 5 funciones exportadas con happy path y el path de error de Supabase, mockeando `supabase` y `useStore`.
- **Pasos:**
  1. Crear `src/features/subjects/lib/__tests__/api.test.ts`.
  2. Mockear el módulo de Supabase con `vi.mock('../../../shared/lib/supabase', () => ({ supabase: { from: vi.fn() } }))`, y dentro de cada test configurar el valor de retorno de `supabase.from(...).upsert(...)` / `.delete()...` / `.select()...` según el caso (patrón: `vi.mocked(supabase.from).mockReturnValue({ upsert: vi.fn().mockResolvedValue({ error: null }) } as any)`, ajustando la cadena de métodos según la función bajo test).
  3. Antes de cada test, resetear el estado real de `useStore` (no mockearlo — es un store de Zustand real, se puede llamar `useStore.setState({ session: {...}, career: {...} })` directamente en el `beforeEach` para fijar el estado necesario, y `useStore.setState({ session: null, career: null, tasks: [], notes: [] })` al final para no filtrar estado entre tests).
  4. Casos mínimos por función:
     - `saveActiveSubject`: (a) sin `session` → rechaza con `'No session'` sin llamar a `supabase.from`; (b) con `session`, Supabase responde `{ error: null }` → resuelve y `useStore.getState().career.subjects` refleja el patch aplicado por `updateSubjectInCareer` (verificar que el subject con el `id` correspondiente tiene los campos nuevos); (c) Supabase responde `{ error: {...} }` → la función rechaza (relanza el error) y no llama a `updateSubjectInCareer` (el subject en el store queda sin cambios).
     - `deleteActiveSubject`: (a) sin `session` → rechaza; (b) happy path → borra de `user_tasks`, `user_grades` y `user_active_subjects` (verificar que `supabase.from` se llamó con esos 3 nombres de tabla) y el subject en el store queda con `activeId: undefined`; (c) error en el `delete` de `user_active_subjects` → rechaza.
     - `syncGrades`: (a) sin `session` → rechaza; (b) con notas existentes en Supabase que no están en `grades` → se llama `.delete()` por cada id sobrante; (c) `grades.length === 0` → no llama a `.upsert()` (cubre el `if (grades.length > 0)` de la línea 119); (d) error en `.upsert()` → rechaza.
     - `saveNote`: (a) sin `session` → rechaza; (b) happy path con nota nueva (`id` no presente en `useStore.getState().notes`) → el store agrega la nota al final del array; (c) happy path con nota existente (mismo `id`) → el store reemplaza esa nota en su lugar, sin duplicarla; (d) error de Supabase → rechaza.
     - `deleteNote`: (a) sin `session` → rechaza; (b) happy path → el store elimina la nota del array; (c) error de Supabase → rechaza.
- **Archivos:** `src/features/subjects/lib/__tests__/api.test.ts` (crear)
- **Verificación (Definition of Done):**
  - `npx tsc -b` sin errores.
  - `npm run test:run` en verde, incluyendo los ~15 casos nuevos descritos arriba.
  - `npm run lint` sin errores nuevos.
  - `npm run test:coverage`: confirmar que `src/features/subjects/lib/api.ts` pasa de 0% a un porcentaje de cobertura mayor a 0, sin que baje la cobertura de ningún otro archivo respecto al reporte previo a esta etapa.

## Cierre

Al completar ambas etapas: generar el reporte en `src/docs/reports/<YYYY-MM-DD>-mej-005-tests-correlativas-subjects-api.md` según AGENTS.md § "Reportes de Implementación", incluyendo cobertura antes/después (`npm run test:coverage`), y actualizar el **Estado** de este ítem a `Completada` tanto acá como en `src/docs/improvements/mejoras.md`.
