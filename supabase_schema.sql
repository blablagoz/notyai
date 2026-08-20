-- ==========================================================
-- NotyAI: Arkadaşlık ve Ekip (Team Workspace) SQL Şeması
-- Supabase Dashboard > SQL Editor alanına yapıştırıp çalıştırın.
-- ==========================================================

-- 1. Kullanıcı Profilleri
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;
create policy "Profilleri herkes görebilir" on public.profiles for select using (true);
create policy "Kullanıcı kendi profilini güncelleyebilir" on public.profiles for update using (auth.uid() = id);

-- 2. Ekipler Tablosu
create table if not exists public.teams (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  created_by uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.teams enable row level security;

-- 3. Ekip Üyeleri & Rolleri (Admin / Member)
create table if not exists public.team_members (
  id uuid default gen_random_uuid() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text check (role in ('admin', 'member')) default 'member' not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(team_id, user_id)
);

alter table public.team_members enable row level security;

-- RLS: Ekip Üyelerini Listeleme
create policy "Ekip üyelerini listeleme" on public.team_members
  for select using (
    exists (
      select 1 from public.team_members tm
      where tm.team_id = team_members.team_id and tm.user_id = auth.uid()
    )
  );

-- RLS: Sadece Ekip Kurucusu veya Yöneticiler yeni üye davet edebilir/silebilir
create policy "Yöneticiler üye ekleyebilir/çıkarabilir" on public.team_members
  for insert with check (
    exists (
      select 1 from public.team_members tm
      where tm.team_id = team_members.team_id
        and tm.user_id = auth.uid()
        and tm.role = 'admin'
    ) or exists (
      select 1 from public.teams t
      where t.id = team_members.team_id and t.created_by = auth.uid()
    )
  );

-- RLS: EKİBİ KURAN KİŞİ (KURUCU), HERHANGİ BİR ÜYEYE YÖNETİCİ YETKİSİ VEREBİLİR VEYA ALABİLİR
create policy "Ekip kurucusu rolleri yönetebilir" on public.team_members
  for update using (
    exists (
      select 1 from public.teams t
      where t.id = team_members.team_id and t.created_by = auth.uid()
    )
  );

-- 4. Ekip Hatırlatıcıları (Sadece Admin & Kurucu Ekler/Siler, Üyeler Görür)
create table if not exists public.team_reminders (
  id uuid default gen_random_uuid() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  created_by uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  location text,
  category text default 'Ekip Görevi',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.team_reminders enable row level security;

create policy "Ekip üyeleri hatırlatıcıları okuyabilir" on public.team_reminders
  for select using (
    exists (
      select 1 from public.team_members tm
      where tm.team_id = team_reminders.team_id and tm.user_id = auth.uid()
    )
  );

create policy "Yöneticiler hatırlatıcı ekleyebilir" on public.team_reminders
  for insert with check (
    exists (
      select 1 from public.team_members tm
      where tm.team_id = team_reminders.team_id
        and tm.user_id = auth.uid()
        and tm.role = 'admin'
    )
  );

create policy "Yöneticiler hatırlatıcı silebilir/güncelleyebilir" on public.team_reminders
  for all using (
    exists (
      select 1 from public.team_members tm
      where tm.team_id = team_reminders.team_id
        and tm.user_id = auth.uid()
        and tm.role = 'admin'
    )
  );
