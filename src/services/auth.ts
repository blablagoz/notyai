import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { oauthRedirectUrl, supabase, supabasePublishableKey, supabaseUrl } from '../lib/supabase';

let listenerReady = false;

async function handleOAuthDeepLink(url: string) {
  if (!url.startsWith(oauthRedirectUrl)) return;

  const parsed = new URL(url);
  const oauthError = parsed.searchParams.get('error_description') || parsed.searchParams.get('error');
  if (oauthError) throw new Error(oauthError);

  const code = parsed.searchParams.get('code');
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
  }

  await Browser.close().catch(() => undefined);
}

export async function initializeOAuthDeepLinks() {
  if (!Capacitor.isNativePlatform() || listenerReady) return;
  listenerReady = true;
  await App.addListener('appUrlOpen', ({ url }) => {
    handleOAuthDeepLink(url).catch((error) => console.error('OAuth yönlendirmesi tamamlanamadı:', error));
  });

  // appUrlOpen handles links while the app is alive. getLaunchUrl is also
  // required when Android starts the app from a completed OAuth redirect.
  const launch = await App.getLaunchUrl().catch(() => undefined);
  if (launch?.url) await handleOAuthDeepLink(launch.url);
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
