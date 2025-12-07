-- Garante coluna proprietario_id e colunas de timestamp
alter table public.vendas
  add column if not exists proprietario_id uuid,
  add column if not exists created_at timestamptz not null default timezone('utc', now()),
  add column if not exists updated_at timestamptz not null default timezone('utc', now()),
  add column if not exists criado_em timestamptz not null default timezone('utc', now()),
  add column if not exists atualizado_em timestamptz not null default timezone('utc', now());

-- Preenche valores nulos com o owner padrão do seed
update public.vendas
set proprietario_id = coalesce(proprietario_id, '8def6638-8eac-465a-84e8-26764eb36eeb'::uuid)
where proprietario_id is null;

-- Ajusta para not null
alter table public.vendas
  alter column proprietario_id set not null;

-- Índice auxiliar
create index if not exists vendas_owner_idx on public.vendas (proprietario_id);
