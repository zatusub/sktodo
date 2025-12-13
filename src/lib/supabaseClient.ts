import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase Config Check:', {
  urlExists: !!SUPABASE_URL,
  keyExists: !!SUPABASE_ANON_KEY,
  urlPrefix: SUPABASE_URL ? SUPABASE_URL.substring(0, 8) : 'undefined'
});

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase URL or Key is missing!');
}

export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder-url.supabase.co', 
  SUPABASE_ANON_KEY || 'placeholder-key'
);
