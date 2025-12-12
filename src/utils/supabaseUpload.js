import { supabase } from "@/services/supabaseClient";

// folder = clientes, produtos, garantias, despesas, os
export async function uploadFoto(folder, file) {
  try {
    if (!file) return null;

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("fotos")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("fotos").getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err) {
    console.error("Erro ao enviar foto:", err);
    return null;
  }
}
