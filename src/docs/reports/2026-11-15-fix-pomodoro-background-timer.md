# Reporte de Implementación: Fix Temporizador Pomodoro en Segundo Plano

- **Objetivo**: Evitar que el temporizador Pomodoro se congele o se retrase cuando el usuario cambia de pestaña en el navegador o minimiza la ventana (throttling de timers nativo), y unificar los selectores duplicados de tarea y parcial en la vista de Estudio.
- **Archivos modificados**:
  - `src/shared/store/useStore.ts` (agregado campo `endTime` al estado de Pomodoro, persistencia en `localStorage` y reconciliación inicial de tiempo restante).
  - `src/pages/Study.tsx` (cálculo de `endTime` absoluto al iniciar y pausar el timer, y unificación de selectores redundantes de tareas y parciales en un único dropdown categorizado por `<optgroup>`).
  - `src/pages/Finals.tsx` (inicialización de `endTime: null` al iniciar estudio de materias regulares).
  - `src/shared/components/layout/MainLayout.tsx` (reemplazo de decremento relativo por cálculo basado en timestamp de pared `Date.now()`, Web Worker para ticks desacoplados del throttling del tab, listeners de `visibilitychange` y `focus` para reconciliación instantánea, y actualización del título de pestaña con el tiempo restante).
  - `.progress/tasks.json` (registrada tarea T-23 en el tracker de progreso).
- **Archivos creados**:
  - `src/shared/store/__tests__/useStore.test.ts` (tests unitarios para el estado de Pomodoro, persistencia y reconciliación de timestamps).
- **Riesgos detectados**: Ninguno. La solución incluye fallbacks progresivos (`Web Worker` -> `window.setInterval`, con reconciliación por `Date.now()`).
- **Tests agregados**: 4 tests unitarios en `src/shared/store/__tests__/useStore.test.ts`. Total suite: 11 tests pasados.
- **Estado de TypeScript (`npx tsc -b`)**: OK (0 errores).
- **Estado de ESLint (`npm run lint`)**: OK (sin errores nuevos introducidos por este cambio).
- **Estado de Vitest (`npm run test:run`)**: OK (11 pasados, 0 fallidos). Cobertura: 1.55% (+0.81%).
- **Próximos pasos**:
  - Resolver advertencias previas de ESLint (`any`) documentadas en deuda técnica.
  - Opcional: Notificación push de audio persistente con Service Worker / Notification Action si el navegador soporta Background Sync.
