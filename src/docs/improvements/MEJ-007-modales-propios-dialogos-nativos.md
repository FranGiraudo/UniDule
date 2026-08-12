# MEJ-007 — Reemplazar `confirm()`/`prompt()` nativos por modales propios en Settings

**Estado:** Propuesta
**Categoría:** Producto / UX
**Impacto estimado:** Medio
**Esfuerzo estimado:** Medio
**Fecha de creación:** 2026-08-11

## Contexto y motivación

`src/pages/Settings.tsx` usa dos diálogos nativos del navegador en medio de una app que ya construyó su propio sistema de modales y de feedback:

- `Settings.tsx:136-140` — `confirm(...)` antes de importar un backup JSON, con el texto interpolado directamente (`Se cargarán ${subjectsIn.length} materia(s)...`).
- `Settings.tsx:237` — `prompt(...)` para que el usuario pegue el código de "Compartir Horario".

El repo ya tiene 4 modales propios con estilos consistentes (`NoteModal.tsx`, `SubjectModal.tsx`, `GradesModal.tsx`, `PlanSimulationModal.tsx`) y un sistema de toast ya implementado en el propio `Settings.tsx:103-106` (`showToast`). Los diálogos nativos no heredan el tema activo (`ThemeProvider`), no se pueden estilizar, y en el caso puntual del `prompt()` de compartir horario, el usuario pega un código a ciegas en una caja de texto de una línea sin poder ver de antemano si el formato es correcto — recién se entera si es inválido después de confirmar (`Settings.tsx:276-278`, catch genérico "Código inválido").

## Objetivo

Que `Settings.tsx` no contenga ninguna llamada a `confirm()` ni `prompt()` — verificado con `grep -n "confirm(\|prompt(" src/pages/Settings.tsx` devolviendo cero resultados — y que ambos flujos (importar backup, ingresar código de horario) usen modales propios con la misma paleta de colores/tipografía que el resto de la app.

## Fuera de alcance

- Cambiar la lógica de negocio de `handleFileChange`, `handleInputCode`, `sanitizeSharePayload` o cualquier función de validación/sanitización existente — esta mejora es puramente de presentación, mueve la interacción del navegador nativo a un modal propio sin tocar qué datos se validan o cómo.
- Rediseñar el flujo de importación/exportación en sí (ej. agregar preview de qué materias se van a sobrescribir antes de confirmar) — es una mejora de producto más grande, fuera de este plan puntual.
- Tocar los otros 4 modales existentes (`NoteModal`, `SubjectModal`, `GradesModal`, `PlanSimulationModal`) — se usan como referencia de estilo, no se modifican.

## Riesgos y consideraciones

- No toca autenticación, permisos, schema de Supabase ni contratos de datos compartidos entre features — no aplica el protocolo de confirmación previa de AGENTS.md.
- `handleFileChange` (`Settings.tsx:123-179`) depende de que el `confirm()` bloquee la ejecución de forma síncrona antes de continuar con el `for` loop de importación — al reemplazarlo por un modal (que es asíncrono/basado en estado), la función tiene que reestructurarse para esperar la confirmación del usuario antes de disparar el loop de `saveActiveSubject`/`saveTask`. Esto se resuelve en la Etapa 1 separando "leer y parsear el archivo" de "confirmar y ejecutar la importación" en dos pasos de estado explícitos.

## Rama sugerida

`feature/mej-007-modales-nativos-a-propios`

## Plan por etapas

### Etapa 1 — Reemplazar el `confirm()` de importación por un modal de confirmación

- **Objetivo:** Que el flujo de "Importar desde JSON" muestre un modal propio en vez de `confirm()`, sin cambiar qué se importa ni cómo se valida.
- **Pasos:**
  1. En `src/pages/Settings.tsx`, agregar un estado nuevo: `const [importPending, setImportPending] = useState<{ subjects: any[]; tasks: any[] } | null>(null);` (usar los mismos tipos laxos que ya usa el parseo existente en `handleFileChange`, líneas 130-133, no introducir tipos nuevos).
  2. Dividir `handleFileChange` (líneas 123-179) en dos funciones:
     - `handleFileChange` (el `reader.onload`) deja de llamar a `confirm(...)` y en su lugar, tras parsear y validar que `subjectsIn.length || tasksIn.length`, hace `setImportPending({ subjects: subjectsIn, tasks: tasksIn })` y termina ahí (sin ejecutar el `for` loop todavía).
     - Una función nueva `confirmImport` contiene el `for` loop de `saveActiveSubject`/`syncGrades`/`saveTask` (el cuerpo que hoy está después del `confirm(...)`, líneas 142-172), lee de `importPending`, y al final hace `setImportPending(null)` y `showToast('Datos importados correctamente.')`. Si falla, mantiene el mismo `catch` que hoy muestra `'El archivo no es un backup válido.'` vía `showToast(..., 'error')`.
  3. Crear el modal inline dentro del JSX de retorno de `Settings` (no un archivo nuevo — es un modal de una sola confirmación, de 2 botones, específico de esta página; seguir el patrón visual de overlay + card que usan los modales existentes, ej. `PlanSimulationModal.tsx`, reutilizando las clases CSS que ese componente ya usa para el overlay/card en vez de definir estilos nuevos):
     ```tsx
     {importPending && (
       <div className="modal-overlay" onClick={() => setImportPending(null)}>
         <div className="modal-content" onClick={(e) => e.stopPropagation()}>
           <h3>Confirmar importación</h3>
           <p>
             Se cargarán {importPending.subjects.length} materia(s) y {importPending.tasks.length}{' '}
             tarea(s). Esto sobrescribirá tus datos actuales para esas materias/tareas.
           </p>
           <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
             <button className="btn btn-ghost" onClick={() => setImportPending(null)}>
               Cancelar
             </button>
             <button className="btn btn-primary" onClick={confirmImport}>
               Importar
             </button>
           </div>
         </div>
       </div>
     )}
     ```
     Antes de escribir este bloque, verificar en `PlanSimulationModal.tsx` los nombres exactos de clase que usa para su overlay/card (`modal-overlay`/`modal-content` son un placeholder de este plan — si `PlanSimulationModal.tsx` usa otros nombres de clase, usar esos mismos, no inventar clases nuevas).
- **Archivos:** `src/pages/Settings.tsx` (modificar)
- **Verificación (Definition of Done):**
  - `npx tsc -b` sin errores.
  - `npm run lint` sin errores nuevos.
  - QA manual: en `/settings`, hacer clic en "Importar desde JSON", elegir un archivo con el shape esperado (`{ subjects: [...], tasks: [...] }`) — debe aparecer el modal propio (no el `confirm()` nativo) con el conteo correcto; "Cancelar" cierra el modal sin cambios; "Importar" ejecuta la importación y muestra el toast de éxito, igual que antes del cambio.

### Etapa 2 — Reemplazar el `prompt()` de "Ingresar Código" por un modal con textarea

- **Objetivo:** Que el flujo de "Ingresar Código" (compartir horario) use un modal propio con un campo de texto, en vez de `prompt()`.
- **Pasos:**
  1. En `src/pages/Settings.tsx`, agregar `const [showCodeInput, setShowCodeInput] = useState(false);` y `const [codeValue, setCodeValue] = useState('');`.
  2. Cambiar el botón "Ingresar Código" (línea 469-471) para que en vez de llamar a `handleInputCode` directamente, haga `setShowCodeInput(true)`.
  3. Renombrar la lógica actual de `handleInputCode` (líneas 236-279) a una función `processShareCode(code: string)` que reciba el código como parámetro en vez de llamarlo internamente con `prompt(...)` — el resto de su cuerpo (decodificar, `sanitizeSharePayload`, el loop de `saveActiveSubject`, el `showToast` de resultado) no cambia.
  4. Agregar un modal inline (mismo patrón visual que la Etapa 1) con un `<textarea>` controlado por `codeValue`, y un botón "Importar Horario" que llama a `processShareCode(codeValue)` y luego `setShowCodeInput(false); setCodeValue('');`. Un botón "Cancelar" cierra el modal sin ejecutar nada.
- **Archivos:** `src/pages/Settings.tsx` (modificar)
- **Verificación (Definition o Done):**
  - `npx tsc -b` sin errores.
  - `npm run lint` sin errores nuevos.
  - QA manual: en `/settings`, hacer clic en "Ingresar Código" — debe aparecer el modal propio con un textarea (no el `prompt()` nativo); pegar un código válido generado previamente con "Generar Código" desde la misma sesión (o de otra) debe importar los horarios igual que antes; pegar un código inválido debe mostrar el mismo toast de error que ya existe (`'Código inválido. Asegurate de copiarlo completo.'`).
  - `grep -n "confirm(\|prompt(" src/pages/Settings.tsx` devuelve cero resultados.

## Cierre

Al completar ambas etapas: generar el reporte en `src/docs/reports/<YYYY-MM-DD>-mej-007-modales-propios-dialogos-nativos.md` según AGENTS.md § "Reportes de Implementación", y actualizar el **Estado** de este ítem a `Completada` tanto acá como en `src/docs/improvements/mejoras.md`.
