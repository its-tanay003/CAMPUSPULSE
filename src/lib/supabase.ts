import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase.
// In client code, ONLY the anonymous public key is ever used.
// The service role key is NEVER exposed in the browser.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co'
);

// If configured, use Supabase client; otherwise mock-client will handle graceful local demo mode
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

