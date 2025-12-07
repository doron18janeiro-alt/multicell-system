# Deploy do Multicell System

## Arquitetura e stack

- React + Vite (SPA) hospedado na Vercel
- Supabase (Postgres, Auth e Storage)
- Integrações locais opcionais para impressoras térmicas e PIX

## Como rodar localmente

```bash
npm ci
npm run dev
npm run build
npm run preview
npm test
```

## Configuração da Vercel

- Framework: Vite / React
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: `dist`
- Node >= 18 (segue padrão da Vercel)

### Variáveis obrigatórias na Vercel

| Variável                                                 | Escopo         | Descrição                      |
| -------------------------------------------------------- | -------------- | ------------------------------ |
| `VITE_SUPABASE_URL`                                      | Pública        | URL do projeto Supabase        |
| `VITE_SUPABASE_ANON_KEY`                                 | Pública        | Chave `anon`                   |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`                      | Server         | Utilizadas por scripts ou CI   |
| `SUPABASE_SERVICE_ROLE`                                  | Secret         | **Nunca** expor no frontend    |
| `LPTECH_PROPRIETARIO_ID`                                 | Server         | Identificador padrão da LPTECH |
| `VITE_PRINTER_IP`, `IMPRESSORA_USB_ID`                   | Pública        | Impressoras e periféricos      |
| `PIX_CHAVE`, `VITE_PIX_CHAVE`                            | Server/Pública | Configuração PIX               |
| `APP_URL`, `AUTH_SITE_URL`, `APP_NAME`                   | Server         | URLs finais do app             |
| `VITE_LOJA_NOME`, `VITE_LOJA_CNPJ`, `VITE_LOJA_TELEFONE` | Pública        | Branding                       |

> Variáveis com prefixo `VITE_` são expostas no bundle. `SUPABASE_SERVICE_ROLE` deve permanecer como secret na Vercel.

## Configuração Supabase

1. Console → Auth → URL Settings
   - `site_url = APP_URL`
   - Redirect URLs: incluir `APP_URL` e `APP_URL/login`
2. Confirmar chaves:
   - `anon key` = `VITE_SUPABASE_ANON_KEY`
   - `service_role` apenas em backend/CI
3. Verificar RLS ativo em `clientes`, `produtos`, `vendas`, `os`.
4. Testes pós-ajuste:
   - Login, refresh, logout/login para validar sessão.

## Primeiro deploy manual

```bash
npm ci
npm run build
npx vercel          # primeiro deploy/link
npx vercel --prod   # produção
```

> Durante o primeiro deploy, informe organização, projeto e URL final.

## CI/CD com GitHub Actions

- Secrets necessários: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
- Deploy automático ao fazer push na `main` ou via `workflow_dispatch`.

## Smoke pós-deploy

- Acessar `APP_URL` e efetuar login.
- Navegar: Dashboard → Vendas → Caixa → Clientes → Produtos → OS → Config.
- Executar venda rápida no Caixa.
- Finalizar venda completa na TelaVendasNova.
- Criar e editar cliente e produto.
- Criar OS e gerar termo de garantia.
- Testar impressão de cupom/termo.
- Monitorar logs na Vercel (erros 500/RLS).
- Conferir logs da Supabase (401/403).

## Próximos passos e riscos

- Preencher todas as variáveis antes de qualquer deploy.
- Validar as policies RLS em ambiente de staging.
- Certificar-se de que impressoras/PIX locais estão configurados antes de liberar para produção.
