---
name: audit
description: "Audita el código de UniDule (React 19 + TypeScript + Vite + Supabase + Zustand) en busca de deuda técnica: bugs y lógica incorrecta en las features (career, subjects, tasks, schedule, dashboard, auth, settings), código duplicado, tipos `any`, malas prácticas de React, problemas de seguridad/accesibilidad/performance e inconsistencias con las convenciones del repo (CLAUDE.md/AGENTS.md, ESLint, Prettier). Genera un reporte de auditoría fechado en src/docs/audits/ y consolida todos los hallazgos en src/docs/technical-debt/tech-debt.md, con IDs TD-RFxxx para deuda funcional (ligada a una feature/página concreta) y TD-RNFxxx para deuda no funcional (cross-cutting: seguridad, performance, tipado, accesibilidad, mantenibilidad), cada uno con severidad Crítica/Alta/Media/Baja, descripción, riesgo y recomendación. Usar esta skill siempre que el usuario pida auditar el código, revisar deuda técnica, hacer un 'code audit', evaluar la calidad/mantenibilidad del código, o pida un '/audit', aunque no use esas palabras exactas (ej: 'revisá si tenemos código sucio', 'qué tan mal está el código', 'necesito un informe de calidad'). Es una skill de análisis y documentación — NO modifica ni refactoriza código."
---

# Audit — Auditoría de UniDule

Analiza el código de UniDule y documenta la deuda técnica encontrada — sin tocar el código en sí. El objetivo es dejar un rastro escrito y accionable que el equipo (o una sesión futura de Claude/Antigravity) pueda usar para priorizar y ejecutar el trabajo de refactor más adelante.

Esta skill genera documentos, nunca aplica cambios de código. Si el usuario quiere que además se implemente alguna solución, eso es un pedido separado y explícito — no lo hagas como parte de este flujo.

Todos los ítems de deuda técnica viven en **un solo archivo**, `src/docs/technical-debt/tech-debt.md`. No generes un archivo por hallazgo ni una carpeta separada de "soluciones" — la recomendación de cómo resolver cada ítem va integrada en su propia entrada, como una viñeta más.

## RF vs RNF — cómo clasificar cada hallazgo

Cada ítem de deuda técnica es **o RF o RNF**, nunca ambos. Usá este criterio:

- **RF (Requerimiento Funcional) → `TD-RFxxx`**: el problema está atado al comportamiento concreto de una feature o página — la lógica está mal, un caso de uso no se cubre, un flujo se rompe, un estado queda inconsistente. Ejemplos: una modal de `SubjectDetailModal` no valida un campo requerido, el cálculo de promedio en `stats.ts` da mal en un caso borde, `useDataSync` deja datos stale entre `Career` y `Subjects`, una ruta no contempla un estado de carga/error.
- **RNF (Requerimiento No Funcional) → `TD-RNFxxx`**: el problema es transversal — no depende de una regla de negocio puntual sino de calidad, seguridad, performance, accesibilidad o mantenibilidad del código en general. Ejemplos: uso de `any`, componente de 500+ líneas mezclando responsabilidades, query a Supabase sin manejo de error, falta de `aria-label` en botones icon-only, re-renders innecesarios, secreto hardcodeado, ausencia de tests.

Si dudás entre las dos, preguntate: "¿esto rompe una regla de negocio/flujo de usuario concreto (RF), o degrada la calidad/seguridad/mantenibilidad en general (RNF)?".

RF y RNF llevan **numeración correlativa independiente** (`TD-RF001`, `TD-RF002`... por un lado; `TD-RNF001`, `TD-RNF002`... por otro). Los IDs nunca se reutilizan, ni siquiera cuando un ítem se resuelve.

## Cuándo correr esto

Cada corrida es una foto del estado actual del código. Es normal correrla repetidamente a medida que el proyecto avanza — por eso el reporte de auditoría se nombra por fecha, mientras que `tech-debt.md` se actualiza in-place (ver "Manejo de corridas repetidas" más abajo).

## Paso 1 — Preparar carpetas y fecha

Asegurate de que existan estas carpetas (creálas si faltan):

- `src/docs/audits/`
- `src/docs/technical-debt/`

Obtené la fecha de hoy en formato `YYYY-MM-DD` (por ejemplo con `date +%F`). El reporte de esta corrida va a ser `src/docs/audits/YYYY-MM-DD.md`. Si ya existe un archivo para la fecha de hoy, sobreescribilo — es la auditoría más reciente del día, no tiene sentido acumular varias por día.

## Paso 2 — Analizar el código

Leé el código real, no asumas nada por el nombre de los archivos. Recorré al menos:

- `src/features/career/` (components + lib)
- `src/features/subjects/` (components + lib)
- `src/features/tasks/` (components + lib)
- `src/pages/` (Auth, Career, Dashboard, Schedule, Settings, Subjects, Tasks)
- `src/shared/` (components/layout, context, hooks, lib, store, types)
- `src/App.tsx`, `src/main.tsx`

Para cada archivo, buscá específicamente:

### Deuda funcional (RF)

1. **Lógica incorrecta o incompleta** en una feature/página puntual — cálculos (promedios, estadísticas en `stats.ts`/`StatsTab`), condiciones de negocio (correlatividades, cupos, fechas límite), casos borde no contemplados.
2. **Validaciones faltantes o rotas** en formularios/modales (`SubjectModal`, `TaskModal`, `GradesModal`, `NoteModal`, `SeminarModal`, `PlanSimulationModal`, etc.): campos requeridos, rangos numéricos, fechas inválidas.
3. **Inconsistencia de estado entre features** — por ejemplo datos que deberían sincronizarse entre `career`, `subjects` y `tasks` vía `useDataSync`/store y no lo hacen, o quedan desactualizados tras una mutación.
4. **Capa de API por feature** (`lib/api.ts` de cada feature) — llamadas a Supabase que no reflejan el flujo esperado, respuestas no manejadas, condiciones de carrera entre fetch y mutación.
5. **Navegación/routing** (`App.tsx`, páginas) — rutas protegidas mal implementadas, estados de auth no contemplados, redirecciones rotas.

### Deuda no funcional (RNF)

1. **Tipado débil** — uso de `any` (el ESLint del repo ya lo marca como warning, así que priorizá los casos reales, no ruido), `unknown` sin narrowing, props sin tipar, casts inseguros.
2. **Código duplicado** — lógica, JSX o estilos repetidos entre dos o más componentes/features que podrían extraerse a `shared/`.
3. **Componentes u organización de archivos problemática** — archivos que mezclan datos + presentación + lógica de sincronización; como guía aproximada, un componente que supera ~300 líneas vale la pena revisar (el tamaño solo no es el problema, evaluá si mezcla responsabilidades).
4. **Malas prácticas de React** — dependencias de `useEffect` incompletas o mentirosas, efectos evitables, renders innecesarios, keys de listas mal elegidas (índice como key en listas dinámicas), estado derivado guardado en vez de calculado.
5. **Manejo de errores y resiliencia** — llamadas a Supabase (`lib/api.ts`) sin try/catch, promesas sin manejar, falta de estados de loading/error visibles al usuario.
6. **Seguridad** — secretos o keys hardcodeadas fuera de variables de entorno, queries a Supabase que asumen RLS pero no lo verifican, `dangerouslySetInnerHTML`, datos de usuario no sanitizados, tokens en `localStorage` sin consideración de XSS.
7. **Accesibilidad** — botones icon-only sin `aria-label`, falta de roles/semántica, contraste o navegación por teclado rota en modales (`SeminarModal`, `SubjectDetailModal`, etc.).
8. **Performance** — cálculos costosos sin memoizar en componentes que re-renderizan seguido (`StatsTab`, `GridTab`), listas grandes sin virtualización si aplica, imports que inflan el bundle innecesariamente.
9. **Consistencia con convenciones del repo** — desvíos de lo documentado en `CLAUDE.md`/`AGENTS.md`, violaciones que ESLint/Prettier no capturan pero rompen el patrón `features/<name>/{components,lib}` ya establecido, naming inconsistente entre features.
10. **Testing** — ausencia total de tests en el repo; si aplica, marcalo como un único ítem RNF de alcance general en vez de repetirlo por archivo.

No hace falta limitarte a esta lista si encontrás algo claramente problemático que no encaje en ninguna categoría — inclui igual, usando criterio y clasificándolo como RF o RNF según corresponda.

Para cada problema real que encuentres, anotá: archivo(s) afectado(s) con línea aproximada, una descripción concreta (no genérica) de qué está mal, por qué constituye deuda técnica (el riesgo de dejarlo así), si es RF o RNF, y una recomendación concreta de cómo resolverlo.

Sé selectivo: preferí reportar 6-10 problemas reales y bien argumentados antes que 30 nitpicks débiles. La señal importa más que el volumen.

## Paso 3 — Escribir el reporte de auditoría

Guardá en `src/docs/audits/YYYY-MM-DD.md` con esta estructura:

```markdown
# Auditoría de código — YYYY-MM-DD

## Resumen ejecutivo
[2-4 líneas: estado general del código, principales áreas de riesgo]

## Alcance
[Qué carpetas/archivos se revisaron]

## Hallazgos

### 1. [Título corto del hallazgo]
- **Tipo**: RF / RNF
- **Severidad**: Crítica / Alta / Media / Baja
- **Archivos**: `src/features/subjects/components/SubjectModal.tsx:42`
- **Descripción**: [qué está mal, concretamente]
- **Por qué es deuda técnica**: [costo de no arreglarlo]
- **Ítem relacionado**: `src/docs/technical-debt/tech-debt.md#td-rf001` (o `#td-rnf001`)

[... un bloque por hallazgo ...]

## Métricas rápidas
- Ítems de deuda técnica encontrados: N
- Funcionales (RF): X · No funcionales (RNF): Y
- Severidad crítica: K · alta: A · media: B · baja: C
```

## Paso 4 — Consolidar en `src/docs/technical-debt/tech-debt.md`

Un único archivo, agrupado por severidad, con este formato:

```markdown
# Deuda Técnica — UniDule

**Última actualización:** YYYY-MM-DD (auditoría src/docs/audits/YYYY-MM-DD.md)

---

## Crítica

### TD-RNF001 — [Título corto y descriptivo]

- **Tipo:** No funcional (RNF)
- **Archivos afectados:** `ruta/al/archivo.tsx:línea`
- **Descripción:** [Qué está mal, con referencias concretas al código.]
- **Riesgo:** [Qué pasa si se deja sin resolver]
- **Recomendación:** [Cómo resolverlo]

## Alta

### TD-RF001 — [Título corto y descriptivo]

- **Tipo:** Funcional (RF)
- **Archivos afectados:** `ruta/al/archivo.tsx:línea`, `ruta/otro.tsx:línea`
- **Descripción:** [Qué está mal, con referencias concretas al código. Puede incluir en qué auditoría se detectó.]
- **Riesgo:** [Qué pasa si se deja sin resolver — costo concreto, no genérico]
- **Recomendación:** [Cómo resolverlo — 2-4 líneas concretas y accionables, no un plan de proyecto completo]

### TD-RNF002 — [Título]
- **Tipo:** No funcional (RNF)
[... mismos campos ...]

## Media

### TD-RF002 — [Título]
[... mismos campos ...]

## Baja

### TD-RNF003 — [Título]
[... mismos campos ...]
```

Reglas para los IDs y el contenido:

- `TD-RFxxx` y `TD-RNFxxx` son dos secuencias correlativas **independientes** entre sí y **nunca se reutilizan**, incluso si un ítem se resuelve y se borra de la lista de pendientes — así una referencia vieja a "TD-RF003" en un commit o PR sigue siendo inequívoca. La severidad (Crítica/Alta/Media/Baja) es un atributo del ítem, no afecta a qué secuencia pertenece.
- Agrupá los ítems bajo `## Crítica`, `## Alta`, `## Media`, `## Baja` en ese orden (RF y RNF pueden mezclarse dentro de la misma sección de severidad); si una severidad no tiene ítems, omití esa sección.
- **Crítica** se reserva para deuda con riesgo inmediato y severo si no se atiende pronto: vulnerabilidades de seguridad explotables (auth bypass, exposición de datos de otros usuarios vía RLS mal configurada, secretos expuestos), pérdida o corrupción de datos, o un flujo core completamente roto en producción. No uses Crítica para deuda que simplemente "molesta" o "sería bueno arreglar pronto" — eso es Alta.
- La **Recomendación** reemplaza lo que en otros flujos sería un documento de solución aparte: tiene que ser concreta y accionable (qué archivo tocar, qué extraer, qué patrón aplicar), pero no hace falta un paso a paso exhaustivo ni un archivo dedicado.
- Si dos hallazgos comparten la misma causa raíz, agrupalos en un solo ítem en vez de fragmentar artificialmente en dos IDs.

## Manejo de corridas repetidas

`src/docs/technical-debt/tech-debt.md` se edita in-place, no se regenera desde cero:

- **Ítems que siguen vigentes**: dejalos como están (mismo ID), salvo que haya info nueva relevante para actualizar la descripción o el riesgo.
- **Ítems nuevos**: agregalos con el siguiente ID correlativo disponible dentro de su secuencia (RF o RNF), en la sección de severidad que corresponda.
- **Ítems resueltos**: no los dejes mezclados con los pendientes. Movelos a una sección `## Resueltos` al final del mismo archivo (no crees un archivo separado), con una línea breve indicando en qué auditoría se detectó y en cuál se confirmó resuelto. Mantené el mismo `TD-RFxxx`/`TD-RNFxxx` para que la referencia histórica no se pierda.
- Si no existe todavía `src/docs/technical-debt/tech-debt.md` (primera corrida), creálo desde cero con esta estructura.

## Paso 5 — Resumen final

Al terminar, respondé al usuario con un resumen breve (no repitas todo el contenido de los documentos):

- Cantidad de ítems de deuda técnica abiertos, desglosados por RF/RNF y por severidad, y cuántos se movieron a "Resueltos" en esta corrida si aplica
- Ruta del reporte de auditoría generado
- Ruta de `src/docs/technical-debt/tech-debt.md`
