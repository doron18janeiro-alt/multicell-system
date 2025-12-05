// @ts-nocheck
// Exemplo de Edge Function para servir o relatório de faturamento diário.
//
// Passos para publicar:
// 1. Instale/atualize a CLI: `npm install supabase --save-dev` (ou global).
// 2. Rode localmente: `supabase functions serve relatorio_faturamento_diario --env-file ./supabase/.env`.
// 3. Deploy: `supabase functions deploy relatorio_faturamento_diario --project-ref <your-ref>`.
// 4. Autorize o acesso via `supabase secrets set --env-file ./supabase/.env`.
//
// O endpoint ficará disponível em:
// https://<project-ref>.functions.supabase.co/relatorio_faturamento_diario

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Use POST e envie proprietarioId." }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { proprietarioId } = await req.json();

    if (!proprietarioId) {
      return new Response(
        JSON.stringify({ error: "proprietarioId é obrigatório" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Consulta a mesma função RPC utilizada no frontend.
    const { data, error } = await supabase.rpc("faturamento_diario", {
      loja: proprietarioId,
    });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ faturamento: data || [] }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[edge] relatorio_faturamento_diario", error);
    return new Response(
      JSON.stringify({ error: error.message ?? "Erro inesperado" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
