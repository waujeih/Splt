import { createClient } from '@supabase/supabase-js';

const enabled = process.env.NEXT_PUBLIC_USE_SUPABASE === 'true';
export const supabase = enabled
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  : null;

export const isSupabase = !!supabase;