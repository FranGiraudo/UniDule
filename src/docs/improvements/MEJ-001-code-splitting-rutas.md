# MEJ-001 — Code-splitting por ruta con `React.lazy`

**Estado:** Propuesta
**Categoría:** Arquitectura / Performance
**Impacto estimado:** Alto
**Esfuerzo estimado:** Bajo
**Fecha de creación:** 2026-08-11

## Contexto y motivación

`src/App.tsx:9-16` importa estáticamente las 7 páginas de la app (`Auth`, `Dashboard`, `Career`, `Subjects`, `Tasks`, `Schedule`, `Settings`). `Career.tsx` a su vez importa sus 6 tabs (`GridTab`, `FinalsTab`, `StatsTab`, `SeminarsTab`, `ElectivesTab`, `MapTab`) de forma estática, y `MapTab.tsx` (517 líneas) es el componente más grande del repo después de `Schedule.tsx` y `Settings.tsx`.

Corriendo `npm run build` en este repo (2026-08-11) el resultado es:

```
dist/assets/index-B3g5ppIy.js   588.81 kB │ gzip: 162.76 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
```

Es el propio build de Vite el que señala el problema y sugiere la solución. Un usuario que entra solo a mirar el Dashboard descarga igual el código de Schedule (577 líneas + lógica de grilla), Settings (548 líneas) y las 6 tabs de Career, antes de poder interactuar con la página que realmente pidió.

## Objetivo

Que `npm run build` deje de emitir el warning `Some chunks are larger than 500 kB after minification`, y que el chunk inicial (el que carga `index.html` antes de cualquier navegación) sea sensiblemente menor a los 588.81 kB actuales — verificado comparando el tamaño de `dist/assets/index-*.js` antes/después del cambio en el reporte de cierre.

## Fuera de alcance

- Code-splitting dentro de los tabs de `Career` (`GridTab`, `MapTab`, etc.) — queda para una mejora futura si el chunk de `Career` sigue siendo grande después de esta etapa.
- Cambiar el bundler o su configuración de `chunkSizeWarningLimit`.
- Prefetch manual de rutas (ej. precargar `Schedule` al hacer hover en el link del sidebar) — optimización aparte, no necesaria para resolver el warning actual.

## Riesgos y consideraciones

- `React.lazy` requiere un `<Suspense>` con `fallback`; si el fallback no cubre el layout completo puede verse un parpadeo al navegar. Se resuelve reutilizando la clase `.loading-screen` ya definida en `src/style.css:2164` y usada en `AuthProvider.tsx:54`, así el fallback es visualmente idéntico al que ya ve el usuario al cargar sesión.
- `ProtectedRoute` (`App.tsx:18-22`) no se toca — sigue evaluando `session` de forma síncrona desde el store, sin relación con la carga perezosa de las páginas.
- No toca autenticación, permisos, schema de Supabase ni contratos de datos compartidos — no aplica el protocolo de confirmación previa de AGENTS.md.

## Rama sugerida

`feature/mej-001-code-splitting-rutas`

## Plan por etapas

### Etapa 1 — Lazy-load de las 7 páginas en `App.tsx`

- **Objetivo:** Que cada página se cargue en su propio chunk, solo cuando el usuario navega a su ruta.
- **Pasos:**
  1. En `src/App.tsx`, reemplazar los imports estáticos de las 7 páginas (líneas 10-16: `Auth`, `Dashboard`, `Career`, `Subjects`, `Tasks`, `Schedule`, `Settings`) por `React.lazy`:
     ```ts
     import { lazy, Suspense } from 'react';

     const Auth = lazy(() => import('./pages/Auth').then((m) => ({ default: m.Auth })));
     const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
     const Career = lazy(() => import('./pages/Career').then((m) => ({ default: m.Career })));
     const Subjects = lazy(() => import('./pages/Subjects').then((m) => ({ default: m.Subjects })));
     const Tasks = lazy(() => import('./pages/Tasks').then((m) => ({ default: m.Tasks })));
     const Schedule = lazy(() => import('./pages/Schedule').then((m) => ({ default: m.Schedule })));
     const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })));
     ```
     Nota: todas las páginas se exportan como named export (`export function Dashboard()`, etc.), no como `default` — por eso el `.then((m) => ({ default: m.NombrePagina }))` es obligatorio en cada una, no se puede pasar `() => import('./pages/Dashboard')` directo.
  2. Envolver el `<Routes>` existente (líneas 29-47) en un único `<Suspense fallback={<div className="loading-screen">Cargando...</div>}>`, no un `<Suspense>` por ruta — así solo hay un punto de fallback y no se duplica markup:
     ```tsx
     <Suspense fallback={<div className="loading-screen">Cargando...</div>}>
       <Routes>
         {/* ...rutas existentes sin cambios... */}
       </Routes>
     </Suspense>
     ```
  3. Dejar `ProtectedRoute` (líneas 18-22) sin cambios — sigue siendo un componente síncrono normal, no envuelve nada de `React.lazy`.
- **Archivos:** `src/App.tsx` (modificar)
- **Verificación (Definition of Done):**
  - `npx tsc -b` sin errores nuevos.
  - `npm run lint` sin errores nuevos.
  - `npm run build`: confirmar que ya no aparece el warning `Some chunks are larger than 500 kB after minification`, y que se generan múltiples archivos `dist/assets/*.js` (uno por página) en vez de un único `index-*.js` de 588 kB.
  - QA manual: `npm run dev`, abrir la app, navegar por las 7 rutas (`/`, `/career`, `/subjects`, `/tasks`, `/schedule`, `/settings`, y `/login` deslogueado) — cada una debe renderizar igual que antes, sin parpadeos permanentes ni errores en la consola del navegador. Verificar en la pestaña "Network" de devtools que cada navegación dispara la descarga de un chunk JS nuevo la primera vez que se visita esa ruta.

## Cierre

Al completar la etapa: generar el reporte en `src/docs/reports/<YYYY-MM-DD>-mej-001-code-splitting-rutas.md` según AGENTS.md § "Reportes de Implementación", incluyendo el tamaño de `dist/assets/*.js` antes/después, y actualizar el **Estado** de este ítem a `Completada` tanto acá como en `src/docs/improvements/mejoras.md`.
