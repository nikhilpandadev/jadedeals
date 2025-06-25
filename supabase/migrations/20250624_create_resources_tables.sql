-- 20250624_create_resources_tables.sql
-- Migration for promoter resources/blogs

-- 1. Resources table
create table if not exists resources (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid references auth.users(id) on delete set null,
  title text not null,
  content jsonb not null, -- rich text content
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  views integer default 0,
  likes integer default 0,
  comments_count integer default 0,
  cover_image_url text
);

-- 2. Resource likes table
create table if not exists resource_likes (
  id uuid primary key default uuid_generate_v4(),
  resource_id uuid references resources(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(resource_id, user_id)
);

-- 3. Resource comments table
create table if not exists resource_comments (
  id uuid primary key default uuid_generate_v4(),
  resource_id uuid references resources(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now(),
  parent_id uuid references resource_comments(id) on delete cascade
);

-- 4. (Optional) Add index for faster lookups
create index if not exists idx_resource_comments_resource_id on resource_comments(resource_id);
create index if not exists idx_resource_likes_resource_id on resource_likes(resource_id);
create index if not exists idx_resources_author_id on resources(author_id);
