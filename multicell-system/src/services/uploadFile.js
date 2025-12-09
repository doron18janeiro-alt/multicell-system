import { supabase } from "@/services/supabaseClient";

export async function uploadFile(folder, file) {
  if (!folder || !file) {
    const message = "Pasta e arquivo são obrigatórios.";
    console.error("[UploadFile] uploadFile:", message);
    return { data: null, error: message };
  }

  const fileExt = file.name?.split(".").pop() || "bin";
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("fotos")
    .upload(filePath, file, {
      upsert: false,
    });

  if (uploadError) {
    const message = uploadError.message || "Erro ao fazer upload";
    console.error("[UploadFile] upload:", message);
    return { data: null, error: message };
  }

  const { data: publicURL } = supabase.storage
    .from("fotos")
    .getPublicUrl(filePath);

  return {
    data: {
      url: publicURL?.publicUrl || null,
      path: filePath,
    },
    error: null,
  };
}
