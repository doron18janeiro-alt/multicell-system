-- Seed inicial para ambientes locais/remotos.
-- Executar com `supabase db reset` ou `supabase db seed` após aplicar a migração inicial.

with upsert_owner as (
	insert into public.proprietarios (nome, email, telefone, documento, endereco, cidade, uf)
	values (
		'Multicell Admin',
		'admin@multicellsystem.com.br',
		'+55 11 99999-0000',
		'00.000.000/0000-00',
		'Rua Exemplo, 123',
		'São Paulo',
		'SP'
	)
	on conflict (email) do update set
		nome = excluded.nome,
		telefone = excluded.telefone,
		documento = excluded.documento,
		endereco = excluded.endereco,
		cidade = excluded.cidade,
		uf = excluded.uf,
		ativo = true
	returning id
)
insert into public.configuracoes (
	id,
	nome_loja,
	cnpj,
	telefone,
	email,
	endereco,
	cidade,
	uf,
	tema,
	pix_chave,
	logo_url
)
select
	'system-config',
	'Multicell System',
	'00.000.000/0000-00',
	'+55 11 99999-0000',
	'contato@multicellsystem.com.br',
	'Rua Exemplo, 123',
	'São Paulo',
	'SP',
	'multicell',
	'pix@multicellsystem.com.br',
	'https://www.multicellsystem.com.br/assets/logo.svg'
from upsert_owner
on conflict (id) do update set
	nome_loja = excluded.nome_loja,
	telefone = excluded.telefone,
	email = excluded.email,
	endereco = excluded.endereco,
	cidade = excluded.cidade,
	uf = excluded.uf,
	pix_chave = excluded.pix_chave,
	logo_url = excluded.logo_url;

insert into public.usuarios (proprietario_id, nome, email, role, ativo)
select
	id,
	'Administrador Multicell',
	'admin@multicellsystem.com.br',
	'ADMIN',
	true
from public.proprietarios
where email = 'admin@multicellsystem.com.br'
	and not exists (
		select 1 from public.usuarios where email = 'admin@multicellsystem.com.br'
	);
