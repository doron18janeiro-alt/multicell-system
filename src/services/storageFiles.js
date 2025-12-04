import { supabase } from "./supabaseClient";

const ENTITY_FOLDERS = {
  cliente: "clientes",
  produto: "produtos",
  os: "os",
  garantia: "garantias",
  despesa: "despesas",
};

function ensureEntity(entidade) {
  const folder = ENTITY_FOLDERS[entidade];
  if (!folder) {
    throw new Error(`Entidade desconhecida: ${entidade}`);
  }
  return folder;
}

function normalizeFileList(files) {
  if (!files) return [];
  if (typeof FileList !== "undefined" && files instanceof FileList) {
    return Array.from(files);
  }
  if (Array.isArray(files)) {
    return files;
  }
  return [files];
}

function buildPath(folder, entidadeId, fileName) {
  const safeName = fileName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]/g, "");
  const timestamp = Date.now();
  return `${folder}/${entidadeId}/${timestamp}-${safeName}`;
}

export async function uploadFilesForEntity({ entidade, entidadeId, files }) {
  if (!entidade || !entidadeId) {
    throw new Error("Entidade e entidadeId são obrigatórios para upload");
  }

  const folder = ensureEntity(entidade);
  const arquivos = normalizeFileList(files).filter(Boolean);
  if (!arquivos.length) return [];

  const registrosInseridos = [];

  for (const file of arquivos) {
    const caminho = buildPath(folder, entidadeId, file.name || "arquivo");

    const { error: uploadError } = await supabase.storage
      .from("fotos")
      .upload(caminho, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicURL } = supabase.storage
      .from("fotos")
      .getPublicUrl(caminho);

    const registro = {
      entidade,
      entidade_id: entidadeId,
      bucket: "fotos",
      pasta: folder,
      caminho,
      url_publica: publicURL?.publicUrl,
      nome_arquivo: file.name || null,
      tamanho_bytes: file.size ?? null,
    };

    const { data, error } = await supabase
      .from("fotos_registros")
      .insert(registro)
      .select()
      .single();

    if (error) {
      throw error;
    }

    registrosInseridos.push(data);
  }

  return registrosInseridos;
}

export async function listFilesForEntity({ entidade, entidadeId }) {
  if (!entidade || !entidadeId) return [];

  const { data, error } = await supabase
    .from("fotos_registros")
    .select("id, url_publica, caminho, criado_em, nome_arquivo")
    .eq("entidade", entidade)
    .eq("entidade_id", entidadeId)
    .order("criado_em", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function deleteFileById(fotoId) {
  if (!fotoId) return null;

  const { data: registro, error } = await supabase
    .from("fotos_registros")
    .select("*")
    .eq("id", fotoId)
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
    .from("fotos_registros")
    .delete()
    .eq("id", fotoId);

  if (deleteError) {
    throw deleteError;
  }

  return registro;
}
