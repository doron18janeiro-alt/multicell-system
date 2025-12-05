import { supabase } from "./supabaseClient";

function normalizarLista(files) {
  if (!files) return [];
  if (typeof FileList !== "undefined" && files instanceof FileList) {
    return Array.from(files);
  }
  if (Array.isArray(files)) {
    return files;
  }
  return [files];
}

function montarCaminho(entidade, entidadeId, nomeOriginal = "arquivo") {
  const nomeSanitizado = nomeOriginal
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "");
  const timestamp = Date.now();
  return `fotos/${entidade}/${entidadeId}/${timestamp}-${
    nomeSanitizado || "arquivo"
  }`;
}

export async function uploadFilesForEntity({ entidade, entidadeId, files }) {
  if (!entidade || !entidadeId) {
    throw new Error("Entidade e entidadeId são obrigatórios para upload");
  }

  const arquivos = normalizarLista(files).filter(Boolean);
  if (!arquivos.length) return [];

  const registros = [];

  for (const arquivo of arquivos) {
    const caminho = montarCaminho(entidade, entidadeId, arquivo.name);

    const { error: uploadError } = await supabase.storage
      .from("fotos")
      .upload(caminho, arquivo, { upsert: false });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicData } = supabase.storage
      .from("fotos")
      .getPublicUrl(caminho);

    const registro = {
      entidade,
      entidade_id: entidadeId,
      nome_arquivo: arquivo.name || "arquivo",
      caminho,
      url_publica: publicData?.publicUrl || null,
      criado_em: new Date().toISOString(),
      tamanho: arquivo.size ?? null,
      tipo: arquivo.type || "",
    };

    const { data, error } = await supabase
      .from("storage_files")
      .insert(registro)
      .select()
      .single();

    if (error) {
      throw error;
    }

    registros.push(data);
  }

  return registros;
}

export async function listFilesForEntity({ entidade, entidadeId }) {
  if (!entidade || !entidadeId) return [];

  const { data, error } = await supabase
    .from("storage_files")
    .select(
      "id, entidade, entidade_id, nome_arquivo, caminho, url_publica, criado_em, tamanho, tipo"
    )
    .eq("entidade", entidade)
    .eq("entidade_id", entidadeId)
    .order("criado_em", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function deleteFileById(id) {
  if (!id) return null;

  const { data: registro, error } = await supabase
    .from("storage_files")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  if (registro?.caminho) {
    const { error: storageError } = await supabase.storage
      .from("fotos")
      .remove([registro.caminho]);

    if (storageError) {
      throw storageError;
    }
  }

  const { error: deleteError } = await supabase
    .from("storage_files")
    .delete()
    .eq("id", id);

  if (deleteError) {
    throw deleteError;
  }

  return registro;
}
