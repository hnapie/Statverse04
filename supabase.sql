-- Chạy trong Supabase > SQL Editor
create table if not exists posts(
  id uuid primary key default gen_random_uuid(),
  author text not null check (char_length(author) between 1 and 40),
  title text not null check (char_length(title) between 1 and 200),
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz default now());
create table if not exists replies(
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  author text not null check (char_length(author) between 1 and 40),
  body text not null check (char_length(body) between 1 and 3000),
  created_at timestamptz default now());
alter table posts enable row level security;
alter table replies enable row level security;
create policy "read posts" on posts for select using (true);
create policy "add posts" on posts for insert with check (true);
create policy "read replies" on replies for select using (true);
create policy "add replies" on replies for insert with check (true);
alter publication supabase_realtime add table posts, replies;
