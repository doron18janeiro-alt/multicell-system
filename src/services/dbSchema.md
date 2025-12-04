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

```sql
create table if not exists public.vendas (
  id uuid primary key default gen_random_uuid(),
  data timestamptz not null default now(),
  cliente_nome text,
  total numeric(12,2) not null,
  forma_pagamento text not null check (forma_pagamento in ('dinheiro','cartao','pix','outro')),
  observacoes text,
  created_at timestamptz not null default now()
);

create table if not exists public.itens_venda (
  id uuid primary key default gen_random_uuid(),
  venda_id uuid not null references public.vendas(id) on delete cascade,
  produto_id text,
  descricao text not null,
  quantidade integer not null check (quantidade > 0),
  preco_unitario numeric(12,2) not null,
  subtotal numeric(12,2) not null
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
```
