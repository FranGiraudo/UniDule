# MEJ-010 — Nombre de perfil editable en Settings

**Estado:** Propuesta
**Categoría:** Producto / UX
**Impacto estimado:** Bajo
**Esfuerzo estimado:** Bajo
**Fecha de creación:** 2026-08-11

## Contexto y motivación

`user_profiles.name` (`supabase/schema.sql:46-52`) se completa una única vez, automáticamente, al registrarse: el trigger `handle_new_user()` (`supabase/schema.sql:151-159`) hace `INSERT INTO public.user_profiles (id, name, career, theme) VALUES (new.id, split_part(new.email, '@', 1), 'Ingeniería en Informática', 'dark')` — es decir, el nombre por defecto es literalmente la parte del email antes del `@`.

`src/pages/Settings.tsx:312-336` (sección "Perfil") muestra ese valor en un `<div className="f-input">` con la misma pinta visual que un input real, pero es de solo lectura — no tiene `onChange` ni ningún botón de guardar cerca. Un `grep` de `user_profiles` en todo `src/` (`AuthProvider.tsx:18`, `Auth.tsx:41`, `Settings.tsx:111`) confirma que la única llamada `.update()` sobre esa tabla en todo el repo es la de `Settings.tsx:111`, y solo toca el campo `theme` — ningún flujo de la app permite cambiar `name` después del registro.

## Objetivo

Desde `/settings`, el usuario puede editar su nombre y guardarlo; el cambio persiste en `user_profiles.name` y el store (`profile.name`) se actualiza sin necesidad de recargar la página — verificado editando el nombre, recargando la app, y confirmando que el nuevo valor sigue ahí (persistió en Supabase, no solo en el estado local).

## Fuera de alcance

- Hacer editable el campo "Carrera" (`profile?.career`, `Settings.tsx:348-361`) — ese campo está más ligado a `plan_id`/selección de plan de estudio (ver TD-RF006 en `tech-debt.md`, sobre contenido hardcodeado por plan) y mezclar su edición acá podría pisar esa deuda técnica en vez de resolverla; queda fuera de este plan.
- Validar formato o unicidad del nombre — cualquier string no vacío es válido, mismo criterio laxo que ya usa el resto de la app (ej. `SubjectModal` no valida el nombre de una materia más allá de que no esté vacío).
- Cambiar cómo se genera el nombre por defecto en el signup (`handle_new_user()`) — esta mejora solo agrega la posibilidad de cambiarlo después, no toca el valor inicial.

## Riesgos y consideraciones

- Toca una tabla de Supabase (`user_profiles`) pero solo agrega un `.update()` de un campo de texto sobre una fila que el usuario ya controla vía RLS (`"Users can manage their own profile" ON user_profiles FOR ALL USING (auth.uid() = id)`, `supabase/schema.sql:140`) — mismo patrón que el `.update({ theme: newTheme })` que `Settings.tsx:111` ya hace hoy sin controversia. No es un cambio de schema ni de política RLS, así que no aplica el protocolo de confirmación previa de AGENTS.md para cambios de Supabase.
- No toca `AuthProvider` ni el flujo de sesión — `profile` se sigue seteando en el store igual que hoy, esta mejora solo agrega una vía adicional para actualizarlo.

## Rama sugerida

`feature/mej-010-nombre-perfil-editable`

## Plan por etapas

### Etapa 1 — Campo de nombre editable con guardado

- **Objetivo:** Reemplazar el `<div>` de solo lectura por un input controlado que persiste el cambio en Supabase.
- **Pasos:**
  1. En `src/pages/Settings.tsx`, agregar estado local para el nombre, inicializado desde el store:
     ```ts
     const [nameValue, setNameValue] = useState(profile?.name || '');
     ```
     Ubicarlo junto a los demás `useState` del componente (cerca de `showSim`/`toast`, línea 97-99).
  2. Agregar una función `handleNameSave`, definida junto a `handleThemeChange` (línea 108-113):
     ```ts
     const handleNameSave = async () => {
       const trimmed = nameValue.trim();
       if (!session || !profile || trimmed === (profile.name || '')) return;
       const { error } = await supabase
         .from('user_profiles')
         .update({ name: trimmed })
         .eq('id', session.user.id);
       if (error) {
         showToast('No se pudo guardar el nombre.', 'error');
         return;
       }
       setProfile({ ...profile, name: trimmed });
       showToast('Nombre actualizado.');
     };
     ```
     Esto requiere agregar `setProfile` a la desestructuración de `useStore()` en la línea 96 (hoy es `const { session, profile, theme, setTheme, career, tasks } = useStore();` → agregar `setProfile`).
  3. Reemplazar el `<div>` de solo lectura del campo "Nombre" (`Settings.tsx:325-336`) por un `<input>` controlado, manteniendo los mismos estilos inline que ya tiene ese `<div>` (mismo `padding`, `background`, `borderRadius`, `color`) para no introducir un cambio visual, y guardando `onBlur` (no hace falta un botón "Guardar" aparte — mismo patrón sin-botón que ya usa `handleThemeChange`, que guarda directo en el `onChange` del `<select>` de tema):
     ```tsx
     <input
       type="text"
       className="f-input"
       value={nameValue}
       onChange={(e) => setNameValue(e.target.value)}
       onBlur={handleNameSave}
       placeholder="Tu nombre"
       style={{
         width: '100%',
         padding: '0.75rem',
         background: 'var(--bg)',
         borderRadius: '8px',
         color: 'var(--text)',
         border: 'none',
         outline: 'none',
         fontFamily: 'inherit',
         fontSize: 'inherit',
       }}
     />
     ```
- **Archivos:** `src/pages/Settings.tsx` (modificar)
- **Verificación (Definition of Done):**
  - `npx tsc -b` sin errores nuevos.
  - `npm run lint` sin errores nuevos.
  - QA manual: en `/settings`, cambiar el texto del campo "Nombre", hacer clic afuera del input (blur) — debe aparecer el toast "Nombre actualizado." y el valor debe quedar guardado. Recargar la página completa (`F5`) y confirmar que el nombre nuevo persiste (no volvió al valor anterior/al prefijo del email). Dejar el campo con el mismo valor que ya tenía y hacer blur — no debe dispararse ningún request ni toast (cubierto por el chequeo `trimmed === (profile.name || '')` del paso 2).

## Cierre

Al completar la etapa: generar el reporte en `src/docs/reports/<YYYY-MM-DD>-mej-010-nombre-perfil-editable.md` según AGENTS.md § "Reportes de Implementación", y actualizar el **Estado** de este ítem a `Completada` tanto acá como en `src/docs/improvements/mejoras.md`.
