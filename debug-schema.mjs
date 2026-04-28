import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function listTables() {
  console.log('Checking connection to:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  
  // Try a simple RPC or just a query to check schema
  const { data, error } = await supabase.from('noticias').select('*').limit(1);
  
  if (error) {
    console.log('Error querying "noticias":', error.code, error.message);
  } else {
    console.log('Successfully queried "noticias". Found rows:', data.length);
  }

  // Try to use a generic query if possible, though PostgREST doesn't let you list tables easily without RPC
}

listTables();
