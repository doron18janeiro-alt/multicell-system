-- Final ajustes para garantir uso exclusivo de proprietario_id e preenchimento de cliente_nome

-- Remove eventuais colunas "loja_id" remanescentes (idempotente)
alter table if exists public.clientes drop column if exists loja_id;
alter table if exists public.produtos drop column if exists loja_id;
alter table if exists public.vendas drop column if exists loja_id;
alter table if exists public.caixa_movimentos drop column if exists loja_id;
alter table if exists public.os drop column if exists loja_id;
alter table if exists public.garantias drop column if exists loja_id;
alter table if exists public.storage_files drop column if exists loja_id;
alter table if exists public.despesas drop column if exists loja_id;

-- Garante que o nome do cliente fique armazenado independente da FK
alter table public.vendas
  add column if not exists cliente_nome text;

update public.vendas v
set cliente_nome = coalesce(v.cliente_nome, c.nome)
from public.clientes c
where c.id = v.cliente_id
  and (v.cliente_nome is null or v.cliente_nome = '');

-- Refuerça obrigatoriedade do proprietario_id em vendas e normaliza índices
alter table public.vendas
  alter column proprietario_id set not null;

create index if not exists vendas_owner_cliente_idx
  on public.vendas (proprietario_id, lower(coalesce(cliente_nome, '')));

-- Remove qualquer função/visão que ainda referencie loja_id (não existem no momento, mas mantemos por segurança)
DROP VIEW IF EXISTS public.vendas_por_loja;
DROP FUNCTION IF EXISTS public.metricas_por_loja;
