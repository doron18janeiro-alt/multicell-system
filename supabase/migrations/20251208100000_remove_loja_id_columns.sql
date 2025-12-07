-- Remove colunas legadas loja_id e alinha RPCs para usar apenas proprietario_id

alter table if exists public.clientes drop column if exists loja_id;
alter table if exists public.produtos drop column if exists loja_id;
alter table if exists public.vendas drop column if exists loja_id;
alter table if exists public.caixa_movimentos drop column if exists loja_id;
alter table if exists public.os drop column if exists loja_id;
alter table if exists public.garantias drop column if exists loja_id;
alter table if exists public.storage_files drop column if exists loja_id;
alter table if exists public.despesas drop column if exists loja_id;

-- Remove índices associados
DROP INDEX IF EXISTS idx_vendas_loja_id;
DROP INDEX IF EXISTS idx_produtos_loja_id;
DROP INDEX IF EXISTS idx_clientes_loja_id;
DROP INDEX IF EXISTS idx_os_loja_id;

-- Atualiza funções RPC para parâmetro "proprietario"
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
