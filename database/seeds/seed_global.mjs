// Script para poblar global_subjects y global_electives en Supabase
// La tabla usa UUID auto-generado para id; el campo code es el identificador legible.
// Las correlativas se guardan como arrays de codes (no de UUIDs).

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ejbbfgenvptwfnlsuytg.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('Falta SUPABASE_SERVICE_ROLE_KEY en las variables de entorno');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ── Plan de estudios: Ingeniería en Informática — IUA ─────────────────────────
// id es UUID auto-generado por Supabase. code es el identificador que usamos en el frontend.
// Las correlativas guardan los codes de las materias prerequisito.
const GLOBAL_SUBJECTS = [
  // Año 1, Semestre 1
  { code: 'cs-info1',    name: 'Informática 1',               year: 1, semester: 1, credits: 6,  correlatives: { toCurse: [], toPass: [] } },
  { code: 'cs-teccomp',  name: 'Tecnología de Computadoras',  year: 1, semester: 1, credits: 6,  correlatives: { toCurse: [], toPass: [] } },
  { code: 'cs-algegeo',  name: 'Álgebra y Geometría',         year: 1, semester: 1, credits: 6,  correlatives: { toCurse: [], toPass: [] } },
  { code: 'cs-am1a',     name: 'Análisis Matemático 1A',      year: 1, semester: 1, credits: 6,  correlatives: { toCurse: [], toPass: [] } },
  { code: 'cs-fis1',     name: 'Física 1',                    year: 1, semester: 1, credits: 6,  correlatives: { toCurse: [], toPass: [] } },
  // Año 1, Semestre 2
  { code: 'cs-info2',    name: 'Informática 2',               year: 1, semester: 2, credits: 6,  correlatives: { toCurse: ['cs-info1'], toPass: ['cs-info1'] } },
  { code: 'cs-algelin',  name: 'Álgebra Lineal',              year: 1, semester: 2, credits: 4,  correlatives: { toCurse: ['cs-algegeo'], toPass: ['cs-algegeo'] } },
  { code: 'cs-quimica',  name: 'Química',                     year: 1, semester: 2, credits: 6,  correlatives: { toCurse: [], toPass: [] } },
  { code: 'cs-am1b',     name: 'Análisis Matemático 1B',      year: 1, semester: 2, credits: 6,  correlatives: { toCurse: ['cs-am1a'], toPass: ['cs-am1a'] } },
  { code: 'cs-fis2',     name: 'Física 2',                    year: 1, semester: 2, credits: 6,  correlatives: { toCurse: ['cs-fis1'], toPass: ['cs-fis1'] } },
  // Año 2, Semestre 1
  { code: 'cs-ingweb1',  name: 'Ingeniería Web 1',            year: 2, semester: 1, credits: 6,  correlatives: { toCurse: ['cs-info2'], toPass: ['cs-info2'] } },
  { code: 'cs-ingsoft1', name: 'Ingeniería de Software 1',    year: 2, semester: 1, credits: 6,  correlatives: { toCurse: ['cs-info2'], toPass: ['cs-info2'] } },
  { code: 'cs-bd1',      name: 'Base de Datos 1',             year: 2, semester: 1, credits: 6,  correlatives: { toCurse: ['cs-info2', 'cs-ingsoft1'], toPass: ['cs-info2', 'cs-ingsoft1'] } },
  { code: 'cs-am2a',     name: 'Análisis Matemático 2A',      year: 2, semester: 1, credits: 6,  correlatives: { toCurse: ['cs-am1b'], toPass: ['cs-am1b'] } },
  { code: 'cs-estdisc',  name: 'Estructuras Discretas',       year: 2, semester: 1, credits: 6,  correlatives: { toCurse: ['cs-algegeo'], toPass: ['cs-algegeo'] } },
  // Año 2, Semestre 2
  { code: 'cs-info3',    name: 'Informática 3',               year: 2, semester: 2, credits: 6,  correlatives: { toCurse: ['cs-info2'], toPass: ['cs-info2'] } },
  { code: 'cs-arqcomp1', name: 'Arquitectura de Comp. 1',     year: 2, semester: 2, credits: 6,  correlatives: { toCurse: ['cs-teccomp'], toPass: ['cs-teccomp'] } },
  { code: 'cs-am2b',     name: 'Análisis Matemático 2B',      year: 2, semester: 2, credits: 6,  correlatives: { toCurse: ['cs-am2a'], toPass: ['cs-am2a'] } },
  { code: 'cs-metnum',   name: 'Métodos Numéricos',           year: 2, semester: 2, credits: 6,  correlatives: { toCurse: ['cs-algelin', 'cs-am2a'], toPass: ['cs-algelin', 'cs-am2a'] } },
  { code: 'cs-probest',  name: 'Probabilidad y Estadística',  year: 2, semester: 2, credits: 6,  correlatives: { toCurse: ['cs-am2a'], toPass: ['cs-am2a'] } },
  // Año 3, Semestre 1
  { code: 'cs-arqcomp2', name: 'Arquitectura de Comp. 2',     year: 3, semester: 1, credits: 6,  correlatives: { toCurse: ['cs-arqcomp1'], toPass: ['cs-arqcomp1'] } },
  { code: 'cs-fis3',     name: 'Física 3',                    year: 3, semester: 1, credits: 6,  correlatives: { toCurse: ['cs-fis2', 'cs-am2b'], toPass: ['cs-fis2', 'cs-am2b'] } },
  { code: 'cs-pds1',     name: 'Proceso de Desarrollo 1',     year: 3, semester: 1, credits: 6,  correlatives: { toCurse: ['cs-info3'], toPass: ['cs-info3'] } },
  { code: 'cs-sisop',    name: 'Sistemas Operativos',         year: 3, semester: 1, credits: 6,  correlatives: { toCurse: ['cs-arqcomp1'], toPass: ['cs-arqcomp1'] } },
  { code: 'cs-teocomp',  name: 'Teoría de la Computación',    year: 3, semester: 1, credits: 6,  correlatives: { toCurse: ['cs-estdisc'], toPass: ['cs-estdisc'] } },
  // Año 3, Semestre 2
  { code: 'cs-audit',    name: 'Auditoría',                   year: 3, semester: 2, credits: 6,  correlatives: { toCurse: [], toPass: [] } },
  { code: 'cs-derecho',  name: 'Derecho y Ética Profesional', year: 3, semester: 2, credits: 6,  correlatives: { toCurse: [], toPass: [] } },
  { code: 'cs-orgemp',   name: 'Organización de Empresas',    year: 3, semester: 2, credits: 6,  correlatives: { toCurse: ['cs-arqcomp2'], toPass: ['cs-arqcomp2'] } },
  { code: 'cs-pds2',     name: 'Proceso de Desarrollo 2',     year: 3, semester: 2, credits: 6,  correlatives: { toCurse: ['cs-pds1'], toPass: ['cs-pds1'] } },
  { code: 'cs-redes1',   name: 'Redes 1',                     year: 3, semester: 2, credits: 6,  correlatives: { toCurse: ['cs-sisop'], toPass: ['cs-sisop'] } },
  { code: 'cs-dhs',      name: 'Desarrollo Herramientas SW',  year: 3, semester: 2, credits: 7,  correlatives: { toCurse: [], toPass: [] } },
  { code: 'cs-ingles',   name: 'Nivel Idioma Inglés',         year: 3, semester: 2, credits: 2,  correlatives: { toCurse: [], toPass: [] } },
  // Año 4, Semestre 1
  { code: 'cs-ingweb2',  name: 'Ingeniería Web 2',            year: 4, semester: 1, credits: 6,  correlatives: { toCurse: ['cs-ingweb1', 'cs-bd1'], toPass: ['cs-ingweb1', 'cs-bd1'] } },
  { code: 'cs-bd2',      name: 'Base de Datos 2',             year: 4, semester: 1, credits: 6,  correlatives: { toCurse: ['cs-bd1'], toPass: ['cs-bd1'] } },
  { code: 'cs-ingsoft2', name: 'Ingeniería de Software 2',    year: 4, semester: 1, credits: 6,  correlatives: { toCurse: [], toPass: [] } },
  { code: 'cs-redes2',   name: 'Redes 2',                     year: 4, semester: 1, credits: 6,  correlatives: { toCurse: ['cs-redes1'], toPass: ['cs-redes1'] } },
  { code: 'cs-economia', name: 'Economía',                    year: 4, semester: 1, credits: 6,  correlatives: { toCurse: [], toPass: [] } },
  { code: 'cs-progfunc', name: 'Prog. Funcional y Scripting', year: 4, semester: 1, credits: 6,  correlatives: { toCurse: [], toPass: [] } },
  { code: 'cs-tecmov',   name: 'Tecnologías Móviles',         year: 4, semester: 1, credits: 6,  correlatives: { toCurse: [], toPass: [] } },
  { code: 'cs-linux',    name: 'Fundamentos de Linux',        year: 4, semester: 1, credits: 2,  correlatives: { toCurse: [], toPass: [] } },
  // Año 4, Semestre 2
  { code: 'cs-gestemp1', name: 'Gestión de Empresas 1',       year: 4, semester: 2, credits: 6,  correlatives: { toCurse: ['cs-orgemp'], toPass: ['cs-orgemp'] } },
  { code: 'cs-gestproy', name: 'Gestión de Proyectos Inf.',   year: 4, semester: 2, credits: 6,  correlatives: { toCurse: ['cs-pds2'], toPass: ['cs-pds2'] } },
  { code: 'cs-modsim',   name: 'Modelos y Simulación',        year: 4, semester: 2, credits: 6,  correlatives: { toCurse: ['cs-probest'], toPass: ['cs-probest'] } },
  { code: 'cs-redes3',   name: 'Redes 3',                     year: 4, semester: 2, credits: 6,  correlatives: { toCurse: ['cs-redes2'], toPass: ['cs-redes2'] } },
  // Año 5, Semestre 1
  { code: 'cs-ingweb3',  name: 'Ingeniería Web 3',            year: 5, semester: 1, credits: 6,  correlatives: { toCurse: ['cs-ingweb2'], toPass: ['cs-ingweb2'] } },
  { code: 'cs-compgraf', name: 'Computación Gráfica y AV',    year: 5, semester: 1, credits: 6,  correlatives: { toCurse: ['cs-am2b'], toPass: ['cs-am2b'] } },
  { code: 'cs-gestemp2', name: 'Gestión de Empresas 2',       year: 5, semester: 1, credits: 6,  correlatives: { toCurse: ['cs-gestemp1'], toPass: ['cs-gestemp1'] } },
  { code: 'cs-sisrt',    name: 'Sistemas en Tiempo Real',     year: 5, semester: 1, credits: 6,  correlatives: { toCurse: ['cs-bd2'], toPass: ['cs-bd2'] } },
  { code: 'cs-audit2',   name: 'Auditoría (Electiva 5to)',    year: 5, semester: 1, credits: 6,  correlatives: { toCurse: [], toPass: [] } },
  // Año 5, Semestre 2
  { code: 'cs-planneg',  name: 'Plan de Negocios',            year: 5, semester: 2, credits: 6,  correlatives: { toCurse: ['cs-gestemp2'], toPass: ['cs-gestemp2'] } },
  { code: 'cs-seginf',   name: 'Seguridad Informática',       year: 5, semester: 2, credits: 6,  correlatives: { toCurse: ['cs-redes3'], toPass: ['cs-redes3'] } },
  { code: 'cs-tfg',      name: 'Trabajo Final de Grado',      year: 5, semester: 2, credits: 12, correlatives: { toCurse: [], toPass: [] } },
  { code: 'cs-pps',      name: 'Práctica Profesional Sup.',   year: 5, semester: 2, credits: 13, correlatives: { toCurse: [], toPass: [] } },
  { code: 'cs-ia',       name: 'Inteligencia Artificial',     year: 5, semester: 2, credits: 6,  correlatives: { toCurse: ['cs-economia', 'cs-modsim'], toPass: ['cs-economia', 'cs-modsim'] } },
];

// ── Optativas (global_electives) — NO son seminarios ─────────────────────────
const GLOBAL_ELECTIVES = [
  { code: '000814', name: 'Algoritmos y Estructuras de Datos',          category: 'Optativa Informática 2017', credits: 6 },
  { code: '000809', name: 'Arquitectura Orientada a Servicios',         category: 'Optativa Informática 2017', credits: 6 },
  { code: '000808', name: 'Cómputo de Altas Prestaciones',              category: 'Optativa Informática 2017', credits: 6 },
  { code: '000800', name: 'Ingeniería Web 2',                           category: 'Optativa Informática 2017', credits: 6 },
  { code: '000803', name: 'Investigación de Operaciones',               category: 'Optativa Informática 2017', credits: 6 },
  { code: '000812', name: 'Procesamiento Digital de Señales',           category: 'Optativa Informática 2017', credits: 6 },
  { code: '000810', name: 'Programación Concurrente',                   category: 'Optativa Informática 2017', credits: 6 },
  { code: '000813', name: 'Programación Funcional y Scripting',         category: 'Optativa Informática 2017', credits: 4 },
  { code: '000805', name: 'Sistemas de Comunicaciones I',               category: 'Optativa Informática 2017', credits: 6 },
  { code: '000801', name: 'Tecnologías Móviles',                        category: 'Optativa Informática 2017', credits: 6 },
  { code: '000804', name: 'Sistemas de Telecomunicaciones I',           category: 'Optativa Informática 2017', credits: 6 },
  { code: '000806', name: 'Ingeniería Web 3',                           category: 'Optativa Informática 2017', credits: 6 },
  { code: '000811', name: 'Comunicaciones Móviles',                     category: 'Optativa Informática 2017', credits: 6 },
  { code: '000929', name: 'Gestión de Redes',                           category: 'Optativa Informática 2017', credits: 6 },
  { code: '000933', name: 'Ingeniería de Protocolo',                    category: 'Optativa Informática 2017', credits: 4 },
  { code: '001636', name: 'Blockchain y Contratos Inteligentes',        category: 'Optativa Informática 2017', credits: 6 },
  { code: '000816', name: 'Sistemas de Radioenlace',                    category: 'Optativa Informática 2017', credits: 6 },
];

async function seed() {
  console.log('🌱 Iniciando seed de plan de estudios en Supabase...\n');

  // 1. global_subjects — sin id (Supabase genera UUID), upsert por code
  console.log(`📚 Subiendo ${GLOBAL_SUBJECTS.length} materias a global_subjects...`);
  const { data: subData, error: subErr } = await supabase
    .from('global_subjects')
    .upsert(GLOBAL_SUBJECTS, { onConflict: 'code' })
    .select();

  if (subErr) {
    console.error('❌ Error en global_subjects:', subErr.message, subErr.details);
  } else {
    console.log(`✅ global_subjects ok — ${subData.length} registros`);
  }

  // 2. global_electives — sin id, upsert por code
  console.log(`\n🎓 Subiendo ${GLOBAL_ELECTIVES.length} optativas a global_electives...`);
  const { data: elecData, error: elecErr } = await supabase
    .from('global_electives')
    .upsert(GLOBAL_ELECTIVES, { onConflict: 'code' })
    .select();

  if (elecErr) {
    console.error('❌ Error en global_electives:', elecErr.message, elecErr.details);
  } else {
    console.log(`✅ global_electives ok — ${elecData.length} registros`);
  }

  console.log('\n🎉 Seed completo.');
  console.log('\n⚠️  NOTA: Los seminarios van a user_seminars (son datos por usuario, no globales).');
}

seed().catch(console.error);
