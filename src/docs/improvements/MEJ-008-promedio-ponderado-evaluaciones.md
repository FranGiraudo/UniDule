# MEJ-008 — Promedio ponderado de evaluaciones en `GradesModal`

**Estado:** Propuesta
**Categoría:** Nueva Funcionalidad
**Impacto estimado:** Alto
**Esfuerzo estimado:** Medio
**Fecha de creación:** 2026-08-11

## Contexto y motivación

`user_grades.weight` (`supabase/schema.sql:110`, `NUMERIC(4,2)`) es una columna real, y `Grade.weight?: number | null` (`shared/types/index.ts:12`) su tipo de dominio correspondiente. El dato circula correctamente por toda la capa de sincronización:

- `src/features/subjects/lib/api.ts:120-128` (`syncGrades`) lo escribe al guardar: `weight: g.weight ?? null`.
- `src/shared/hooks/useDataSync.ts:84-90` lo lee al cargar: `weight: gr.weight`.

Pero **nunca se usa para nada**. Dos huecos concretos:

1. `src/features/subjects/components/GradesModal.tsx` es el único componente donde se cargan/editan evaluaciones (líneas 168-216, el loop `grades.map(...)`). Cada fila tiene `<select>` de tipo, `<input type="number">` de nota y `<input type="date">` de fecha (líneas 174-209) — no hay ningún campo para `weight`. `addGrade` (línea 22-23) crea evaluaciones nuevas sin setearlo. No hay forma de que un usuario le asigne peso a una evaluación desde la UI.
2. Ningún lugar de la app calcula un promedio a partir de las evaluaciones de una materia — ni ponderado ni simple. `StatsTab.tsx:30` (`avgPass`) promedia `Subject.grade` (la nota final que el usuario carga a mano en `SubjectDetailModal`), no las evaluaciones individuales de `Grade[]`. El estudiante que va cargando parciales y trabajos prácticos en `GradesModal` no tiene, en ningún momento, una cuenta de "cómo voy" antes de decidir qué nota final cargar.

## Objetivo

- `GradesModal` permite ingresar un peso numérico por evaluación (por defecto `1` si no se toca).
- `GradesModal` muestra, debajo de la lista de evaluaciones, un promedio ponderado calculado en vivo a partir de las evaluaciones que ya tienen nota cargada — verificado manualmente cargando 2 evaluaciones con pesos distintos (ej. una nota `8` con peso `2` y una nota `5` con peso `1`) y confirmando que el promedio mostrado es `(8×2 + 5×1) / (2+1) = 7.00`, no `(8+5)/2 = 6.50`.
- Esta mejora **no** escribe automáticamente ese promedio en `Subject.grade` ("Nota final") — es un valor de referencia, la nota final la sigue cargando el usuario a mano en `SubjectDetailModal`, sin cambios en ese flujo.

## Fuera de alcance

- Cualquier cambio a `SubjectDetailModal.tsx` o a la forma en que se guarda la "Nota final" de una materia — el promedio ponderado de `GradesModal` es informativo, no reemplaza ni pre-completa ese campo.
- Recalcular `StatsTab.tsx` (`avgPass`) usando este promedio — esa métrica sigue basándose en `Subject.grade` como hoy; cambiar su fuente de datos es una decisión de producto aparte, no incluida acá.
- Arreglar el breakpoint mobile de `.grade-row` (`src/style.css:1167-1172`): esa media query define `.grade-date-field { display: none; }`, pero ningún elemento del `grade-row` actual en `GradesModal.tsx` tiene la clase `grade-date-field` — es una regla CSS que hoy no aplica a nada, un bug preexistente y ajeno a esta mejora. No la toques como parte de este plan (ver "Riesgos y consideraciones").
- Migrar pesos existentes o poblar `weight` para evaluaciones ya cargadas — los datos históricos sin peso simplemente valen `1` por default en el cálculo (ver Etapa 2).

## Riesgos y consideraciones

- No toca autenticación, permisos, schema de Supabase (la columna `weight` ya existe) ni contratos de datos compartidos entre features — no aplica el protocolo de confirmación previa de AGENTS.md.
- `.grade-row` (`src/style.css:1153-1156`) define un grid de **4** columnas (`1fr 4.5rem 8.75rem 1.75rem`: tipo, nota, fecha, botón de borrar). Agregar el input de peso suma una 5ª columna — la Etapa 1 ajusta esa regla CSS puntual. La media query mobile (línea 1167-1172, que ya está rota per lo explicado en "Fuera de alcance") queda sin tocar; el comportamiento en mobile con 5 columnas reales contra un grid-template de 3 tracks no empeora respecto al bug que ya existía con 4 columnas reales contra 3 tracks — no es una regresión nueva de esta mejora, pero tampoco la arregla.
- El signo de `weight` no se valida (podría cargarse `0` o negativo). Si `totalWeight` calculado da `0` (ej. todas las evaluaciones tienen peso `0`), el promedio debe mostrarse como "—" (no calculable) en vez de `NaN` o dividir por cero — ver Etapa 2, paso 3.

## Rama sugerida

`feature/mej-008-promedio-ponderado-evaluaciones`

## Plan por etapas

### Etapa 1 — Input de peso por evaluación

- **Objetivo:** Que cada fila de evaluación en `GradesModal` tenga un campo editable para `weight`.
- **Pasos:**
  1. En `src/style.css:1153-1156`, cambiar `grid-template-columns: 1fr 4.5rem 8.75rem 1.75rem;` por `grid-template-columns: 1fr 4.5rem 4.5rem 8.75rem 1.75rem;` (inserta una columna de `4.5rem` para el peso, mismo ancho que la columna de nota).
  2. En `src/features/subjects/components/GradesModal.tsx`, agregar un `<input type="number">` para `weight` entre el input de nota (línea 187-202) y el input de fecha (línea 203-209):
     ```tsx
     <input
       type="number"
       min={0}
       step={0.5}
       placeholder="1"
       className="f-input"
       style={{ fontSize: '12px', textAlign: 'center' }}
       value={g.weight ?? ''}
       onChange={(e) => updGrade(i, 'weight', e.target.value)}
     />
     ```
  3. Actualizar `updGrade` (línea 25-32) para que, igual que ya hace con `'score'`, parsee `'weight'` como número (o `undefined` si el input queda vacío, no `''` — a diferencia de `score`, que sí puede quedar en `''` para representar "sin nota", `weight` vacío se interpreta como "usar el default 1", así que se guarda como `undefined`, no como cadena vacía):
     ```ts
     const updGrade = (i: number, field: keyof Grade, value: string) =>
       setGrades(
         grades.map((g, idx) =>
           idx === i
             ? {
                 ...g,
                 [field]:
                   field === 'score'
                     ? value === ''
                       ? ''
                       : parseFloat(value)
                     : field === 'weight'
                       ? value === ''
                         ? undefined
                         : parseFloat(value)
                       : value,
               }
             : g,
         ),
       );
     ```
- **Archivos:** `src/style.css` (modificar), `src/features/subjects/components/GradesModal.tsx` (modificar)
- **Verificación (Definition of Done):**
  - `npx tsc -b` sin errores nuevos.
  - `npm run lint` sin errores nuevos.
  - QA manual: abrir `GradesModal` de cualquier materia, agregar una evaluación, confirmar que aparece el campo de peso entre nota y fecha, que se puede escribir un número, y que al guardar y reabrir el modal el peso cargado persiste (confirma que `syncGrades`/`useDataSync` ya lo sincronizan sin cambios adicionales).

### Etapa 2 — Promedio ponderado calculado en vivo

- **Objetivo:** Mostrar, debajo de la lista de evaluaciones, el promedio ponderado de las que ya tienen nota.
- **Pasos:**
  1. En `src/features/subjects/components/GradesModal.tsx`, agregar una función (definida junto a `addGrade`/`rmGrade`/`updGrade`, antes del `return`):
     ```ts
     const gradedEntries = grades.filter((g) => g.score !== '' && g.score !== null);
     const totalWeight = gradedEntries.reduce((sum, g) => sum + (g.weight ?? 1), 0);
     const weightedAvg =
       gradedEntries.length && totalWeight > 0
         ? gradedEntries.reduce((sum, g) => sum + Number(g.score) * (g.weight ?? 1), 0) / totalWeight
         : null;
     ```
     Nota: `g.weight ?? 1` es la regla de default — una evaluación sin peso cargado pesa `1`, así que si ninguna evaluación de la materia tiene peso, el resultado es matemáticamente idéntico al promedio simple (no hace falta una rama de cálculo separada para "sin pesos").
  2. Debajo del bloque de evaluaciones (después del `</div>` que cierra el `.map()` de la línea 168-216, todavía dentro del mismo contenedor `m-body`), agregar:
     ```tsx
     {weightedAvg !== null && (
       <div
         style={{
           display: 'flex',
           justifyContent: 'space-between',
           alignItems: 'center',
           padding: '8px 10px',
           borderRadius: '8px',
           background: 'var(--card2)',
           marginTop: '4px',
         }}
       >
         <span style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: 600 }}>
           Promedio ponderado
         </span>
         <span
           style={{
             fontSize: '14px',
             fontWeight: 800,
             color: weightedAvg >= 4 ? '#4ade80' : '#f87171',
           }}
         >
           {weightedAvg.toFixed(2)}
         </span>
       </div>
     )}
     ```
  3. Cuando `weightedAvg === null` (ninguna evaluación con nota cargada, o todas con peso `0`), no renderizar nada en ese lugar — no mostrar "—" para no agregar un elemento vacío permanente en un modal que ya tiene "Sin evaluaciones" como empty-state (línea 156-166).
- **Archivos:** `src/features/subjects/components/GradesModal.tsx` (modificar)
- **Verificación (Definition of Done):**
  - `npx tsc -b` sin errores nuevos.
  - `npm run lint` sin errores nuevos.
  - QA manual, en el mismo modal de la Etapa 1:
    1. Cargar una evaluación con nota `8` y peso `2`, otra con nota `5` y peso `1` → el promedio ponderado mostrado debe ser `7.00`.
    2. Borrar el peso de ambas (dejar el campo vacío) → el promedio debe recalcularse a `6.50` (promedio simple, pesos default `1`).
    3. Agregar una evaluación sin nota (campo score vacío) → no debe alterar el promedio (se excluye de `gradedEntries`).
    4. Vaciar todas las notas → el bloque de "Promedio ponderado" debe desaparecer, no mostrar `NaN` ni `0.00`.

## Cierre

Al completar ambas etapas: generar el reporte en `src/docs/reports/<YYYY-MM-DD>-mej-008-promedio-ponderado-evaluaciones.md` según AGENTS.md § "Reportes de Implementación", y actualizar el **Estado** de este ítem a `Completada` tanto acá como en `src/docs/improvements/mejoras.md`.
