# Plano de dados Supabase (Multicell)

Este documento consolida todos os requisitos de banco levantados no frontend. Ele passa a ser a fonte da verdade para as migrations do Supabase.

> **Premissas gerais**
>
> - Cada loja/proprietário tem um registro em `proprietarios`.
> - Todas as tabelas de negócio armazenam `proprietario_id` **e** `loja_id` (ambas referenciam `proprietarios.id`) para manter compatibilidade com telas legadas.
> - O frontend sempre filtra dados pelo owner (`ownerFilter`), portanto as políticas de RLS devem comparar `auth.jwt()->>'email'` com `proprietarios.email`.
> - Manter duplicidade de campos de data (`created_at/updated_at` e `criado_em/atualizado_em`).
> - Funções auxiliares necessárias: `current_owner_id()` (retorna o `id` do proprietário com o mesmo e-mail do token) e `current_owner_email()` (retorna `lower(auth.jwt()->>'email')`). Ambas serão `security definer` e ficarão no schema `public`.

## Tabelas core

1. **proprietarios** — campos: `id`, `nome`, `email`, `telefone`, `documento`, `auth_user_id`, dados de endereço, `ativo`, timestamps duplos. `SELECT` permitido apenas quando `lower(email) = current_owner_email()`; demais operações somente com `service_role`.

2. **clientes** — `id`, `proprietario_id`, `loja_id`, `nome`, contatos (`telefone`, `email`, `cpf`), `observacoes`, `obs`, timestamps duplos. Todas as operações com RLS `proprietario_id = current_owner_id()`.

3. **produtos** — `id`, `proprietario_id`, `loja_id`, `nome`, `codigo`, `categoria`, `descricao`, `preco_custo`, `preco_venda`, `quantidade`, `quantidade_estoque`, `estoque_minimo`, `ativo`, `observacoes`, `fotos text[]`, timestamps duplos + trigger para sincronizá-los. Índices: `(proprietario_id, nome)` e `(proprietario_id, lower(codigo))`.

4. **vendas** — referencia clientes (opcional), guarda `cliente_nome`, `forma_pagamento`, `status`, totais (`total_bruto`, `desconto`, `total_liquido`, `total`), `data_venda`, `data`, `observacoes`, `cabecalho jsonb`, `proprietario_id`, `loja_id`, timestamps.

5. **itens_venda** — `id`, `venda_id`, `produto_id`, `descricao`, `quantidade`, `preco_unitario`, `subtotal`, timestamps.

6. **caixa_movimentos** — `id`, `proprietario_id`, `tipo` (entrada/saída), `descricao`, `categoria`, `valor`, `data`, timestamps.

7. **os** — inclui `numero` (bigserial), `cliente_nome`, `cliente` (alias), contatos, `aparelho`, `aparelho_descricao`, `imei`, `problema_relatado`, `problema`, `servico`, `senha_aparelho`, `tecnico`, valores orçados/finais, `status`, datas (`data_entrada`, `data_entrega`), `observacoes`, `obs`, `proprietario_id`, `loja_id`, timestamps + trigger para preencher aliases.

8. **garantias** — `id`, `proprietario_id`, `os_id`, `cliente`, `telefone`, `aparelho`, `imei`, `servico`, `valor`, `data_entrega`, `data_validade`, `codigo`, dados da empresa, `obs`, `fotos text[]`, timestamps.

9. **configuracoes** — `id` fixo (`system-config`), `nome_loja`, `cnpj`, `telefone`, `email`, endereço completo, `tema` (`dark|light|multicell`), `pix_chave`, `logo_url`, timestamps. RLS: leitura pública, escrita condicionada a `current_owner_id() is not null`.

10. **storage_files** — `id`, `entidade`, `entidade_id`, `proprietario_id` default `current_owner_id()`, `nome_arquivo`, `caminho`, `url_publica`, `tamanho`, `tipo`, `criado_em`.

11. **despesas** — `id`, `proprietario_id`, `descricao`, `categoria`, `valor_total`, `valor_pago`, `vencimento`, `obs`, `parcelas jsonb`, `pagamentos jsonb`, `status`, timestamps.

12. **usuarios** — `id`, `nome`, `email`, `role` (`ADMIN|GERENTE|CAIXA`), `ativo`, `empresa_id`, timestamps (posteriormente vincular ao owner).

## Funções / RPCs

- `faturamento_diario(loja uuid)` — soma `vendas.total_liquido` por dia (últimos 7 dias, ajustável) respeitando `proprietario_id`.
- `top_produtos(loja uuid, limite int)` — agrega `itens_venda.quantidade` por produto.
- `decrementar_estoque(produto uuid, quantidade int)` — atualiza estoque garantindo que não fique negativo; usada após cada venda.
- Triggers auxiliares para sincronizar timestamps duplos e popular aliases (`cliente`/`obs`, etc.).

Todas as funções devem ser `security definer`, setar `search_path = public` e validar `proprietario_id` dentro da query.

## Políticas RLS

| tabela                                                                                            | SELECT                                                                     | INSERT/UPDATE/DELETE                                                              |
| ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| proprietarios                                                                                     | `lower(email)=current_owner_email()`                                       | apenas `service_role`                                                             |
| clientes, produtos, vendas, itens_venda, caixa_movimentos, os, garantias, despesas, storage_files | `proprietario_id = current_owner_id()`                                     | `WITH CHECK (coalesce(proprietario_id, current_owner_id()) = current_owner_id())` |
| configuracoes                                                                                     | pública                                                                    | `WITH CHECK (current_owner_id() is not null)`                                     |
| usuarios                                                                                          | temporariamente liberado para `authenticated`; depois aplicar RBAC próprio |

## Storage

- Bucket `fotos` (público) para imagens de produtos, OS e garantias.
- RLS no storage: o upload/delete só é permitido quando o arquivo pertence ao `proprietario_id` do token.
- Tabela `storage_files` armazena metadados e replica o filtro por owner.

## Próximos passos

1. Executar `supabase init` e versionar `supabase/config.toml` + diretório `supabase/migrations`.
2. Escrever a migração inicial contendo todas as tabelas, índices, funções e políticas acima.
3. Criar `supabase/seed.sql` com um proprietário administrador (dados fictícios) e credenciais de teste.
4. Atualizar o workflow `.github/workflows/supabase.yml` para rodar `supabase db push` em cada PR/main.

Este documento deve ser revisado sempre que novos campos aparecerem no frontend/backend antes da criação das próximas migrations.
