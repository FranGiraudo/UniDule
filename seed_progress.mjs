// Script para restaurar el progreso de carrera de Fran desde DEF_CAREER a user_progress
// Ejecutar con: node seed_progress.mjs

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ejbbfgenvptwfnlsuytg.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('Falta SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Progreso real de Fran extraído de DEF_CAREER (solo materias con estado != pendiente)
const PROGRESS = [
  // Aprobadas
  { global_id: 'cs-info1',    type: 'subject', status: 'aprobada',  grade: 7,    reg_date: null,         exp_date: null },
  { global_id: 'cs-am1a',     type: 'subject', status: 'aprobada',  grade: 8,    reg_date: null,         exp_date: null },
  { global_id: 'cs-info2',    type: 'subject', status: 'aprobada',  grade: 10,   reg_date: null,         exp_date: null },
  { global_id: 'cs-ingweb1',  type: 'subject', status: 'aprobada',  grade: 8,    reg_date: null,         exp_date: null },
  { global_id: 'cs-ingsoft1', type: 'subject', status: 'aprobada',  grade: 6,    reg_date: null,         exp_date: null },
  { global_id: 'cs-derecho',  type: 'subject', status: 'aprobada',  grade: 4,    reg_date: null,         exp_date: null },
  { global_id: 'cs-ingles',   type: 'subject', status: 'aprobada',  grade: null, reg_date: null,         exp_date: null },
  { global_id: 'cs-ingweb2',  type: 'subject', status: 'aprobada',  grade: 8,    reg_date: null,         exp_date: null },
  { global_id: 'cs-tecmov',   type: 'subject', status: 'aprobada',  grade: 8,    reg_date: null,         exp_date: null },
  // Regulares (con fecha de regularidad y vencimiento)
  { global_id: 'cs-teccomp',  type: 'subject', status: 'regular',   grade: null, reg_date: '2025-06-17', exp_date: '2027-02-19' },
  { global_id: 'cs-algegeo',  type: 'subject', status: 'regular',   grade: null, reg_date: '2025-06-18', exp_date: '2027-02-19' },
  { global_id: 'cs-fis1',     type: 'subject', status: 'regular',   grade: null, reg_date: '2025-06-19', exp_date: '2027-02-19' },
  { global_id: 'cs-algelin',  type: 'subject', status: 'regular',   grade: null, reg_date: '2025-11-20', exp_date: '2027-07-20' },
  { global_id: 'cs-am1b',     type: 'subject', status: 'regular',   grade: null, reg_date: '2025-11-20', exp_date: '2027-07-20' },
  { global_id: 'cs-info3',    type: 'subject', status: 'regular',   grade: null, reg_date: '2025-11-20', exp_date: '2027-07-20' },
  { global_id: 'cs-arqcomp1', type: 'subject', status: 'regular',   grade: null, reg_date: '2025-11-20', exp_date: '2027-07-20' },
  { global_id: 'cs-arqcomp2', type: 'subject', status: 'regular',   grade: null, reg_date: '2026-06-22', exp_date: '2028-02-19' },
  { global_id: 'cs-orgemp',   type: 'subject', status: 'regular',   grade: null, reg_date: '2025-11-20', exp_date: '2027-07-20' },
  { global_id: 'cs-economia', type: 'subject', status: 'regular',   grade: null, reg_date: '2026-06-19', exp_date: '2028-02-19' },
  { global_id: 'cs-gestemp1', type: 'subject', status: 'regular',   grade: null, reg_date: '2026-06-19', exp_date: '2028-02-19' },
  // Cursando
  { global_id: 'cs-fis2',     type: 'subject', status: 'cursando',  grade: null, reg_date: null,         exp_date: null },
  { global_id: 'cs-bd1',      type: 'subject', status: 'cursando',  grade: null, reg_date: null,         exp_date: null },
  { global_id: 'cs-metnum',   type: 'subject', status: 'cursando',  grade: null, reg_date: null,         exp_date: null },
  { global_id: 'cs-probest',  type: 'subject', status: 'cursando',  grade: null, reg_date: null,         exp_date: null },
  { global_id: 'cs-audit',    type: 'subject', status: 'cursando',  grade: null, reg_date: null,         exp_date: null },
  { global_id: 'cs-redes1',   type: 'subject', status: 'cursando',  grade: null, reg_date: null,         exp_date: null },
  { global_id: 'cs-progfunc', type: 'subject', status: 'cursando',  grade: null, reg_date: null,         exp_date: null },
  { global_id: 'cs-ingweb3',  type: 'subject', status: 'cursando',  grade: null, reg_date: null,         exp_date: null },
  { global_id: 'cs-gestemp2', type: 'subject', status: 'cursando',  grade: null, reg_date: null,         exp_date: null },
];

async function seedProgress() {
  // Primero buscar el user_id de Fran
  const { data: users, error: usersErr } = await supabase.auth.admin.listUsers();
  if (usersErr) {
    console.error('Error listando usuarios:', usersErr.message);
    process.exit(1);
  }

  console.log('Usuarios encontrados:');
  users.users.forEach(u => console.log(`  - ${u.email} (${u.id})`));

  if (users.users.length === 0) {
    console.error('No hay usuarios registrados');
    process.exit(1);
  }

  // Usar el primer usuario (o el que corresponda)
  const user = users.users[0];
  console.log(`\n📊 Restaurando progreso para: ${user.email}`);

  const toInsert = PROGRESS.map(p => ({
    user_id: user.id,
    ...p
  }));

  const { data, error } = await supabase
    .from('user_progress')
    .upsert(toInsert, { onConflict: 'user_id,global_id' })
    .select();

  if (error) {
    console.error('❌ Error:', error.message, error.details);
  } else {
    console.log(`✅ Progreso restaurado — ${data.length} registros guardados`);
    console.log('\nMaterias regulares con fechas:');
    data.filter(d => d.status === 'regular').forEach(d => {
      console.log(`  ${d.global_id}: regular hasta ${d.exp_date}`);
    });
  }
}

seedProgress().catch(console.error);
