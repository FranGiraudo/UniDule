# Deuda Técnica — UniDule

**Última actualización:** 2026-08-12 (auditorías `src/docs/audits/2026-08-12.md`; incluye fixes de `TD-RF001` y parcial de `TD-RF007` aportados por otra sesión sobre la misma rama)

---

## Crítica

### TD-RF009 — Editar una materia desde `SubjectModal` resetea las inasistencias a 0 silenciosamente

- **Tipo:** Funcional (RF)
- **Archivos afectados:** `src/features/subjects/components/SubjectModal.tsx:75-93` (`handleSave`), `src/features/subjects/lib/api.ts:42` (`saveActiveSubject`, `absences: sub.absences ?? 0`)
- **Descripción:** el payload que arma `handleSave` en `SubjectModal` para `saveActiveSubject` no incluye la propiedad `absences`. Como `saveActiveSubject` defaultea a `absences: sub.absences ?? 0` cuando el campo no llega, cada vez que se edita una materia activa desde este modal (cambiar profesor, aula, email, máximo de inasistencias, estado, o agregar/editar un horario) el contador de inasistencias actuales se sobrescribe a 0 tanto en Supabase (`user_active_subjects`) como en el store local, sin ningún aviso. `GradesModal.tsx:45`, la otra vía de edición de la misma materia, sí reenvía `absences: subject.absences` correctamente — es la única de las dos rutas que lo hace bien. Detectado en auditoría 2026-08-12.
- **Riesgo:** pérdida de datos reales del usuario en un flujo de uso muy frecuente — cualquier edición de una materia que se está cursando pisa las inasistencias ya registradas. El usuario no tiene forma de notar el reseteo hasta que revisa el contador y ya perdió el historial acumulado.
- **Recomendación:** agregar `absences: subject?.absences` al payload de `SubjectModal.handleSave`. Adicionalmente, hacer que `saveActiveSubject` preserve el valor existente (vía upsert parcial o lectura previa) en vez de defaultear silenciosamente a 0 cuando el campo no llega, para que esta clase de omisión no pueda repetirse en otro punto de la app.

## Alta

### TD-RF007 — Los estados `'libre'` y `'promocionado'` no los reconoce de forma consistente ningún componente de estilos de Carrera

- **Tipo:** Funcional (RF)
- **Archivos afectados:** `src/shared/types/index.ts:5` (`SubjectStatus`), `src/features/career/lib/utils.ts` (`CAREER_STATUS_CFG`), `src/features/career/components/MapTab.tsx:180-201` (`getStatusStyle`), `src/features/career/components/GridTab.tsx:174`, `src/features/career/components/ElectivesTab.tsx:51`, `src/features/career/components/SubjectDetailModal.tsx:96,108,177-182` (clamp + `<select>` de estado), `src/features/subjects/components/SubjectModal.tsx:192`, `src/features/subjects/components/GradesModal.tsx:119`
- **Descripción:** `SubjectModal.tsx:192` y `GradesModal.tsx:119` permiten elegir `status='libre'` desde sus `<select>`, pero `SubjectStatus` (`shared/types/index.ts:5`) no incluía `'libre'` en su unión de tipos, y `CAREER_STATUS_CFG` tampoco tenía esa key — todo componente que hace `CAREER_STATUS_CFG[cs] || CAREER_STATUS_CFG.pendiente` caía al fallback y mostraba "Pendiente". En `MapTab.tsx`, el `switch` de `getStatusStyle` no tenía caso para `'libre'` y caía en el `default`, mostrando la etiqueta **"DISPONIBLE"**. **Parcialmente resuelto el 2026-08-12** (commit `8d1f063` de otra sesión sobre esta misma rama): se agregó `'libre'` a `SubjectStatus`, a `CAREER_STATUS_CFG` y al `switch` de `MapTab.getStatusStyle` — ese caso puntual ya funciona en los tres archivos. **Sigue sin resolver:** el mismo bug de raíz afecta también a `'promocionado'` — es un valor válido de `SubjectStatus` y seleccionable desde `SubjectModal.tsx:191` y `GradesModal.tsx:118`, pero `CAREER_STATUS_CFG` no tiene esa key, `MapTab.getStatusStyle` no tiene ese caso (cae a `'DISPONIBLE'`), y `GridTab`/`ElectivesTab`/`SubjectDetailModal` caen al fallback `'Pendiente'`. Además, el propio `<select>` de `SubjectDetailModal.tsx:177-182` sigue sin ofrecer ni `'libre'` ni `'promocionado'` como opciones — si una materia ya tiene uno de esos estados, al abrir el modal de Carrera el `<select>` queda con una selección vacía/inconsistente, independientemente del fix ya aplicado.
- **Riesgo:** en `MapTab` específicamente, mostrar "Disponible" para una materia que ya fue promocionada puede llevar a un estudiante a no darse cuenta de que ya la aprobó. El `<select>` sin opción correspondiente en `SubjectDetailModal` puede además llevar a resetear el estado real de la materia al guardar sin que el usuario lo note.
- **Recomendación:** replicar el mismo patrón ya aplicado para `'libre'` con `'promocionado'` (agregar a `SubjectStatus`, a `CAREER_STATUS_CFG` y al `switch` de `MapTab.tsx`), y sumar las `<option>` faltantes (`'libre'` y `'promocionado'`) al `<select>` de `SubjectDetailModal.tsx`.

### TD-RF002 — `PlanSimulationModal` es contenido 100% hardcodeado, no una simulación real

- **Tipo:** Funcional (RF)
- **Archivos afectados:** `src/features/career/components/PlanSimulationModal.tsx:1-245`, `src/pages/Settings.tsx:318-327,473`
- **Descripción:** el propio comentario del código lo admite (línea 4): *"Hardcoded for the prompt's provided text... In a real scenario, this would be computed by comparing user progress with plan_id 2026 subjects' equivalent_ids"*. Las listas `riskSubjects` y `appliedEquivalences` son literales fijos que no leen `career`, `profile` ni ningún estado del usuario. Detectado en auditoría 2026-08-11, confirmado sin cambios en 2026-08-12 (el archivo creció a 245 líneas pero el contenido sigue siendo estático).
- **Riesgo:** el botón "Simular Cambio" en Settings promete "comprobar qué materias te tomarían como equivalencias" según el progreso propio del usuario, pero todos ven exactamente el mismo listado, sin relación con su carrera real — una feature que aparenta funcionar pero engaña.
- **Recomendación:** o bien implementar el cálculo real comparando `career.subjects`/`electives` del usuario contra las equivalencias del plan destino (tabla de equivalencias en Supabase), o quitar la feature/marcarla explícitamente como "Próximamente" hasta que exista esa tabla.

### TD-RF011 — `GradesModal` borra silenciosamente tareas ya completadas al quitar una nota vinculada

- **Tipo:** Funcional (RF)
- **Archivos afectados:** `src/features/subjects/components/GradesModal.tsx:79-82`
- **Descripción:** el loop de limpieza de `handleSave` recorre `tasks` (la lista global de todas las materias, vía `useStore`) y borra cualquier tarea cuyo `gradeId` ya no esté entre las notas actuales — incluidas tareas con `done: true`. Si el usuario borra una fila de evaluación con `rmGrade` (incluso por error), la tarea vinculada desaparece sin confirmación ni aviso, aunque represente una entrega ya completada. Detectado en auditoría 2026-08-12.
- **Riesgo:** pérdida silenciosa de contenido creado por el usuario (una tarea ya marcada como hecha) como efecto secundario de una acción que no advierte esa consecuencia.
- **Recomendación:** pedir confirmación explícita antes de borrar tareas vinculadas a una nota eliminada, o preservar la tarea y solo desvincular su `gradeId` en vez de borrarla.

### TD-RNF002 — Notas de usuario renderizadas con `dangerouslySetInnerHTML` sin sanitizar

- **Tipo:** No funcional (RNF)
- **Archivos afectados:** `src/features/subjects/lib/utils.ts:1-12` (`parseMd`), `src/pages/Subjects.tsx:405`
- **Descripción:** `parseMd` aplica reemplazos regex (`**bold**`, `` `code` ``, listas) directamente sobre el contenido crudo de la nota, sin escapar `<`, `>` ni `&` antes de convertir a HTML. El resultado se inyecta con `dangerouslySetInnerHTML` en la tarjeta de la nota. Detectado en auditoría 2026-08-11, confirmado sin cambios en 2026-08-12 (verificado desde dos ángulos distintos: feature `subjects` y página `Subjects.tsx`).
- **Riesgo:** cualquier texto con HTML/JS embebido pegado en una nota se renderiza literalmente — al menos self-XSS explotable por contenido pegado sin querer, y deja la puerta abierta a un problema mayor si en el futuro las notas se comparten entre usuarios (como ya ocurría con los horarios antes del fix de TD-RNF001). Nota adicional: la sesión de Supabase se persiste con la configuración por defecto del SDK (`localStorage`, sin `httpOnly`), así que un XSS explotado por esta vía también podría exponer el token de sesión del usuario, no solo el contenido de la página.
- **Recomendación:** escapar `<`, `>`, `&`, `"` del contenido crudo antes de aplicar los reemplazos de `parseMd` (reusando `escapeHtml` de `shared/lib/utils.ts`, ya usado para el mismo propósito en `Schedule.tsx`), o cambiar el enfoque a un parser de markdown que sanitice por diseño (ej. `marked` + `DOMPurify`) en vez de regex manual.

### TD-RNF007 — Re-renders innecesarios en `MapTab` y `StatsTab` por fallback a array vacío en cada render

- **Tipo:** No funcional (RNF)
- **Archivos afectados:** `src/features/career/components/MapTab.tsx:17`, `src/features/career/components/StatsTab.tsx:8`
- **Descripción:** la declaración `const subjects = career?.subjects || [];` crea una nueva referencia de array en memoria en cada ciclo de renderizado de React. Esto hace que los hooks `useMemo` dependientes de `subjects` evalúen que hubo un cambio en sus dependencias, invalidando sus cálculos internos. Detectado en auditoría 2026-08-12 (sesión paralela sobre esta misma rama).
- **Riesgo:** deterioro de performance. En componentes con alta interacción y gráficos complejos como `MapTab`, recalcular los datos y el layout SVG en cada render penaliza el rendimiento y provoca retrasos perceptibles en la UI.
- **Recomendación:** definir una constante inmutable `const EMPTY_SUBJECTS: Subject[] = [];` fuera del componente para actuar como fallback de `career?.subjects || EMPTY_SUBJECTS`, o memoizar el array de subjects directamente si la referencia no puede ser estática.

## Media

### TD-RF003 — El ordenamiento de finales por vencimiento no hace nada

- **Tipo:** Funcional (RF)
- **Archivos afectados:** `src/features/career/components/FinalsTab.tsx:69-76,174-177`
- **Descripción:** el `<select>` de orden ofrece "Vencimiento más próximo" y "Vencimiento más lejano" (`exp-asc`/`exp-desc`), pero el comparador hace `return 0` en ambos casos, dejando la lista sin ordenar. El comentario en línea 70 (*"We don't have expDate in V2 yet"*) está desactualizado: el mismo archivo usa `expDate` unas líneas más abajo (175, 178) para calcular `daysLeft` y pintar los badges de vencimiento — el campo ya existe en `Subject.expDate` (`shared/types/index.ts:25`). Detectado en auditoría 2026-08-11, confirmado sin cambios en 2026-08-12; se confirma además que los `(s as any).expDate`/`(s as any).regDate` de las líneas 175-176 son casts innecesarios (el tipo ya tiene esos campos) que la corrección debería eliminar de paso, usando el helper `getDaysToExpiration` (ya importado) en vez del cast.
- **Riesgo:** es una opción de UI visible que no hace lo que dice.
- **Recomendación:** implementar el comparador real usando `getDaysToExpiration`/`expDate` (`a.expDate` vs `b.expDate`, con `null` al final) y quitar los casts `as any` ya innecesarios.

### TD-RF004 — "Próximas Entregas" del Dashboard no ordena por fecha

- **Tipo:** Funcional (RF)
- **Archivos afectados:** `src/pages/Dashboard.tsx:477-480`
- **Descripción:** `tasks.filter((t) => !t.done).slice(0, 5).map(renderTask)` recorta las primeras 5 tareas pendientes en el orden en que llegan del store, sin ordenar por `dueDate`. `src/pages/Tasks.tsx:73-79` sí implementa el ordenamiento correcto (no hechas primero, luego por fecha ascendente) para la misma data. Detectado en auditoría 2026-08-11, confirmado sin cambios en 2026-08-12.
- **Riesgo:** una tarea que vence en 60 días puede desplazar del widget a otra que vence mañana, justo en el panel pensado para avisar qué es urgente.
- **Recomendación:** ordenar por `dueDate` ascendente (con `null` al final, igual que en `Tasks.tsx`) antes de aplicar `.slice(0, 5)`.

### TD-RF005 — Validación de notas inconsistente entre modales

- **Tipo:** Funcional (RF)
- **Archivos afectados:** `src/features/subjects/components/GradesModal.tsx:25-32,189-191`, `src/features/career/components/SubjectDetailModal.tsx:60-63`, `src/features/tasks/components/GradePromptModal.tsx:30-37`
- **Descripción:** `GradePromptModal` valida explícitamente el rango 0-10 antes de guardar. `SubjectDetailModal` clampea la nota final con `Math.min(10, Math.max(0, gv))` pero solo cuando `status === 'aprobada'`, y permite guardar con nota vacía (`finalGrade = null`) sin bloquear el guardado. `GradesModal` (editor de evaluaciones parciales) no aplica ningún clamp ni validación al `score`, solo la restricción visual `min`/`max` del `<input type="number">`, que no impide escribir un valor fuera de rango. Detectado en auditoría 2026-08-11, confirmado sin cambios en 2026-08-12.
- **Riesgo:** el mismo dato (nota 0-10) tiene tres reglas de validación distintas según qué modal se use, facilitando notas de parcial fuera de rango o materias "Aprobadas" sin nota final.
- **Recomendación:** extraer una función compartida `clampGrade`/`validateGrade` en `shared/lib/` y usarla en los tres modales; en `SubjectDetailModal`, bloquear el guardado si `status === 'aprobada'` y la nota quedó vacía.

### TD-RF006 — Contenido hardcodeado para un solo plan de carrera, pese a que la app soporta varios

- **Tipo:** Funcional (RF)
- **Archivos afectados:** `src/shared/components/layout/Sidebar.tsx:49`, `src/features/career/components/StatsTab.tsx:22,206`, `src/pages/Auth.tsx:13,268-270`, `src/pages/Career.tsx:22`, `src/pages/Settings.tsx:359,383`
- **Descripción:** `Auth.tsx` ofrece tres planes de estudio distintos al registrarse, incluido "Plan 2000 (Abogacía UNC)". Sin embargo, `Sidebar.tsx:49` muestra siempre `"IUA · 2do Sem 2026"` como subtítulo fijo, y `StatsTab.tsx` calcula el "Título Intermedio" filtrando `subjects.filter(s => s.year <= 3)` (línea 22) y lo etiqueta siempre `"Analista de Sistemas Informáticos"` (línea 206), sin importar el `plan_id` real del usuario. **Ampliado en auditoría 2026-08-12:** el nombre de institución de respaldo también es inconsistente entre pantallas — `Career.tsx:22` usa el fallback `'Ingeniería en Informática — UTN'` mientras `Settings.tsx:359` usa `'Ingeniería en Informática — IUA'` para el mismo dato (`profile?.career` nulo). El plan por defecto también difiere: `Auth.tsx:13` asigna `planId = '2026'` al registrarse, mientras `Settings.tsx:383` muestra `Plan {profile?.plan_id || '2016'}` como fallback si `plan_id` llegara nulo.
- **Riesgo:** un usuario del plan de Abogacía UNC ve branding y estadísticas de una carrera de informática que no cursa; el umbral `year <= 3` es una regla de negocio del plan de Ingeniería sin sentido para otro plan. Los fallbacks inconsistentes de institución/plan agravan el problema mostrando datos distintos según qué pantalla mire el usuario. Este fallback silencioso a `'2016'` es además la causa raíz confirmada de un bug reportado por un usuario (ver `TD-RNF003`): con `plan_id` nulo en el perfil, `useDataSync` cargaba sistemáticamente el catálogo del plan 2016 y las notas de materias de otro plan aparecían como "Materia desconocida".
- **Recomendación:** mover estos literales a configuración por `plan_id` (nombre de carrera, institución, título intermedio, año de corte si aplica) en un único lugar (`shared/lib/constants.ts` o similar) del que lean todas las páginas/componentes, en vez de hardcodearlos y duplicarlos con valores distintos; para planes sin título intermedio, ocultar esa tarjeta en `StatsTab`.

### TD-RF010 — Tareas auto-generadas desde evaluaciones usan tipos que `TaskModal` no reconoce

- **Tipo:** Funcional (RF)
- **Archivos afectados:** `src/features/subjects/components/GradesModal.tsx:68`, `src/features/tasks/lib/constants.ts:1-9` (`TASK_TYPES`), `src/features/tasks/components/TaskModal.tsx:76-82`, `src/pages/Tasks.tsx:204-205`
- **Descripción:** `GradesModal.handleSave` crea tareas con `type: EXAM_TYPES.has(g.type) ? g.type : 'Tarea'`, generando `task.type` como `'Parcial 1'`, `'Parcial 2'`, `'Parcial 3'` o `'Recuperatorio'`. Ninguno de esos valores existe en `TASK_TYPES` (que solo tiene `'Parcial'` genérico). Al abrir esa tarea en `TaskModal.tsx`, el `<select value={type}>` no tiene ninguna `<option>` que matchee, quedando con la selección en blanco. Efecto secundario: `TYPE_BG`/`TYPE_FG` en `Tasks.tsx:204-205` caen al color gris por defecto para esos tipos. Detectado en auditoría 2026-08-12.
- **Riesgo:** cualquier tarea auto-generada desde una evaluación de nota (el flujo más común de creación de tareas de examen) muestra un `<select>` en blanco al editarla, y pierde su color distintivo en el listado.
- **Recomendación:** agregar las variantes de examen a `TASK_TYPES`, o separar `type` (categoría visible en `TaskModal`) de un campo `examType`/`gradeType` propio para no mezclar ambos vocabularios.

### TD-RF014 — `useDataSync` no cancela cargas superadas, riesgo de pisar el store con datos de una carga vieja

- **Tipo:** Funcional (RF)
- **Archivos afectados:** `src/shared/hooks/useDataSync.ts:13-162`
- **Descripción:** el `useEffect` que dispara `loadData()` no tiene cleanup ni bandera de "cancelado". Si `session`/`profile` cambian rápido (logout seguido de login con otro usuario, o un cambio de `plan_id` en Settings que dispara un nuevo fetch de `profile`), una `loadData()` vieja en vuelo puede resolver **después** de la nueva y pisar el store (`setCareer`/`setTasks`/`setNotes`, etc.) con datos del usuario o plan anterior. Detectado en auditoría 2026-08-12.
- **Riesgo:** condición de carrera real entre features — el usuario puede ver, transitoriamente, datos de una carrera/plan que ya no es el suyo tras cambiar de plan o de cuenta.
- **Recomendación:** usar un flag `let cancelled = false` en el cleanup del `useEffect` (o un id de request creciente) y no llamar a los setters del store si la carga fue superada por una más nueva.

### TD-RNF003 — Llamadas a Supabase sin manejo de error visible al usuario

- **Tipo:** No funcional (RNF)
- **Archivos afectados:** `src/shared/hooks/useDataSync.ts:18,20-47`, `src/shared/context/AuthProvider.tsx:17-28`, `src/pages/Settings.tsx:108-113`, `src/features/subjects/lib/api.ts:68-98,100-137` (`deleteActiveSubject`, `syncGrades`), `src/pages/Tasks.tsx:24-56`
- **Descripción:** `useDataSync` dispara ocho queries en paralelo con `Promise.all` y nunca revisa el campo `error` de ninguna respuesta individual; si una falla, sus datos quedan `undefined` y se tratan silenciosamente como "sin datos" (todos los destructurados usan `|| []`/`|| undefined` de respaldo). `AuthProvider.tsx:17-21` hace lo mismo con el fetch de perfil — y si `data` viene `null` (perfil borrado o error de `.single()`), el código no hace `setProfile(null)` explícito ni loguea nada: el `profile` de una sesión anterior puede quedar "pegado" en el store tras un re-login con perfil roto. `Settings.tsx:108-113` (`handleThemeChange`) tampoco revisa el resultado del `update`. **Ampliado en auditoría 2026-08-12:** en `subjects/lib/api.ts`, `deleteActiveSubject` no revisa el `error` de los deletes de `user_tasks`/`user_grades` antes de borrar `user_active_subjects` (cuyo error sí se valida) — un fallo parcial deja filas huérfanas mientras la UI ya limpió todo el estado local; `syncGrades` tampoco revisa el `error` del delete dentro de su loop y ejecuta `updateSubjectInCareer` incondicionalmente, por lo que el store local puede quedar desincronizado del servidor (una nota "borrada" reaparece en el siguiente reload). `pages/Tasks.tsx` (`handleToggle`, `handleGradeBadgeClick`, `ensureGradeForTask`) invoca `saveTask`/`syncGrades` sin ningún `try/catch`, a diferencia de los modales que sí envuelven el guardado en uno. **Parcialmente resuelto el 2026-08-12:** el caso de `Auth.tsx:39-44` (`.update({ plan_id: planId })` posterior al registro, sin revisar `error`) causaba en la práctica que un fallo silencioso de esa escritura dejara el perfil con `plan_id` nulo, y `useDataSync.ts:18` caía al fallback `'2016'` sin avisar — reportado por un usuario como notas mostrando "Materia desconocida" en `Subjects.tsx:344,369` porque el catálogo cargado (plan 2016) no contenía los códigos de materia de las notas creadas bajo el plan real. Se corrigió agregando `if (profileError) throw profileError;` en `Auth.tsx`, que ahora reutiliza el manejo de error ya existente en el mismo `catch` del formulario.
- **Riesgo:** si Supabase devuelve un error (RLS, red, etc.), la app no lo distingue de "el usuario no tiene datos todavía" — no hay estado de error visible, así que un fallo real se percibe como una carrera vacía, un cambio de tema que no se guardó, o datos que "vuelven" tras haberlos borrado, sin ninguna pista de qué pasó. El caso de `Auth.tsx` ya corregido demuestra el impacto real: perfiles con `plan_id` nulo hacían que la app cargara sistemáticamente el catálogo de un plan distinto al elegido, mostrando "Materia desconocida" en notas legítimas.
- **Recomendación:** revisar el campo `error` de cada respuesta restante en `useDataSync`, `AuthProvider`, `deleteActiveSubject` y `syncGrades`, y exponer un estado de error en el store (o al menos un `console.error` + toast) en vez de tratar todo fallo como "sin datos"; envolver las llamadas de `Tasks.tsx` en `try/catch` igual que los modales. Nota: usuarios que ya tienen `plan_id` nulo en la base por este bug siguen necesitando una corrección de datos manual (o un flujo de "elegí tu plan" en Settings) — el fix de `Auth.tsx` solo previene casos nuevos.

### TD-RNF004 — Tipado débil concentrado en la capa de sincronización con Supabase

- **Tipo:** No funcional (RNF)
- **Archivos afectados:** `src/shared/hooks/useDataSync.ts:51,65,76-90,121,132-134`
- **Descripción:** todos los `.map()` que transforman filas de Supabase a los tipos del dominio (`Task`, `Note`, `Subject`, `Seminar`, `Elective`) tipan el parámetro como `any` (`t: any`, `n: any`, `g: any`, `p: any`, `a: any`, `gr: any`, `s: any`, `e: any`), sin ningún tipo intermedio para las filas de Supabase. Es el único punto del repo que mapea los ocho `SELECT *` a los tipos de dominio. Detectado en auditoría 2026-08-11; confirmado en 2026-08-12 con conteo exacto de 10 usos de `any` en este único archivo. Hay usos puntuales adicionales de `any`/`catch (e: any)` dispersos en otros componentes (ver TD-RNF009), pero la concentración principal sigue siendo esta.
- **Riesgo:** es el punto de entrada de todos los datos remotos a la app; un cambio de nombre de columna en Supabase (p. ej. `g.correlatives?.toCurse`, un nombre de campo poco convencional) no se detecta en compilación, solo en runtime cuando el dato ya está mal mapeado.
- **Recomendación:** definir tipos de fila (`SupabaseActiveSubjectRow`, `SupabaseTaskRow`, etc.) o generar tipos desde el schema de Supabase (`supabase gen types typescript`), y tipar los parámetros de los `.map()` con esos tipos en vez de `any`.

### TD-RNF005 — Escrituras multi-paso a Supabase sin atomicidad ante un fallo a mitad de camino

- **Tipo:** No funcional (RNF)
- **Archivos afectados:** `src/features/subjects/components/GradesModal.tsx:34-90` (`handleSave`), `src/pages/Settings.tsx:142-171` (`handleFileChange`), `src/pages/Settings.tsx:247-272` (`handleInputCode`)
- **Descripción:** `GradesModal.handleSave` encadena `saveActiveSubject` → `syncGrades` → `updateSubjectProgress` → un loop de `saveTask`/`deleteTask`, cuatro-más escrituras a tablas distintas sin transacción ni rollback. `Settings.tsx` repite el patrón en el import de backup (`handleFileChange`) y en "Ingresar Código" de horario compartido (`handleInputCode`): un `for` que llama a varias funciones de escritura por cada ítem, una por una. Detectado en auditoría 2026-08-11, confirmado sin cambios en 2026-08-12 (además, en `handleFileChange`, si el fallo ocurre a mitad del loop el único mensaje que ve el usuario es el catch genérico "El archivo no es un backup válido", que es engañoso cuando la causa real fue un error de red/Supabase a mitad de proceso, no un archivo inválido).
- **Riesgo:** un corte de red a mitad de la secuencia deja algunas tablas actualizadas y otras no, y reintentar puede duplicar lo que ya se había guardado (ej. una tarea de evaluación repetida); en `handleFileChange` además el mensaje de error no refleja la causa real.
- **Recomendación:** para `GradesModal.handleSave`, evaluar mover los cuatro pasos a una función de Postgres (`RPC`) que los agrupe en una transacción del lado del servidor. Para los imports masivos, acumular los fallos por ítem y mostrar al usuario un resumen de qué se guardó y qué no (con un mensaje que distinga "archivo inválido" de "error de red/servidor a mitad de proceso"), en vez de abortar el loop en el primer error sin indicar hasta dónde llegó.

### TD-RNF006 — Accesibilidad: botones/elementos icon-only sin nombre accesible y elementos clickeables no operables por teclado

- **Tipo:** No funcional (RNF)
- **Archivos afectados:** botón de cerrar (`className="btn-icon"`) en los 8 modales de la app (`SeminarModal.tsx`, `SubjectDetailModal.tsx`, `PlanSimulationModal.tsx`, `GradePromptModal.tsx`, `TaskModal.tsx`, `SubjectModal.tsx`, `GradesModal.tsx`, `NoteModal.tsx`); `src/shared/components/layout/Sidebar.tsx:133` (logout); `src/features/career/components/GridTab.tsx:136` (colapsar/expandir año); `src/features/career/components/MapTab.tsx:422-430` (nodos SVG del mapa de correlativas); `src/features/subjects/components/SubjectModal.tsx:280` y `GradesModal.tsx:210` (`slot-rm`, borrar horario/evaluación); `src/pages/Auth.tsx:235-251` (toggle mostrar/ocultar contraseña); `src/pages/Subjects.tsx` y `src/pages/Tasks.tsx` (botones de acción `btn-xs` con solo `title`, sin `aria-label`)
- **Descripción:** los 8 modales de la app cierran con un `<button className="btn-icon">` que solo contiene el ícono `<X>` — sin `aria-label` ni texto accesible. `Sidebar.tsx:133` (logout) y `GridTab.tsx:136` (colapsar/expandir año) usan `<div onClick={...}>` para una acción interactiva, sin `role="button"`, `tabIndex` ni manejador de teclado. Detectado en auditoría 2026-08-11. **Ampliado en auditoría 2026-08-12:** el mismo patrón de `<div onClick>` sin soporte de teclado aparece también en `SubjectModal.tsx:280` y `GradesModal.tsx:210` (botón para borrar un horario/evaluación); los nodos `<g className="cm-node" onClick=...>` de `MapTab.tsx` (líneas 422-430) tampoco tienen `role`/`tabIndex`/`onKeyDown`, así que toda la interacción del mapa de correlativas depende de mouse/touch; el toggle de mostrar contraseña en `Auth.tsx` no tiene `aria-label`; y varios botones de acción en `Subjects.tsx`/`Tasks.tsx` (editar, ver estadísticas, borrar) usan solo `title` como pista, que no sustituye un nombre accesible confiable en todos los lectores de pantalla.
- **Riesgo:** un usuario con lector de pantalla no puede identificar qué hace el botón de cerrar de ningún modal, ni varios botones de acción de las páginas principales; un usuario que navega solo con teclado no puede cerrar sesión, colapsar un año del plan de carrera, seleccionar una materia desde el mapa de correlativas, ni borrar un horario/evaluación sin mouse.
- **Recomendación:** agregar `aria-label="Cerrar"` a los 8 botones `btn-icon` de cierre y `aria-label` a los botones de acción que hoy solo tienen `title`; cambiar los `<div onClick>` (`Sidebar.tsx:133`, `GridTab.tsx:136`, `SubjectModal.tsx:280`, `GradesModal.tsx:210`) por `<button>`, o agregarles `role="button"`, `tabIndex={0}` y un `onKeyDown` que dispare la acción en Enter/Espacio; para los nodos SVG de `MapTab.tsx`, agregar el mismo soporte de teclado o, como alternativa más simple, señalizar explícitamente `GridTab` como el camino accesible equivalente.

### TD-RNF010 — Import de backup confía en el JSON sin validar shape, a diferencia del import de horario compartido

- **Tipo:** No funcional (RNF)
- **Archivos afectados:** `src/pages/Settings.tsx:142-171` (`handleFileChange`, import de backup), `src/pages/Settings.tsx:236-279` (`handleInputCode`, ya sanitizado con `sanitizeSharePayload`/`sanitizeShareScheduleEvent`)
- **Descripción:** `handleFileChange` confía directamente en los campos del JSON de backup (`s.name`, `s.color`, `s.professor`, horarios, etc.) sin ninguna validación de shape ni sanitización, mientras que `handleInputCode` (import de código de horario compartido) sí pasa todo por `sanitizeSharePayload`/`sanitizeShareScheduleEvent` (día contra whitelist, formato de hora con regex, strings saneados). Ambas rutas cargan datos "externos" — un archivo de backup puede haber sido editado a mano o compartido igual que un código — pero reciben tratamiento de confianza distinto. Detectado en auditoría 2026-08-12.
- **Riesgo:** un backup manipulado o corrupto (a mano, o por un bug de una versión anterior del export) puede introducir strings fuera de formato, colores inválidos o campos con longitud arbitraria directamente en `user_active_subjects`, sin ninguna de las validaciones que sí se aplican al importar por código.
- **Recomendación:** aplicar la misma validación de shape (`sanitizeSharePayload`-style) al JSON de `handleFileChange` antes de persistirlo, en vez de mantener dos niveles de confianza distintos para datos de origen igualmente externo.

### TD-RNF012 — Cobertura de tests mínima, y ausente para la función de seguridad más sensible del repo

- **Tipo:** No funcional (RNF)
- **Archivos afectados:** `src/shared/lib/__tests__/utils.test.ts`, `src/shared/lib/utils.ts` (`escapeHtml`), `src/test/setup.ts`
- **Descripción:** el único archivo de test del repo (`utils.test.ts`) cubre solo `t2m`/`m2t`, `formatDate`, `daysUntil` y `urgColor` — 4 de las 7 funciones exportadas en `utils.ts`. Faltan tests para `todayDay`, `nowMin`, `t2y`, `dur`, y notablemente **`escapeHtml`**, la función que sostiene el fix de seguridad de TD-RNF001 (XSS en exportación PDF y horarios compartidos), no tiene ningún test que impida una regresión silenciosa. `src/test/` solo tiene `setup.ts` (configuración de Vitest). No hay ningún test para `useStore.ts`, `useDataSync.ts`, `AuthProvider.tsx`, `ThemeProvider.tsx`, el routing de `App.tsx`, ni ningún componente de página o feature. Detectado en auditoría 2026-08-12.
- **Riesgo:** sin test de regresión sobre `escapeHtml`, un refactor futuro de esa función (o de su forma de uso) podría reabrir silenciosamente el vector de XSS que ya se cerró en TD-RNF001, sin que ningún CI lo detecte. La ausencia total de tests sobre `useDataSync`/`AuthProvider`/routing tampoco da ninguna red de seguridad para los hallazgos de esta misma auditoría (TD-RF014, TD-RNF003) que tocan justamente esos archivos.
- **Recomendación:** priorizar un test de regresión para `escapeHtml` (casos con `<script>`, atributos `on*`, comillas) y uno para el guard de `ProtectedRoute` en `App.tsx`; a partir de ahí, ampliar cobertura de forma incremental sobre `useDataSync`/`AuthProvider` en paralelo a que se resuelvan TD-RF014/TD-RNF003.

### TD-RNF013 — Lógica de "correlativas aprobadas para rendir final" duplicada entre `GridTab` y `FinalsTab`

- **Tipo:** No funcional (RNF)
- **Archivos afectados:** `src/features/career/components/GridTab.tsx:176-180` (`canFinal`), `src/features/career/components/FinalsTab.tsx:59-62,169-172` (`missingToPass`/`canRendir`)
- **Descripción:** cada componente reimplementa, de forma independiente, la misma regla de negocio — "todas las correlativas de la materia están en estado `aprobada`" — sin reusar un helper común de `career/lib/utils.ts`. Detectado en auditoría 2026-08-12.
- **Riesgo:** un cambio futuro en la regla de correlatividad (por ejemplo, permitir rendir con correlativas regularizadas en vez de aprobadas) requiere tocar dos implementaciones independientes, con riesgo real de que queden desincronizadas.
- **Recomendación:** extraer un helper `canSitFinal(subject, allSubjects)` a `career/lib/utils.ts` y usarlo desde ambos componentes.

## Baja

### TD-RF008 — `SeminarModal` no valida horas negativas

- **Tipo:** Funcional (RF)
- **Archivos afectados:** `src/features/career/components/SeminarModal.tsx:29`, `src/features/career/components/SeminarsTab.tsx:24-26`
- **Descripción:** `parseInt(hours) || 0` solo filtra `NaN`, no valores negativos; el `min="0"` del `<input type="number">` es solo una pista de HTML que no se aplica al guardar. Un valor negativo corrompe el total de "horas acreditadas" calculado en `SeminarsTab.tsx:24-26`. Detectado en auditoría 2026-08-12.
- **Riesgo:** un valor negativo ingresado (a propósito o por error de tipeo) descuadra el total de horas de seminarios sin ningún aviso.
- **Recomendación:** usar `Math.max(0, parseInt(hours) || 0)` al guardar.

### TD-RF012 — `Auth.tsx` valida contraseñas solo por no estar vacías

- **Tipo:** Funcional (RF)
- **Archivos afectados:** `src/pages/Auth.tsx:19`
- **Descripción:** `handleSubmit` solo chequea `!email || !password`, sin longitud mínima, confirmación de contraseña, ni validación de complejidad en el registro. Cualquier password de 1 carácter pasa la validación del front (Supabase puede rechazarla del lado del servidor, pero recién después del roundtrip). Detectado en auditoría 2026-08-12.
- **Riesgo:** feedback tardío y de peor calidad para el usuario en el registro; no es una falla de seguridad en sí (Supabase sigue validando server-side) pero degrada la experiencia de un flujo core.
- **Recomendación:** agregar validación de longitud mínima y, opcionalmente, confirmación de contraseña en el propio formulario antes de llamar a `signUp`.

### TD-RF013 — `App.tsx` sin ruta catch-all (404)

- **Tipo:** Funcional (RF)
- **Archivos afectados:** `src/App.tsx:29-47`
- **Descripción:** no existe ninguna `<Route path="*">`; cualquier URL inválida (typo, deep link roto, ruta vieja) no matchea ninguna ruta y React Router no renderiza nada, dejando una pantalla en blanco sin feedback. Detectado en auditoría 2026-08-12. **Corrección 2026-08-12:** el hallazgo original también reportaba que `/login` no redirigía a un usuario con sesión activa — se verificó que esto es incorrecto: `Auth.tsx` (líneas 53-55) ya hace `if (session) return <Navigate to="/" replace />`, así que ese caso está cubierto y se retira del ítem.
- **Riesgo:** una URL rota deja al usuario sin ninguna pista de qué pasó ni cómo volver.
- **Recomendación:** agregar `<Route path="*" element={<Navigate to="/" replace />} />` (o una página 404 propia) al final de las rutas en `App.tsx`.

### TD-RNF008 — Varios componentes/páginas de gran tamaño mezclan datos, presentación y lógica de sincronización

- **Tipo:** No funcional (RNF)
- **Archivos afectados:** `src/features/career/components/MapTab.tsx` (~517 líneas), `src/pages/Dashboard.tsx` (~504 líneas), `src/pages/Settings.tsx` (~548 líneas), `src/pages/Schedule.tsx` (~577 líneas)
- **Descripción:** `MapTab.tsx` mezcla en un solo componente una máquina de estados de pan/zoom, un algoritmo de layout/bin-packing hecho a mano, dos paletas de tema completas y todo el render SVG. `Dashboard.tsx`, `Settings.tsx` y `Schedule.tsx` combinan de forma similar cálculos de dominio, múltiples formularios/flujos de import-export y presentación en un único archivo grande. Detectado en auditoría 2026-08-12.
- **Riesgo:** archivos de este tamaño y con estas responsabilidades mezcladas son más costosos de modificar sin introducir regresiones, y más difíciles de cubrir con tests (ver TD-RNF012).
- **Recomendación:** extraer subunidades con responsabilidad única — por ejemplo `usePlanLayout(subjects)` y un módulo de paleta de tema separados de `MapTab.tsx` — de forma incremental, sin necesidad de un refactor único de gran alcance.

### TD-RNF009 — `catch (e: any)` repetido en vez de `unknown` con narrowing

- **Tipo:** No funcional (RNF)
- **Archivos afectados:** `SubjectModal.tsx:95`, `GradesModal.tsx:85`, `NoteModal.tsx:42,55`, `GradePromptModal.tsx:46`, `TaskModal.tsx:41`, `Auth.tsx:46`, `Subjects.tsx:29`, `Tasks.tsx:62`, `src/pages/Dashboard.tsx:85` (`renderTask = (t: any) => ...`)
- **Descripción:** el patrón `catch (e: any) { alert(e?.message) }`/`catch (error: any)` se repite de forma idéntica en 5 modales y 3 páginas; por separado, `Dashboard.tsx:85` tipa el parámetro de `renderTask` como `any` pese a que `Task` ya está definido en `shared/types`. Detectado en auditoría 2026-08-12.
- **Riesgo:** tipado débil disperso y duplicado en más de 8 puntos del repo; bajo impacto individual, pero refuerza la falta de un patrón común de manejo de errores.
- **Recomendación:** introducir un helper `getErrorMessage(e: unknown): string` en `shared/lib/` y usarlo en los `catch` en vez de `any`; tipar `renderTask` como `(t: Task) => ...`.

### TD-RNF011 — Arrays de días de la semana duplicados y levemente distintos entre `Dashboard`, `Schedule` y `shared/lib/utils`

- **Tipo:** No funcional (RNF)
- **Archivos afectados:** `src/pages/Dashboard.tsx:37` (`DAYS`, 7 días incluyendo Domingo/Sábado), `src/pages/Schedule.tsx:6` (`DAYS`/`DSHORT`, 6 días sin Domingo), `src/shared/lib/utils.ts:10-14` (`todayDay`, tercer array inline)
- **Descripción:** tres fuentes de verdad ligeramente distintas para los mismos nombres de día, cada una con su propio orden/alcance según el uso puntual del archivo que la define. Detectado en auditoría 2026-08-12.
- **Riesgo:** cualquier cambio futuro en el formato de nombres de día (abreviaturas, agregar/quitar Domingo del horario) requiere tocar tres lugares distintos, con riesgo de que queden inconsistentes entre sí.
- **Recomendación:** centralizar en una única constante en `shared/lib/` (o `shared/types/`) de la que las tres ubicaciones importen, ajustando cada uso al subconjunto de días que necesite.

## Resueltos

### TD-RNF001 — Robo de sesión entre usuarios vía "Compartir Horario" + exportación PDF sin sanitizar

- **Tipo:** No funcional (RNF)
- **Detectado en:** auditoría 2026-08-11 (`src/docs/audits/2026-08-11.md`).
- **Resuelto en:** 2026-08-11.
- **Confirmado que sigue resuelto en:** auditoría 2026-08-12 (`src/docs/audits/2026-08-12.md`) — se verificó que `escapeHtml` (`shared/lib/utils.ts`) sigue aplicado a las 9 interpolaciones dinámicas de `exportPDF` en `Schedule.tsx`, y que `sanitizeSharePayload`/`sanitizeShareScheduleEvent` (`Settings.tsx`) siguen validando el shape completo de un código de horario compartido antes de persistirlo. Sin regresión.
- **Fix:** se agregó `escapeHtml` (`src/shared/lib/utils.ts`) y se aplicó a todo el contenido dinámico interpolado en `exportPDF` (`src/pages/Schedule.tsx`) antes de pasarlo a `win.document.write(...)`: título/materia/tipo de tareas pendientes, nombre/color/horario/aula/tipo de cada bloque de clase y nombre/color de las materias activas. Además, `handleInputCode` (`src/pages/Settings.tsx`) ahora valida el shape completo del código pegado (`sanitizeSharePayload`/`sanitizeShareScheduleEvent`) — día dentro de una lista permitida, horarios con formato `HH:MM`, y todo texto (`professor`, `room`, `type`, `name`, `id`) saneado (sin `<`/`>`, longitud acotada) — antes de persistirlo vía `saveActiveSubject`.

### TD-RF001 — El mapa de correlativas (`MapTab`) etiqueta materias bloqueadas como "Disponible"

- **Tipo:** Funcional (RF)
- **Detectado en:** auditoría 2026-08-11.
- **Resuelto en:** 2026-08-12 (commit `3781937`, otra sesión sobre esta misma rama; verificado en esta auditoría).
- **Fix:** se reemplazó el `switch (s.status)` en `getStatusStyle` de `MapTab.tsx` por `getComputedStatus(s, subjects)`. Se agregaron los casos específicos para `bloqueada` (usando `V.nodeFillBloq`) y `disponible` (usando `V.nodeFillDisp`), unificando la lógica con `GridTab`/`FinalsTab`. Verificado: coincide con la recomendación original del hallazgo.
