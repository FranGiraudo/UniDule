# Reporte: Motor de Recomendación Algorítmica y Puntos de Contacto

**Fecha:** 2026-11-17  
**Rama:** `feature/recomendador-algoritmico`  
**Tipo:** Feature / Optimización

---

## 1. Objetivo

Implementar un motor de recomendación puramente algorítmico (sin IA, 100% determinista, offline y sin costos de API) para orientar al alumno sobre:
1. Qué materias cursar el próximo período según Camino Crítico (CPM) y correlatividades transitivas.
2. Qué mesas de finales regulares priorizar según urgencia de vencimiento y materias que destraban.

Cumpliendo estrictamente con la regla de negocio solicitada:
- Las materias que están actualmente en estado `cursando` (ej. Base de Datos 1) **no entran** en la recomendación de cursada.
- Las correlativas de materias futuras que dependan de una materia en `cursando` **no se consideran cumplidas** hasta que dicha materia esté regularizada o aprobada.

Integrando los 3 puntos de contacto solicitados:
- **A. Widget en Dashboard (`Dashboard.tsx`):** Tarjeta con las mejores sugerencias para cursar y finales prioritarios, con enlace a Plan de Carrera.
- **B. Ordenamiento por Prioridad en Finales (`FinalsTab.tsx`):** Opción `🎯 Prioridad recomendada (Algorítmica)` en el selector de orden, con badges de razones de prioridad.
- **C. Iluminar Camino Crítico en el Mapa (`MapTab.tsx`):** Botón toggle `Camino Crítico` que resalta en dorado los nodos y aristas del camino crítico de la carrera y atenúa los caminos secundarios.
- **D. Pulido visual:** Eliminación total de emojis en textos, badges y opciones de menú, manteniendo una estética 100% técnica, limpia y profesional.

---

## 2. Archivos Afectados

### Creados
- `src/features/career/lib/recommender.ts` — Motor algorítmico puro (Camino Crítico CPM, dependencias transitivas, ranking multicriterio de cursada y finales).
- `src/features/career/lib/__tests__/recommender.test.ts` — Suite de 6 pruebas unitarias en Vitest.

### Modificados
- `src/pages/Dashboard.tsx` — Widget de recomendaciones académicas integrado entre métricas y entregas.
- `src/pages/Settings.tsx` — Unificación del exportador .ics en una única tarjeta completa que utiliza `exportICS()`, eliminando código duplicado.
- `src/features/career/components/FinalsTab.tsx` — Opción de orden por prioridad algorítmica y etiquetas explicativas.
- `src/features/career/components/MapTab.tsx` — Botón y resaltado visual para "Próximo Semestre" (destaca las materias que forman la carga del próximo período) y "Camino Crítico", con leyenda interactiva.

---

## 3. Riesgos Detectados

- **Riesgo:** Inclusión accidental de materias en curso o desbloqueo prematuro de materias avanzadas.  
  **Mitigación:** Filtro explícito en `getRecommendedCourses`: solo materias pendientes con todas sus correlativas en `regular` o `aprobada`. Tests unitarios específicos garantizan que materias en `cursando` ni se recomiendan ni desbloquean correlativas dependientes.
- **Riesgo:** Ciclos en el grafo de correlatividades por datos erróneos de usuario.  
  **Mitigación:** Protección de ciclo en DFS (`visiting` set) que retorna fallback determinista si se detecta recursión cíclica.

---

## 4. Tests y QA

- **Tests nuevos:** 6 pruebas unitarias en `src/features/career/lib/__tests__/recommender.test.ts`.
- **Suite completa:** 18 tests pasados (100%).
- **TypeScript:** `npx tsc -b` limpio, 0 errores.
- **ESLint:** 0 errores nuevos.
- **Cobertura:**
  - Antes: 1.57% Stmts, 1.53% Lines
  - Después: 6.92% Stmts, 7.28% Lines (submódulo `career/lib` al 63.71%)

---

## 5. Próximos Pasos

1. Evaluar agregar la pestaña dedicada "Recomendador" en `Career.tsx` para permitir simular escenarios por cantidad de horas disponibles.
2. Permitir configurar filtros de ponderación (ej: priorizar materias de software vs matemáticas).
