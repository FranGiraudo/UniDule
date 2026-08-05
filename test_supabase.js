import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ejbbfgenvptwfnlsuytg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqYmJmZ2VudnB0d2ZubHN1eXRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3ODg2MjMsImV4cCI6MjEwMTM2NDYyM30.W7GeHjMp4zOfRTj74VKoeHDcMdRNIiLvn_-2ugGERQQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const { data, error } = await supabase.from('global_subjects')
    .select('id, name, year, semester, layout_row')
    .eq('plan_id', '2026')
    .in('name', ['Sistemas de Comunicaciones', 'Procesos de Software I', 'Electiva I - Desarrollo de Herramientas de Software']);
  console.log('Results:', data, error);
}
test();
