# Reporte de Implementación: Sync Bidireccional de Materias (Tracking <-> Plan)

- **Objetivo**: Garantizar que el cambio de estado de una materia en su tracking activo impacte el progreso global (y viceversa) para que las materias regulares o aprobadas desaparezcan de "Mis Materias" y Horarios, y que borrar una materia del tracking vuelva su estado a "Pendiente" en el plan.
- **Archivos modificados**:
  - `src/features/subjects/lib/api.ts` (`saveActiveSubject` y `deleteActiveSubject`).
  - `src/features/career/lib/api.ts` (ajuste en la inyección de la llamada a `deleteActiveSubject`).
- **Lógica implementada**:
  - Si en `SubjectModal` (tracking) se guarda la materia con estado != `cursando` (e.g. Regular, Aprobada, Libre), se actualiza el progreso académico de la carrera a ese nuevo estado y la materia se **elimina** de `active_subjects` (lo que la saca del Dashboard, Horario y "Mis Materias").
  - Si se usa el botón "Eliminar" en "Mis Materias", se la saca de `active_subjects` y se **restaura** su estado en el Plan a `pendiente` (Disponible/Bloqueada).
  - Se previnieron loops infinitos agregando un flag `resetProgress = true` a la función `deleteActiveSubject`.
- **Estado de TypeScript**: OK (0 errores)
- **Estado de ESLint**: OK 
- **Estado de Vitest**: OK (cobertura base mantenida)
