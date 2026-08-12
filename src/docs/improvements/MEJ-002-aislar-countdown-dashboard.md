# MEJ-002 — Aislar el countdown de "Próxima Clase" del Dashboard

**Estado:** Propuesta
**Categoría:** Performance
**Impacto estimado:** Medio
**Esfuerzo estimado:** Bajo
**Fecha de creación:** 2026-08-11

## Contexto y motivación

`src/pages/Dashboard.tsx:24-27` inicializa `nowSec` como estado del componente `Dashboard` (el componente de página completo), y `src/pages/Dashboard.tsx:29-35` lo actualiza cada segundo con `setInterval`:

```tsx
const [nowSec, setNowSec] = useState(() => { ... });
useEffect(() => {
  const timer = setInterval(() => { setNowSec(...) }, 1000);
  return () => clearInterval(timer);
}, []);
```

`nowSec` solo se usa dentro de `getNextClass()` (líneas 39-80) y en el cálculo del countdown del panel "Próxima Clase" (líneas 272-289: horas/min/seg restantes). Sin embargo, como el `useState` vive en `Dashboard` y no en un componente hijo, cada tick de 1 segundo re-renderiza el árbol completo de la página: el grid de 4 stat-cards (líneas 297-374), la lista "Clases de Hoy" (líneas 395-464) y la lista "Próximas Entregas" (líneas 473-498) — ninguno de los cuales depende de `nowSec`. `renderTask` (línea 85) y el `.find()`/`.filter()`/`.sort()` de `todayClasses` (líneas 152-157) se re-ejecutan en cada uno de esos renders también, porque no están memoizados.

## Objetivo

Que el único nodo del árbol de React que se re-renderice cada segundo sea el propio countdown — verificado con el React DevTools Profiler: grabar una interacción de ~3 segundos en `/` (Dashboard) y confirmar que `Dashboard` (el componente de página) no aparece en la lista de renders del profiler durante esos 3 segundos, solo el nuevo componente del countdown.

## Fuera de alcance

- Memoizar `renderTask`, `todayClasses` u otros cálculos del Dashboard con `useMemo`/`useCallback` — no es necesario si ya no se re-ejecutan cada segundo; si en el futuro se detecta que siguen siendo costosos por otro motivo, es una mejora aparte.
- Tocar la lógica de negocio del countdown (`getNextClass`) — se mueve de archivo tal cual, sin cambiar su comportamiento.
- Extraer también el grid de stats o las listas a componentes propios — fuera del problema puntual de esta mejora.

## Riesgos y consideraciones

- No toca autenticación, permisos, Supabase ni contratos de datos compartidos entre features — no aplica el protocolo de confirmación previa de AGENTS.md.
- El repo no tiene hoy ningún feature folder para `Dashboard` (a diferencia de `career`, `subjects`, `tasks`, que sí tienen `src/features/<name>/components`). Esta mejora crea `src/features/dashboard/components/`, siguiendo el mismo patrón que las features existentes — es la decisión de estructura que se resuelve en este plan para que no quede ambigua.

## Rama sugerida

`feature/mej-002-aislar-countdown-dashboard`

## Plan por etapas

### Etapa 1 — Extraer `NextClassCountdown` como componente propio

- **Objetivo:** Mover todo el estado y la lógica que dependen de `nowSec` a un componente nuevo y autocontenido, que lee `career` directamente del store en vez de recibirlo por props.
- **Pasos:**
  1. Crear `src/features/dashboard/components/NextClassCountdown.tsx`. El componente:
     - No recibe props.
     - Lee `career` desde `useStore` (`const { career } = useStore();`) y calcula `subjects = career?.subjects || [];` igual que hace hoy `Dashboard.tsx:8-9`.
     - Contiene el `useState` de `nowSec` (`Dashboard.tsx:24-27`) y su `useEffect` con `setInterval` (`Dashboard.tsx:29-35`), moviendo ambos tal cual.
     - Contiene la constante `DAYS` (`Dashboard.tsx:37`) y la función `getNextClass` (`Dashboard.tsx:39-80`), movidas tal cual (usan `t2m` de `shared/lib/utils`, que el nuevo archivo debe importar).
     - Contiene la función `pad` (`Dashboard.tsx:149`), movida tal cual.
     - Renderiza exactamente el JSX que hoy está en `Dashboard.tsx:170-294` (el `<div id="next-class-banner">` completo, con su contenido condicional según `nc`).
  2. En `src/pages/Dashboard.tsx`:
     - Eliminar el `useState` de `nowSec`, el `useEffect` del timer, la constante `DAYS`, la función `getNextClass`, la variable `const nc = getNextClass();` y la función `pad` (ya no se usan en este archivo).
     - Eliminar el import de `useEffect` y `useState` si `Dashboard` deja de usarlos en algún otro lado (revisar: `useState` ya no se usa tras este cambio; `useEffect` tampoco).
     - Importar `NextClassCountdown` desde `../features/dashboard/components/NextClassCountdown` y reemplazar el bloque `<div id="next-class-banner">...</div>` (líneas 170-294) por `<NextClassCountdown />`.
  3. Confirmar que `Clock` y `CheckCircle2` de `lucide-react` (importados en `Dashboard.tsx:2`) se siguen usando en el resto del archivo (sí: `CheckCircle2` en los empty-states de las líneas 440 y 493, `Clock` en el ícono del stat-card de línea 330 y el empty-state de línea 458) — no hace falta tocar ese import. El componente nuevo importa su propio `Clock` y `CheckCircle2` de `lucide-react` para el JSX que se le movió.
- **Archivos:**
  - `src/features/dashboard/components/NextClassCountdown.tsx` (crear)
  - `src/pages/Dashboard.tsx` (modificar)
- **Verificación (Definition of Done):**
  - `npx tsc -b` sin errores nuevos.
  - `npm run lint` sin errores nuevos.
  - `npm run test:run` en verde (sin tests nuevos obligatorios para este cambio puntual de performance, pero no debe romper `src/shared/lib/__tests__/utils.test.ts`).
  - QA manual: `npm run dev`, abrir `/`, confirmar que el panel "Próxima Clase" sigue mostrando el countdown correcto (en curso / próxima hoy / próximo día) y que los segundos siguen bajando cada segundo, igual que antes del cambio.
  - Verificación de performance con React DevTools Profiler: grabar ~3 segundos de interacción en `/` y confirmar que `Dashboard` no re-renderiza en ese lapso, solo `NextClassCountdown`.

## Cierre

Al completar la etapa: generar el reporte en `src/docs/reports/<YYYY-MM-DD>-mej-002-aislar-countdown-dashboard.md` según AGENTS.md § "Reportes de Implementación", y actualizar el **Estado** de este ítem a `Completada` tanto acá como en `src/docs/improvements/mejoras.md`.
