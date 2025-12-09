-- Multicell System - full schema (idempotente)
-- Compatível com Supabase. Usa IF NOT EXISTS sempre que possível.

set check_function_bodies = off;

-- Extensões necessárias
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- Funções helper de contexto (usuário/proprietário)
create or replace function public.current_owner_email()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select lower(coalesce(auth.jwt()->>'email', ''));
$$;

create or replace function public.current_owner_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.proprietarios
  where lower(email) = lower(coalesce(auth.jwt()->>'email', ''))
  limit 1;
$$;

-- Funções utilitárias de timestamp e aliases
create or replace function public.set_dual_timestamps()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  new.atualizado_em := new.updated_at;
  if tg_op = 'INSERT' then
    new.created_at := coalesce(new.created_at, timezone('utc', now()));
    new.criado_em := new.created_at;
  end if;
  return new;
end;
$$;

create or replace function public.set_created_only()
returns trigger
language plpgsql
as $$
begin
  new.criado_em := coalesce(new.criado_em, timezone('utc', now()));
  return new;
end;
$$;

create or replace function public.os_sync_aliases()
returns trigger
language plpgsql
as $$
begin
  if new.cliente is null then
    new.cliente := new.cliente_nome;
  end if;
  if new.obs is null then
    new.obs := new.observacoes;
  end if;
  return new;
end;
$$;

create or replace function public.set_owner_default()
returns trigger
language plpgsql
as $$
begin
  if new.proprietario_id is null then
    new.proprietario_id := public.current_owner_id();
  end if;
  return new;
end;
$$;

-- Tabelas principais
create table if not exists public.proprietarios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null unique,
  telefone text,
  documento text,
  auth_user_id uuid unique,
  endereco text,
  cidade text,
  uf text,
  ativo boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  criado_em timestamptz not null default timezone('utc', now()),
  atualizado_em timestamptz not null default timezone('utc', now())
);

create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  proprietario_id uuid not null references public.proprietarios(id) on delete cascade,
  nome text not null,
  telefone text,
  email text,
  cpf text,
  observacoes text,
  obs text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  criado_em timestamptz not null default timezone('utc', now()),
  atualizado_em timestamptz not null default timezone('utc', now())
);

create table if not exists public.produtos (
  id uuid primary key default gen_random_uuid(),
  proprietario_id uuid not null references public.proprietarios(id) on delete cascade,
  nome text not null,
  codigo text,
  categoria text,
  descricao text,
  preco_custo numeric(12,2) not null default 0,
  preco_venda numeric(12,2) not null default 0,
  quantidade integer not null default 0,
  quantidade_estoque integer not null default 0,
  estoque_minimo integer not null default 0,
  ativo boolean not null default true,
  observacoes text,
  fotos text[] not null default '{}'::text[],
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  criado_em timestamptz not null default timezone('utc', now()),
  atualizado_em timestamptz not null default timezone('utc', now())
);

create unique index if not exists produtos_codigo_unq on public.produtos (proprietario_id, lower(codigo)) where codigo is not null;
create index if not exists produtos_owner_nome_idx on public.produtos (proprietario_id, nome);
create index if not exists produtos_owner_idx on public.produtos (proprietario_id);

create table if not exists public.vendas (
  id uuid primary key default gen_random_uuid(),
  proprietario_id uuid not null references public.proprietarios(id) on delete cascade,
  cliente_id uuid references public.clientes(id) on delete set null,
  cliente_nome text,
  forma_pagamento text not null default 'pix' check (forma_pagamento in ('dinheiro','cartao','pix','outro')),
  status text not null default 'concluido' check (status in ('rascunho','aberta','concluido','cancelada')),
  total_bruto numeric(12,2) not null default 0,
  desconto numeric(12,2) not null default 0,
  total_liquido numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  valor_total numeric(12,2) generated always as (coalesce(total_liquido, total)) stored,
  data_venda timestamptz not null default timezone('utc', now()),
  data timestamptz not null default timezone('utc', now()),
  observacoes text,
  cabecalho jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  criado_em timestamptz not null default timezone('utc', now()),
  atualizado_em timestamptz not null default timezone('utc', now())
);

create index if not exists vendas_owner_data_idx on public.vendas (proprietario_id, data_venda desc);
create index if not exists vendas_owner_idx on public.vendas (proprietario_id);
create index if not exists vendas_owner_cliente_idx on public.vendas (proprietario_id, lower(coalesce(cliente_nome, '')));

create table if not exists public.itens_venda (
  id uuid primary key default gen_random_uuid(),
  venda_id uuid not null references public.vendas(id) on delete cascade,
  produto_id uuid references public.produtos(id) on delete set null,
  descricao text not null,
  quantidade integer not null check (quantidade > 0),
  preco_unitario numeric(12,2) not null default 0,
  subtotal numeric(12,2) not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  criado_em timestamptz not null default timezone('utc', now()),
  atualizado_em timestamptz not null default timezone('utc', now())
);

create table if not exists public.caixa_movimentos (
  id uuid primary key default gen_random_uuid(),
  proprietario_id uuid not null references public.proprietarios(id) on delete cascade,
  tipo text not null check (tipo in ('entrada','saida')),
  descricao text,
  categoria text,
  valor numeric(12,2) not null default 0,
  data timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  criado_em timestamptz not null default timezone('utc', now()),
  atualizado_em timestamptz not null default timezone('utc', now())
);

create table if not exists public.os (
  id uuid primary key default gen_random_uuid(),
  numero bigserial unique,
  proprietario_id uuid not null references public.proprietarios(id) on delete cascade,
  cliente_nome text not null,
  cliente text,
  cliente_telefone text,
  aparelho text not null,
  aparelho_descricao text,
  imei text,
  problema_relatado text,
  problema text,
  servico text,
  senha_aparelho text,
  tecnico text,
  valor_orcado numeric(12,2) not null default 0,
  valor_estimado numeric(12,2),
  valor_final numeric(12,2),
  status text not null default 'aberta' check (status in ('aberta','em_andamento','concluida')),
  data_entrada timestamptz not null default timezone('utc', now()),
  data_entrega timestamptz,
  observacoes text,
  obs text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  criado_em timestamptz not null default timezone('utc', now()),
  atualizado_em timestamptz not null default timezone('utc', now())
);

create index if not exists os_owner_status_idx on public.os (proprietario_id, status);

create table if not exists public.garantias (
  id uuid primary key default gen_random_uuid(),
  proprietario_id uuid not null references public.proprietarios(id) on delete cascade,
  os_id uuid references public.os(id) on delete set null,
  cliente text not null,
  telefone text,
  aparelho text not null,
  imei text,
  servico text not null,
  valor numeric(12,2) not null default 0,
  data_entrega date,
  data_validade date,
  codigo text,
  empresa_nome text,
  empresa_cnpj text,
  empresa_telefone text,
  obs text,
  fotos text[] not null default '{}'::text[],
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  criado_em timestamptz not null default timezone('utc', now()),
  atualizado_em timestamptz not null default timezone('utc', now())
);

create table if not exists public.configuracoes (
  id text primary key,
  nome_loja text,
  cnpj text,
  telefone text,
  email text,
  endereco text,
  cidade text,
  uf text,
  tema text not null default 'multicell' check (tema in ('dark','light','multicell')),
  pix_chave text,
  logo_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  criado_em timestamptz not null default timezone('utc', now()),
  atualizado_em timestamptz not null default timezone('utc', now())
);

create table if not exists public.storage_files (
  id uuid primary key default gen_random_uuid(),
  proprietario_id uuid not null references public.proprietarios(id) on delete cascade,
  entidade text not null,
  entidade_id uuid,
  nome_arquivo text not null,
  caminho text not null,
  url_publica text,
  tamanho bigint,
  tipo text,
  criado_em timestamptz not null default timezone('utc', now())
);

create table if not exists public.despesas (
  id uuid primary key default gen_random_uuid(),
  proprietario_id uuid not null references public.proprietarios(id) on delete cascade,
  descricao text not null,
  categoria text,
  valor numeric(12,2) not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  criado_em timestamptz not null default timezone('utc', now()),
  atualizado_em timestamptz not null default timezone('utc', now())
);

create index if not exists despesas_owner_created_idx on public.despesas (proprietario_id, created_at desc);

create table if not exists public.usuarios (
  id uuid primary key default gen_random_uuid(),
  proprietario_id uuid references public.proprietarios(id) on delete set null,
  nome text not null,
  email text not null,
  role text not null default 'GERENTE' check (role in ('ADMIN','GERENTE','CAIXA')),
  ativo boolean not null default true,
  empresa_id integer not null default 1,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  criado_em timestamptz not null default timezone('utc', now()),
  atualizado_em timestamptz not null default timezone('utc', now())
);

-- Triggers de timestamp e owner default
create trigger proprietarios_set_dual_ts before insert or update on public.proprietarios for each row execute procedure public.set_dual_timestamps();
create trigger clientes_set_dual_ts before insert or update on public.clientes for each row execute procedure public.set_dual_timestamps();
create trigger clientes_owner_default before insert on public.clientes for each row execute procedure public.set_owner_default();

create trigger produtos_set_dual_ts before insert or update on public.produtos for each row execute procedure public.set_dual_timestamps();
create trigger produtos_owner_default before insert on public.produtos for each row execute procedure public.set_owner_default();

create trigger vendas_set_dual_ts before insert or update on public.vendas for each row execute procedure public.set_dual_timestamps();
create trigger vendas_owner_default before insert on public.vendas for each row execute procedure public.set_owner_default();

create trigger itens_venda_set_dual_ts before insert or update on public.itens_venda for each row execute procedure public.set_dual_timestamps();

create trigger caixa_set_dual_ts before insert or update on public.caixa_movimentos for each row execute procedure public.set_dual_timestamps();
create trigger caixa_owner_default before insert on public.caixa_movimentos for each row execute procedure public.set_owner_default();

create trigger os_set_dual_ts before insert or update on public.os for each row execute procedure public.set_dual_timestamps();
create trigger os_sync_alias before insert or update on public.os for each row execute procedure public.os_sync_aliases();
create trigger os_owner_default before insert on public.os for each row execute procedure public.set_owner_default();

create trigger garantias_set_dual_ts before insert or update on public.garantias for each row execute procedure public.set_dual_timestamps();
create trigger garantias_owner_default before insert on public.garantias for each row execute procedure public.set_owner_default();

create trigger configuracoes_set_dual_ts before insert or update on public.configuracoes for each row execute procedure public.set_dual_timestamps();

create trigger storage_files_created_ts before insert on public.storage_files for each row execute procedure public.set_created_only();
create trigger storage_files_owner_default before insert on public.storage_files for each row execute procedure public.set_owner_default();

create trigger despesas_set_dual_ts before insert or update on public.despesas for each row execute procedure public.set_dual_timestamps();
create trigger despesas_owner_default before insert on public.despesas for each row execute procedure public.set_owner_default();

create trigger usuarios_set_dual_ts before insert or update on public.usuarios for each row execute procedure public.set_dual_timestamps();

-- Row Level Security
alter table public.proprietarios enable row level security;
alter table public.clientes enable row level security;
alter table public.produtos enable row level security;
alter table public.vendas enable row level security;
alter table public.itens_venda enable row level security;
alter table public.caixa_movimentos enable row level security;
alter table public.os enable row level security;
alter table public.garantias enable row level security;
alter table public.configuracoes enable row level security;
alter table public.storage_files enable row level security;
alter table public.despesas enable row level security;
alter table public.usuarios enable row level security;

create policy proprietarios_self_select
on public.proprietarios
for select
using (lower(email) = public.current_owner_email());

create policy clientes_select_owner
on public.clientes
for select
using (proprietario_id = public.current_owner_id());

create policy clientes_mutate_owner
on public.clientes
for all
using (proprietario_id = public.current_owner_id())
with check (coalesce(proprietario_id, public.current_owner_id()) = public.current_owner_id());

create policy produtos_select_owner
on public.produtos
for select
using (proprietario_id = public.current_owner_id());

create policy produtos_mutate_owner
on public.produtos
for all
using (proprietario_id = public.current_owner_id())
with check (coalesce(proprietario_id, public.current_owner_id()) = public.current_owner_id());

create policy vendas_select_owner
on public.vendas
for select
using (proprietario_id = public.current_owner_id());

create policy vendas_mutate_owner
on public.vendas
for all
using (proprietario_id = public.current_owner_id())
with check (coalesce(proprietario_id, public.current_owner_id()) = public.current_owner_id());

create policy itens_venda_select_owner
on public.itens_venda
for select
using (exists (
  select 1 from public.vendas v
  where v.id = itens_venda.venda_id
  and v.proprietario_id = public.current_owner_id()
));

create policy itens_venda_mutate_owner
on public.itens_venda
for all
using (exists (
  select 1 from public.vendas v
  where v.id = itens_venda.venda_id
  and v.proprietario_id = public.current_owner_id()
))
with check (exists (
  select 1 from public.vendas v
  where v.id = itens_venda.venda_id
  and v.proprietario_id = public.current_owner_id()
));

create policy caixa_select_owner
on public.caixa_movimentos
for select
using (proprietario_id = public.current_owner_id());

create policy caixa_mutate_owner
on public.caixa_movimentos
for all
using (proprietario_id = public.current_owner_id())
with check (coalesce(proprietario_id, public.current_owner_id()) = public.current_owner_id());

create policy os_select_owner
on public.os
for select
using (proprietario_id = public.current_owner_id());

create policy os_mutate_owner
on public.os
for all
using (proprietario_id = public.current_owner_id())
with check (coalesce(proprietario_id, public.current_owner_id()) = public.current_owner_id());

create policy garantias_select_owner
on public.garantias
for select
using (proprietario_id = public.current_owner_id());

create policy garantias_mutate_owner
on public.garantias
for all
using (proprietario_id = public.current_owner_id())
with check (coalesce(proprietario_id, public.current_owner_id()) = public.current_owner_id());

create policy configuracoes_select_public
on public.configuracoes
for select
using (true);

create policy configuracoes_mutate_owner
on public.configuracoes
for all
using (public.current_owner_id() is not null)
with check (public.current_owner_id() is not null);

create policy storage_files_select_owner
on public.storage_files
for select
using (proprietario_id = public.current_owner_id());

create policy storage_files_mutate_owner
on public.storage_files
for all
using (proprietario_id = public.current_owner_id())
with check (coalesce(proprietario_id, public.current_owner_id()) = public.current_owner_id());

create policy despesas_select_owner
on public.despesas
for select
using (proprietario_id = public.current_owner_id());

create policy despesas_mutate_owner
on public.despesas
for all
using (proprietario_id = public.current_owner_id())
with check (coalesce(proprietario_id, public.current_owner_id()) = public.current_owner_id());

create policy usuarios_all_authenticated
on public.usuarios
for all
to authenticated
using (true)
with check (true);

-- Funções RPC
create or replace function public.faturamento_diario(proprietario uuid default null, dias integer default 7)
returns table(dia date, total numeric)
language sql
security definer
set search_path = public
as $$
  select date(v.data_venda) as dia,
         coalesce(sum(v.total_liquido), 0)::numeric as total
  from public.vendas v
  where coalesce(proprietario, public.current_owner_id()) is not null
    and v.proprietario_id = coalesce(proprietario, public.current_owner_id())
    and v.data_venda >= (timezone('utc', now())::date - (dias - 1))
  group by date(v.data_venda)
  order by dia desc;
$$;

create or replace function public.top_produtos(proprietario uuid default null, limite integer default 5)
returns table(produto text, qtd bigint)
language sql
security definer
set search_path = public
as $$
  select coalesce(i.descricao, 'Produto') as produto,
         sum(i.quantidade)::bigint as qtd
  from public.itens_venda i
  join public.vendas v on v.id = i.venda_id
  where coalesce(proprietario, public.current_owner_id()) is not null
    and v.proprietario_id = coalesce(proprietario, public.current_owner_id())
  group by coalesce(i.descricao, 'Produto')
  order by qtd desc
  limit limite;
$$;

create or replace function public.decrementar_estoque(p_produto_id uuid, p_quantidade integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.produtos
  set quantidade = greatest(0, quantidade - coalesce(p_quantidade, 0)),
      quantidade_estoque = greatest(0, quantidade_estoque - coalesce(p_quantidade, 0)),
      updated_at = timezone('utc', now()),
      atualizado_em = timezone('utc', now())
  where id = p_produto_id
    and proprietario_id = public.current_owner_id();
end;
$$;

set check_function_bodies = on;
