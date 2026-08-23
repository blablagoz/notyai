import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { oauthRedirectUrl, supabase, supabasePublishableKey, supabaseUrl } from '../lib/supabase';

let listenerReady = false;

export async function initializeOAuthDeepLinks() {
  if (!Capacitor.isNativePlatform() || listenerReady) return;
  listenerReady = true;
  await App.addListener('appUrlOpen', async ({ url }) => {
    if (!url.startsWith(oauthRedirectUrl)) return;
    const parsed = new URL(url);
    const code = parsed.searchParams.get('code');
    if (code) await supabase.auth.exchangeCodeForSession(code);
    await Browser.close().catch(() => undefined);
  });
}

export async function signInWithGoogle() {
  const settingsResponse = await fetch(`${supabaseUrl}/auth/v1/settings`, {
    headers: { apikey: supabasePublishableKey },
  });
  if (!settingsResponse.ok) throw new Error('Google giriş ayarı doğrulanamadı. Lütfen internet bağlantınızı kontrol edin.');
  const settings = await settingsResponse.json();
  if (!settings?.external?.google) {
    throw new Error('Google ile giriş henüz etkinleştirilmedi. Şimdilik Gmail adresinizle Kayıt Ol seçeneğini kullanabilirsiniz.');
  }
  const native = Capacitor.isNativePlatform();
  const redirectTo = native ? oauthRedirectUrl : window.location.origin;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: native },
  });
  if (error) throw error;
  if (native && data.url) await Browser.open({ url: data.url });
}
