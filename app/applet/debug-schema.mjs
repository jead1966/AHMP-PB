import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const { data, error } = await supabase.from('mensalidades').select('*').limit(1);
console.log("Error:", error);
console.log("Data:", data);
if (data && data[0]) {
  console.log("Keys:", Object.keys(data[0]));
}
