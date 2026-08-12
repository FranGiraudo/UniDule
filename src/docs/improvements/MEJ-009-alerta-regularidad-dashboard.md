# MEJ-009 — Alerta de vencimiento de regularidad en el Dashboard

**Estado:** Propuesta
**Categoría:** Nueva Funcionalidad
**Impacto estimado:** Medio
**Esfuerzo estimado:** Bajo
**Fecha de creación:** 2026-08-11

## Contexto y motivación

El Dashboard ya tiene un patrón de "tarjeta de alertas" bien establecido: el stat-card de `src/pages/Dashboard.tsx:337-373` cuenta y lista, en un tooltip, las materias en riesgo por faltas (`warnSubs`, línea 18-21: `s.activeId && (s.absences || 0) >= (s.maxAbsences || 6) * 0.75`).

Pero existe un segundo riesgo académico igual de real que la app **ya calcula en otro lado** y nunca sube al Dashboard: perder la regularidad de una materia por vencimiento de plazo para rendir el final. `src/features/career/components/FinalsTab.tsx:178` ya llama a `getDaysToExpiration(expDate)` (`src/features/career/lib/utils.ts:14-23`) para cada materia con `status === 'regular'`, y ya define el umbral de alerta en la línea 188 (`daysLeft <= 90`) para pintar el badge en naranja/rojo. Ese cálculo hoy solo es visible si el usuario entra puntualmente a **Career → Finales** — el Dashboard, que es la primera pantalla que ve al entrar a la app, no lo menciona.

Es exactamente el caso que describe la categoría "Nueva Funcionalidad" de la skill `improve`: un patrón (la tarjeta de alertas) que la app ya resuelve para un tipo de riesgo (faltas) y no para otro equivalente que la propia app ya tiene calculado (vencimiento de regularidad).

## Objetivo

El stat-card "Alertas" del Dashboard cuenta, en un solo número, tanto las materias en riesgo por faltas como las materias regulares a ≤90 días de vencer su regularidad, y el tooltip lista ambas categorías por separado — verificado manualmente con al menos una materia de cada tipo cargada (ver Etapa 1, QA manual).

## Fuera de alcance

- Cambiar el umbral de 90 días o la lógica de `getDaysToExpiration` — se reutiliza tal cual está en `career/lib/utils.ts`, sin modificarlo.
- Agregar notificaciones push/email por vencimiento próximo — esto es solo una alerta visible dentro del Dashboard, no un sistema de notificaciones.
- Tocar `FinalsTab.tsx` — sigue siendo la vista de detalle; esta mejora solo agrega un resumen en el Dashboard, no reemplaza esa pantalla.
- Extender la alerta a electivas (`career.electives`) — `FinalsTab` mismo solo mira `career.subjects` (línea 8: `career?.subjects || []`), así que esta mejora mantiene el mismo alcance para no introducir un comportamiento que ni la pantalla de referencia tiene. (Nota: el hecho de que una electiva pueda quedar en `status: 'regular'` sin aparecer nunca en `FinalsTab` es una inconsistencia aparte, no cubierta por este plan — ver el aviso a `audit` al cierre de esta corrida de `improve`.)

## Riesgos y consideraciones

- No toca autenticación, permisos, schema de Supabase ni contratos de datos compartidos — no aplica el protocolo de confirmación previa de AGENTS.md.
- `getDaysToExpiration` ya maneja `null`/fechas inválidas devolviendo `null` (`career/lib/utils.ts:15`) — el filtro de la Etapa 1 debe excluir explícitamente esos casos (`d !== null`), no tratarlos como "vencido".

## Rama sugerida

`feature/mej-009-alerta-regularidad-dashboard`

## Plan por etapas

### Etapa 1 — Sumar el riesgo de vencimiento de regularidad a la tarjeta de Alertas

- **Objetivo:** Extender el cálculo y el tooltip existentes de `Dashboard.tsx` para incluir materias regulares a punto de vencer, sin tocar la lógica de faltas ya existente.
- **Pasos:**
  1. En `src/pages/Dashboard.tsx`, agregar el import de `getDaysToExpiration`:
     ```ts
     import { getDaysToExpiration } from '../features/career/lib/utils';
     ```
  2. Justo debajo de `const warnSubs: Subject[] = ...` (línea 18-20), agregar el cálculo de materias por vencer:
     ```ts
     const expiringSubs: Subject[] = subjects.filter((s) => {
       if (s.status !== 'regular') return false;
       const d = getDaysToExpiration(s.expDate);
       return d !== null && d <= 90;
     });
     ```
  3. Cambiar la línea `const warn = warnSubs.length;` (línea 21) por:
     ```ts
     const warn = warnSubs.length + expiringSubs.length;
     ```
  4. En el JSX del tooltip de alertas (`Dashboard.tsx:348-372`), reemplazar el bloque `{warn ? (...) : (...)}` para que, cuando `warn > 0`, muestre dos sub-listas condicionales en vez de una sola "Materias en riesgo:" — cada una solo se renderiza si su array correspondiente tiene elementos:
     ```tsx
     {warn ? (
       <>
         {warnSubs.length > 0 && (
           <>
             <div
               style={{ fontWeight: 800, fontSize: '11px', marginBottom: '4px', color: '#f87171' }}
             >
               Por faltas:
             </div>
             {warnSubs.map((s) => (
               <div key={s.id} style={{ fontSize: '10px', marginTop: '2px' }}>
                 • <strong>{s.name}</strong> ({s.absences}/{s.maxAbsences} faltas)
               </div>
             ))}
           </>
         )}
         {expiringSubs.length > 0 && (
           <>
             <div
               style={{
                 fontWeight: 800,
                 fontSize: '11px',
                 marginTop: warnSubs.length > 0 ? '8px' : '0',
                 marginBottom: '4px',
                 color: '#fbbf24',
               }}
             >
               Por vencimiento de regularidad:
             </div>
             {expiringSubs.map((s) => {
               const d = getDaysToExpiration(s.expDate);
               return (
                 <div key={s.id} style={{ fontSize: '10px', marginTop: '2px' }}>
                   • <strong>{s.name}</strong> ({d !== null && d < 0 ? 'vencida' : `${d}d restantes`})
                 </div>
               );
             })}
           </>
         )}
       </>
     ) : (
       <div style={{ fontWeight: 700, fontSize: '10px', color: '#4ade80' }}>
         Sin alertas de ausencias ni vencimientos
       </div>
     )}
     ```
     El texto del estado "sin alertas" (línea 368-370 original: "Sin alertas de ausencias") se actualiza a "Sin alertas de ausencias ni vencimientos" para reflejar que ahora cubre ambos tipos.
- **Archivos:** `src/pages/Dashboard.tsx` (modificar)
- **Verificación (Definition of Done):**
  - `npx tsc -b` sin errores nuevos.
  - `npm run lint` sin errores nuevos.
  - QA manual:
    1. En `Career` → seleccionar una materia y ponerle `status: 'regular'` con `regDate` reciente (para que `expDate` quede a menos de 90 días, o editar `expDate` directamente a una fecha cercana) — abrir `/` (Dashboard) y confirmar que el número de "Alertas" subió y que el tooltip muestra la sección "Por vencimiento de regularidad:" con esa materia y los días restantes correctos.
    2. Confirmar que una materia con falta de asistencia alta (ya cubierta por el comportamiento existente) sigue apareciendo bajo "Por faltas:" sin cambios de comportamiento.
    3. Sin ninguna materia en riesgo de ningún tipo, el tooltip debe mostrar "Sin alertas de ausencias ni vencimientos" y el número de la tarjeta debe ser `0`.

## Cierre

Al completar la etapa: generar el reporte en `src/docs/reports/<YYYY-MM-DD>-mej-009-alerta-regularidad-dashboard.md` según AGENTS.md § "Reportes de Implementación", y actualizar el **Estado** de este ítem a `Completada` tanto acá como en `src/docs/improvements/mejoras.md`.
