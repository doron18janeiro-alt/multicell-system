import { supabase } from "@/services/supabaseClient";

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
  const nomeSanitizado = (nomeOriginal || "arquivo")
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
    const message = "Entidade e entidadeId são obrigatórios para upload";
    console.error("[StorageFiles] uploadFilesForEntity:", message);
    return { data: [], error: message };
  }

  const arquivos = normalizarLista(files).filter(Boolean);
  if (!arquivos.length) return { data: [], error: null };

  const registros = [];

  for (const arquivo of arquivos) {
    const caminho = montarCaminho(entidade, entidadeId, arquivo.name);

    const { error: uploadError } = await supabase.storage
      .from("fotos")
      .upload(caminho, arquivo, { upsert: false });

    if (uploadError) {
      const message = uploadError.message || "Erro ao enviar arquivo";
      console.error("[StorageFiles] upload:", message);
      return { data: registros, error: message };
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
      .insert(registro, { returning: "representation" })
      .select()
      .single();

    if (error) {
      const message = error.message || "Erro ao registrar arquivo";
      console.error("[StorageFiles] insert:", message);
      return { data: registros, error: message };
    }

    registros.push(data);
  }

  return { data: registros, error: null };
}

export async function listFilesForEntity({ entidade, entidadeId }) {
  if (!entidade || !entidadeId) {
    const message = "Entidade e entidadeId são obrigatórios.";
    console.error("[StorageFiles] listFilesForEntity:", message);
    return { data: [], error: message };
  }

  const result = await supabase
    .from("storage_files")
    .select(
      "id, entidade, entidade_id, nome_arquivo, caminho, url_publica, criado_em, tamanho, tipo"
    )
    .eq("entidade", entidade)
    .eq("entidade_id", entidadeId)
    .order("criado_em", { ascending: false });

  if (result.error) {
    const message = result.error.message || "Erro ao listar arquivos";
    console.error("[StorageFiles] list:", message);
    return { data: [], error: message };
  }

  return { data: result.data || [], error: null };
}

export async function deleteFileById(id) {
  if (!id) {
    const message = "ID é obrigatório.";
    console.error("[StorageFiles] deleteFileById:", message);
    return { data: null, error: message };
  }

  const registroResult = await supabase
    .from("storage_files")
    .select("*")
    .eq("id", id)
    .single();

  if (registroResult.error) {
    const message = registroResult.error.message || "Erro ao localizar arquivo";
    console.error("[StorageFiles] fetch:", message);
    return { data: null, error: message };
  }

  const registro = registroResult.data;

  if (registro?.caminho) {
    const { error: storageError } = await supabase.storage
      .from("fotos")
      .remove([registro.caminho]);

    if (storageError) {
      const message =
        storageError.message || "Erro ao remover arquivo do storage";
      console.error("[StorageFiles] storage delete:", message);
      return { data: null, error: message };
    }
  }

  const { error: deleteError } = await supabase
    .from("storage_files")
    .delete({ returning: "representation" })
    .eq("id", id);

  if (deleteError) {
    const message = deleteError.message || "Erro ao remover registro";
    console.error("[StorageFiles] delete:", message);
    return { data: null, error: message };
  }

  return { data: registro, error: null };
}
