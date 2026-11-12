create extension if not exists pgcrypto;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 120),
  category text not null check (category in ('papeleria', 'ferreteria', 'agroinsumos', 'servicios')),
  address text not null check (char_length(btrim(address)) between 2 and 240),
  phone_whatsapp text not null check (phone_whatsapp ~ '^52[0-9]{10}$'),
  zone text not null default 'Zona Centro' check (char_length(btrim(zone)) between 2 and 100),
  shelf_photos text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 160),
  category text not null check (category in ('papeleria', 'ferreteria', 'agroinsumos', 'servicios')),
  tags text[] not null default '{}',
  price numeric(10, 2) check (price is null or price >= 0),
  business_id uuid not null references public.businesses (id) on delete cascade,
  in_stock boolean not null default true,
  image_url text not null default ''
);

create table if not exists public.whatsapp_analytics (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products (id) on delete set null,
  business_id uuid not null references public.businesses (id) on delete cascade,
  type text not null check (type in ('direct_contact', 'quote_list')),
  created_at timestamptz not null default now()
);

-- Merchant entries are reviewed before they are added to the public catalog.
create table if not exists public.merchant_submissions (
  id uuid primary key default gen_random_uuid(),
  request_type text not null default 'new_business'
    check (request_type in ('new_business', 'update_business')),
  name text not null check (char_length(btrim(name)) between 2 and 120),
  category text not null check (category in ('papeleria', 'ferreteria', 'agroinsumos', 'servicios')),
  address text not null check (char_length(btrim(address)) between 2 and 240),
  phone_whatsapp text not null check (phone_whatsapp ~ '^52[0-9]{10}$'),
  zone text not null default 'Zona Centro' check (char_length(btrim(zone)) between 2 and 100),
  shelf_photos text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.merchant_submissions
  add column if not exists request_type text not null default 'new_business'
    check (request_type in ('new_business', 'update_business'));

create index if not exists products_business_id_idx on public.products (business_id);
create index if not exists products_category_idx on public.products (category);
create index if not exists whatsapp_analytics_created_at_idx on public.whatsapp_analytics (created_at desc);
create index if not exists whatsapp_analytics_business_id_idx on public.whatsapp_analytics (business_id);
create index if not exists merchant_submissions_created_at_idx on public.merchant_submissions (created_at desc);

alter table public.businesses enable row level security;
alter table public.products enable row level security;
alter table public.whatsapp_analytics enable row level security;
alter table public.merchant_submissions enable row level security;

drop policy if exists "Public can read businesses" on public.businesses;
create policy "Public can read businesses"
  on public.businesses for select to anon, authenticated
  using (true);

drop policy if exists "Public can read products" on public.products;
create policy "Public can read products"
  on public.products for select to anon, authenticated
  using (true);

drop policy if exists "Public can insert WhatsApp analytics" on public.whatsapp_analytics;
create policy "Public can insert WhatsApp analytics"
  on public.whatsapp_analytics for insert to anon, authenticated
  with check (true);

drop policy if exists "Public can submit merchant applications" on public.merchant_submissions;
create policy "Public can submit merchant applications"
  on public.merchant_submissions for insert to anon, authenticated
  with check (status = 'pending');

grant usage on schema public to anon, authenticated;
grant select on public.businesses, public.products to anon, authenticated;
grant insert on public.whatsapp_analytics, public.merchant_submissions to anon, authenticated;
revoke update, delete on public.businesses, public.products, public.whatsapp_analytics, public.merchant_submissions from anon, authenticated;
