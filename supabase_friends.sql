-- Chạy SAU supabase.sql. Bật đăng nhập: Authentication > Providers > Email > TẮT "Confirm email".
create table if not exists profiles(id uuid primary key references auth.users on delete cascade, handle text unique not null);
create table if not exists friendships(id uuid primary key default gen_random_uuid(), a uuid not null references profiles(id), b uuid not null references profiles(id), status text not null default 'pending', unique(a,b));
create table if not exists messages(id uuid primary key default gen_random_uuid(), sender uuid not null references profiles(id), receiver uuid not null references profiles(id), body text not null check (char_length(body) between 1 and 2000), created_at timestamptz default now());
alter table profiles enable row level security; alter table friendships enable row level security; alter table messages enable row level security;
create policy "p read" on profiles for select to authenticated using (true);
create policy "p add" on profiles for insert to authenticated with check (id = auth.uid());
create policy "f read" on friendships for select to authenticated using (a = auth.uid() or b = auth.uid());
create policy "f add" on friendships for insert to authenticated with check (a = auth.uid() and status = 'pending');
create policy "f accept" on friendships for update to authenticated using (b = auth.uid()) with check (b = auth.uid());
create policy "m read" on messages for select to authenticated using (sender = auth.uid() or receiver = auth.uid());
create policy "m add" on messages for insert to authenticated with check (sender = auth.uid() and exists (select 1 from friendships f where f.status = 'ok' and ((f.a = sender and f.b = receiver) or (f.b = sender and f.a = receiver))));
alter publication supabase_realtime add table friendships, messages;
