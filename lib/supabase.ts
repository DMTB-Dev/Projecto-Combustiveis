import { createClient } from '@supabase/supabase-js';

// These will be replaced with real values from .env
// For now, using placeholders that allow the app to build
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const isSupabaseConfigured = (): boolean => {
  return (
    SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    SUPABASE_ANON_KEY !== 'placeholder-key'
  );
};
