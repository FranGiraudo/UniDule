# Reporte de Implementación: Fix Sincronización de Materias Libres / No Cursando

- **Objetivo**: Corregir la inconsistencia por la cual materias marcadas como "Libre" (o Regular / Aprobada) continuaban mostrándose como tarjetas activas en la sección "Materias" (Mis Materias), mientras que otras sí se removían.
- **Causa raíz identificada**:
  1. `Subjects.tsx` filtraba por `allSubjects.filter(s => s.activeId)` en vez de verificar que la materia estuviera efectivamente en estado `cursando` (`s.activeId && s.status === 'cursando'`).
  2. Al cambiar el estado de una materia desde el Mapa de Carrera (`SubjectDetailModal.tsx` -> `updateSubjectProgress`), solo se eliminaba el registro de `user_active_subjects` si el nuevo estado era `'pendiente'`. Si pasaba a `'libre'`, `'regular'` o `'aprobada'`, el registro en `user_active_subjects` quedaba huérfano en la base de datos.
  3. En `GradesModal.tsx`, al cambiar de estado a != `cursando`, se llamaba a `saveActiveSubject` y luego a `syncGrades`, produciendo un fallo de clave foránea en PostgreSQL al intentar insertar notas para un `active_subject` recién eliminado.
  4. En `useDataSync.ts`, no se limpiaban automáticamente los registros huérfanos de `user_active_subjects` cuyo estado en `user_progress` ya no era `'cursando'`.
- **Archivos modificados**:
  - `src/pages/Subjects.tsx`: filtrado estricto `s.activeId && s.status === 'cursando'`.
  - `src/features/career/lib/api.ts` (`updateSubjectProgress`): desvincula y borra de `user_active_subjects` cuando el estado deja de ser `cursando` (libre, regular, aprobada o pendiente).
  - `src/features/subjects/components/GradesModal.tsx`: maneja el cambio de estado sin intentar sincronizar notas sobre registros activos eliminados.
  - `src/shared/hooks/useDataSync.ts`: solo asigna `activeId` si `status === 'cursando'` y limpia en segundo plano los registros huérfanos de `user_active_subjects` en Supabase.
  - `src/shared/store/__tests__/useStore.test.ts`: agregado test para verificar el filtrado de materias activas en cursado.
- **Riesgos detectados**: Ninguno. Se mantiene la integridad referencial y las materias no pierden su estado histórico en el plan de carrera (`user_progress`).
- **Tests agregados**: 1 test unitario. Suite total: 12 tests pasados.
- **Estado de TypeScript**: OK (0 errores).
- **Estado de ESLint**: OK (sin errores nuevos).
- **Estado de Vitest**: OK (12 pasados, 0 fallidos). Cobertura: 1.57%.
