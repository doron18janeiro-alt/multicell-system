# Onboarding operacional do Multicell

Este guia resume o que precisa ser configurado antes de liberar uma nova loja/proprietário no sistema.

## 1. Pré-requisitos locais

1. **Node 18+** instalado.
2. Copie `.env.example` para `.env` e preencha todas as chaves:
   - `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` do projeto Supabase.
   - Identidade/contato da loja (`VITE_LOJA_*`).
   - Configurações da impressora (`VITE_PRINTER_IP`, `VITE_AUTO_PRINT_VENDA`).
   - `VITE_PIX_CHAVE` para geração dos QR Codes.
3. Instale deps com `npm install`.
4. Rode `npm run dev` para validar o login e o fluxo do caixa.

## 2. Provisionamento Supabase

1. Crie o proprietário na tabela `proprietarios` com email que será usado no login.
2. Defina a `loja_id` (ou utilize o `id` do proprietário) em todas as tabelas dependentes.
3. Verifique se as RLS policies permitem o acesso apenas quando `proprietario_id = auth.uid()`.
4. Gere um usuário auth convencional ou cadastre via Dashboard do Supabase e vincule ao mesmo email.

## 3. Impressão e cupom

1. Certifique-se de que a impressora térmica está na mesma rede da máquina que roda o app.
2. Ajuste `VITE_PRINTER_IP` para o IP/reserva DHCP da impressora.
3. Caso não queira impressão automática, mantenha `VITE_AUTO_PRINT_VENDA=false`.
4. O cupom HTML e o QR do PIX podem ser visualizados diretamente na tela de Caixa antes de imprimir/enviar.

## 4. Checklist de smoke tests

Execute sempre após uma migração ou antes de publicar para um novo cliente:

- `npm run build` — garante que o bundle React está íntegro.
- `npm run test` — cobre o fluxo de login e as ferramentas de cupom/PIX.
- Registrar uma venda completa no módulo **Caixa** e validar o cupom + QR.
- Criar/editar/excluir um produto e um cliente para garantir o owner-id correto.

## 5. Entrega para o cliente

1. Disponibilize o link/app hospedado (ex.: Vercel) + credenciais do proprietário.
2. Envie mini-manual do caixa (PDF ou Loom) mostrando como abrir a gaveta, gerar cupom e PIX.
3. Combine canal de suporte (WhatsApp/Email) e SLA de resposta.
4. Documente qualquer customização específica dessa loja dentro do CRM interno.

Com esses passos validados, o ambiente fica pronto para ser vendido/apresentado para novos clientes com segurança.
