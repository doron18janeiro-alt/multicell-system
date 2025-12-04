import { supabase } from "../supabaseClient";

export async function uploadFile(folder, file) {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("fotos")
      .upload(filePath, file, {
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: publicURL } = supabase.storage
      .from("fotos")
      .getPublicUrl(filePath);

    return {
      url: publicURL.publicUrl,
      path: filePath,
    };
  } catch (err) {
    console.error("Erro ao fazer upload:", err.message);
    throw err;
  }
}

console.log("uploadFile.js criado com sucesso");
