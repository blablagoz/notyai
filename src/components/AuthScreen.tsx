import React, { useState } from 'react';
import { Mail, Lock, User, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { signInWithGoogle } from '../services/auth';
import { oauthRedirectUrl } from '../lib/supabase';
import { Capacitor } from '@capacitor/core';
import { ThemeColors } from '../theme';

export function AuthScreen({ theme }: { theme: ThemeColors }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMessage('');
    try {
      const result = mode === 'signup'
        ? await supabase.auth.signUp({ email, password, options: { data: { full_name: name.trim() }, emailRedirectTo: Capacitor.isNativePlatform() ? oauthRedirectUrl : window.location.origin } })
        : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      if (mode === 'signup' && !result.data.session) setMessage('Kayıt tamamlandı. E-postanıza gelen doğrulama bağlantısını açın.');
    } catch (error: any) { setMessage(error.message || 'İşlem tamamlanamadı.'); }
    finally { setBusy(false); }
  };

  return <main className="app-shell min-h-[100dvh] flex items-center justify-center p-4" style={{ backgroundColor: theme.bg, color: theme.textPrimary }}>
    <section className="w-full max-w-md rounded-3xl border p-6 shadow-2xl" style={{ backgroundColor: theme.panel, borderColor: theme.border }}>
      <div className="flex items-center gap-3 mb-6"><div className="w-11 h-11 rounded-2xl flex items-center justify-center font-black" style={{ backgroundColor: theme.accent, color: theme.bg }}>N</div><div><h1 className="text-2xl font-black">NOTY<span style={{ color: theme.accent }}>AI</span></h1><p className="text-xs" style={{ color: theme.textMuted }}>Akıllı ajandanıza güvenli giriş</p></div></div>
      <div className="grid grid-cols-2 gap-1 p-1 rounded-xl mb-5" style={{ backgroundColor: theme.card }}><button onClick={() => setMode('login')} className="py-2 rounded-lg text-xs font-bold" style={{ backgroundColor: mode === 'login' ? theme.accent : 'transparent', color: mode === 'login' ? theme.bg : theme.textMuted }}>Giriş Yap</button><button onClick={() => setMode('signup')} className="py-2 rounded-lg text-xs font-bold" style={{ backgroundColor: mode === 'signup' ? theme.accent : 'transparent', color: mode === 'signup' ? theme.bg : theme.textMuted }}>Kayıt Ol</button></div>
      <form onSubmit={submit} className="space-y-3">
        {mode === 'signup' && <label className="relative block"><User className="absolute left-3 top-3" size={17} color={theme.accent}/><input required value={name} onChange={e => setName(e.target.value)} placeholder="Ad soyad" className="w-full p-3 pl-10 rounded-xl border outline-none text-sm" style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.textPrimary }}/></label>}
        <label className="relative block"><Mail className="absolute left-3 top-3" size={17} color={theme.accent}/><input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-posta" className="w-full p-3 pl-10 rounded-xl border outline-none text-sm" style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.textPrimary }}/></label>
        <label className="relative block"><Lock className="absolute left-3 top-3" size={17} color={theme.accent}/><input required minLength={6} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Şifre" className="w-full p-3 pl-10 rounded-xl border outline-none text-sm" style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.textPrimary }}/></label>
        {message && <p className="text-xs rounded-xl p-3" style={{ backgroundColor: theme.card, color: theme.warning }}>{message}</p>}
        <button disabled={busy} className="w-full py-3 rounded-xl font-bold text-sm disabled:opacity-60" style={{ backgroundColor: theme.accent, color: theme.bg }}>{busy ? 'İşleniyor…' : mode === 'signup' ? 'Hesap Oluştur' : 'Giriş Yap'}</button>
      </form>
      <div className="flex items-center gap-3 my-4"><span className="h-px flex-1" style={{ backgroundColor: theme.border }}/><small style={{ color: theme.textMuted }}>veya</small><span className="h-px flex-1" style={{ backgroundColor: theme.border }}/></div>
      <button onClick={() => signInWithGoogle().catch((e) => setMessage(e.message))} className="w-full py-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-2" style={{ backgroundColor: theme.card, borderColor: theme.border }}><Sparkles size={17} color={theme.accent}/> Google ile Devam Et</button>
    </section>
  </main>;
}
