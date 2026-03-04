// @ts-nocheck
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nalgblxgtrvltjfccbfs.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_cXHWAVh0VpIYVf_s5_3cUQ_YisklIuX';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
