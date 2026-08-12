# MEJ-011 — `FinalsTab` usa las correlativas de cursada para decidir si podés rendir el final

**Estado:** Propuesta
**Categoría:** Nueva Funcionalidad
**Impacto estimado:** Medio
**Esfuerzo estimado:** Medio
**Fecha de creación:** 2026-08-11

## Contexto y motivación

`global_subjects.correlatives` (`supabase/schema.sql:20`) es `JSONB DEFAULT '{"toCurse": [], "toPass": []}'::jsonb` — la propia columna anticipa dos conjuntos de correlativas distintos: las que necesitás para **cursar** una materia y las que necesitás para **rendir su final**. No es un artefacto vacío del schema: `database/seeds/seed_global.mjs` puebla `toPass` en las 40+ materias del plan (ej. línea 28: `{ code: 'cs-info2', ..., correlatives: { toCurse: ['cs-info1'], toPass: ['cs-info1'] } }`), y la distinción ya existía en la app pre-Supabase — `scripts/legacy/state_original.js` y `scripts/legacy/state_pre.js` (líneas 41, 46, 55, 86, 97 en ambos) transportan `toCurse` y `toPass` como dos arrays separados en el estado local.

La migración a Supabase perdió esa distinción en el camino:

- `src/shared/hooks/useDataSync.ts:99` — `correlatives: g.correlatives?.toCurse || [],` — es el único punto donde `global_subjects.correlatives` se mapea al dominio, y solo toma `toCurse`. `toPass` se lee de Supabase (viaja en `g.correlatives`) y se descarta ahí mismo, nunca llega a `Subject`.
- `src/shared/types/index.ts:21` — `Subject.correlatives: string[]` es un único array; aunque `toPass` sobreviviera al mapeo, no hay dónde guardarlo.
- `src/features/career/components/FinalsTab.tsx:59-62` (cálculo de `missingToPass` en el filtro) y `169-172` (mismo cálculo repetido para el badge "Habilitado para rendir" / la lista "Falta aprobar") iteran `s.correlatives` — es decir, las correlativas de **cursada** — para decidir si un final está habilitado. La variable se llama `missingToPass` pero los datos que consume son los de `toCurse`.

En la mayoría de las materias actuales del seed, `toCurse` y `toPass` son idénticos, así que hoy el resultado visual coincide por casualidad — pero la columna existe justamente para el caso en que no coincidan (currícula real: para cursar Análisis II alcanza con tener Análisis I regularizada, pero para rendir su final hace falta tenerla aprobada), y en ese caso `FinalsTab` mostraría "Habilitado para rendir" con datos equivocados.

## Objetivo

- `Subject` expone un campo separado para las correlativas de final (`correlativesToPass`), poblado desde `toPass` en `useDataSync`.
- `FinalsTab` calcula `missingToPass`/el badge "Habilitado para rendir" a partir de `correlativesToPass`, no de `correlatives`.
- Verificado manualmente: editar el registro de `global_subjects` de una materia en Supabase para que `toCurse` y `toPass` difieran (ej. agregar un id extra solo a `toPass`), recargar la app, y confirmar que `FinalsTab` refleja el requisito de `toPass` mientras que `GridTab`/`MapTab`/`SubjectDetailModal` (que siguen usando `correlatives`/`toCurse` para "para cursar") no cambian.

## Fuera de alcance

- Tocar `GridTab.tsx`, `MapTab.tsx`, `SubjectDetailModal.tsx` o `getComputedStatus` (`career/lib/utils.ts:3-11`) — esos usan correctamente `toCurse` para decidir si una materia está disponible para cursar; no cambian.
- Editar `database/seeds/seed_global.mjs` para que `toCurse` y `toPass` dejen de ser idénticos — eso es una decisión curricular de contenido, no de código; queda fuera de este plan.
- Cualquier cambio a `user_progress` o a cómo se guarda el estado de una materia (`updateSubjectProgress`, `career/lib/api.ts`).

## Riesgos y consideraciones

- No toca autenticación, permisos, RLS ni el schema de Supabase (la columna y sus datos ya existen) — no aplica el protocolo de confirmación previa de AGENTS.md.
- `Subject.correlativesToPass` debe ser opcional (`?: string[]`) y con fallback a `[]` en todos los consumos, igual que `correlatives` ya lo hace (`s.correlatives || []`), para no romper materias del catálogo que todavía no tengan `toPass` poblado.

## Rama sugerida

`feature/mej-011-correlativas-topass-finales`

## Plan por etapas

### Etapa 1 — Propagar `toPass` hasta el dominio

- **Objetivo:** Que `Subject` tenga un campo separado con las correlativas de final, alimentado desde Supabase.
- **Pasos:**
  1. En `src/shared/types/index.ts`, agregar el campo justo debajo de `correlatives: string[];` (línea 21):
     ```ts
     correlativesToPass?: string[];
     ```
  2. En `src/shared/hooks/useDataSync.ts:99`, agregar la línea siguiente inmediatamente después de `correlatives: g.correlatives?.toCurse || [],`:
     ```ts
     correlativesToPass: g.correlatives?.toPass || [],
     ```
- **Archivos:** `src/shared/types/index.ts` (modificar), `src/shared/hooks/useDataSync.ts` (modificar)
- **Verificación (Definition of Done):**
  - `npx tsc -b` sin errores nuevos.
  - `npm run lint` sin errores nuevos.
  - QA manual: recargar la app logueado y confirmar en las devtools (o un `console.log` temporal en `useDataSync`) que `career.subjects[0].correlativesToPass` es un array (no `undefined`) para materias con correlativas.

### Etapa 2 — `FinalsTab` usa `correlativesToPass`

- **Objetivo:** Que el filtro "Habilitados para rendir" y el badge de cada tarjeta reflejen `toPass`, no `toCurse`.
- **Pasos:**
  1. En `src/features/career/components/FinalsTab.tsx:59-62`, reemplazar:
     ```ts
     const missingToPass = (s.correlatives || [])
       .map((id) => subjects.find((x) => x.id === id))
       .filter((dep) => !dep || dep.status !== 'aprobada');
     ```
     por:
     ```ts
     const missingToPass = (s.correlativesToPass || [])
       .map((id) => subjects.find((x) => x.id === id))
       .filter((dep) => !dep || dep.status !== 'aprobada');
     ```
  2. Aplicar el mismo reemplazo (`s.correlatives` → `s.correlativesToPass`) en el segundo cálculo idéntico dentro del `.map()` de renderizado, líneas 169-172.
- **Archivos:** `src/features/career/components/FinalsTab.tsx` (modificar)
- **Verificación (Definition of Done):**
  - `npx tsc -b` sin errores nuevos.
  - `npm run lint` sin errores nuevos.
  - QA manual:
    1. Con los datos actuales del seed (donde `toCurse` y `toPass` coinciden), confirmar que `FinalsTab` se comporta exactamente igual que antes — mismas materias marcadas "Habilitado para rendir" / "Pendiente correlativas".
    2. En Supabase, editar temporalmente el `correlatives` de una materia regularizada para que `toPass` incluya un id de una materia no aprobada que NO esté en su `toCurse`, recargar, y confirmar que esa materia pasa a mostrar "Pendiente correlativas" en `FinalsTab` (y sigue mostrando el estado que le corresponda en `GridTab`, sin cambios ahí). Revertir el dato de prueba al terminar.

## Cierre

Al completar ambas etapas: generar el reporte en `src/docs/reports/<YYYY-MM-DD>-mej-011-correlativas-topass-finales.md` según AGENTS.md § "Reportes de Implementación", y actualizar el **Estado** de este ítem a `Completada` tanto acá como en `src/docs/improvements/mejoras.md`.
