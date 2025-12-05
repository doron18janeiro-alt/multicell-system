# Esquema mínimo Supabase (MULTICELL)

- **produtos**

  - id (uuid, PK)
  - nome (text)
  - codigo (text, único, opcional)
  - categoria (text)
  - preco_custo (numeric)
  - preco_venda (numeric)
  - quantidade (integer)
  - ativo (boolean, default true)
  - observacoes (text)
  - created_at (timestamp, default now())
  - updated_at (timestamp, default now())

- **vendas**

  - id (uuid, PK)
  - data (timestamp, default now())
  - cliente_nome (text, opcional)
  - total (numeric)
  - forma_pagamento (text) — valores: `dinheiro`, `cartao`, `pix`, `outro`
  - observacoes (text)
  - created_at (timestamp, default now())

- **itens_venda**

  - id (uuid, PK)
  - venda_id (uuid, FK -> vendas.id)
  - produto_id (uuid ou text, opcional)
  - descricao (text)
  - quantidade (integer)
  - preco_unitario (numeric)
  - subtotal (numeric)

- **estoque_movimentos**

  - id (PK)
  - produto_id (FK)
  - tipo (ENTRADA ou SAIDA)
  - quantidade
  - data_hora
  - referencia (ex: “venda #id”, “ajuste manual”)

- **os**

  - id (uuid, PK)
  - cliente_nome (text)
  - cliente_telefone (text)
  - aparelho (text)
  - imei (text)
  - problema_relatado (text)
  - senha_aparelho (text, opcional)
  - valor_orcado (numeric)
  - valor_final (numeric, opcional)
  - status (text) — valores: `aberta`, `em_andamento`, `concluida`
  - data_entrada (timestamp)
  - data_entrega (timestamp, opcional)
  - observacoes (text)
  - created_at (timestamp, default now())
  - updated_at (timestamp, default now())

- **configuracoes**

  - id (uuid, PK)
  - nome_loja (text)
  - cnpj (text)
  - telefone (text)
  - email (text)
  - endereco (text)
  - cidade (text)
  - uf (text)
  - tema (text) — valores: `dark`, `light`, `multicell`
  - created_at (timestamp, default now())
  - updated_at (timestamp, default now())

- **garantias**

  - id (uuid, PK)
  - os_id (uuid, FK -> os.id, opcional)
  - cliente (text)
  - telefone (text)
  - aparelho (text)
  - imei (text, opcional)
  - servico (text)
  - valor (numeric)
  - data_entrega (date)
  - data_validade (date)
  - obs (text)
  - fotos (text[] default '{}')
  - created_at (timestamp, default now())

```sql
create table if not exists public.garantias (
  id uuid primary key default gen_random_uuid(),
  os_id uuid references public.os(id) on delete set null,
  cliente text not null,
  telefone text,
  aparelho text not null,
  imei text,
  servico text not null,
  valor numeric(12,2) default 0,
  data_entrega date,
  data_validade date,
  obs text,
  fotos text[] not null default '{}',
  created_at timestamptz not null default now()
);
```

## Bloco 1 — Login + RLS

```sql
create table if not exists public.usuarios (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  senha text not null,
  nome text,
  criado_em timestamptz default now()
);

create table if not exists public.lojas (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  criado_em timestamptz default now()
);

create table if not exists public.relacao_usuario_loja (
  id uuid primary key default uuid_generate_v4(),
  usuario_id uuid references public.usuarios(id),
  loja_id uuid references public.lojas(id)
);

alter table public.usuarios enable row level security;
alter table public.lojas enable row level security;
alter table public.relacao_usuario_loja enable row level security;

create policy if not exists "Apenas o usuário vê seus dados"
  on public.usuarios
  for select
  using (auth.uid() = id);
```

> Após criar as tabelas rode as instruções de RLS/políticas no SQL Editor do Supabase. As tabelas relacionadas devem validar `loja_id` usando a `relacao_usuario_loja` para saber quais registros o usuário atual pode acessar.

## Bloco 2 — Dashboard / Analytics

```sql
create table if not exists public.vendas (
  id uuid primary key default uuid_generate_v4(),
  loja_id uuid references public.lojas(id),
  total numeric,
  metodo_pagamento text,
  criado_em timestamptz default now()
);

create table if not exists public.vendas_itens (
  id uuid primary key default uuid_generate_v4(),
  venda_id uuid references public.vendas(id),
  produto_id uuid references public.produtos(id),
  quantidade integer,
  preco numeric
);
```

Funções esperadas:

- `faturamento_diario` ⇒ retorna `{ total numeric }` do dia atual.
- `top_produtos` ⇒ retorna `{ produto text, qtd integer }` ordenado pela quantidade.

## Bloco 3 — Estoque avançado

```sql
create table if not exists public.produtos (
  id uuid primary key default uuid_generate_v4(),
  loja_id uuid references public.lojas(id),
  nome text,
  preco numeric,
  estoque integer,
  minimo integer default 1
);

create table if not exists public.movimentacoes_estoque (
  id uuid primary key default uuid_generate_v4(),
  produto_id uuid references public.produtos(id),
  tipo text,
  quantidade integer,
  usuario_id uuid,
  criado_em timestamptz default now()
);

create or replace function public.baixar_estoque(produto uuid, qtd integer)
returns void
language plpgsql
as $$
begin
  update public.produtos set estoque = estoque - qtd where id = produto;
end;
$$;
```

## Bloco 4 — Ordem de Serviço

```sql
create table if not exists public.ordens_servico (
  id uuid primary key default uuid_generate_v4(),
  loja_id uuid references public.lojas(id),
  cliente text,
  telefone text,
  aparelho text,
  problema text,
  preco numeric,
  status text,
  criado_em timestamptz default now()
);
```

## Bloco 5 — Caixa avançado / Pagamentos

```sql
create table if not exists public.pagamentos (
  id uuid primary key default uuid_generate_v4(),
  venda_id uuid references public.vendas(id),
  valor numeric,
  metodo text,
  criado_em timestamptz default now()
);

insert into public.pagamentos (venda_id, valor, metodo)
values ($1, $2, $3);
```

### PIX

```js
import QRCode from "qrcode";

export async function gerarPix(valor) {
  const payload = `000201...520400005303986540${valor}`;
  return QRCode.toDataURL(payload);
}
```

````
);

create table if not exists public.os (
  id uuid primary key default gen_random_uuid(),
  cliente_nome text not null,
  cliente_telefone text not null,
  aparelho text not null,
  imei text,
  problema_relatado text not null,
  senha_aparelho text,
  valor_orcado numeric(12,2) not null default 0,
  valor_final numeric(12,2),
  status text not null check (status in ('aberta','em_andamento','concluida')),
  data_entrada timestamptz not null default now(),
  data_entrega timestamptz,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  codigo text unique,
  categoria text,
  preco_custo numeric(12,2) not null default 0,
  preco_venda numeric(12,2) not null default 0,
  quantidade integer not null default 0,
  ativo boolean not null default true,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.configuracoes (
  id uuid primary key default gen_random_uuid(),
  nome_loja text,
  cnpj text,
  telefone text,
  email text,
  endereco text,
  cidade text,
  uf text,
  tema text not null default 'multicell' check (tema in ('dark','light','multicell')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.garantias (
  id uuid primary key default gen_random_uuid(),
  os_id uuid references public.os(id) on delete set null,
  cliente text not null,
  telefone text,
  aparelho text not null,
  imei text,
  servico text not null,
  valor numeric(12,2) default 0,
  data_entrega date,
  data_validade date,
  obs text,
  fotos text[] not null default '{}',
  created_at timestamptz not null default now()
);
```
````
