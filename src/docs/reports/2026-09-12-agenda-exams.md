# Reporte de Implementación: Inyección de Exámenes en Agenda y Dashboard

- **Objetivo**: Renderizar automáticamente los parciales y finales (tareas) en el Calendario/Agenda y en la vista de Dashboard cuando tengan una fecha y hora (startTime y endTime) definidas, sin necesidad de duplicarlos como eventos.
- **Archivos modificados**:
  - `src/pages/Schedule.tsx` (modificado `getBlocksForDate` para inyectar Tasks).
  - `src/pages/Dashboard.tsx` (modificado `getBlocksForDay` para inyectar Tasks y arreglar la renderización de eventos de un solo día).
- **Estado**: Listo.
