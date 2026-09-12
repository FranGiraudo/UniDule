# Reporte de Implementación: Sincronización de Tareas/Parciales y Horarios

- **Objetivo**: Garantizar que los exámenes creados desde Tareas aparezcan inmediatamente en Evaluaciones de la materia, unificar los nombres en la etiqueta del Task para que no diga "Parcial 1" forzosamente, y añadir la capacidad de ingresar hora de inicio/fin.
- **Archivos modificados**:
  - `src/features/subjects/components/GradesModal.tsx` (modificado para usar `Parcial` o `Final` como tipo base sin subíndices de número de parcial para no romper los colores de las etiquetas de Tareas).
  - `src/features/tasks/components/TaskModal.tsx` (agregados campos `startTime` y `endTime`, y lógica para que si se selecciona 'Parcial' o 'Final' se cree inmediatamente un Grade en la materia asociada).
  - `src/shared/types/index.ts`, `src/features/tasks/lib/api.ts` y `src/shared/hooks/useDataSync.ts` (modelo de datos para soportar inicio/fin).
- **Riesgos detectados**:
  - Para persistir las horas en el backend hace falta correr una migración SQL en Supabase que el usuario deberá aplicar manualmente.
- **Estado de TypeScript**: OK (0 errores)
- **Estado de ESLint**: OK 
- **Estado de Vitest**: OK
