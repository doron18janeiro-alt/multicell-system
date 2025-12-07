-- Restaura funções helper para resolução do proprietário via JWT

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
