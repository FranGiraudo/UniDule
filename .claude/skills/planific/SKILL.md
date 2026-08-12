---
name: planific
description: "Ejecuta, en etapas y modificando código real, un plan de mejora que la skill `improve` ya dejó documentado en src/docs/improvements/MEJ-xxx-<slug>.md. A diferencia de `improve` (que solo planifica, nunca toca código) y `audit` (que solo audita), `planific` SÍ implementa: recorre el plan etapa por etapa, corre la verificación de cada una (tsc, lint, tests, y pide confirmación de los pasos de QA manual que no se pueden automatizar), y crea una rama de Git dedicada cuando una etapa es grande (toca más de 3 archivos, crea un módulo/feature nuevo) o de riesgo (toca auth, permisos, schema/RLS de Supabase, o contratos de datos compartidos entre features) — mismos criterios que ya define AGENTS.md — pidiendo confirmación explícita del usuario antes de tocar código en esas etapas. Las etapas chicas y sin riesgo se aplican directo sobre la rama general de la mejora. Soporta reanudar una mejora que quedó a mitad de ejecución. Usar esta skill cuando el usuario pida implementar, ejecutar, arrancar, continuar o retomar una mejora ya planificada (identificándola por su ID MEJ-xxx o por su nombre/slug), o escriba '/planific <mejora>' (ej. '/planific MEJ-001', '/planific code splitting por ruta', '/planific el countdown del dashboard'). No usar para deuda técnica suelta (TD-xxx — eso se resuelve como una tarea puntual normal, no tiene plan por etapas) ni para trabajo que todavía no tiene un plan documentado — en ese caso correr primero `improve`."
---

# Planific — Ejecución por etapas de mejoras planificadas

Toma un plan que la skill `improve` ya dejó escrito en `src/docs/improvements/MEJ-xxx-<slug>.md` y lo **implementa**, etapa por etapa, en el código real. Es la única de las tres skills de gobernanza de mejoras/deuda (`audit`, `improve`, `planific`) que modifica archivos fuente.

El principio central: **cada etapa se ejecuta exactamente como el plan la describe** — `planific` no re-decide diseño que `improve` ya resolvió, no expande el alcance de una etapa aunque encuentre algo mejorable en el camino (ver "Scope Control" de AGENTS.md), y no avanza a la siguiente etapa si la actual no pasa su verificación. Si el plan resulta ambiguo o el código cambió desde que se escribió, la respuesta correcta es preguntarle al usuario, no improvisar.

## Relación con `improve` y `audit`

- `improve` **planifica** (nunca toca código). `planific` **ejecuta** lo que `improve` planificó (sí toca código). No hay superposición: si no existe un plan en `src/docs/improvements/`, no hay nada que `planific` pueda ejecutar — decíselo al usuario y ofrecé correr `improve` primero.
- `audit` registra deuda técnica (`TD-RFxxx`/`TD-RNFxxx`) con una recomendación corta, no un plan por etapas. `planific` no ejecuta ítems de `tech-debt.md` — esos se resuelven como una tarea puntual normal, con su propio flujo QA de AGENTS.md, no con esta skill.

## Paso 1 — Resolver qué mejora ejecutar

1. Leé `src/docs/improvements/mejoras.md`. Buscá, entre los ítems de `## Propuestas`, el que coincida con lo que pidió el usuario — por ID exacto (`MEJ-001`), por coincidencia parcial de slug, o por similitud de título/resumen si el usuario describió la mejora en palabras.
2. Si hay una sola coincidencia clara, seguí con ella.
3. Si hay cero coincidencias o más de una plausible, **no adivines** — usá `AskUserQuestion` (o listá las opciones y pedí que elija) antes de tocar nada.
4. Si el ítem que pidió el usuario está en `## Completadas`, avisale que ya se completó (con la fecha y el link al reporte) y preguntale si de verdad quiere volver a ejecutarla (ej. por una regresión) antes de continuar. Si está en `## Descartadas`, avisale por qué se descartó y esperá confirmación explícita antes de seguir.
5. Con el ID resuelto, leé el plan completo: `src/docs/improvements/MEJ-xxx-<slug>.md`.

## Paso 2 — Preparar el terreno de Git

1. Corré `git status`. Si hay cambios sin commitear que no son de esta ejecución, seguí el protocolo estándar del sistema: no los descartes ni los pises — preguntale al usuario si quiere que los comitees, los guardes en un stash, o si son parte de lo que ya está haciendo (en cuyo caso podés continuar sobre lo que hay).
2. Identificá la rama base: `develop` (ver AGENTS.md § "Estructura de ramas" — toda rama nueva sale de `develop`, nunca de `main`). Si `develop` no existe localmente pero sí en el remoto, creá el tracking branch (`git checkout -b develop origin/develop`) antes de seguir.
3. Leé la línea **"Rama sugerida"** del plan (ej. `` `feature/mej-001-code-splitting-rutas` ``) — esa es la rama general de la mejora, donde van a vivir las etapas chicas y donde se van a mergear las ramas de las etapas grandes/de riesgo.
4. Resolución de la rama del plan:
   - Si ya existe localmente (una ejecución anterior de `planific` la dejó a mitad de camino) → hacé checkout, no la recrees. Seguí al Paso 3 y detectá ahí qué etapas ya están marcadas como completadas dentro del `.md` del plan (ver Paso 3, punto 6) para saber por dónde continuar.
   - Si no existe → creála desde `develop`: `git checkout -b <rama-del-plan> develop`.

## Paso 3 — Ejecutar cada etapa, en orden

Recorré las secciones `### Etapa N — <Título>` del plan en orden. Para cada una que no esté ya marcada como completada (ver punto 6):

1. **Mostrale al usuario qué etapa vas a ejecutar** antes de tocar nada: su "Objetivo" y sus "Pasos", tal como están en el plan.

2. **Clasificá la etapa** con estos criterios, en este orden:
   - Si el texto de la etapa ya contiene la frase **"punto de confirmación obligatoria"** (así es como `improve` marca en el plan las etapas que tocan auth, permisos, o schema/RLS/contratos de datos compartidos) → es de **riesgo**. No hace falta re-derivarlo.
   - Si no lo dice explícitamente pero la etapa toca `AuthProvider`/sesión, permisos, cualquier tabla o política RLS de Supabase, o un tipo/contrato en `shared/types` o un `lib/api.ts` consumido por más de una feature → también es de **riesgo** (mismos criterios que AGENTS.md § "Protocolo de seguridad antes de cambios riesgosos").
   - Si la sección "Archivos" de la etapa lista más de 3 archivos, o sus "Pasos" crean un módulo/feature folder nuevo → es **grande** (mismo umbral que AGENTS.md § "Protocolo antes de implementar funcionalidades grandes": "cambios en más de 3 archivos existentes").
   - Si no aplica ninguna de las dos → es **chica**.

3. **Si es grande o de riesgo**, creá una rama propia para esa etapa desde la rama del plan:
   ```
   git checkout -b <feature|fix>/mej-xxx-etapa-N-<slug-corto-de-la-etapa> <rama-del-plan>
   ```
   El tipo (`feature/`/`fix/`) sale del mismo tipo que usa la rama general del plan. El `<slug-corto-de-la-etapa>` es kebab-case de las 3-5 palabras más significativas del título de la etapa (sin artículos/conectores, sin tildes).

   Si además es de **riesgo**: **detenete antes de escribir una sola línea de código.** Explicále al usuario, en concreto, qué se va a tocar y qué podría romperse (tomalo de la sección "Riesgos y consideraciones" del plan), y esperá confirmación explícita — igual que exige AGENTS.md § "Protocolo de seguridad antes de cambios riesgosos". Si la etapa involucra `apply_migration`, `execute_sql` de escritura, o cambios de política RLS, proponé el SQL/migración exacto y esperá esa confirmación aparte, según AGENTS.md § "Supabase como backend" — no lo ejecutes con la sola confirmación de "dale, seguí con la etapa".

   **Si es chica**, no crees rama — se aplica directo sobre la rama del plan (la del Paso 2).

4. **Ejecutá los "Pasos" de la etapa tal como están escritos.** No agregues pasos, refactors ni mejoras que el plan no pida, aunque los veas al tocar el código — si encontrás deuda técnica nueva en el camino, registrala en `src/docs/technical-debt/tech-debt.md` (mismo criterio de AGENTS.md § "Gestión de Deuda Técnica") y seguí de largo, no la arregles ahí mismo. Si un paso del plan resulta ambiguo, no aplica al estado actual del código, o el código cambió desde que se escribió el plan, **detenete y preguntale al usuario cómo proceder** en vez de asumir o improvisar la decisión.

5. **Corré la "Verificación (Definition of Done)"** de la etapa:
   - Los comandos automatizables (`npx tsc -b`, `npm run lint`, `npm run test:run`, `npm run test:coverage`) corrélos vos directamente.
   - Los pasos de QA manual (abrir tal página, hacer tal click, esperar tal resultado) **no se pueden dar por hechos** — pedíselos al usuario tal como los describe el plan, con instrucciones concretas de qué hacer y qué debería ver, y esperá su confirmación de que el resultado fue el esperado antes de considerar la etapa terminada.
   - Si algo falla (TypeScript, lint, tests, o el usuario reporta que el QA manual no dio el resultado esperado): no avances a la siguiente etapa. Arreglalo dentro del alcance de esa misma etapa. Si no se puede resolver sin salirte del alcance que el plan definió para esa etapa, detenete y consultá al usuario cómo seguir.

6. **Marcá la etapa como completada dentro del archivo del plan** (`MEJ-xxx-<slug>.md`): agregá una línea `**✅ Completada — YYYY-MM-DD**` al final de la sección de esa etapa (después de su "Verificación (Definition of Done)"), sin reescribir ni resumir el resto de la etapa. Esto es lo que permite que una ejecución futura de `/planific` sobre la misma mejora sepa por dónde continuar sin repetir trabajo.

7. **Si la etapa tuvo rama propia**: comiteá los cambios de esa etapa siguiendo las convenciones de commit de AGENTS.md § "Git Commit Conventions" (un commit por etapa está bien; si la etapa generó varios cambios lógicos distintos, varios commits). El merge de esa rama de vuelta a la rama del plan **requiere confirmación explícita del usuario** antes de ejecutarse (no es un `git push`, pero sí cambia el estado de una rama compartida — mismo criterio de cautela que "Executing actions with care" del sistema). Después de confirmar, hacé el merge (`git merge --no-ff <rama-de-la-etapa>` desde la rama del plan, para dejar rastro claro de que esa etapa vivió en su propia rama) y quedate parado en la rama del plan para la siguiente etapa.

## Paso 4 — Cierre

Cuando ya no queden etapas sin marcar como completadas:

1. Seguí la sección **"Cierre"** del propio plan: generá el reporte en `src/docs/reports/<YYYY-MM-DD>-<slug>.md` según AGENTS.md § "Reportes de Implementación" (objetivo, archivos modificados/creados/eliminados, riesgos detectados, tests agregados, estado de TypeScript/ESLint/Vitest, próximos pasos).
2. Actualizá el **Estado** a `Completada` tanto en `MEJ-xxx-<slug>.md` como en `src/docs/improvements/mejoras.md` — movés la entrada del índice de `## Propuestas` a `## Completadas`, agregando la fecha y el link al reporte recién generado (mismo formato que ya usa `improve` § "Manejo de corridas repetidas").
3. Emití el bloque `REPORTE_INICIO ... REPORTE_FIN` obligatorio de AGENTS.md § "Reporte Final Obligatorio" — `planific` modifica código, así que este bloque nunca se omite.
4. Preguntale al usuario si quiere que hagas `git push` de la rama del plan y/o que abras el PR hacia `develop` — no lo hagas de forma automática; son acciones visibles para otros y requieren confirmación explícita antes de ejecutarse, sin importar que ya haya confirmado los merges de etapas individuales.

## Reanudar una ejecución parcial

Si el usuario vuelve a pedir `/planific` sobre una mejora que ya tiene rama y algunas etapas marcadas como `✅ Completada` en su `.md`: hacé checkout de la rama del plan (no la recrees), saltate las etapas ya marcadas, y seguí desde la primera etapa sin marcar. No vuelvas a pedir confirmación por etapas de riesgo que ya se ejecutaron y están marcadas como completadas.

## Qué hacer si el plan mismo parece estar mal

Si al ejecutar una etapa notás que el plan asume algo que ya no es cierto (un archivo que ya no existe, una función que cambió de firma, una decisión de diseño que quedó obsoleta), no lo "arregles" en silencio ni sigas adelante con tu propio criterio — parate, explicále al usuario la discrepancia concreta entre lo que el plan asume y lo que el código real tiene hoy, y preguntale cómo quiere resolverlo (ajustar el plan, saltear la etapa, u otra cosa). El plan es un documento vivo del proyecto (`src/docs/improvements/`) — si se ajusta, el ajuste queda escrito ahí, no solo en esta conversación.
