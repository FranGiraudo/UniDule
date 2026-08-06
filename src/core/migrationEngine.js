// src/core/migrationEngine.js

// Precedencia de estados: de menor a mayor
export const STATUS_PRECEDENCE = {
  pendiente: 0,
  libre: 1,
  cursando: 2,
  regular: 3,
  aprobada: 4,
  promocionada: 4
};

// Mapa de equivalencias: { target2026_code: { type: 'direct' | 'parcial', req16: ['code1', 'code2'] } }
// basándose en el listado de reglas definido.
export const EQUIVALENCES_16_TO_26 = {
  'cs26-002': { type: 'direct', req16: ['000452', '000457'] }, // Análisis Matemático I <- 1A + 1B
  'cs26-001': { type: 'direct', req16: ['000453', '000654'] }, // Álgebra y Geometría Analítica <- Álgebra y Geo + Álgebra Lineal
  'cs26-004': { type: 'direct', req16: ['000454'] },           // Física I <- Física 1
  'cs26-003': { type: 'direct', req16: ['000450', '000455'] }, // Paradigmas de Prog I <- Info 1 + Info 2
  'cs26-005': { type: 'direct', req16: ['000451'] },           // Tecnología de Computadoras
  'cs26-009': { type: 'direct', req16: ['000490'] },           // Organización Empresarial e Ind <- Gestión de Empresas 1
  'cs26-007': { type: 'direct', req16: ['000450'] },           // Técnicas de Desarrollo <- Info 1
  'cs26-008': { type: 'direct', req16: ['000450', '000451'] }, // Sistemas de Información <- Info 1 + Tec de Comp
  'cs26-010': { type: 'direct', req16: ['000460'] },           // Estructuras de Datos <- Info 3
  'cs26-013': { type: 'direct', req16: ['000462', '000466'] }, // Análisis Matemático II <- 2A + 2B
  'cs26-011': { type: 'direct', req16: ['000456'] },           // Física II <- Física 2
  'cs26-012': { type: 'direct', req16: ['000464'] },           // Matemática Discreta <- Estructuras Discretas
  'cs26-014': { type: 'direct', req16: ['000465'] },           // Paradigmas II <- Ing Web 1
  'cs26-016': { type: 'direct', req16: ['000468'] },           // Arquitectura de Comp <- Arq Comp 1
  'cs26-017': { type: 'direct', req16: ['000463'] },           // Base de Datos I <- Base de Datos 1
  'cs26-018': { type: 'direct', req16: ['000256'] },           // Probabilidad y Estadística
  'cs26-019': { type: 'direct', req16: ['000456', '000924'] }, // Física III <- Física 2 + Física 3
  'cs26-015': { type: 'direct', req16: ['000461'] },           // Ingeniería de Requerimientos <- Ing de Software 1
  'cs26-020': { type: 'direct', req16: ['000461'] },           // Taller de Integración I <- Ing de Software 1
  'cs26-021': { type: 'direct', req16: ['000471'] },           // Sistemas de Comunicaciones <- Redes 1
  'cs26-022': { type: 'direct', req16: ['000470'] },           // Procesos de Software I <- Proceso de Desarrollo 1
  'cs26-023': { type: 'direct', req16: ['000475'] },           // Teoría de la Computación
  'cs26-024': { type: 'direct', req16: ['000477'] },           // Sistemas Operativos
  'cs26-025': { type: 'direct', req16: ['000813'] },           // Paradigmas III <- Prog. Funcional y Scripting
  'cs26-027': { type: 'direct', req16: ['000467'] },           // Análisis y Cálculo Numérico <- Métodos Numéricos
  'cs26-026': { type: 'direct', req16: ['000800'] },           // Desarrollo Web Seguro <- Ingeniería Web 2
  'cs26-029': { type: 'direct', req16: ['000476'] },           // Procesos de Software II <- Proceso de Des 2
  'cs26-030': { type: 'direct', req16: ['000485'] },           // Bases de Datos II <- Base de Datos 2
  'cs26-031': { type: 'direct', req16: ['000476', '000800'] }, // Taller de Integración II <- Proceso 2 + Ing Web 2
  'cs26-052': { type: 'direct', req16: ['000480'] },           // Electiva I <- Desarrollo Herramientas SW
  'cs26-032': { type: 'direct', req16: ['000809'] },           // Taller de Integración III <- Arq Orientada a Servicios
  'cs26-036': { type: 'direct', req16: ['000496', '000499'] }, // Proyectos de Ing <- Gestión de Emp 2 + Plan de Negocios
  'cs26-038': { type: 'direct', req16: ['000489'] },           // Modelos y Simulación
  'cs26-033': { type: 'direct', req16: ['000806'] },           // Ingeniería Web <- Ingeniería Web 3
  'cs26-034': { type: 'direct', req16: ['000801'] },           // Desarrollo de App Móviles <- Tecnologías Móviles
  'cs26-035': { type: 'direct', req16: ['000479'] },           // Legislación para Ingeniería <- Derecho y Ética
  'cs26-042': { type: 'direct', req16: ['000761'] },           // Gestión de Proyectos TIC <- Gestión de Proyectos Inf
  'cs26-041': { type: 'direct', req16: ['000482', '000486'] }, // Electiva II <- Redes 2 + Redes 3
  'cs26-040': { type: 'direct', req16: ['001636'] },           // Electiva III <- Blockchain
  'cs26-039': { type: 'direct', req16: ['000494'] },           // Electiva IV <- Computación Gráfica
  'cs26-037': { type: 'parcial', req16: ['000473'] },          // Electiva V <- Arq de Comp 2 (Parcial)
  'cs26-043': { type: 'direct', req16: ['000762'] },           // Inteligencia Artificial
  'cs26-046': { type: 'direct', req16: ['000491'] },           // Economía para Ingeniería <- Economía
  'cs26-047': { type: 'direct', req16: ['000500'] },           // Seguridad Informática
  'cs26-051': { type: 'direct', req16: ['000481'] },           // Calidad de Software <- Ingeniería de Software 2
  'cs26-049': { type: 'direct', req16: ['000478'] },           // Auditoría e Informática Forense <- Auditoría
  'cs26-050': { type: 'direct', req16: ['000495'] },           // Electiva VI <- Sistemas en Tiempo Real
  'cs26-048': { type: 'parcial', req16: ['000481'] },          // Electiva VII <- Ingeniería de Software 2 (Parcial)
  'cs26-045': { type: 'direct', req16: ['000616'] },           // Práctica Profesional Supervisada (Assuming PPS code 045)
  'cs26-028': { type: 'direct', req16: ['000621'] }            // Inglés para Ingeniería
};

/**
 * Calcula el progreso inferido para el Plan 2026 basado en el progreso real del usuario (Plan 2016 y otros).
 * @param {Array} allProgress - El array completo de progreso del usuario de Supabase.
 * @returns {Array} - Progreso unificado y derivado.
 */
export function calculateDerivedProgress(allProgress) {
  const derivedProgress = [];
  const existing26Ids = new Set();

  // 1. Guardar primero todo el progreso EXPLÍCITO que ya tenga guardado el usuario 
  // (ej. cursó una materia directamente en 2026).
  allProgress.forEach(p => {
    if (p.global_id.startsWith('cs26-')) {
      derivedProgress.push({ ...p });
      existing26Ids.add(p.global_id);
    }
  });

  // 2. Construir mapa rápido del progreso en 2016
  const progress16Map = {};
  allProgress.forEach(p => {
    if (!p.global_id.startsWith('cs26-')) {
      progress16Map[p.global_id] = p;
    }
  });

  // 3. Inferir el estado de las materias 2026 que NO tienen progreso explícito
  for (const [target26, rule] of Object.entries(EQUIVALENCES_16_TO_26)) {
    if (existing26Ids.has(target26)) continue;

    let minStatusValue = 99;
    let minStatusStr = 'pendiente';

    let allReqsExist = true;

    for (const req16Code of rule.req16) {
      const p16 = progress16Map[req16Code];
      if (!p16 || !p16.status || p16.status === 'pendiente') {
        allReqsExist = false;
        minStatusStr = 'pendiente';
        break; // If one is missing or pendiente, the overall result is pendiente
      }
      const sVal = STATUS_PRECEDENCE[p16.status.toLowerCase()] || 0;
      if (sVal < minStatusValue) {
        minStatusValue = sVal;
        minStatusStr = p16.status.toLowerCase();
      }
    }

    if (allReqsExist && minStatusStr !== 'pendiente') {
      // If it's a partial equivalency, the maximum state they get is 'regular'
      if (rule.type === 'parcial' && minStatusValue > STATUS_PRECEDENCE['regular']) {
        minStatusStr = 'regular';
      }

      derivedProgress.push({
        global_id: target26,
        status: minStatusStr,
        is_derived: true, // flag useful for UI
        grade: null // grades aren't necessarily directly carried over on the frontend yet
      });
    }
  }

  // Also include the 2016 progress so the app can still query it if needed,
  // or return just the derived. We will return the merged list.
  return [...allProgress.filter(p => !existing26Ids.has(p.global_id) && !p.global_id.startsWith('cs26-')), ...derivedProgress];
}

/**
 * Cruza el progreso derivado 2026 con los correlativas del plan 2026 para encontrar "Trampas".
 * Una trampa ocurre si el usuario tiene una materia 2026 en estado 'regular', pero no cumple 
 * con las correlativas obligatorias de 2026 para mantener esa regularidad (ej. no tiene el `toPass` de la correlativa anterior).
 * @param {Array} derivedProgress - Progreso inferido/mezclado.
 * @param {Array} subjects2026 - El array de materias globales del plan 2026.
 * @returns {Array} - Alertas de finales que hay que rendir.
 */
export function calculateLostRegularities(derivedProgress, subjects2026) {
  const alerts = [];
  const pMap = {};
  derivedProgress.forEach(p => pMap[p.global_id] = p.status);

  subjects2026.forEach(sub => {
    const subStatus = pMap[sub.code] || 'pendiente';
    if (subStatus === 'regular') {
      const reqsToPass = (sub.correlatives && sub.correlatives.toPass) ? sub.correlatives.toPass : [];
      reqsToPass.forEach(reqCode => {
        const reqStatus = pMap[reqCode] || 'pendiente';
        if (reqStatus !== 'aprobada' && reqStatus !== 'promocionada') {
          const reqSub = subjects2026.find(s => s.code === reqCode);
          alerts.push({
            subjectAtRisk: sub.name,
            missingFinal: reqSub ? reqSub.name : reqCode
          });
        }
      });
    }
  });

  return alerts;
}
