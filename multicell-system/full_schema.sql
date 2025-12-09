-- Multicell System - schema simplificado (idempotente)
-- Compatível com Supabase. Usa IF NOT EXISTS, RLS e isolamento por usuário (auth.uid() = user_id).

set check_function_bodies = off;

-- Extensões
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- Trigger helpers
create or replace function public.set_timestamps()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    new.created_at := coalesce(new.created_at, timezone('utc', now()));
  end if;
  return new;
end;
$$;

create or replace function public.set_user_id_default()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.user_id is null then
    new.user_id := auth.uid();
  end if;
  return new;
end;
$$;

create or replace function public.calc_subtotal_venda_item()
returns trigger
language plpgsql
as $$
begin
  new.subtotal := coalesce(new.quantidade, 0) * coalesce(new.preco_unit, 0);
  return new;
end;
$$;

create or replace function public.sync_total_venda()
returns trigger
language plpgsql
as $$
begin
  update public.vendas v
  set total = coalesce((
    select sum(coalesce(subtotal,0)) from public.vendas_itens vi where vi.venda_id = v.id
  ), 0)
  where v.id = coalesce(new.venda_id, old.venda_id);
  return null;
end;
$$;

-- Tabelas
create table if not exists public.proprietarios (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null default auth.uid(),
  email text unique not null,
  nome text,
  created_at timestamptz default now()
);

create index if not exists proprietarios_created_at_idx on public.proprietarios (created_at desc);
create index if not exists proprietarios_email_idx on public.proprietarios (lower(email));
create index if not exists proprietarios_user_idx on public.proprietarios (user_id);

create table if not exists public.clientes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null default auth.uid(),
  nome text not null,
  telefone text,
  cpf text,
  email text,
  observacoes text,
  created_at timestamptz default now() not null
);

create index if not exists clientes_created_at_idx on public.clientes (created_at desc);
create index if not exists clientes_nome_idx on public.clientes (lower(nome));
create index if not exists clientes_user_idx on public.clientes (user_id);

create table if not exists public.produtos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null default auth.uid(),
  nome text not null,
  preco numeric not null,
  estoque integer default 0,
  created_at timestamptz default now() not null
);

create index if not exists produtos_created_at_idx on public.produtos (created_at desc);
create index if not exists produtos_nome_idx on public.produtos (lower(nome));
create index if not exists produtos_user_idx on public.produtos (user_id);

create table if not exists public.vendas (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null default auth.uid(),
  cliente_id uuid references public.clientes(id),
  total numeric default 0,
  created_at timestamptz default now() not null
);

create index if not exists vendas_created_at_idx on public.vendas (created_at desc);
create index if not exists vendas_user_idx on public.vendas (user_id);

create table if not exists public.vendas_itens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null default auth.uid(),
  venda_id uuid references public.vendas(id),
  produto_id uuid references public.produtos(id),
  quantidade integer not null,
  preco_unit numeric not null,
  subtotal numeric not null,
  created_at timestamptz default now() not null
);

create index if not exists vendas_itens_created_at_idx on public.vendas_itens (created_at desc);
create index if not exists vendas_itens_user_idx on public.vendas_itens (user_id);

create table if not exists public.os (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null default auth.uid(),
  cliente_id uuid references public.clientes(id),
  aparelho text not null,
  defeito text,
  valor numeric default 0,
  status text default 'aberto',
  created_at timestamptz default now() not null
);

create index if not exists os_created_at_idx on public.os (created_at desc);
create index if not exists os_aparelho_idx on public.os (lower(aparelho));
create index if not exists os_user_idx on public.os (user_id);

create table if not exists public.garantias (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null default auth.uid(),
  os_id uuid references public.os(id),
  descricao text,
  validade timestamptz,
  created_at timestamptz default now() not null
);

create index if not exists garantias_created_at_idx on public.garantias (created_at desc);
create index if not exists garantias_descricao_idx on public.garantias (lower(coalesce(descricao,'')));
create index if not exists garantias_user_idx on public.garantias (user_id);

create table if not exists public.despesas (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null default auth.uid(),
  categoria text not null,
  descricao text,
  valor numeric not null,
  created_at timestamptz default now() not null
);

create index if not exists despesas_created_at_idx on public.despesas (created_at desc);
create index if not exists despesas_categoria_idx on public.despesas (lower(categoria));
create index if not exists despesas_user_idx on public.despesas (user_id);

-- Triggers
drop trigger if exists vendas_itens_calc_subtotal on public.vendas_itens;
create trigger vendas_itens_calc_subtotal
before insert or update on public.vendas_itens
for each row execute procedure public.calc_subtotal_venda_item();

drop trigger if exists vendas_itens_sync_total on public.vendas_itens;
create trigger vendas_itens_sync_total
after insert or update or delete on public.vendas_itens
for each row execute procedure public.sync_total_venda();

drop trigger if exists proprietarios_set_ts on public.proprietarios;
create trigger proprietarios_set_ts before insert or update on public.proprietarios for each row execute procedure public.set_timestamps();
drop trigger if exists proprietarios_set_user on public.proprietarios;
create trigger proprietarios_set_user before insert on public.proprietarios for each row execute procedure public.set_user_id_default();

drop trigger if exists clientes_set_ts on public.clientes;
create trigger clientes_set_ts before insert or update on public.clientes for each row execute procedure public.set_timestamps();
drop trigger if exists clientes_set_user on public.clientes;
create trigger clientes_set_user before insert on public.clientes for each row execute procedure public.set_user_id_default();

drop trigger if exists produtos_set_ts on public.produtos;
create trigger produtos_set_ts before insert or update on public.produtos for each row execute procedure public.set_timestamps();
drop trigger if exists produtos_set_user on public.produtos;
create trigger produtos_set_user before insert on public.produtos for each row execute procedure public.set_user_id_default();

drop trigger if exists vendas_set_ts on public.vendas;
create trigger vendas_set_ts before insert or update on public.vendas for each row execute procedure public.set_timestamps();
drop trigger if exists vendas_set_user on public.vendas;
create trigger vendas_set_user before insert on public.vendas for each row execute procedure public.set_user_id_default();

drop trigger if exists vendas_itens_set_ts on public.vendas_itens;
create trigger vendas_itens_set_ts before insert or update on public.vendas_itens for each row execute procedure public.set_timestamps();
drop trigger if exists vendas_itens_set_user on public.vendas_itens;
create trigger vendas_itens_set_user before insert on public.vendas_itens for each row execute procedure public.set_user_id_default();

drop trigger if exists os_set_ts on public.os;
create trigger os_set_ts before insert or update on public.os for each row execute procedure public.set_timestamps();
drop trigger if exists os_set_user on public.os;
create trigger os_set_user before insert on public.os for each row execute procedure public.set_user_id_default();

drop trigger if exists garantias_set_ts on public.garantias;
create trigger garantias_set_ts before insert or update on public.garantias for each row execute procedure public.set_timestamps();
drop trigger if exists garantias_set_user on public.garantias;
create trigger garantias_set_user before insert on public.garantias for each row execute procedure public.set_user_id_default();

drop trigger if exists despesas_set_ts on public.despesas;
create trigger despesas_set_ts before insert or update on public.despesas for each row execute procedure public.set_timestamps();
drop trigger if exists despesas_set_user on public.despesas;
create trigger despesas_set_user before insert on public.despesas for each row execute procedure public.set_user_id_default();

-- RLS e políticas
alter table public.proprietarios enable row level security;
alter table public.clientes enable row level security;
alter table public.produtos enable row level security;
alter table public.vendas enable row level security;
alter table public.vendas_itens enable row level security;
alter table public.os enable row level security;
alter table public.garantias enable row level security;
alter table public.despesas enable row level security;

-- Limpar políticas antigas para evitar conflitos
do $$
begin
  perform 1;
  execute 'drop policy if exists proprietarios_all on public.proprietarios';
  execute 'drop policy if exists clientes_all on public.clientes';
  execute 'drop policy if exists produtos_all on public.produtos';
  execute 'drop policy if exists vendas_all on public.vendas';
  execute 'drop policy if exists vendas_itens_all on public.vendas_itens';
  execute 'drop policy if exists os_all on public.os';
  execute 'drop policy if exists garantias_all on public.garantias';
  execute 'drop policy if exists despesas_all on public.despesas';
  execute 'drop policy if exists proprietarios_owner_all on public.proprietarios';
  execute 'drop policy if exists clientes_owner_all on public.clientes';
  execute 'drop policy if exists produtos_owner_all on public.produtos';
  execute 'drop policy if exists vendas_owner_all on public.vendas';
  execute 'drop policy if exists vendas_itens_owner_all on public.vendas_itens';
  execute 'drop policy if exists os_owner_all on public.os';
  execute 'drop policy if exists garantias_owner_all on public.garantias';
  execute 'drop policy if exists despesas_owner_all on public.despesas';
end $$;

-- Políticas: auth.uid() = user_id
create policy if not exists proprietarios_owner_all
  on public.proprietarios
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists clientes_owner_all
  on public.clientes
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists produtos_owner_all
  on public.produtos
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists vendas_owner_all
  on public.vendas
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists vendas_itens_owner_all
  on public.vendas_itens
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists os_owner_all
  on public.os
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists garantias_owner_all
  on public.garantias
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists despesas_owner_all
  on public.despesas
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

set check_function_bodies = on;
