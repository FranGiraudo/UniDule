# Mejoras Propuestas — UniDule

**Última actualización:** 2026-08-11

---

## Propuestas

### MEJ-001 — Code-splitting por ruta con `React.lazy`

- **Categoría:** Arquitectura / Performance
- **Impacto:** Alto
- **Esfuerzo:** Bajo
- **Estado:** Propuesta
- **Resumen:** `src/App.tsx:9-16` importa las 7 páginas de forma estática, así que `npm run build` empaqueta todo en un único chunk de **588.81 kB** (162.76 kB gzip) — Vite emite el warning `Some chunks are larger than 500 kB after minification` y sugiere explícitamente `dynamic import()`. Un usuario que solo entra al Dashboard descarga también el código de Schedule, Settings, Career (con sus 6 tabs) y Subjects.
- **Plan:** `src/docs/improvements/MEJ-001-code-splitting-rutas.md`

### MEJ-002 — Aislar el countdown de "Próxima Clase" del Dashboard

- **Categoría:** Performance
- **Impacto:** Medio
- **Esfuerzo:** Bajo
- **Estado:** Propuesta
- **Resumen:** `src/pages/Dashboard.tsx:24-35` guarda `nowSec` en el estado del componente `Dashboard` y lo actualiza cada segundo con `setInterval`. Como `nowSec` vive en el componente de página completo, cada tick re-renderiza también el grid de stats, la lista de "Clases de Hoy" y "Próximas Entregas" — nada de eso depende del segundo actual.
- **Plan:** `src/docs/improvements/MEJ-002-aislar-countdown-dashboard.md`

### MEJ-003 — Tipos generados desde el schema de Supabase en `useDataSync`

- **Categoría:** Arquitectura
- **Impacto:** Alto
- **Esfuerzo:** Medio
- **Estado:** Propuesta
- **Resumen:** `src/shared/hooks/useDataSync.ts` mapea las 8 queries a los tipos de dominio con parámetros `any` (líneas 51, 65, 76-90, 121, 132-134) en vez de tipar contra el schema real (`supabase/schema.sql`). Generar los tipos con `supabase gen types typescript` elimina el `any` en la fuente, no solo lo silencia.
- **Relacionado:** TD-RNF004
- **Plan:** `src/docs/improvements/MEJ-003-tipos-generados-supabase.md`

### MEJ-004 — Pipeline de CI en GitHub Actions

- **Categoría:** Developer Experience
- **Impacto:** Medio
- **Esfuerzo:** Bajo
- **Estado:** Propuesta
- **Resumen:** No existe `.github/workflows/` en el repo — `lint`, `tsc -b` y `test:run` (ya configurados en `package.json`) solo corren si alguien se acuerda de hacerlo a mano antes de cada commit (ver AGENTS.md § "Pre-commit": "No hay Husky/lint-staged configurado todavía"). Un PR puede mergearse a `develop` con TypeScript roto o tests en rojo sin que nada lo señale.
- **Plan:** `src/docs/improvements/MEJ-004-ci-pipeline-github-actions.md`

### MEJ-005 — Tests para la lógica de correlativas y la capa de API de `subjects`

- **Categoría:** Testing
- **Impacto:** Alto
- **Esfuerzo:** Medio
- **Estado:** Propuesta
- **Resumen:** Hoy solo existe un archivo de test en todo el repo (`src/shared/lib/__tests__/utils.test.ts`). `getComputedStatus` (`src/features/career/lib/utils.ts:3-11`) es la función que decide si una materia está disponible o bloqueada — la misma clase de bug que ya causó TD-RF001 (`MapTab` no la usa) — y `src/features/subjects/lib/api.ts` es la única capa que escribe en 5 tablas de Supabase (`user_active_subjects`, `user_grades`, `user_notes`), consumida por `Settings.tsx`, `GradesModal`, `NoteModal` y `SubjectModal`. Ninguna de las dos tiene un solo test.
- **Plan:** `src/docs/improvements/MEJ-005-tests-correlativas-subjects-api.md`

### MEJ-006 — Content-Security-Policy en el build de producción

- **Categoría:** Seguridad proactiva
- **Impacto:** Medio
- **Esfuerzo:** Bajo
- **Estado:** Propuesta
- **Resumen:** `index.html` no tiene ninguna cabecera ni meta-tag de CSP. El repo ya tuvo un XSS real (TD-RNF001, resuelto) y tiene uno abierto (TD-RNF002, `dangerouslySetInnerHTML` en notas sin sanitizar) — una CSP no arregla esos bugs puntuales, pero acota el daño de cualquier inyección de script que se cuele por ahí o por un vector todavía no encontrado.
- **Plan:** `src/docs/improvements/MEJ-006-content-security-policy.md`

### MEJ-007 — Reemplazar `confirm()`/`prompt()` nativos por modales propios en Settings

- **Categoría:** Producto / UX
- **Impacto:** Medio
- **Esfuerzo:** Medio
- **Estado:** Propuesta
- **Resumen:** `src/pages/Settings.tsx:136` (`confirm(...)` antes de importar un backup) y `src/pages/Settings.tsx:237` (`prompt(...)` para pegar un código de horario) rompen la identidad visual de una app que ya tiene su propio sistema de modales (`NoteModal`, `SubjectModal`, `GradesModal`, `PlanSimulationModal`) y de toasts (`Settings.tsx:103-106`). El diálogo nativo del navegador no se puede estilizar, no respeta el tema activo, y en el caso del `prompt()` no valida nada hasta después de cerrarse.
- **Plan:** `src/docs/improvements/MEJ-007-modales-propios-dialogos-nativos.md`

### MEJ-008 — Promedio ponderado de evaluaciones en `GradesModal`

- **Categoría:** Nueva Funcionalidad
- **Impacto:** Alto
- **Esfuerzo:** Medio
- **Estado:** Propuesta
- **Resumen:** `Grade.weight` (`shared/types/index.ts:12`) y la columna `user_grades.weight` (`supabase/schema.sql:110`) ya existen y se guardan/leen correctamente (`features/subjects/lib/api.ts:127`, `shared/hooks/useDataSync.ts:89`), pero `GradesModal.tsx` — el único lugar donde se cargan evaluaciones — nunca tuvo un campo para setear el peso, y en ningún punto de la app se calcula un promedio a partir de las evaluaciones de una materia (ponderado o no). El dato está listo hace tiempo; la funcionalidad que lo iba a usar nunca se construyó.
- **Plan:** `src/docs/improvements/MEJ-008-promedio-ponderado-evaluaciones.md`

### MEJ-009 — Alerta de vencimiento de regularidad en el Dashboard

- **Categoría:** Nueva Funcionalidad
- **Impacto:** Medio
- **Esfuerzo:** Bajo
- **Estado:** Completada
- **Resumen:** El stat-card "Alertas" del Dashboard (`src/pages/Dashboard.tsx:337-373`) solo cuenta riesgo de faltas (`warnSubs`). `FinalsTab.tsx:178-201` ya calcula, para cada materia regular, cuántos días faltan para que venza la regularidad (`getDaysToExpiration`) y ya define el umbral de alerta (≤90 días) — pero esa alerta solo es visible si el usuario entra a Career → Finales. Es el mismo patrón de "tarjeta de alertas" que el Dashboard ya resuelve para una causa de riesgo y no para otra equivalente que la propia app ya calcula.
- **Plan:** `src/docs/improvements/MEJ-009-alerta-regularidad-dashboard.md`

### MEJ-010 — Nombre de perfil editable en Settings

- **Categoría:** Producto / UX
- **Impacto:** Bajo
- **Esfuerzo:** Bajo
- **Estado:** Propuesta
- **Resumen:** `user_profiles.name` (`supabase/schema.sql:48`) se setea una única vez al registrarse, con el prefijo del email como valor por defecto (`handle_new_user()`, `supabase/schema.sql:152-159`). `Settings.tsx:312-336` lo muestra en un `<div>` de solo lectura con pinta de input, y en todo el repo `user_profiles` solo se actualiza para `theme` (`Settings.tsx:111`) — no existe ninguna forma de cambiar el nombre mostrado.
- **Plan:** `src/docs/improvements/MEJ-010-nombre-perfil-editable.md`

### MEJ-011 — Agenda con Soporte de Fechas Reales (Semanas/Mes)

- **Categoría:** Nueva Funcionalidad
- **Impacto:** Alto
- **Esfuerzo:** Medio
- **Estado:** Completada
- **Resumen:** Migrar la vista de horarios (Schedule) a un calendario con fechas reales, permitiendo navegar entre semanas pasadas y futuras, y agregando un toggle para vista mensual.
- **Plan:** `src/docs/improvements/MEJ-011-agenda-fechas-reales.md`

### MEJ-012 — Sincronización con Google Calendar

- **Categoría:** Nueva Funcionalidad
- **Impacto:** Alto
- **Esfuerzo:** Medio
- **Estado:** Propuesta
- **Resumen:** Permitir importar y exportar eventos extracurriculares a Google Calendar para interoperabilidad.
- **Plan:** `src/docs/improvements/MEJ-012-sincronizacion-google-calendar.md`

### MEJ-013 — Modo Do Not Disturb en Pomodoro

- **Categoría:** Nueva Funcionalidad
- **Impacto:** Alto
- **Esfuerzo:** Medio
- **Estado:** Completada
- **Resumen:** Ocultar menús y elementos distractivos al iniciar el Pomodoro, mostrando solo el temporizador en pantalla completa.
- **Plan:** `src/docs/improvements/MEJ-013-modo-do-not-disturb-pomodoro.md`

### MEJ-014 — Vincular Pomodoro a Exámenes específicos

- **Categoría:** Nueva Funcionalidad
- **Impacto:** Alto
- **Esfuerzo:** Medio
- **Estado:** Completada
- **Resumen:** Permitir asociar una sesión de estudio a un evento tipo Parcial o Final, para poder medir la cantidad de horas dedicadas a prepararlo.
- **Plan:** `src/docs/improvements/MEJ-014-vincular-pomodoro-examenes.md`

### MEJ-015 — Rachas y Gamificación (Streaks) en Estadísticas

- **Categoría:** Nueva Funcionalidad
- **Impacto:** Alto
- **Esfuerzo:** Medio
- **Estado:** Completada
- **Resumen:** Mostrar en la pestaña de Estadísticas rachas de días seguidos cumpliendo actividades o sesiones de estudio.
- **Plan:** `src/docs/improvements/MEJ-015-rachas-gamificacion-stats.md`

### MEJ-016 — Checklist de Hábitos Diarios Independiente

- **Categoría:** Nueva Funcionalidad
- **Impacto:** Alto
- **Esfuerzo:** Medio
- **Estado:** Completada
- **Resumen:** Separar los hábitos repetitivos diarios de los eventos del timeline, creando un checklist que se reinicie cada medianoche.
- **Plan:** `src/docs/improvements/MEJ-016-checklist-habitos-independiente.md`

### MEJ-017 — Cuenta Regresiva de Exámenes (Countdown)

- **Categoría:** Nueva Funcionalidad
- **Impacto:** Alto
- **Esfuerzo:** Medio
- **Estado:** Completada
- **Resumen:** Agregar un widget destacado en el Dashboard indicando los días restantes para el próximo parcial o final.
- **Plan:** `src/docs/improvements/MEJ-017-cuenta-regresiva-examenes.md`

### MEJ-018 — Modo Fin de Semana en Dashboard

- **Categoría:** Nueva Funcionalidad
- **Impacto:** Alto
- **Esfuerzo:** Medio
- **Estado:** Propuesta
- **Resumen:** Los fines de semana, restar prioridad a la carga académica y destacar eventos de ocio/descanso, a menos que existan entregas urgentes.
- **Plan:** `src/docs/improvements/MEJ-018-modo-fin-de-semana.md`

### MEJ-019 — Matriz de Eisenhower para Tareas

- **Categoría:** Nueva Funcionalidad
- **Impacto:** Alto
- **Esfuerzo:** Medio
- **Estado:** Completada
- **Resumen:** Permitir clasificar las tareas académicas según su urgencia e importancia para sugerir el orden de resolución.
- **Plan:** `src/docs/improvements/MEJ-019-matriz-eisenhower-tareas.md`

### MEJ-020 — Tiempos de Pomodoro Personalizables

- **Categoría:** Nueva Funcionalidad
- **Impacto:** Alto
- **Esfuerzo:** Medio
- **Estado:** Completada
- **Resumen:** Habilitar la configuración de la duración del Pomodoro (ej. 50/10) desde la pantalla de Ajustes.
- **Plan:** `src/docs/improvements/MEJ-020-tiempos-pomodoro-personalizables.md`

### MEJ-021 — Log Historial y Edición de Sesiones

- **Categoría:** Nueva Funcionalidad
- **Impacto:** Alto
- **Esfuerzo:** Medio
- **Estado:** Propuesta
- **Resumen:** Mostrar en Estadísticas una lista detallada de cada sesión completada, con la posibilidad de editar o eliminar registros erróneos.
- **Plan:** `src/docs/improvements/MEJ-021-log-historial-edicion-sesiones.md`

### MEJ-022 — Sonidos de Ambientación en el Estudio

- **Categoría:** Nueva Funcionalidad
- **Impacto:** Alto
- **Esfuerzo:** Medio
- **Estado:** Completada
- **Resumen:** Incluir un mini-reproductor con ruido blanco o sonidos relajantes integrados dentro de la vista de Estudio.
- **Plan:** `src/docs/improvements/MEJ-022-sonidos-ambientacion-estudio.md`

### MEJ-023 — Reporte de Cierre Semanal

- **Categoría:** Nueva Funcionalidad
- **Impacto:** Alto
- **Esfuerzo:** Medio
- **Estado:** Propuesta
- **Resumen:** Generar automáticamente una tarjeta resumen cada domingo detallando las horas estudiadas y tareas completadas durante la semana.
- **Plan:** `src/docs/improvements/MEJ-023-reporte-cierre-semanal.md`

## Completadas

_Sin ítems todavía._

## Descartadas

_Sin ítems todavía._

### MEJ-024 — Sección de Finales (Gestión Completa)

- **Categoría:** Nueva Funcionalidad
- **Impacto:** Alto
- **Esfuerzo:** Alto
- **Estado:** Completada
- **Resumen:** Crear una sección dedicada para gestionar materias regulares que requieren rendir Final. Debe permitir visualizar materias disponibles para final, cargar fechas de mesas de exámenes, registrar intentos restantes, mostrar un countdown específico, y permitir vincular sesiones de estudio (Pomodoro) directamente a la preparación de ese final.
- **Plan:** `src/docs/improvements/MEJ-024-seccion-finales.md`
