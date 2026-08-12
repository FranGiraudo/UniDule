# MEJ-003 — Tipos generados desde el schema de Supabase en `useDataSync`

**Estado:** Propuesta
**Categoría:** Arquitectura
**Impacto estimado:** Alto
**Esfuerzo estimado:** Medio
**Fecha de creación:** 2026-08-11

## Contexto y motivación

`src/shared/hooks/useDataSync.ts` dispara 8 queries (`Promise.all`, líneas 20-47) contra `user_active_subjects`, `user_tasks`, `user_grades`, `global_subjects`, `user_progress`, `user_seminars`, `global_electives`, `user_notes` — todas con `select('*')`, sin ningún tipo intermedio para las filas devueltas. Cada `.map()`/`.find()`/`.filter()` que las transforma tipa su parámetro como `any`: `t: any` (línea 51), `n: any` (línea 65), `g: any` (línea 76), `p: any` (línea 77, dos apariciones más en 133-134), `a: any` (línea 78), `gr: any` (líneas 83-84), `s: any` (línea 121), `e: any` (línea 132). Es el punto de entrada de todos los datos remotos a la app, y el único lugar del repo donde se concentra la mayoría del uso de `any` (ya registrado como TD-RNF004 en `src/docs/technical-debt/tech-debt.md`).

`supabase/schema.sql` define las 8 tablas con columnas concretas (ej. `user_active_subjects.max_absences INTEGER`, `global_subjects.correlatives JSONB`) — la información para tipar correctamente ya existe en el schema, solo no se está usando. Generar los tipos con `supabase gen types typescript` (herramienta que Supabase distribuye para exactamente este caso) convierte el `any` en un error de compilación real si mañana cambia un nombre de columna, en vez de un fallo silencioso en runtime.

## Objetivo

Que ningún parámetro de los `.map()`/`.find()`/`.filter()` en `useDataSync.ts` esté tipado como `any` — verificado con `grep -n ": any" src/shared/hooks/useDataSync.ts` devolviendo cero resultados, y `npx tsc -b` compilando sin errores.

## Fuera de alcance

- Tipar el resto de los ~27 usos de `any`/`as any` del repo (TD-RNF004 cubre varios fuera de `useDataSync.ts`) — esta mejora resuelve específicamente el hotspot de `useDataSync.ts`.
- Reducir las columnas seleccionadas (`select('*')` → columnas específicas) — el schema actual es chico (cada tabla tiene pocas columnas sin usar, ej. solo `created_at` en la mayoría), no hay evidencia de que el overfetch actual tenga impacto medible; se puede reevaluar en una mejora futura si el schema crece.
- Regenerar tipos para tablas que `useDataSync.ts` no consulta.

## Riesgos y consideraciones

- Generar los tipos requiere acceso de lectura al proyecto de Supabase (introspección de schema, no escritura). Usar la herramienta MCP `generate_typescript_types` o, si no está disponible, `supabase gen types typescript --linked` vía CLI — ambas son operaciones de solo lectura, no requieren el protocolo de confirmación de AGENTS.md § "Supabase como backend" (que aplica a `apply_migration`, `execute_sql` de escritura, o cambios de RLS).
- El campo `correlatives` de `global_subjects` es `JSONB` — el tipo generado lo va a tipar como `Json` (unión genérica), no como `{ toCurse: string[]; toPass: string[] }`. La línea 99 de `useDataSync.ts` (`g.correlatives?.toCurse || []`) va a necesitar un cast o type guard puntual para ese campo — se resuelve en la Etapa 2, no se puede evitar sin cambiar el schema.
- No toca RLS, `AuthProvider` ni el shape de los tipos de dominio (`Subject`, `Task`, etc. en `shared/types/index.ts`) — solo agrega tipos intermedios para las filas crudas de Supabase antes de mapearlas a esos tipos de dominio, que no cambian.

## Rama sugerida

`feature/mej-003-tipos-generados-supabase`

## Plan por etapas

### Etapa 1 — Generar los tipos del schema

- **Objetivo:** Tener un archivo con los tipos `Database` generados desde el schema real de Supabase.
- **Pasos:**
  1. Obtener el `project-id` del proyecto de Supabase vinculado a este repo (si no se conoce, usar la herramienta MCP `list_projects` o `get_project` para identificarlo).
  2. Ejecutar la herramienta MCP `generate_typescript_types` (o `supabase gen types typescript --project-id <id>` por CLI si se prefiere) y guardar la salida completa en `src/shared/types/supabase.ts`.
  3. Confirmar que el archivo generado exporta un tipo `Database` con, como mínimo, las 8 tablas usadas por `useDataSync.ts` bajo `Database['public']['Tables']`.
- **Archivos:** `src/shared/types/supabase.ts` (crear, generado — no editar a mano)
- **Verificación (Definition of Done):** El archivo existe, exporta `Database`, y `npx tsc -b` no reporta errores de sintaxis en él.

### Etapa 2 — Tipar `useDataSync.ts` con las filas generadas

- **Objetivo:** Eliminar los 8 parámetros `any` de `useDataSync.ts`, reemplazándolos por alias de fila derivados de `Database`.
- **Pasos:**
  1. En `src/shared/hooks/useDataSync.ts`, agregar tipos de fila con `type` derivado de `Database`, uno por tabla consultada:
     ```ts
     import type { Database } from '../types/supabase';

     type ActiveSubjectRow = Database['public']['Tables']['user_active_subjects']['Row'];
     type TaskRow = Database['public']['Tables']['user_tasks']['Row'];
     type GradeRow = Database['public']['Tables']['user_grades']['Row'];
     type GlobalSubjectRow = Database['public']['Tables']['global_subjects']['Row'];
     type ProgressRow = Database['public']['Tables']['user_progress']['Row'];
     type SeminarRow = Database['public']['Tables']['user_seminars']['Row'];
     type ElectiveRow = Database['public']['Tables']['global_electives']['Row'];
     type NoteRow = Database['public']['Tables']['user_notes']['Row'];
     ```
  2. Reemplazar cada `any` por el tipo de fila correspondiente:
     - Línea 51: `t: any` → `t: TaskRow`
     - Línea 65: `n: any` → `n: NoteRow`
     - Línea 76: `g: any` → `g: GlobalSubjectRow`
     - Línea 77: `p: any` (dentro del `.find()` sobre `progressData`) → `p: ProgressRow`
     - Línea 78: `a: any` → `a: ActiveSubjectRow`
     - Líneas 83-84: `gr: any` (filter y map) → `gr: GradeRow`
     - Línea 99: `g.correlatives?.toCurse || []` → tipar `correlatives` como `{ toCurse?: string[]; toPass?: string[] } | null` con un cast explícito acotado a esa línea (`(g.correlatives as { toCurse?: string[] } | null)?.toCurse || []`), ya que el tipo generado para JSONB es `Json` genérico.
     - Línea 121: `s: any` → `s: SeminarRow`
     - Línea 132: `e: any` → `e: ElectiveRow`
     - Líneas 133-134: `p: any` (dentro del `.find()` sobre `progressData` para electivas) → `p: ProgressRow`
  3. Revisar cada acceso a propiedad dentro de esos callbacks (ej. `t.due_date`, `a.max_absences`) contra los nombres de columna reales del tipo generado — `npx tsc -b` va a marcar cualquier discrepancia de nombre.
- **Archivos:** `src/shared/hooks/useDataSync.ts` (modificar)
- **Verificación (Definition of Done):**
  - `grep -n ": any" src/shared/hooks/useDataSync.ts` no devuelve resultados.
  - `npx tsc -b` sin errores.
  - `npm run lint` sin errores nuevos (la regla `no-explicit-any` deja de marcar warnings en este archivo).
  - `npm run test:run` en verde.
  - QA manual: `npm run dev`, iniciar sesión y confirmar que Dashboard, Career (los 6 tabs), Subjects y Tasks siguen mostrando los mismos datos que antes del cambio (materias, notas, tareas, seminarios, electivas) — el mapeo de datos no debe cambiar de comportamiento, solo de tipado.

## Cierre

Al completar ambas etapas: generar el reporte en `src/docs/reports/<YYYY-MM-DD>-mej-003-tipos-generados-supabase.md` según AGENTS.md § "Reportes de Implementación", actualizar el **Estado** de este ítem a `Completada` tanto acá como en `src/docs/improvements/mejoras.md`, y marcar TD-RNF004 en `src/docs/technical-debt/tech-debt.md` como resuelto en la parte que corresponde a `useDataSync.ts` (la próxima corrida de la skill `audit` es responsable de mover/cerrar formalmente ese ítem).
