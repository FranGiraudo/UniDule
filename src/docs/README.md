# Documentación

Carpeta central de documentación de la aplicación. No contiene código, solo Markdown.

## Estructura

- `audits/` — auditorías de código y calidad (ver skill `audit`)
- `architecture/` — reportes de arquitectura: estructura de features, flujo de datos, diagramas
- `implementations/` — documentación de features/implementaciones relevantes (decisiones de diseño, trade-offs)
- `security/` — reportes de seguridad: RLS de Supabase, auth/sesión, hallazgos y remediación
- `testing/` — estrategias y planes de testing, evolución de cobertura
- `reports/` — reportes de progreso por tarea (archivos tocados, riesgos, estado de tsc/lint/tests)
- `decisions/` — decision records (ADR)
- `technical-debt/` — deuda técnica identificada, pendiente o resuelta (formato `TD-RFxxx` / `TD-RNFxxx`, ver skill `audit`)

## Convención de archivos

- Nombre de archivo en `kebab-case` con fecha cuando aplique: `YYYY-MM-DD-titulo.md`
- Reportes formales pueden usar MAYÚSCULAS (`AUDIT_REPORT.md`, `ARCHITECTURE_REPORT.md`); documentos de trabajo en minúsculas
- Cada documento debe indicar fecha de creación, última actualización y estado (si corresponde: abierto, resuelto, en progreso)
- No crear archivos `.md` sueltos en la raíz del proyecto ni en `src/` — toda la documentación vive dentro de esta carpeta, en la subcategoría que corresponda
- Antes de crear un documento nuevo, verificar si ya existe uno relacionado para actualizar en lugar de duplicar
