import { createClient } from '@supabase/supabase-js'; 
const supabase = createClient('https://ejbbfgenvptwfnlsuytg.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqYmJmZ2VudnB0d2ZubHN1eXRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3ODg2MjMsImV4cCI6MjEwMTM2NDYyM30.W7GeHjMp4zOfRTj74VKoeHDcMdRNIiLvn_-2ugGERQQ');

async function run() {
  const email1 = 'test1' + Date.now() + '@test.com';
  const { data: auth1 } = await supabase.auth.signUp({ email: email1, password: 'password123' });
  
  const id = 'test-id-' + Date.now();
  const payload1 = {
    id,
    user_id: auth1.user.id,
    code: '123',
    name: 'Test Sub 1',
    color: '#000'
  };
  await supabase.from('user_active_subjects').upsert(payload1);
  
  const email2 = 'test2' + Date.now() + '@test.com';
  const { data: auth2 } = await supabase.auth.signUp({ email: email2, password: 'password123' });
  
  const payload2 = {
    id, // SAME ID!
    user_id: auth2.user.id,
    code: '123',
    name: 'Test Sub 2',
    color: '#000'
  };
  const { data, error } = await supabase.from('user_active_subjects').upsert(payload2).select().single();
  console.log('Result of updating SOMEONE ELSES row:', { data, error });
}
run();
