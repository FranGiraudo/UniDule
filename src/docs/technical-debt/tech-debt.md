# Deuda Técnica — UniDule

**Última actualización:** 2026-09-10 (auditoría src/docs/audits/2026-09-10.md)

---

## Crítica

### TD-RF007 — Estado de Finales persistido como nota visible

- **Tipo:** Funcional (RF)
- **Archivos afectados:** `src/pages/Finals.tsx:57-75`, `src/pages/Subjects.tsx:288-300`
- **Descripción:** La sección de Finales almacena los "Intentos Restantes" como un JSON dentro de `user_notes` (título `__FINALS_STATE__`). El modal de notas en la sección de materias lista todas las notas y **no filtra** esta nota interna de configuración.
- **Riesgo:** El usuario puede ver el JSON crudo en la UI, editarlo y romper el parser, o eliminarlo accidentalmente perdiendo su progreso de intentos de exámenes finales. Riesgo extremo de corrupción de datos por uso normal de la app.
- **Recomendación:** Agregar un filtro `n.title !== '__FINALS_STATE__'` en la generación de `filteredNotes` dentro de `Subjects.tsx`, o migrar la data a una columna nativa si es posible.


_Sin ítems en esta corrida._

## Alta

### TD-RF001 — El mapa de correlativas (`MapTab`) etiqueta materias bloqueadas como "Disponible"

- **Tipo:** Funcional (RF)
- **Archivos afectados:** `src/features/career/components/MapTab.tsx:180-201,254`
- **Descripción:** `getStatusStyle` solo distingue `aprobada`, `regular` y `cursando`; cualquier otro estado —incluidas materias con correlativas sin cumplir— cae en el mismo `default` y muestra la etiqueta `'DISPONIBLE'`. A diferencia de `GridTab.tsx:172-180` y `FinalsTab.tsx`, nunca llama a `getComputedStatus` para diferenciar `disponible` de `bloqueada`. El color de leyenda `V.nodeFillDisp` (línea 254) tampoco se usa en ningún nodo real (el `default` pinta con `V.nodeFill`), así que no hay ni siquiera contraste visual entre ambos estados. Detectado en auditoría 2026-08-11.
- **Riesgo:** El mapa es la vista pensada para planificar qué cursar; decirle a un estudiante que una materia bloqueada está "Disponible" puede llevarlo a intentar anotarse en algo que no cumple correlativas, y contradice lo que la misma app muestra en `GridTab`/`FinalsTab` para la misma materia.
- **Recomendación:** Reemplazar el `switch (s.status)` de `getStatusStyle` por la misma lógica de `getComputedStatus(s, subjects)` que ya usan `GridTab` y `FinalsTab`, agregando una rama explícita para `bloqueada` que use `V.nodeFillBloq` (ya definido pero sin uso) en vez de reutilizar el color de disponible.

### TD-RF002 — `PlanSimulationModal` es contenido 100% hardcodeado, no una simulación real

- **Tipo:** Funcional (RF)
- **Archivos afectados:** `src/features/career/components/PlanSimulationModal.tsx:1-99`, `src/pages/Settings.tsx:318-327,473`
- **Descripción:** El propio comentario del código lo admite (línea 4): *"Hardcoded for the prompt's provided text... In a real scenario, this would be computed by comparing user progress with plan_id 2026 subjects' equivalent_ids"*. Las listas `riskSubjects` y `appliedEquivalences` son literales fijos que no leen `career`, `profile` ni ningún estado del usuario. Detectado en auditoría 2026-08-11.
- **Riesgo:** El botón "Simular Cambio" en Settings promete "comprobar qué materias te tomarían como equivalencias" según el progreso propio del usuario, pero todos ven exactamente el mismo listado, sin relación con su carrera real — una feature que aparenta funcionar pero engaña.
- **Recomendación:** O bien implementar el cálculo real comparando `career.subjects`/`electives` del usuario contra las equivalencias del plan destino (tabla de equivalencias en Supabase), o quitar la feature/marcarla explícitamente como "Próximamente" hasta que exista esa tabla.

### TD-RNF002 — Notas de usuario renderizadas con `dangerouslySetInnerHTML` sin sanitizar

- **Tipo:** No funcional (RNF)
- **Archivos afectados:** `src/features/subjects/lib/utils.ts:1-12` (`parseMd`), `src/pages/Subjects.tsx:405`
- **Descripción:** `parseMd` aplica reemplazos regex (`**bold**`, `` `code` ``, listas) directamente sobre el contenido crudo de la nota, sin escapar `<`, `>` ni `&` antes de convertir a HTML. El resultado se inyecta con `dangerouslySetInnerHTML` en la tarjeta de la nota. Detectado en auditoría 2026-08-11.
- **Riesgo:** Cualquier texto con HTML/JS embebido pegado en una nota se renderiza literalmente — al menos self-XSS explotable por contenido pegado sin querer, y deja la puerta abierta a un problema mayor si en el futuro las notas se comparten entre usuarios (como ya ocurre con los horarios, ver TD-RNF001).
- **Recomendación:** Escapar `<`, `>`, `&`, `"` del contenido crudo antes de aplicar los reemplazos de `parseMd`, o cambiar el enfoque a un parser de markdown que sanitice por diseño (ej. `marked` + `DOMPurify`) en vez de regex manual.

## Media

### TD-RNF005 — Generación frágil de iCalendar (.ics) y tipado débil

- **Tipo:** No funcional (RNF)
- **Archivos afectados:** `src/pages/Settings.tsx:201-255`
- **Descripción:** El string de exportación `.ics` se ensambla concatenando texto bruto. No se maneja el plegado de líneas (folding) requerido por la RFC 5545 para líneas mayores a 75 bytes. Además, el mapeo se escribió evadiendo TypeScript con `(sub: any)`.
- **Riesgo:** Si el título de una materia o su descripción excede la longitud, el archivo generado quedará corrompido y no será importado por Google Calendar.
- **Recomendación:** Instalar un paquete liviano como `ics` o implementar un generador que respete el *folding CRLF* y tipar los parámetros correctamente.


### TD-RF003 — El ordenamiento de finales por vencimiento no hace nada

- **Tipo:** Funcional (RF)
- **Archivos afectados:** `src/features/career/components/FinalsTab.tsx:69-76,174-177`
- **Descripción:** El `<select>` de orden ofrece "Vencimiento más próximo" y "Vencimiento más lejano" (`exp-asc`/`exp-desc`), pero el comparador hace `return 0` en ambos casos, dejando la lista sin ordenar. El comentario en línea 70 (*"We don't have expDate in V2 yet"*) está desactualizado: el mismo archivo usa `expDate` unas líneas más abajo (175, 178) para calcular `daysLeft` y pintar los badges de vencimiento — el campo ya existe en `Subject.expDate` (`shared/types/index.ts:25`). Detectado en auditoría 2026-08-11.
- **Riesgo:** Es una opción de UI visible que no hace lo que dice; el `(s as any)` de las líneas 175-176 es además un cast innecesario que esconde que el tipo ya tiene el campo.
- **Recomendación:** Implementar el comparador real usando `getDaysToExpiration`/`expDate` (`a.expDate` vs `b.expDate`, con `null` al final) y quitar los casts `as any` ya innecesarios.

### TD-RF005 — Validación de notas inconsistente entre modales

- **Tipo:** Funcional (RF)
- **Archivos afectados:** `src/features/subjects/components/GradesModal.tsx:25-32`, `src/features/career/components/SubjectDetailModal.tsx:60-63`, `src/features/tasks/components/GradePromptModal.tsx:30-37`
- **Descripción:** `GradePromptModal` valida explícitamente el rango 0-10 antes de guardar. `SubjectDetailModal` clampea la nota final con `Math.min(10, Math.max(0, gv))` pero solo cuando `status === 'aprobada'`, y permite guardar con nota vacía (`finalGrade = null`) sin bloquear el guardado. `GradesModal` (editor de evaluaciones parciales) no aplica ningún clamp ni validación al `score`, solo la restricción visual `min`/`max` del `<input type="number">`, que no impide escribir un valor fuera de rango. Detectado en auditoría 2026-08-11.
- **Riesgo:** El mismo dato (nota 0-10) tiene tres reglas de validación distintas según qué modal se use, facilitando notas de parcial fuera de rango o materias "Aprobadas" sin nota final.
- **Recomendación:** Extraer una función compartida `clampGrade`/`validateGrade` en `shared/lib/` y usarla en los tres modales; en `SubjectDetailModal`, bloquear el guardado si `status === 'aprobada'` y la nota quedó vacía.

### TD-RF006 — Contenido hardcodeado para un solo plan de carrera, pese a que la app soporta varios

- **Tipo:** Funcional (RF)
- **Archivos afectados:** `src/shared/components/layout/Sidebar.tsx:49`, `src/features/career/components/StatsTab.tsx:22,206`, `src/pages/Auth.tsx:268-270`
- **Descripción:** `Auth.tsx` ofrece tres planes de estudio distintos al registrarse, incluido "Plan 2000 (Abogacía UNC)". Sin embargo, `Sidebar.tsx:49` muestra siempre `"IUA · 2do Sem 2026"` como subtítulo fijo, y `StatsTab.tsx` calcula el "Título Intermedio" filtrando `subjects.filter(s => s.year <= 3)` (línea 22) y lo etiqueta siempre `"Analista de Sistemas Informáticos"` (línea 206), sin importar el `plan_id` real del usuario. Detectado en auditoría 2026-08-11.
- **Riesgo:** Un usuario del plan de Abogacía UNC ve branding y estadísticas de una carrera de informática que no cursa; el umbral `year <= 3` es una regla de negocio del plan de Ingeniería sin sentido para otro plan.
- **Recomendación:** Mover estos literales a configuración por `plan_id` (nombre de carrera, título intermedio, año de corte si aplica) en vez de hardcodearlos en el componente; para planes sin título intermedio, ocultar esa tarjeta en `StatsTab`.

### TD-RNF003 — Llamadas a Supabase sin manejo de error visible al usuario

- **Tipo:** No funcional (RNF)
- **Archivos afectados:** `src/shared/hooks/useDataSync.ts:20-47`, `src/shared/context/AuthProvider.tsx:17-28`, `src/pages/Settings.tsx:39`
- **Descripción:** `useDataSync` dispara ocho queries en paralelo con `Promise.all` y nunca revisa el campo `error` de ninguna respuesta individual; si una falla, sus datos quedan `undefined` y se tratan silenciosamente como "sin datos" (todos los destructurados usan `|| []`/`|| undefined` de respaldo). `AuthProvider.tsx:17-21` hace lo mismo con el fetch de perfil. `Settings.tsx:39` (`handleThemeChange`) tampoco revisa el resultado del `update`. Detectado en auditoría 2026-08-11.
- **Riesgo:** Si Supabase devuelve un error (RLS, red, etc.), la app no lo distingue de "el usuario no tiene datos todavía" — no hay estado de error visible, así que un fallo real se percibe como una carrera vacía o un cambio de tema que no se guardó, sin ninguna pista de qué pasó.
- **Recomendación:** Revisar el campo `error` de cada respuesta en `useDataSync` y exponer un estado de error en el store (o al menos un `console.error` + toast) en vez de tratar todo fallo como "sin datos"; aplicar el mismo patrón en `AuthProvider` y `handleThemeChange`.

### TD-RNF004 — Tipado débil concentrado en la capa de sincronización con Supabase

- **Tipo:** No funcional (RNF)
- **Archivos afectados:** `src/shared/hooks/useDataSync.ts:51,65,76-90,121,132-134`
- **Descripción:** Todos los `.map()` que transforman filas de Supabase a los tipos del dominio (`Task`, `Note`, `Subject`, `Seminar`, `Elective`) tipan el parámetro como `any` (`t: any`, `n: any`, `g: any`, `p: any`, `a: any`, `gr: any`, `s: any`, `e: any`), sin ningún tipo intermedio para las filas de Supabase. Es el único punto del repo que mapea los ocho `SELECT *` a los tipos de dominio. En todo el repo hay 27 usos de `any`/`as any`, concentrados sobre todo acá. Detectado en auditoría 2026-08-11.
- **Riesgo:** Es el punto de entrada de todos los datos remotos a la app; un cambio de nombre de columna en Supabase (p. ej. `g.correlatives?.toCurse`, línea 99, un nombre de campo poco convencional) no se detecta en compilación, solo en runtime cuando el dato ya está mal mapeado.
- **Recomendación:** Definir tipos de fila (`SupabaseActiveSubjectRow`, `SupabaseTaskRow`, etc.) o generar tipos desde el schema de Supabase (`supabase gen types typescript`), y tipar los parámetros de los `.map()` con esos tipos en vez de `any`.

## Baja

### TD-RNF006 — Cálculos pesados sin memoizar en Schedule y Stats

- **Tipo:** No funcional (RNF)
- **Archivos afectados:** `src/pages/Schedule.tsx`, `src/pages/Stats.tsx`
- **Descripción:** `currentStreak` se calcula iterando todo el historial con un `while(true)` dentro del cuerpo del componente (ejecutado en cada render). En `Schedule.tsx`, `getBlocksForDate` filtra y mapea el estado global de eventos 31 veces por cada renderizado del calendario mensual.
- **Riesgo:** Deterioro de performance (drop de FPS al navegar) en celulares gama baja a medida que el usuario acumula cientos de eventos históricos y sesiones a lo largo del semestre.
- **Recomendación:** Envolver estos cálculos con `useMemo` y optimizar la iteración histórica con estructuras indexadas.


_Sin ítems en esta corrida._

## Resueltos

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
