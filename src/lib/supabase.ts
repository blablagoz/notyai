import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ujwlgblxgorufxikwqjp.supabase.co';
export const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_4HPTSWDpGqCmDbdCHCAa-Q_V9GGFrxP';

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    flowType: 'pkce',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const oauthRedirectUrl = 'com.blablagoz.notyai://login-callback';
