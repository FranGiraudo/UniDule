# MEJ-012 — Lógica de filtrado de `GridTab` duplicada entre el chequeo de vacío y el render

**Estado:** Propuesta
**Categoría:** Developer Experience / Performance
**Impacto estimado:** Bajo
**Esfuerzo estimado:** Bajo
**Fecha de creación:** 2026-08-11

## Contexto y motivación

`src/features/career/components/GridTab.tsx` filtra las materias por año, búsqueda y estado en **dos lugares casi idénticos**:

- Líneas 20-36 (`hasAnySubjects`): para cada año, filtra `subjects` por `s.year === year`, aplica el filtro de texto (`search`) sobre `name`/`id`, y aplica el filtro de estado (`filter`) llamando a `getComputedStatus(s, subjects)` — todo para decidir si hay que mostrar el empty-state.
- Líneas 106-120 (dentro del `years.map(...)` que arma el render real): **el mismo bloque, carácter por carácter**, para obtener `yearSubs` y efectivamente renderizarlo.

Las dos copias no están extraídas a una función compartida, así que:

1. Cualquier cambio futuro en la lógica de filtrado (ej. agregar un nuevo criterio, corregir un caso borde) tiene que aplicarse en dos lugares — si se actualiza uno y se olvida el otro, el mensaje de "no se encontraron materias con el filtro aplicado" puede quedar desincronizado con lo que realmente se renderiza (ej. mostrar el empty-state cuando en realidad sí hay resultados, o viceversa).
2. El filtrado completo de los ~40-50 registros de `subjects` corre dos veces en cada render de `GridTab` (una en `hasAnySubjects`, otra en el `.map()`), sin necesidad.

## Objetivo

- Una única función `filterYearSubjects(subjects, year, search, filter)` (definida en el propio `GridTab.tsx`, junto al componente — no hace falta moverla a `career/lib/utils.ts` porque es específica del filtrado combinado año+búsqueda+estado de esta vista) reemplaza ambos bloques duplicados.
- `hasAnySubjects` y el `years.map(...)` de renderizado usan esa misma función.
- Verificado: `npx tsc -b` y `npm run lint` limpios, y manualmente — combinar búsqueda + filtro de estado en la UI y confirmar que el empty-state aparece/desaparece exactamente cuando corresponde, igual que antes del cambio.

## Fuera de alcance

- Memoizar el resultado con `useMemo` — este plan solo elimina la duplicación de código; envolver en `useMemo` es una optimización adicional que puede evaluarse aparte si en el futuro el catálogo de materias crece mucho (hoy son ~40-50 registros, no justifica la complejidad extra).
- Tocar `FinalsTab.tsx` u otras tabs de `Career` — cada una tiene su propia lógica de filtrado y no comparten este código con `GridTab`.

## Riesgos y consideraciones

- No toca autenticación, permisos, schema de Supabase ni contratos de datos compartidos — no aplica el protocolo de confirmación previa de AGENTS.md.
- La función extraída debe producir exactamente el mismo resultado que los dos bloques actuales — no es una reescritura de la lógica de filtrado, solo una deduplicación.

## Rama sugerida

`fix/mej-012-filtro-duplicado-gridtab`

## Plan por etapas

### Etapa 1 — Extraer y reusar `filterYearSubjects`

- **Objetivo:** Una sola implementación del filtro, usada en los dos puntos que hoy la duplican.
- **Pasos:**
  1. En `src/features/career/components/GridTab.tsx`, antes de la declaración de `export function GridTab(...)`, agregar:
     ```ts
     function filterYearSubjects(
       subjects: Subject[],
       year: number,
       search: string,
       filter: string,
     ): Subject[] {
       let yearSubs = subjects.filter((s) => s.year === year);
       if (search) {
         const q = search.toLowerCase();
         yearSubs = yearSubs.filter(
           (s) => s.name.toLowerCase().includes(q) || (s.id && s.id.toLowerCase().includes(q)),
         );
       }
       if (filter !== 'all') {
         yearSubs = yearSubs.filter((s) => {
           const cs = getComputedStatus(s, subjects);
           if (filter === 'bloqueada') return cs === 'pendiente' || cs === 'bloqueada';
           return cs === filter;
         });
       }
       return yearSubs;
     }
     ```
     Esto requiere importar el tipo `Subject`: agregar `import type { Subject } from '../../../shared/types';` junto a los imports existentes (línea 1-4).
  2. Reemplazar el cuerpo de `hasAnySubjects` (líneas 20-36) por:
     ```ts
     const hasAnySubjects = years.some(
       (year) => filterYearSubjects(subjects, year, search, filter).length > 0,
     );
     ```
  3. Dentro de `years.map((year) => { ... })` (línea 106), reemplazar el bloque que recalcula `yearSubs` (líneas 107-120) por:
     ```ts
     let yearSubs = filterYearSubjects(subjects, year, search, filter);
     ```
- **Archivos:** `src/features/career/components/GridTab.tsx` (modificar)
- **Verificación (Definition of Done):**
  - `npx tsc -b` sin errores nuevos.
  - `npm run lint` sin errores nuevos.
  - QA manual en la tab "Plan" de Career:
    1. Sin filtros: confirmar que se ven exactamente los mismos años/materias que antes del cambio.
    2. Escribir un texto de búsqueda que no matchee ninguna materia → debe aparecer el empty-state "No se encontraron materias con el filtro aplicado."
    3. Combinar búsqueda + filtro de estado (ej. "Disponibles") con un término que sí matchee → deben aparecer solo los años/materias que cumplen ambos criterios, igual que antes.

## Cierre

Al completar la etapa: generar el reporte en `src/docs/reports/<YYYY-MM-DD>-mej-012-filtro-duplicado-gridtab.md` según AGENTS.md § "Reportes de Implementación", y actualizar el **Estado** de este ítem a `Completada` tanto acá como en `src/docs/improvements/mejoras.md`.
