import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ejbbfgenvptwfnlsuytg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqYmJmZ2VudnB0d2ZubHN1eXRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3ODg2MjMsImV4cCI6MjEwMTM2NDYyM30.W7GeHjMp4zOfRTj74VKoeHDcMdRNIiLvn_-2ugGERQQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const { data, error } = await supabase.from('global_subjects').select('plan_id, id');
  console.log('Total subjects:', data.length);
  const byPlan = data.reduce((acc, curr) => {
    acc[curr.plan_id] = (acc[curr.plan_id] || 0) + 1;
    return acc;
  }, {});
  console.log('By plan:', byPlan);
}
test();
