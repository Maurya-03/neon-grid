import { createClient } from '@supabase/supabase-js';

// Get Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase configuration missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file');
  console.warn('📖 See FIX_SIGNATURE_ERROR.txt for instructions');
}

if (supabaseAnonKey === 'YOUR_ACTUAL_ANON_KEY_HERE') {
  console.error('❌ SUPABASE NOT CONFIGURED: You need to replace YOUR_ACTUAL_ANON_KEY_HERE with your real anon key');
  console.error('📖 See FIX_SIGNATURE_ERROR.txt for step-by-step instructions');
  console.error('🔗 Get your key from: https://supabase.com/dashboard/project/fwzguzhppvzzyybnhjkj/settings/api');
}

// Create Supabase client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: false // For anonymous access
    }
  }
);

// Check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  const isConfigured = !!(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseAnonKey !== 'YOUR_ACTUAL_ANON_KEY_HERE' &&
    supabaseAnonKey.startsWith('eyJ') && // JWT tokens start with eyJ
    !supabaseUrl.includes('placeholder')
  );
  
  if (!isConfigured && supabaseUrl) {
    console.warn('⚠️ Supabase URL found but anon key appears invalid');
    console.warn('📖 Make sure to get the correct anon key from your dashboard');
  }
  
  return isConfigured;
};

console.log('🚀 Supabase initialized:', isSupabaseConfigured() ? '✅ Configured' : '❌ Not configured - see FIX_SIGNATURE_ERROR.txt');

export default supabase;
