import { createClient } from '@supabase/supabase-js'; 
const supabase = createClient('https://ejbbfgenvptwfnlsuytg.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqYmJmZ2VudnB0d2ZubHN1eXRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3ODg2MjMsImV4cCI6MjEwMTM2NDYyM30.W7GeHjMp4zOfRTj74VKoeHDcMdRNIiLvn_-2ugGERQQ');

async function run() {
  const { data, error } = await supabase.from('global_subjects').select('*').eq('plan_id', '2026').order('year', {ascending:true}).order('semester', {ascending:true});
  if (error) { console.error(error); return; }
  
  data.forEach(d => {
    console.log(`[Yr ${d.year} | Sem ${d.semester} | Row ${d.layout_row}] ${d.name} (${d.code})`);
  });
}
run();
