# Deuda Técnica — UniDule

**Última actualización:** 2026-09-10 (auditoría src/docs/audits/2026-09-10.md)

---

## Crítica

### TD-RNF002 — Notas de usuario renderizadas con `dangerouslySetInnerHTML` sin sanitizar

- **Tipo:** No funcional (RNF)
- **Archivos afectados:** `src/features/subjects/lib/utils.ts:1-12` (`parseMd`), `src/pages/Subjects.tsx:405`
- **Descripción:** `parseMd` aplica reemplazos regex (`**bold**`, `` `code` ``, listas) directamente sobre el contenido crudo de la nota, sin escapar `<`, `>` ni `&` antes de convertir a HTML. El resultado se inyecta con `dangerouslySetInnerHTML` en la tarjeta de la nota. Detectado en auditoría 2026-08-11.
- **Riesgo:** Cualquier texto con HTML/JS embebido pegado en una nota se renderiza literalmente — al menos self-XSS explotable por contenido pegado sin querer, y deja la puerta abierta a un problema mayor si en el futuro las notas se comparten entre usuarios (como ya ocurre con los horarios, ver TD-RNF001).
- **Recomendación:** Escapar `<`, `>`, `&`, `"` del contenido crudo antes de aplicar los reemplazos de `parseMd`, o cambiar el enfoque a un parser de markdown que sanitice por diseño (ej. `marked` + `DOMPurify`) en vez de regex manual.

## Media

### TD-RF008 — Poblar tabla de equivalencias (equivalent_ids) en base de datos para Plan 2026

- **Tipo:** Funcional (RF)
- **Archivos afectados:** Ninguno (Base de Datos / Supabase)
- **Descripción:** El `PlanSimulationModal.tsx` fue refactorizado para calcular dinámicamente las equivalencias cruzando el progreso del usuario con las materias del Plan 2026 en la tabla `global_subjects`. Sin embargo, la columna `equivalent_ids` (tipo jsonb) actualmente está vacía en la base de datos de producción para las materias del plan nuevo, por lo que el simulador solo logra reconocer equivalencias donde los nombres coinciden exactamente.
- **Riesgo:** El simulador de plan no cumple su función de orientar al alumno sobre el impacto real del cambio de plan (ej. no detecta materias combinadas o con cambio de nombre).
- **Recomendación:** Recuperar o reconstruir el archivo JSON/CSV original con la matriz de equivalencias del plan 2016 vs 2026, y correr un script de `UPDATE` en Supabase para llenar la columna `equivalent_ids` de cada materia del Plan 2026 con los UUIDs/Códigos correspondientes del plan anterior.

## Baja

## Resueltos

### TD-RNF004 — Resuelto

- **Tipo:** Funcional/No funcional
- **Detectado en:** auditoría previa.
- **Resuelto en:** 2026-09-10.
- **Fix:** Se reemplazaron los any por interfaces DbTask, DbUserEvent, etc en useDataSync.ts.


### TD-RNF006 — Resuelto

- **Tipo:** Funcional/No funcional
- **Detectado en:** auditoría previa.
- **Resuelto en:** 2026-09-10.
- **Fix:** Se envolvió currentStreak en Stats y getBlocksForDate en Schedule usando useMemo.


### TD-RNF005 — Resuelto

- **Tipo:** Funcional/No funcional
- **Detectado en:** auditoría previa.
- **Resuelto en:** 2026-09-10.
- **Fix:** Se agregó salto de línea y formateo correcto para el ICS export en Settings.tsx.


### TD-RNF003 — Resuelto

- **Tipo:** Funcional/No funcional
- **Detectado en:** auditoría previa.
- **Resuelto en:** 2026-09-10.
- **Fix:** Se agregaron console.error a las respuestas de Supabase en useDataSync.ts.


### TD-RF006 — Resuelto

- **Tipo:** Funcional/No funcional
- **Detectado en:** auditoría previa.
- **Resuelto en:** 2026-09-10.
- **Fix:** Se usó profile.plan_id para ocultar el Título Intermedio en StatsTab si es Abogacía.


### TD-RF005 — Resuelto

- **Tipo:** Funcional/No funcional
- **Detectado en:** auditoría previa.
- **Resuelto en:** 2026-09-10.
- **Fix:** Se abstrajo clampGrade en shared/lib/utils.ts y se aplicó en los tres modales de notas.


### TD-RF003 — Resuelto

- **Tipo:** Funcional/No funcional
- **Detectado en:** auditoría previa.
- **Resuelto en:** 2026-09-10.
- **Fix:** Se implementó el sort usando a.expDate y localeCompare en FinalsTab.tsx.


### TD-RF007 — Estado de Finales persistido como nota visible

- **Tipo:** Funcional (RF)
- **Detectado en:** auditoría 2026-09-10.
- **Resuelto en:** 2026-09-10.
- **Fix:** Se agregó exclusión explícita `if (n.title === '__FINALS_STATE__') return false;` en el renderizado de notas (`Subjects.tsx`).


### TD-RF004 — "Próximas Entregas" del Dashboard no ordena por fecha

- **Tipo:** Funcional (RF)
- **Detectado en:** auditoría 2026-08-11.
- **Resuelto en:** 2026-09-09.
- **Fix:** Se agregó un `.sort()` explícito por `dueDate` en `src/pages/Dashboard.tsx` antes de aplicar `.slice(0, 5)`.


### TD-RNF001 — Robo de sesión entre usuarios vía "Compartir Horario" + exportación PDF sin sanitizar

- **Tipo:** No funcional (RNF)
- **Detectado en:** auditoría 2026-08-11 (`src/docs/audits/2026-08-11.md`).
- **Resuelto en:** 2026-08-11.
- **Fix:** Se agregó `escapeHtml` (`src/shared/lib/utils.ts`) y se aplicó a todo el contenido dinámico interpolado en `exportPDF` (`src/pages/Schedule.tsx`) antes de pasarlo a `win.document.write(...)`: título/materia/tipo de tareas pendientes, nombre/color/horario/aula/tipo de cada bloque de clase y nombre/color de las materias activas. Además, `handleInputCode` (`src/pages/Settings.tsx`) ahora valida el shape completo del código pegado (`sanitizeSharePayload`/`sanitizeShareScheduleEvent`) — día dentro de una lista permitida, horarios con formato `HH:MM`, y todo texto (`professor`, `room`, `type`, `name`, `id`) saneado (sin `<`/`>`, longitud acotada) — antes de persistirlo vía `saveActiveSubject`.
