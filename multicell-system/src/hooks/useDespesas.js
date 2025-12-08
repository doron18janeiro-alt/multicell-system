import { supabase } from "@/supabaseClient";

export async function getDespesas() {
  const { data, error } = await supabase
    .from("despesas")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function novaDespesa({ valor, categoria, descricao }) {
  const { data, error } = await supabase
    .from("despesas")
    .insert([{ valor, categoria, descricao }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletarDespesa(id) {
  const { error } = await supabase.from("despesas").delete().eq("id", id);
  if (error) throw error;
  return true;
}
