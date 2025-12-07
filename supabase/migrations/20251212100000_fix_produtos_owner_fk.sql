-- Corrige FK de produtos para referenciar proprietarios.id e alinha RLS
set check_function_bodies = off;

-- Normaliza proprietario_id caso tenha sido gravado com user_id
do $$
declare
  has_user_id boolean;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'proprietarios'
      and column_name = 'user_id'
  ) into has_user_id;

  if has_user_id then
    update public.produtos pr
    set proprietario_id = p.id
    from public.proprietarios p
    where pr.proprietario_id = p.user_id;
  end if;
end $$;

-- Preenche valores nulos com o owner padrão do seed para evitar violação temporária
update public.produtos
set proprietario_id = '8def6638-8eac-465a-84e8-26764eb36eeb'::uuid
where proprietario_id is null;

-- Refaz a constraint sempre apontando para proprietarios(id)
alter table public.produtos
drop constraint if exists produtos_proprietario_fk;

alter table public.produtos
  add constraint produtos_proprietario_fk
  foreign key (proprietario_id)
  references public.proprietarios(id)
  on delete cascade;

-- Garante not null
alter table public.produtos
  alter column proprietario_id set not null;

-- Políticas RLS consistentes com current_owner_id()
drop policy if exists "Produtos do proprietário" on public.produtos;
drop policy if exists produtos_select_owner on public.produtos;
drop policy if exists produtos_mutate_owner on public.produtos;

create policy produtos_select_owner
on public.produtos
for select
using (proprietario_id = public.current_owner_id());

create policy produtos_mutate_owner
on public.produtos
for all
using (proprietario_id = public.current_owner_id())
with check (coalesce(proprietario_id, public.current_owner_id()) = public.current_owner_id());

create index if not exists produtos_owner_idx on public.produtos (proprietario_id);
