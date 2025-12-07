-- Garantir que a coluna email exista e seja preenchida para os proprietários
alter table public.proprietarios
  add column if not exists email text;

do $$
declare
  has_auth_user_id boolean;
  has_user_id boolean;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'proprietarios'
      and column_name = 'auth_user_id'
  ) into has_auth_user_id;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'proprietarios'
      and column_name = 'user_id'
  ) into has_user_id;

  if has_auth_user_id then
    update public.proprietarios p
    set email = u.email
    from auth.users u
    where p.auth_user_id = u.id
      and (p.email is null or p.email = '');
  elsif has_user_id then
    update public.proprietarios p
    set email = u.email
    from auth.users u
    where p.user_id = u.id
      and (p.email is null or p.email = '');
  end if;
end $$;

-- Mantém consistência e evita duplicidade de emails
create unique index if not exists proprietarios_email_unique
  on public.proprietarios ((lower(email)))
  where email is not null;
