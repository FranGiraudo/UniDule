# Reporte de Implementación: Modales y Sincronización de Materias

- **Objetivo**: Corregir la ausencia de estilos en el modal global de confirmación de eliminación de materias y arreglar la desincronización donde una materia marcada como "Pendiente" en el plan seguía apareciendo en "Mis Materias".
- **Archivos modificados**:
  - `src/shared/components/layout/GlobalDialogs.tsx` (agregada la clase `btn` base a `btn-primary` y `btn-secondary`).
  - `src/features/career/lib/api.ts` (añadida lógica para llamar a `deleteActiveSubject` cuando se actualiza el progreso a `pendiente`).
- **Riesgos detectados**: Importación circular entre `career/lib/api.ts` y `subjects/lib/api.ts`.
  - *Mitigación*: Se usó import dinámico (`await import()`) para cargar `deleteActiveSubject` bajo demanda sin romper el grafo de dependencias estático.
- **Tests agregados**: Ninguno funcional.
- **Estado de TypeScript**: OK (0 errores)
- **Estado de ESLint**: OK 
- **Estado de Vitest**: OK (cobertura base mantenida)
