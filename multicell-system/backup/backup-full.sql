-- Backup FULL do MULTICELL SYSTEM (idempotente, sem DROP). 
-- Exporta dados e estrutura para: usuarios, produtos, vendas, os, clientes, funções, policies e sequences.
-- Gerado automaticamente; pode ser sobrescrito por supabase db dump.

-- Estrutura mínima assegurada
create extension if not exists "uuid-ossp";

create table if not exists usuarios (
    id uuid primary key default uuid_generate_v4(),
    nome text,
    email text unique,
    criado_em timestamp with time zone default now()
);

create table if not exists produtos (
    id uuid primary key default uuid_generate_v4(),
    nome text,
    preco numeric,
    estoque integer,
    categoria text,
    criado_em timestamp with time zone default now(),
    created_at timestamp with time zone default now()
);

create table if not exists vendas (
    id uuid primary key default uuid_generate_v4(),
    usuario_id uuid references usuarios(id),
    data timestamp with time zone default now(),
    itens jsonb,
    total numeric,
    forma_pagamento text,
    status text default 'finalizado',
    created_at timestamp with time zone default now()
);

create table if not exists os (
    id uuid primary key default uuid_generate_v4(),
    usuario_id uuid references usuarios(id),
    cliente_nome text,
    telefone text,
    aparelho text,
    imei text,
    senha text,
    problema text,
    observacoes text,
    status text default 'aberto',
    valor_orcado numeric,
    valor_final numeric,
    data_entrada timestamp with time zone default now(),
    created_at timestamp with time zone default now()
);

create table if not exists clientes (
    id uuid primary key default uuid_generate_v4(),
    nome text,
    telefone text,
    criado_em timestamp with time zone default now(),
    created_at timestamp with time zone default now()
);

-- PLACEHOLDER: o comando abaixo deve ser executado pelo script backup.sh usando Supabase CLI para capturar todos os dados, policies e funções.
-- Exemplo:
--   supabase db dump --data-only --file backup/backup-full.sql
--   supabase db dump --schema-only --file backup/schema.sql

-- Se necessário, cole aqui o resultado do dump. Caso contrário, o backup.sh sobrescreverá este arquivo.
