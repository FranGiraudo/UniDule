# Reporte de Implementación: Exportador iCalendar (.ics)

- **Objetivo**: Añadir la funcionalidad de generar un archivo `.ics` para que el usuario pueda sincronizar su horario, materias y exámenes con calendarios externos (Google Calendar, Apple Calendar), logrando así notificaciones push nativas del OS.
- **Archivos modificados**:
  - `src/shared/lib/ics.ts` (creado: lógica de parseo a formato VCALENDAR con IDs únicos para evitar duplicados).
  - `src/pages/Settings.tsx` (agregada tarjeta "Sincronizar Calendario" en Configuración).
- **Estado**: Listo.
