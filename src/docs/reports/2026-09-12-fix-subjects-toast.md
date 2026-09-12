# Reporte de Implementación: Feedback de Eliminación y Ajuste de Sincronización

- **Objetivo**: Añadir feedback visual (toast) al desmarcar una materia (eliminarla de cursando) y corregir la nomenclatura cruzada de Parciales que generaba desincronizaciones en el título de la tarea.
- **Archivos modificados**:
  - `src/pages/Subjects.tsx` (se añadió `showToast`).
  - `src/features/subjects/components/GradesModal.tsx` (se quitó el sufijo " - Materia" que forzaba a cambiar el título de las tareas editadas desde Evaluaciones, causando un bucle de desincronización).
- **Riesgos detectados**: Ninguno.
- **Estado de TypeScript**: OK.
- **Estado de ESLint**: OK.
- **Estado de Vitest**: OK.
