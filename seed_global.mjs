// Script para poblar global_subjects y global_electives en Supabase
// Ejecutar con: node seed_global.mjs

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ejbbfgenvptwfnlsuytg.supabase.co';
// Necesita SERVICE_ROLE key para saltear RLS y hacer INSERT en tablas globales
// La anon key NO puede escribir en global_subjects (solo leer)
// Pegá la service_role key de: Supabase > Project Settings > API > service_role
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'PEGA_TU_SERVICE_ROLE_KEY_ACÁ';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ── Plan de estudios: Ingeniería en Informática — IUA ─────────────────────────
const GLOBAL_SUBJECTS = [
  // Año 1, Semestre 1
  { id: 'cs-info1',    code: '000450', name: 'Informática 1',               year: 1, semester: 1, credits: 6, correlatives: { toCurse: [], toPass: [] } },
  { id: 'cs-teccomp',  code: '000451', name: 'Tecnología de Computadoras',  year: 1, semester: 1, credits: 6, correlatives: { toCurse: [], toPass: [] } },
  { id: 'cs-algegeo',  code: '000453', name: 'Álgebra y Geometría',         year: 1, semester: 1, credits: 6, correlatives: { toCurse: [], toPass: [] } },
  { id: 'cs-am1a',     code: '000452', name: 'Análisis Matemático 1A',      year: 1, semester: 1, credits: 6, correlatives: { toCurse: [], toPass: [] } },
  { id: 'cs-fis1',     code: '000454', name: 'Física 1',                    year: 1, semester: 1, credits: 6, correlatives: { toCurse: [], toPass: [] } },
  // Año 1, Semestre 2
  { id: 'cs-info2',    code: '000455', name: 'Informática 2',               year: 1, semester: 2, credits: 6, correlatives: { toCurse: ['cs-info1'], toPass: ['cs-info1'] } },
  { id: 'cs-algelin',  code: '000654', name: 'Álgebra Lineal',              year: 1, semester: 2, credits: 4, correlatives: { toCurse: ['cs-algegeo'], toPass: ['cs-algegeo'] } },
  { id: 'cs-quimica',  code: '000459', name: 'Química',                     year: 1, semester: 2, credits: 6, correlatives: { toCurse: [], toPass: [] } },
  { id: 'cs-am1b',     code: '000457', name: 'Análisis Matemático 1B',      year: 1, semester: 2, credits: 6, correlatives: { toCurse: ['cs-am1a'], toPass: ['cs-am1a'] } },
  { id: 'cs-fis2',     code: '000456', name: 'Física 2',                    year: 1, semester: 2, credits: 6, correlatives: { toCurse: ['cs-fis1'], toPass: ['cs-fis1'] } },
  // Año 2, Semestre 1
  { id: 'cs-ingweb1',  code: '000465', name: 'Ingeniería Web 1',            year: 2, semester: 1, credits: 6, correlatives: { toCurse: ['cs-info2'], toPass: ['cs-info2'] } },
  { id: 'cs-ingsoft1', code: '000461', name: 'Ingeniería de Software 1',    year: 2, semester: 1, credits: 6, correlatives: { toCurse: ['cs-info2'], toPass: ['cs-info2'] } },
  { id: 'cs-bd1',      code: '000463', name: 'Base de Datos 1',             year: 2, semester: 1, credits: 6, correlatives: { toCurse: ['cs-info2', 'cs-ingsoft1'], toPass: ['cs-info2', 'cs-ingsoft1'] } },
  { id: 'cs-am2a',     code: '000462', name: 'Análisis Matemático 2A',      year: 2, semester: 1, credits: 6, correlatives: { toCurse: ['cs-am1b'], toPass: ['cs-am1b'] } },
  { id: 'cs-estdisc',  code: '000464', name: 'Estructuras Discretas',       year: 2, semester: 1, credits: 6, correlatives: { toCurse: ['cs-algegeo'], toPass: ['cs-algegeo'] } },
  // Año 2, Semestre 2
  { id: 'cs-info3',    code: '000460', name: 'Informática 3',               year: 2, semester: 2, credits: 6, correlatives: { toCurse: ['cs-info2'], toPass: ['cs-info2'] } },
  { id: 'cs-arqcomp1', code: '000468', name: 'Arquitectura de Comp. 1',     year: 2, semester: 2, credits: 6, correlatives: { toCurse: ['cs-teccomp'], toPass: ['cs-teccomp'] } },
  { id: 'cs-am2b',     code: '000466', name: 'Análisis Matemático 2B',      year: 2, semester: 2, credits: 6, correlatives: { toCurse: ['cs-am2a'], toPass: ['cs-am2a'] } },
  { id: 'cs-metnum',   code: '000467', name: 'Métodos Numéricos',           year: 2, semester: 2, credits: 6, correlatives: { toCurse: ['cs-algelin', 'cs-am2a'], toPass: ['cs-algelin', 'cs-am2a'] } },
  { id: 'cs-probest',  code: '000256', name: 'Probabilidad y Estadística',  year: 2, semester: 2, credits: 6, correlatives: { toCurse: ['cs-am2a'], toPass: ['cs-am2a'] } },
  // Año 3, Semestre 1
  { id: 'cs-arqcomp2', code: '000473', name: 'Arquitectura de Comp. 2',     year: 3, semester: 1, credits: 6, correlatives: { toCurse: ['cs-arqcomp1'], toPass: ['cs-arqcomp1'] } },
  { id: 'cs-fis3',     code: '000924', name: 'Física 3',                    year: 3, semester: 1, credits: 6, correlatives: { toCurse: ['cs-fis2', 'cs-am2b'], toPass: ['cs-fis2', 'cs-am2b'] } },
  { id: 'cs-pds1',     code: '000470', name: 'Proceso de Desarrollo 1',     year: 3, semester: 1, credits: 6, correlatives: { toCurse: ['cs-info3'], toPass: ['cs-info3'] } },
  { id: 'cs-sisop',    code: '000477', name: 'Sistemas Operativos',         year: 3, semester: 1, credits: 6, correlatives: { toCurse: ['cs-arqcomp1'], toPass: ['cs-arqcomp1'] } },
  { id: 'cs-teocomp',  code: '000475', name: 'Teoría de la Computación',    year: 3, semester: 1, credits: 6, correlatives: { toCurse: ['cs-estdisc'], toPass: ['cs-estdisc'] } },
  // Año 3, Semestre 2
  { id: 'cs-audit',    code: '000478', name: 'Auditoría',                   year: 3, semester: 2, credits: 6, correlatives: { toCurse: [], toPass: [] } },
  { id: 'cs-derecho',  code: '000479', name: 'Derecho y Ética Profesional', year: 3, semester: 2, credits: 6, correlatives: { toCurse: [], toPass: [] } },
  { id: 'cs-orgemp',   code: '000474', name: 'Organización de Empresas',    year: 3, semester: 2, credits: 6, correlatives: { toCurse: ['cs-arqcomp2'], toPass: ['cs-arqcomp2'] } },
  { id: 'cs-pds2',     code: '000476', name: 'Proceso de Desarrollo 2',     year: 3, semester: 2, credits: 6, correlatives: { toCurse: ['cs-pds1'], toPass: ['cs-pds1'] } },
  { id: 'cs-redes1',   code: '000471', name: 'Redes 1',                     year: 3, semester: 2, credits: 6, correlatives: { toCurse: ['cs-sisop'], toPass: ['cs-sisop'] } },
  { id: 'cs-dhs',      code: '000480', name: 'Desarrollo Herramientas SW',  year: 3, semester: 2, credits: 7, correlatives: { toCurse: [], toPass: [] } },
  { id: 'cs-ingles',   code: '000621', name: 'Nivel Idioma Inglés',         year: 3, semester: 2, credits: 2, correlatives: { toCurse: [], toPass: [] } },
  // Año 4, Semestre 1
  { id: 'cs-ingweb2',  code: '000800', name: 'Ingeniería Web 2',            year: 4, semester: 1, credits: 6, correlatives: { toCurse: ['cs-ingweb1', 'cs-bd1'], toPass: ['cs-ingweb1', 'cs-bd1'] } },
  { id: 'cs-bd2',      code: '000485', name: 'Base de Datos 2',             year: 4, semester: 1, credits: 6, correlatives: { toCurse: ['cs-bd1'], toPass: ['cs-bd1'] } },
  { id: 'cs-ingsoft2', code: '000481', name: 'Ingeniería de Software 2',    year: 4, semester: 1, credits: 6, correlatives: { toCurse: [], toPass: [] } },
  { id: 'cs-redes2',   code: '000482', name: 'Redes 2',                     year: 4, semester: 1, credits: 6, correlatives: { toCurse: ['cs-redes1'], toPass: ['cs-redes1'] } },
  { id: 'cs-economia', code: '000491', name: 'Economía',                    year: 4, semester: 1, credits: 6, correlatives: { toCurse: [], toPass: [] } },
  { id: 'cs-progfunc', code: '000813', name: 'Prog. Funcional y Scripting', year: 4, semester: 1, credits: 6, correlatives: { toCurse: [], toPass: [] } },
  { id: 'cs-tecmov',   code: '000801', name: 'Tecnologías Móviles',         year: 4, semester: 1, credits: 6, correlatives: { toCurse: [], toPass: [] } },
  // Año 4, Semestre 2
  { id: 'cs-gestemp1', code: '000490', name: 'Gestión de Empresas 1',       year: 4, semester: 2, credits: 6, correlatives: { toCurse: ['cs-orgemp'], toPass: ['cs-orgemp'] } },
  { id: 'cs-gestproy', code: '000761', name: 'Gestión de Proyectos Inf.',   year: 4, semester: 2, credits: 6, correlatives: { toCurse: ['cs-pds2'], toPass: ['cs-pds2'] } },
  { id: 'cs-modsim',   code: '000489', name: 'Modelos y Simulación',        year: 4, semester: 2, credits: 6, correlatives: { toCurse: ['cs-probest'], toPass: ['cs-probest'] } },
  { id: 'cs-redes3',   code: '000486', name: 'Redes 3',                     year: 4, semester: 2, credits: 6, correlatives: { toCurse: ['cs-redes2'], toPass: ['cs-redes2'] } },
  // Año 5, Semestre 1
  { id: 'cs-ingweb3',  code: '000806', name: 'Ingeniería Web 3',            year: 5, semester: 1, credits: 6, correlatives: { toCurse: ['cs-ingweb2'], toPass: ['cs-ingweb2'] } },
  { id: 'cs-compgraf', code: '000494', name: 'Computación Gráfica y AV',    year: 5, semester: 1, credits: 6, correlatives: { toCurse: ['cs-am2b'], toPass: ['cs-am2b'] } },
  { id: 'cs-gestemp2', code: '000496', name: 'Gestión de Empresas 2',       year: 5, semester: 1, credits: 6, correlatives: { toCurse: ['cs-gestemp1'], toPass: ['cs-gestemp1'] } },
  { id: 'cs-sisrt',    code: '000495', name: 'Sistemas en Tiempo Real',     year: 5, semester: 1, credits: 6, correlatives: { toCurse: ['cs-bd2'], toPass: ['cs-bd2'] } },
  { id: 'cs-audit2',   code: '000478', name: 'Auditoría (5to)',             year: 5, semester: 1, credits: 6, correlatives: { toCurse: [], toPass: [] } },
  // Año 5, Semestre 2
  { id: 'cs-planneg',  code: '000499', name: 'Plan de Negocios',            year: 5, semester: 2, credits: 6, correlatives: { toCurse: ['cs-gestemp2'], toPass: ['cs-gestemp2'] } },
  { id: 'cs-seginf',   code: '000500', name: 'Seguridad Informática',       year: 5, semester: 2, credits: 6, correlatives: { toCurse: ['cs-redes3'], toPass: ['cs-redes3'] } },
  { id: 'cs-tfg',      code: '000501', name: 'Trabajo Final de Grado',      year: 5, semester: 2, credits: 12, correlatives: { toCurse: [], toPass: [] } },
  { id: 'cs-pps',      code: '000616', name: 'Práctica Profesional Sup.',   year: 5, semester: 2, credits: 13, correlatives: { toCurse: [], toPass: [] } },
  { id: 'cs-ia',       code: '000762', name: 'Inteligencia Artificial',     year: 5, semester: 2, credits: 6, correlatives: { toCurse: ['cs-economia', 'cs-modsim'], toPass: ['cs-economia', 'cs-modsim'] } },
  { id: 'cs-linux',    code: '001835', name: 'Fundamentos de Linux',        year: 4, semester: 1, credits: 2, correlatives: { toCurse: [], toPass: [] } },
];

// ── Optativas — NO son seminarios ──────────────────────────────────────────────
// Los seminarios van a user_seminars (son por usuario, no globales)
const GLOBAL_ELECTIVES = [
  { code: '000814', name: 'Algoritmos y Estructuras de Datos',                 category: 'Optativa Informática 2017', credits: 6 },
  { code: '000809', name: 'Arquitectura Orientada a Servicios',                category: 'Optativa Informática 2017', credits: 6 },
  { code: '000808', name: 'Cómputo de Altas Prestaciones',                     category: 'Optativa Informática 2017', credits: 6 },
  { code: '000800', name: 'Ingeniería Web 2',                                   category: 'Optativa Informática 2017', credits: 6 },
  { code: '000803', name: 'Investigación de Operaciones',                       category: 'Optativa Informática 2017', credits: 6 },
  { code: '000812', name: 'Procesamiento Digital de Señales',                   category: 'Optativa Informática 2017', credits: 6 },
  { code: '000810', name: 'Programación Concurrente',                           category: 'Optativa Informática 2017', credits: 6 },
  { code: '000813', name: 'Programación Funcional y Scripting',                 category: 'Optativa Informática 2017', credits: 4 },
  { code: '000805', name: 'Sistemas de Comunicaciones I',                       category: 'Optativa Informática 2017', credits: 6 },
  { code: '000801', name: 'Tecnologías Móviles',                               category: 'Optativa Informática 2017', credits: 6 },
  { code: '000804', name: 'Sistemas de Telecomunicaciones I',                   category: 'Optativa Informática 2017', credits: 6 },
  { code: '000806', name: 'Ingeniería Web 3',                                   category: 'Optativa Informática 2017', credits: 6 },
  { code: '000811', name: 'Comunicaciones Móviles',                             category: 'Optativa Informática 2017', credits: 6 },
  { code: '000929', name: 'Gestión de Redes',                                   category: 'Optativa Informática 2017', credits: 6 },
  { code: '000933', name: 'Ingeniería de Protocolo',                            category: 'Optativa Informática 2017', credits: 4 },
  { code: '001636', name: 'Blockchain y Contratos Inteligentes',                category: 'Optativa Informática 2017', credits: 6 },
  { code: '000816', name: 'Sistemas de Radioenlace',                            category: 'Optativa Informática 2017', credits: 6 },
];

async function seed() {
  console.log('🌱 Iniciando seed de plan de estudios en Supabase...\n');

  // 1. global_subjects — upsert por code (unique constraint)
  console.log(`📚 Subiendo ${GLOBAL_SUBJECTS.length} materias a global_subjects...`);
  const { error: subErr } = await supabase
    .from('global_subjects')
    .upsert(GLOBAL_SUBJECTS, { onConflict: 'code' });

  if (subErr) {
    console.error('❌ Error en global_subjects:', subErr.message);
  } else {
    console.log('✅ global_subjects ok');
  }

  // 2. global_electives — upsert por code
  console.log(`\n🎓 Subiendo ${GLOBAL_ELECTIVES.length} optativas a global_electives...`);
  const { error: elecErr } = await supabase
    .from('global_electives')
    .upsert(GLOBAL_ELECTIVES, { onConflict: 'code' });

  if (elecErr) {
    console.error('❌ Error en global_electives:', elecErr.message);
  } else {
    console.log('✅ global_electives ok');
  }

  console.log('\n🎉 Seed completo.');
  console.log('\n⚠️  NOTA: Los seminarios son datos por usuario (user_seminars), no globales.');
  console.log('   Cada usuario carga sus propios seminarios desde la pestaña Carrera.');
}

seed().catch(console.error);
