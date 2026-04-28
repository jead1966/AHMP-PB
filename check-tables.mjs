import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkTables() {
  const tables = ['noticias', 'videos', 'competicoes'];
  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1);
    if (error) {
      console.log(`Table ${table} does not exist or error:`, error.message);
    } else {
      console.log(`Table ${table} exists!`);
    }
  }
}

checkTables();
