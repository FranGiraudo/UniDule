# MEJ-013 — `allowsPromotion` se guarda en 8 puntos del código y no se muestra en ninguno

**Estado:** Propuesta
**Categoría:** Producto / UX
**Impacto estimado:** Medio
**Esfuerzo estimado:** Bajo
**Fecha de creación:** 2026-08-11

## Contexto y motivación

`allowsPromotion` (si una materia "cursando" habilita promoción directa, sin rendir final) es un dato que la app captura, persiste y transporta de punta a punta, pero que **nunca se le muestra al usuario** después de cargarlo:

- `supabase/schema.sql` → `user_active_subjects.allows_promotion BOOLEAN DEFAULT false`.
- `src/shared/types/index.ts:38` — `Subject.allowsPromotion?: boolean`.
- `src/features/subjects/lib/api.ts:24,44,63,91` — `ActiveSubjectInput.allowsPromotion`, se escribe en `saveActiveSubject` (línea 44: `allows_promotion: sub.allowsPromotion || false`) y se limpia al borrar la materia activa (línea 91).
- `src/shared/hooks/useDataSync.ts:116` — `allowsPromotion: !!active?.allows_promotion` se lee de Supabase al cargar la carrera.
- `src/features/subjects/components/GradesModal.tsx:19,47,133-137` — único lugar de la UI donde el usuario puede **cambiarlo**: un checkbox "Habilita promoción" dentro del modal de calificaciones.
- `src/pages/Settings.tsx:153,195,268` — el export/import de backup y el "Ingresar Código" de horario compartido también lo transportan.

Con 8 puntos de código que leen o escriben este campo, hay exactamente **cero** lugares donde se lo muestre después de guardado: no aparece en la tarjeta de la materia en `Subjects.tsx`, ni en las filas de `GridTab`, ni en `SubjectDetailModal`, ni en `StatsTab`. Un usuario que activa el checkbox en `GradesModal` no tiene forma de recordar, mirando el resto de la app, qué materias tiene marcadas con promoción habilitada — tiene que reabrir el modal de cada una para chequearlo.

## Objetivo

- La tarjeta de cada materia en curso (`Subjects.tsx`, vista "Mis Materias") muestra un badge "Promoción" cuando `s.allowsPromotion` es `true` **y** `s.status === 'cursando'` (la promoción es una condición de la cursada activa; una vez que la materia pasa a `aprobada`/`regular`, la promoción ya se resolvió y el badge deja de tener sentido mostrarlo ahí).
- Verificado manualmente: activar el checkbox "Habilita promoción" en `GradesModal` para una materia cursando, guardar, y confirmar que el badge aparece en su tarjeta de `Subjects.tsx` sin recargar la página; desactivarlo y confirmar que desaparece.

## Fuera de alcance

- Agregar el mismo badge en `GridTab`, `SubjectDetailModal` o `StatsTab` — este plan cubre únicamente la tarjeta de `Subjects.tsx`, que es donde el usuario gestiona sus materias en curso día a día. Extender la visibilidad a otras vistas es una iteración aparte si se decide que hace falta.
- Cualquier lógica que use `allowsPromotion` para calcular automáticamente si una materia queda "aprobada" al alcanzar cierta nota — sigue siendo el usuario quien cambia el `status` a mano en `GradesModal`/`SubjectDetailModal`, sin cambios en ese flujo.

## Riesgos y consideraciones

- No toca autenticación, permisos, schema de Supabase ni contratos de datos compartidos — el campo ya existe y ya se sincroniza; no aplica el protocolo de confirmación previa de AGENTS.md.
- El badge debe quedar oculto para materias sin `activeId` (no trackeadas) y para `s.status !== 'cursando'`, para no ensuciar la tarjeta de materias aprobadas/regulares donde el dato ya no es relevante.

## Rama sugerida

`feature/mej-013-mostrar-promocion-habilitada`

## Plan por etapas

### Etapa 1 — Badge "Promoción" en la tarjeta de `Subjects.tsx`

- **Objetivo:** Que `allowsPromotion` sea visible sin tener que abrir `GradesModal`.
- **Pasos:**
  1. En `src/pages/Subjects.tsx`, dentro del bloque que renderiza los badges de código y estado (líneas 129-156, el `<div>` con `display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap'` que contiene el badge de `s.code` y el badge de estado `st.label`), agregar un tercer badge condicional inmediatamente después del badge de estado (después del `</span>` que cierra el badge de `st.label`, línea 155, todavía dentro del mismo `<div>` contenedor):
     ```tsx
     {s.allowsPromotion && s.status === 'cursando' && (
       <span
         style={{
           padding: '2px 8px',
           borderRadius: '5px',
           fontSize: '10px',
           fontWeight: 700,
           background: 'rgba(74,222,128,.15)',
           color: '#4ade80',
         }}
       >
         Promoción
       </span>
     )}
     ```
- **Archivos:** `src/pages/Subjects.tsx` (modificar)
- **Verificación (Definition of Done):**
  - `npx tsc -b` sin errores nuevos.
  - `npm run lint` sin errores nuevos.
  - QA manual:
    1. Abrir `GradesModal` de una materia con estado "Cursando", activar "Habilita promoción", guardar → la tarjeta de esa materia en "Mis Materias" debe mostrar el badge "Promoción" junto al badge de estado.
    2. Reabrir `GradesModal` para la misma materia y desactivar el checkbox, guardar → el badge debe desaparecer de la tarjeta.
    3. Confirmar que una materia con `allowsPromotion = true` pero estado "Aprobada" (cambiar el estado en `SubjectDetailModal`) NO muestra el badge "Promoción" en su tarjeta.

## Cierre

Al completar la etapa: generar el reporte en `src/docs/reports/<YYYY-MM-DD>-mej-013-mostrar-promocion-habilitada.md` según AGENTS.md § "Reportes de Implementación", y actualizar el **Estado** de este ítem a `Completada` tanto acá como en `src/docs/improvements/mejoras.md`.
