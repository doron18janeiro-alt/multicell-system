-- Repara coluna quantidade em public.produtos e força reload do cache do PostgREST
-- Garante que a coluna exista e esteja preenchida

alter table public.produtos
  add column if not exists quantidade integer;

-- Preenche valores nulos com zero
update public.produtos
set quantidade = 0
where quantidade is null;

-- Define not null e default
alter table public.produtos
  alter column quantidade set not null,
  alter column quantidade set default 0;

-- Recarrega o schema cache do PostgREST
-- (necessário para Supabase perceber a coluna)
select pg_notify('pgrst', 'reload schema');
