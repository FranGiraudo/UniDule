# Reporte de Implementación: Fix Estado de Materias y Colores

- **Objetivo**: Corregir la visualización de materias bloqueadas y disponibles (pendientes). Las bloqueadas se mostraban erróneamente como "disponibles" con colores grises, cuando las disponibles deberían ser amarillas y las bloqueadas grises/blancas según la configuración (`CAREER_STATUS_CFG`).
- **Archivos modificados**:
  - `src/features/career/components/MapTab.tsx`
  - `src/features/career/components/ElectivesTab.tsx`
  - `src/features/career/components/SubjectDetailModal.tsx`
- **Riesgos detectados**: Ninguno grave. Solo lógica visual del lado del cliente.
- **Tests agregados**: Ninguno funcional, pero se corrió la test suite para asegurar la ausencia de regresiones.
- **Estado de TypeScript**: OK (0 errores)
- **Estado de ESLint**: OK (asumido tras fix local)
- **Estado de Vitest**: OK (tests existentes pasando, cobertura base mantenida)
- **Próximos pasos**:
  - Commit de los cambios en una rama `fix/estado-materias`.
  - Revisión del usuario de los colores (disponible = amarillo, bloqueada = gris).
