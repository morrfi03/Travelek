create table if not exists profiles (
  user_id text primary key,
  email text not null unique,
  display_name text not null default '',
  role text not null default 'user',
  created_at timestamptz not null default now()
);

create table if not exists diaries (
  user_id text primary key,
  data text not null default '{}',
  updated_at timestamptz not null default now()
);
