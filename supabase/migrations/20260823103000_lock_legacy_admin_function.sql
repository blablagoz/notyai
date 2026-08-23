-- This legacy helper predates NotyAI's application schema. It must never be exposed through Data API.
revoke all on function public.rls_auto_enable() from public, anon, authenticated;
