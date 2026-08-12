# MEJ-006 — Content-Security-Policy en el build de producción

**Estado:** Propuesta
**Categoría:** Seguridad proactiva
**Impacto estimado:** Medio
**Esfuerzo estimado:** Bajo
**Fecha de creación:** 2026-08-11

## Contexto y motivación

`index.html:1-13` no tiene ninguna meta-tag ni cabecera de `Content-Security-Policy`. El repo ya tuvo un XSS real y corregido (TD-RNF001 en `src/docs/technical-debt/tech-debt.md` — robo de sesión vía "Compartir Horario" + exportación PDF sin sanitizar) y tiene uno abierto (TD-RNF002 — `dangerouslySetInnerHTML` sin sanitizar en `src/features/subjects/lib/utils.ts` `parseMd`, renderizado en `Subjects.tsx:405`). Una CSP no reemplaza esos fixes puntuales (que corresponden a `audit`), pero es la capa de defensa que limita el daño de cualquier inyección de script que logre colarse — ya sea por un vector todavía no encontrado, o si TD-RNF002 queda sin resolver por un tiempo.

## Objetivo

Que el HTML servido por `npm run build` + `npm run preview` incluya una meta-tag `Content-Security-Policy` con `script-src 'self'`, y que la app funcione en producción sin ninguna violación de CSP visible en la consola del navegador al recorrer sus 7 páginas — verificado manualmente según la Etapa 2.

## Fuera de alcance

- `frame-ancestors`, `report-uri`/`report-to`, y `sandbox` — estas directivas están explícitamente ignoradas por el spec cuando la CSP se entrega vía `<meta>` (solo funcionan como cabecera HTTP real). Configurarlas requiere el nivel de hosting/CDN del deploy (ej. headers de Vercel/Netlify), que es desconocido en este plan — queda fuera de alcance; si se define el hosting de producción, es una mejora de seguimiento.
- Un CSP para el modo `npm run dev` — esta mejora aplica la política solo al build de producción (ver Etapa 1, decisión de implementación), para no arriesgar romper HMR de Vite en desarrollo.
- Sanitizar `parseMd`/`dangerouslySetInnerHTML` (eso es TD-RNF002, responsabilidad de `audit`).

## Riesgos y consideraciones

- **Riesgo principal: una CSP mal calibrada puede romper la app en producción** (bloquear el fetch a Supabase, o el propio script de la app). Por eso la Etapa 2 exige QA manual explícito de las 7 páginas antes de dar la mejora por terminada — no alcanza con que `npm run build` no tire errores.
- El repo usa `style={{...}}` (estilos inline vía objetos de React) de forma extensiva en casi todas las páginas, y `ThemeProvider.tsx:14-16` aplica variables CSS con `root.style.setProperty(...)`. Ambos mecanismos son manipulación de la propiedad `style` vía la API del DOM, no `<style>` HTML ni atributos `style="..."` en el markup fuente — pero para no arriesgar romper la interfaz completa de la app, la política definida en la Etapa 1 incluye `'unsafe-inline'` en `style-src` de forma explícita (la protección relevante contra XSS la da `script-src 'self'`, que sí bloquea la ejecución de `<script>` inyectado — ese es el vector real que importa para TD-RNF001/TD-RNF002).
- No toca autenticación, permisos, schema de Supabase, ni `AuthProvider` — no aplica el protocolo de confirmación previa de AGENTS.md.

## Rama sugerida

`feature/mej-006-content-security-policy`

## Plan por etapas

### Etapa 1 — Inyectar la CSP solo en el build de producción

- **Objetivo:** Que el HTML de producción incluya la meta-tag de CSP, sin tocar el comportamiento de `npm run dev`.
- **Pasos:**
  1. En `vite.config.ts`, agregar un plugin local al array `plugins` (junto a `react()`) que use el hook `transformIndexHtml` de Vite para inyectar la meta-tag solo quándo se está construyendo (`command === 'build'`), no en modo `serve`:
     ```ts
     import { defineConfig, type Plugin } from 'vite';

     const CSP =
       "default-src 'self'; " +
       "script-src 'self'; " +
       "style-src 'self' 'unsafe-inline'; " +
       "img-src 'self' data:; " +
       "font-src 'self'; " +
       "connect-src 'self' https://*.supabase.co wss://*.supabase.co; " +
       "object-src 'none'; " +
       "base-uri 'self';";

     function injectCsp(): Plugin {
       return {
         name: 'inject-csp',
         transformIndexHtml(html, ctx) {
           if (!ctx.bundle) return html; // ctx.bundle solo existe durante `vite build`
           return html.replace(
             '<meta charset="UTF-8" />',
             `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`,
           );
         },
       };
     }
     ```
  2. Agregar `injectCsp()` al array `plugins` de `defineConfig({ plugins: [react(), injectCsp()], ... })`, sin modificar el resto de la configuración existente (`server`, `test`).
  3. No modificar `index.html` directamente — la meta-tag se inyecta solo en el HTML de salida del build, `index.html` en el repo queda igual.
- **Archivos:** `vite.config.ts` (modificar)
- **Verificación (Definition of Done):**
  - `npx tsc -b` sin errores.
  - `npm run dev`: abrir la app y confirmar en el DOM (inspeccionar `<head>`) que **no** aparece la meta-tag de CSP, y que HMR sigue funcionando (editar un archivo y ver el cambio reflejado sin recargar manualmente).
  - `npm run build`: confirmar que `dist/index.html` sí contiene la meta-tag `Content-Security-Policy` con el contenido exacto definido en el paso 1.

### Etapa 2 — QA manual de la app en producción con la CSP activa

- **Objetivo:** Confirmar que ninguna funcionalidad existente se rompe por la política definida en la Etapa 1.
- **Pasos:**
  1. Correr `npm run build && npm run preview`.
  2. Abrir la URL de preview en el navegador con la consola de DevTools abierta (pestaña "Console" y "Network").
  3. Recorrer, en orden: login (`/login`), Dashboard (`/`), las 6 tabs de Career (`/career`), Subjects (`/subjects`, incluyendo abrir una nota si hay alguna cargada — ejercita `dangerouslySetInnerHTML`), Tasks (`/tasks`), Schedule (`/schedule`, incluyendo generar un PDF si hay materias cargadas — ejercita `window.open`/`document.write`), y Settings (`/settings`, incluyendo cambiar de tema, que ejercita `ThemeProvider`).
  4. En cada página, confirmar que no aparece ningún mensaje `Refused to ...` ni `Content-Security-Policy` en la consola, y que las requests a Supabase (pestaña "Network", filtrando por el dominio `*.supabase.co`) devuelven `200`, no son bloqueadas.
- **Archivos:** Ninguno (solo verificación manual).
- **Verificación (Definition of Done):** Las 7 páginas recorridas sin ningún error de CSP en consola y sin requests a Supabase bloqueadas. Si aparece alguna violación, ajustar la directiva correspondiente en el `CSP` de la Etapa 1 (documentando el ajuste y por qué fue necesario) y repetir esta etapa.

## Cierre

Al completar ambas etapas: generar el reporte en `src/docs/reports/<YYYY-MM-DD>-mej-006-content-security-policy.md` según AGENTS.md § "Reportes de Implementación", documentando la política final aplicada y cualquier ajuste hecho durante el QA de la Etapa 2, y actualizar el **Estado** de este ítem a `Completada` tanto acá como en `src/docs/improvements/mejoras.md`.
