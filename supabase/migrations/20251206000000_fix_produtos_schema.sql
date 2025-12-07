
alter table if exists public.produtos
  add column if not exists proprietario_id uuid;

alter table if exists public.produtos
  add column if not exists created_at timestamptz not null default timezone('utc', now());

alter table if exists public.produtos
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

alter table if exists public.produtos
  add column if not exists criado_em timestamptz not null default timezone('utc', now());

alter table if exists public.produtos
  add column if not exists atualizado_em timestamptz not null default timezone('utc', now());

update public.produtos
set proprietario_id = '8def6638-8eac-465a-84e8-26764eb36eeb'
where proprietario_id is null;

create unique index if not exists produtos_codigo_unq
on public.produtos (proprietario_id, lower(codigo))
where codigo is not null;

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
     begin
      execute 'create unique index if not exists proprietarios_user_id_unq on public.proprietarios(user_id)';
       alter table public.produtos
         add constraint produtos_proprietario_fk
         foreign key (proprietario_id)
         references public.proprietarios(user_id)
         on delete cascade;
     exception
       when duplicate_object then
         null;
     end;
   else
     begin
       alter table public.produtos
         add constraint produtos_proprietario_fk
         foreign key (proprietario_id)
         references public.proprietarios(id)
         on delete cascade;
     exception
       when duplicate_object then
         null;
     end;
   end if;
 end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'produtos'
      and policyname = 'Produtos do proprietário'
  ) then
    execute 'create policy "Produtos do proprietário" on public.produtos for select using (auth.uid() = proprietario_id)';
  end if;
end $$;
