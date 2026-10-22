-- Chạy SAU supabase.sql và supabase_friends.sql
alter table posts add column if not exists img text check (img is null or char_length(img) < 400000);
alter table messages add column if not exists img text check (img is null or char_length(img) < 400000);
create table if not exists reactions(id uuid primary key default gen_random_uuid(), message_id uuid not null references messages(id) on delete cascade, user_id uuid not null references profiles(id), emoji text not null check (char_length(emoji) <= 8), unique(message_id,user_id,emoji));
alter table reactions enable row level security;
create policy "r read" on reactions for select to authenticated using (exists (select 1 from messages m where m.id = message_id));
create policy "r add" on reactions for insert to authenticated with check (user_id = auth.uid() and exists (select 1 from messages m where m.id = message_id));
create policy "r del" on reactions for delete to authenticated using (user_id = auth.uid());
alter publication supabase_realtime add table reactions;
