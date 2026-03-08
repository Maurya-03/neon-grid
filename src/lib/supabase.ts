import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return !!(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('placeholder') &&
    (supabaseAnonKey.startsWith('eyJ') || supabaseAnonKey.startsWith('sb_publishable_'))
  );
};

// Only create the client if we have valid credentials — newer supabase-js throws on invalid URLs
let _supabase: SupabaseClient | null = null;

if (isSupabaseConfigured()) {
  _supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
  console.log('🚀 Supabase initialized: ✅ Configured');
} else {
  console.warn('⚠️ Supabase not configured — media uploads will use mock mode. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local to enable.');
}

export const supabase = _supabase;
export default _supabase;
