---
name: improve
description: "Analiza el código de UniDule (React 19 + TypeScript + Vite + Supabase + Zustand) en busca de mejoras posibles y de sugerencias de funcionalidad nueva — no bugs ni deuda técnica, sino oportunidades de arquitectura, performance, developer experience, testing estratégico, seguridad proactiva, producto/UX sobre código que ya funciona, y funcionalidades que el proyecto todavía no tiene pero que encajan con su dominio y con lo que el código/modelo de datos ya anticipa. Genera un índice general en src/docs/improvements/mejoras.md (ID MEJ-XXX, categoría, impacto, esfuerzo, estado) y, para cada mejora o funcionalidad nueva, un archivo .md separado con una planificación por etapas explícita, determinista y verificable, pensada para que cualquier sesión de IA (o persona) la ejecute sin tener que tomar decisiones de diseño no resueltas — sin sesgo ni ambigüedad. Usar esta skill cuando el usuario pida encontrar mejoras, sugerir funcionalidades nuevas, proponer un roadmap de mejoras o de producto, planificar refactors u optimizaciones futuras, evaluar qué se podría mejorar o agregar al código, o pida un '/improve', aunque no use esas palabras exactas (ej: 'qué mejorarías de esto', 'armá un plan de mejoras', 'qué oportunidades ves en el código', 'qué funcionalidades le faltan a la app'). Es una skill de análisis y planificación — NO modifica ni refactoriza código (para ejecutar un plan ya generado, ver la skill `planific`), y NO es un reemplazo de la skill `audit` (que cubre bugs y deuda técnica)."
---

# Improve — Planificación de mejoras para UniDule

Analiza el código de UniDule y documenta **oportunidades de mejora** — código que funciona pero podría ser mejor — y **sugerencias de funcionalidad nueva** — cosas que la app todavía no hace pero que tienen sentido dado su dominio (gestión académica) y lo que su código/modelo de datos ya anticipa. Para cada una, deja un plan de ejecución tan concreto que una sesión de IA distinta, sin el contexto de esta conversación, pueda seguirlo y llegar al mismo resultado. Esta skill genera documentos, nunca aplica cambios de código. Si el usuario quiere que además se implemente alguna mejora, eso es un pedido separado y explícito — no lo hagas como parte de este flujo; la skill `planific` (`.claude/skills/planific/`) existe exactamente para eso: ejecutar por etapas un plan que `improve` ya dejó documentado.

## `improve` vs. `audit` — no te pises con la otra skill

Ambas skills documentan, ninguna corrige código. La diferencia es el tipo de hallazgo:

- **`audit`** (`.claude/skills/audit/`) → cosas que están **mal**: bugs, lógica incorrecta, inconsistencias con las convenciones del repo, código inseguro. Se registran como `TD-RFxxx`/`TD-RNFxxx` en `src/docs/technical-debt/tech-debt.md`, con una recomendación corta (2-4 líneas).
- **`improve`** (esta skill) → cosas que **funcionan pero podrían ser mejores**: arquitectura que no escala bien a futuro, performance mejorable, developer experience, testing estratégico, endurecimiento de seguridad más allá de vulnerabilidades puntuales, oportunidades de producto/UX visibles en el código. Se registran como `MEJ-XXX` en `src/docs/improvements/`, con un plan de ejecución completo por etapas.

Antes de escribir un hallazgo acá, revisá `src/docs/technical-debt/tech-debt.md`:

- Si el problema es un bug/inconsistencia real → no lo dupliques acá, mencioná al usuario que corresponde a `audit` (o si ya está, citá el `TD-xxx`).
- Si una mejora resuelve de paso un `TD-xxx` existente, anotalo como **Relacionado: TD-xxx** en el plan, pero no borres ni muevas el ítem de `tech-debt.md` vos mismo — eso lo hace la skill `audit` en su propia corrida.

## El principio central: planes sin sesgo

"Sin sesgo" acá significa **determinismo**, no neutralidad de opinión. Un plan mal escrito deja huecos que cada sesión de IA llena distinto ("mejorar la estructura", "optimizar donde haga falta", "usar un nombre razonable"). Un plan bien escrito resuelve esas decisiones de diseño **en el documento mismo**, así dos ejecuciones independientes del mismo plan producen el mismo resultado.

Regla práctica al escribir cada paso de una etapa:

- Nombrá el archivo exacto, la función/componente exacto, el cambio exacto.
- Si hay una decisión de diseño abierta (nombre de una función, forma de un tipo, estructura de carpetas), resolvela vos en el plan — no la dejes "a criterio de quien lo implemente".
- Si un paso depende de un dato que no podés conocer de antemano (ej. el resultado de una query), especificá cómo obtenerlo y qué hacer con cada resultado posible, no solo el caso feliz.
- Preferí instrucciones verificables ("agregar `React.memo` a `StatsTab` y confirmar con el profiler que el re-render de `Dashboard` no lo re-renderiza") sobre aspiracionales ("mejorar el rendimiento de `StatsTab`").

## Cuándo correr esto

A pedido explícito del usuario — no es parte del flujo normal de una tarea puntual (ver "Scope Control" en AGENTS.md: no mezclar mejoras no pedidas con una corrección puntual). Es normal correrla repetidamente a medida que el proyecto avanza; el índice se actualiza in-place (ver "Manejo de corridas repetidas").

## Paso 1 — Preparar carpetas e ID

Asegurate de que exista `src/docs/improvements/` (creála si falta). Si ya existe `src/docs/improvements/mejoras.md`, leelo para saber cuál es el último `MEJ-XXX` usado — los IDs son una única secuencia correlativa, nunca se reutilizan, ni siquiera si una mejora se descarta.

## Paso 2 — Analizar el código

Leé el código real, no asumas nada por el nombre de los archivos. Recorré al menos:

- `src/features/career/`, `src/features/subjects/`, `src/features/tasks/` (components + lib)
- `src/pages/` (Auth, Career, Dashboard, Schedule, Settings, Subjects, Tasks)
- `src/shared/` (components/layout, context, hooks, lib, store, types)
- `src/App.tsx`, `src/main.tsx`, configuración de build (`vite.config.ts`, `tsconfig*.json`, ESLint)

Para cada mejora candidata, buscá específicamente en estas categorías (no es necesario encontrar algo en todas):

1. **Arquitectura / escalabilidad** — patrones que hoy funcionan pero se van a volver dolorosos a medida que crece el proyecto: acoplamiento entre features que debería pasar por una capa compartida, falta de tipos generados desde Supabase (`supabase gen types typescript`) en vez de mapeos manuales, oportunidades de code-splitting por ruta.
2. **Performance** — cálculos costosos sin memoizar en componentes que re-renderizan seguido, listas grandes sin virtualización, imports que inflan el bundle, queries a Supabase que traen más datos de los que se usan.
3. **Developer experience** — scripts o generadores que evitarían trabajo manual repetitivo, reglas de ESLint/Prettier que faltan y ya se ven violadas de forma consistente, configuración de CI ausente.
4. **Testing estratégico** — no "falta cobertura" en general (eso ya lo cubre AGENTS.md § "Cobertura de Testing" con su objetivo progresivo 1%→30%→80%), sino qué módulos concretos son de alto riesgo/alto cambio y se beneficiarían más de tests ahora.
5. **Seguridad proactiva** — hardening que va más allá de arreglar una vulnerabilidad puntual (eso es `audit`): rate limiting, rotación de tokens, CSP, dependencias desactualizadas con CVEs conocidos.
6. **Producto / UX** — oportunidades visibles en el código (no gustos personales de diseño): estados de carga/error faltantes que ya dejan al usuario sin feedback, flujos con pasos manuales que podrían simplificarse, features a medio terminar que podrían completarse.
7. **Sugerencias de funcionalidad nueva** — funcionalidades que UniDule no tiene todavía pero que encajan con lo que la app ya es (gestión académica: materias, tareas, carrera, horario) y con la infraestructura que ya existe. A diferencia de las otras 6 categorías, acá no hay un bug ni una carencia visible que señalar — por eso la evidencia tiene que anclarse en otra cosa concreta: una columna de `supabase/schema.sql` que ya existe pero ningún componente usa, un campo de `shared/types/index.ts` que sugiere una funcionalidad no implementada, o un patrón que la app ya resuelve para una feature y no para otra equivalente. No alcanza con "estaría bueno tener X" sin ese anclaje. Ejemplo del nivel de evidencia esperado: `Grade.weight` (`shared/types/index.ts`) y la columna `user_grades.weight` (`supabase/schema.sql`) ya existen, pero ningún cálculo de promedio en el código (`StatsTab.tsx`, `GradesModal.tsx`) los usa — eso es evidencia concreta de que un "promedio ponderado por evaluación" es una funcionalidad que la propia base de datos ya anticipó, no una idea sin fundamento.

Sé selectivo: 4-8 mejoras/funcionalidades reales y bien argumentadas, con evidencia concreta (archivo:línea) de por qué vale la pena, es mejor que una lista larga de ideas genéricas. Si no encontrás nada que valga la pena en alguna categoría, no la fuerces.

## Paso 3 — Escribir/actualizar el índice general

`src/docs/improvements/mejoras.md`, con esta estructura:

```markdown
# Mejoras Propuestas — UniDule

**Última actualización:** YYYY-MM-DD

---

## Propuestas

### MEJ-001 — [Título corto y descriptivo]

- **Categoría:** Arquitectura / Performance / DX / Testing / Seguridad proactiva / Producto-UX / Nueva Funcionalidad
- **Impacto:** Alto / Medio / Bajo
- **Esfuerzo:** Alto / Medio / Bajo
- **Estado:** Propuesta
- **Resumen:** [2-3 líneas: qué se propone, con referencia concreta a archivo(s)/línea(s), y por qué vale la pena]
- **Relacionado:** TD-RNFxxx (si aplica, si no omitir la línea)
- **Plan:** `src/docs/improvements/MEJ-001-slug-corto.md`

[... un bloque por mejora ...]

## Completadas

_Sin ítems todavía._

## Descartadas

_Sin ítems todavía._
```

- **Impacto** = qué tan grande es el beneficio si se hace. **Esfuerzo** = cuánto trabajo implica. Son ejes independientes — no los confundas con severidad de `audit` (esto no es sobre riesgo de dejarlo sin hacer, ninguna mejora de esta skill es urgente por definición, si lo fuera sería `audit`).
- El slug del archivo de plan va en kebab-case, corto y descriptivo (ej. `MEJ-001-tipos-generados-supabase.md`).

## Paso 4 — Escribir el plan de cada mejora

Un archivo por mejora en `src/docs/improvements/MEJ-XXX-slug-corto.md`, con esta estructura:

```markdown
# MEJ-XXX — [Título]

**Estado:** Propuesta
**Categoría:** [...]
**Impacto estimado:** [...]
**Esfuerzo estimado:** [...]
**Fecha de creación:** YYYY-MM-DD

## Contexto y motivación

[Evidencia concreta en el código — archivo(s)/línea(s) — de la oportunidad. Qué gana el proyecto si se hace. Nada de afirmaciones genéricas sin anclar en el código real. Para sugerencias de funcionalidad nueva (categoría 7 del Paso 2), la evidencia no es "algo que está mal" sino "algo que ya existe y anticipa la funcionalidad" — una columna sin usar, un tipo con un campo sin consumir, un patrón resuelto en una feature y ausente en otra equivalente.]

## Objetivo

[Qué significa "terminado": un criterio de éxito medible y verificable, no una aspiración vaga. Ej: "las 3 queries de useDataSync que traen columnas sin usar pasan a seleccionar solo las columnas consumidas por la UI, verificado comparando el payload de red antes/después", no "mejorar el performance de useDataSync".]

## Fuera de alcance

[Qué se excluye explícitamente de este plan — mejoras relacionadas pero distintas que NO se resuelven acá, para evitar scope creep dentro de la propia mejora.]

## Riesgos y consideraciones

[Qué podría romperse. Si toca schema/RLS de Supabase, `AuthProvider`, o contratos de datos que ya consumen otras features, señalar que aplica el "Protocolo de seguridad antes de cambios riesgosos" de AGENTS.md antes de tocar esa etapa.]

## Rama sugerida

`feature/mej-xxx-slug-corto` o `fix/mej-xxx-slug-corto` según corresponda (ver AGENTS.md § "Estructura de ramas" — el repo solo usa estos dos tipos).

## Plan por etapas

### Etapa 1 — [Título de la etapa]

- **Objetivo:** [acotado — una unidad de trabajo revisable de forma independiente, idealmente sin tocar más de 2-3 archivos]
- **Pasos:**
  1. [instrucción concreta, sin ambigüedad — archivo exacto, cambio exacto]
  2. [...]
- **Archivos:** `ruta/archivo.ts` (crear/modificar/eliminar)
- **Verificación (Definition of Done):** [ej: `npx tsc -b` sin errores nuevos, `npm run lint` sin errores nuevos, `npm run test:run` en verde, y/o pasos de QA manual concretos — qué página abrir, qué hacer, qué resultado esperar]

### Etapa 2 — [Título]

[... mismos campos ...]

[... tantas etapas como haga falta; cada una debe poder mergearse sola sin depender de que las siguientes ya estén hechas, salvo que la dependencia sea inevitable y se explicite]

## Cierre

Al completar todas las etapas: generar el reporte en `src/docs/reports/<YYYY-MM-DD>-mej-xxx-slug-corto.md` según AGENTS.md § "Reportes de Implementación", y actualizar el **Estado** de este ítem a `Completada` tanto acá como en `src/docs/improvements/mejoras.md`.
```

Reglas para las etapas:

- Cada etapa es una unidad de trabajo chica y revisable — alineado con "Scope Control" de AGENTS.md. Si una mejora requiere tocar auth, permisos, schema/RLS de Supabase, o contratos de datos compartidos, marcá esa etapa específica como punto de confirmación obligatoria con el usuario antes de ejecutarla (no todo el plan, solo esa etapa).
- No prescribas más etapas de las necesarias — si la mejora es chica, 1-2 etapas está bien. No infles el plan para que se vea más completo.
- El plan no incluye código escrito de antemano salvo que sea imprescindible para eliminar ambigüedad (ej. la firma exacta de un tipo nuevo); no es una implementación hecha, es una guía para hacerla.

## Manejo de corridas repetidas

`src/docs/improvements/mejoras.md` se edita in-place, no se regenera desde cero:

- **Mejoras que siguen vigentes**: dejalas como están (mismo ID), salvo info nueva relevante.
- **Mejoras nuevas**: agregalas con el siguiente ID correlativo disponible.
- **Mejoras completadas**: movelas a `## Completadas` en el índice (mismo ID, con fecha de completado y link al reporte de `src/docs/reports/`). No borres el archivo de plan individual.
- **Mejoras descartadas**: movelas a `## Descartadas` con una línea breve de por qué (ej. "se evaluó y el costo no justifica el beneficio", "quedó obsoleta por MEJ-00X"). No borres el archivo de plan individual — queda como registro histórico.
- Si no existe todavía `src/docs/improvements/mejoras.md` (primera corrida), creálo desde cero.

## Paso 5 — Resumen final

Al terminar, respondé al usuario con un resumen breve (no repitas todo el contenido de los documentos):

- Cantidad de mejoras propuestas, desglosadas por categoría e impacto.
- Ruta de `src/docs/improvements/mejoras.md`.
- Ruta de cada plan individual generado.
