-- =====================================================================
-- Esquema del Blog — RG Gestión de Marcas
-- Plataforma: Supabase (Postgres + Auth + Storage)
-- Conectar con cualquier cliente SQL de Supabase y ejecutar este script
-- desde el editor SQL del proyecto. El script es idempotente.
-- =====================================================================

-- =====================================================================
-- MIGRACIÓN: eliminar categorías (redundante con tags).
-- Ejecutar UNA VEZ si las tablas viejas ya existen en la base de datos.
-- =====================================================================
drop table if exists public.post_categories;
drop table if exists public.categories;

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Tabla: posts
-- ---------------------------------------------------------------------
create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text not null unique,
  excerpt     text,
  content_md  text not null,
  cover_image text,
  status      text not null default 'draft'
              check (status in ('draft', 'published')),
  author_id   uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists posts_status_created_at_idx
  on public.posts (status, created_at desc);

create index if not exists posts_author_id_idx
  on public.posts (author_id);

-- ---------------------------------------------------------------------
-- Tabla: tags
-- ---------------------------------------------------------------------
create table if not exists public.tags (
  id   uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);

-- ---------------------------------------------------------------------
-- Tabla pivote: post_tags (muchos a muchos)
-- ---------------------------------------------------------------------
create table if not exists public.post_tags (
  post_id uuid not null references public.posts(id) on delete cascade,
  tag_id  uuid not null references public.tags(id)  on delete cascade,
  primary key (post_id, tag_id)
);

create index if not exists post_tags_tag_id_idx
  on public.post_tags (tag_id);

-- ---------------------------------------------------------------------
-- Trigger: mantener updated_at actualizado automáticamente
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_touch_posts on public.posts;
create trigger trg_touch_posts
  before update on public.posts
  for each row execute function public.touch_updated_at();

-- =====================================================================
-- Row Level Security (RLS)
-- Política general:
--   * Lectura pública (anon + authenticated): ver posts publicados y tags.
--   * Escritura (insert/update/delete): solo rol authenticated.
-- =====================================================================

alter table public.posts         enable row level security;
alter table public.tags          enable row level security;
alter table public.post_tags     enable row level security;

-- ---------- posts ----------
drop policy if exists "posts_public_read_published" on public.posts;
create policy "posts_public_read_published"
  on public.posts
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "posts_auth_full_access" on public.posts;
create policy "posts_auth_full_access"
  on public.posts
  for all
  to authenticated
  using (true)
  with check (true);

-- ---------- tags ----------
drop policy if exists "tags_public_read" on public.tags;
create policy "tags_public_read"
  on public.tags
  for select
  to anon, authenticated
  using (true);

drop policy if exists "tags_auth_write" on public.tags;
create policy "tags_auth_write"
  on public.tags
  for all
  to authenticated
  using (true)
  with check (true);

-- ---------- post_tags ----------
drop policy if exists "post_tags_public_read" on public.post_tags;
create policy "post_tags_public_read"
  on public.post_tags
  for select
  to anon, authenticated
  using (true);

drop policy if exists "post_tags_auth_write" on public.post_tags;
create policy "post_tags_auth_write"
  on public.post_tags
  for all
  to authenticated
  using (true)
  with check (true);

-- =====================================================================
-- Storage: bucket "blog-covers"
--   * Lectura pública.
--   * Escritura solo para usuarios autenticados (staff).
-- El bucket se crea con esta SQL; las policies asociadas se aplican
-- sobre la tabla storage.objects.
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('blog-covers', 'blog-covers', true)
on conflict (id) do nothing;

drop policy if exists "blog_covers_public_read" on storage.objects;
create policy "blog_covers_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'blog-covers');

drop policy if exists "blog_covers_auth_write" on storage.objects;
create policy "blog_covers_auth_write"
  on storage.objects
  for all
  to authenticated
  using (bucket_id = 'blog-covers')
  with check (bucket_id = 'blog-covers');

-- =====================================================================
-- Forzar cambio de contraseña por defecto
-- Trigger BEFORE INSERT sobre auth.users que añade el flag
-- `must_change_password = true` en `raw_user_meta_data` cuando un
-- usuario es creado sin especificarlo explícitamente. Esto hace que
-- el panel admin pida cambiar la contraseña en el primer inicio de
-- sesión sin necesidad de configurar metadata manualmente.
-- Si al crear el usuario se define explícitamente `must_change_password`
-- (true o false), ese valor se respeta y NO se sobrescribe.
-- =====================================================================

create or replace function public.force_password_change_default()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if new.raw_user_meta_data is null or not (new.raw_user_meta_data ? 'must_change_password') then
    new.raw_user_meta_data := coalesce(new.raw_user_meta_data, '{}'::jsonb)
      || '{"must_change_password": true}'::jsonb;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_force_password_change_default on auth.users;
create trigger trg_force_password_change_default
  before insert on auth.users
  for each row execute function public.force_password_change_default();

-- =====================================================================
-- Notas operativas
-- =====================================================================
-- 1. Crear el proyecto en https://supabase.com y pegar este script en
--    "SQL Editor" → "New query" → Run.
-- 2. En "Authentication" → "Providers", mantener Email habilitado.
-- 3. En "Authentication" → "URL Configuration", agregar el dominio del
--    sitio (ej. https://rg-gestiondemarcas.com) en "Site URL".
-- 4. Desactivar el registro público: "Authentication" → "Sign Up" →
--    "Allow new users to sign up" = OFF. Crear las cuentas de staff
--    manualmente desde el panel ("Add user" con email + password).
-- 5. Tomar nota de:
--      * Project URL → js/blog-config.js (SUPABASE_URL)
--      * anon public key → js/blog-config.js (SUPABASE_ANON_KEY)
--    La service role key NO debe usarse en el frontend.
-- 
-- 6. (Automático) Cambio de contraseña obligatorio en el primer inicio de
--    sesión del panel admin:
--    El trigger `force_password_change_default` definido arriba añade
--    automáticamente `must_change_password = true` a la metadata de cada
--    usuario nuevo, por lo que el panel forzará el cambio en su primer
--    inicio de sesión sin configuración manual.
--
--    a) Para excluir a un usuario concreto del cambio obligatorio,
--       definir explícitamente el flag como `false` al crearlo:
--          {"must_change_password": false}
--
--    b) Para volver a forzar el cambio a un usuario existente (creado
--       antes de instalar el trigger o que ya cambió su contraseña),
--       ejecutar en SQL Editor:
--          update auth.users
--            set raw_user_meta_data = raw_user_meta_data
--              || '{"must_change_password": true}'::jsonb
--            where email = 'staff@rg-gestiondemarcas.com';
--
--    El flag se limpia automáticamente desde el navegador cuando el
--    usuario actualiza su contraseña (sb.auth.updateUser con data).
 