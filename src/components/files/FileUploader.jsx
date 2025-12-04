import React, { useMemo, useState } from "react";
import { supabase } from "../../services/supabase";
import "./files.css";

const BUCKET = "multicell-files";

/**
 * Pode operar em dois modos:
 * 1) ownerType/ownerId -> mantém compatibilidade com anexos vinculados
 * 2) folder -> faz upload direto para uma pasta e devolve URLs públicas
 */
export function FileUploader({ ownerType, ownerId, folder, onUploaded }) {
  const [uploading, setUploading] = useState(false);

  const sanitizedFolder = useMemo(() => {
    if (!folder) return null;
    return folder.trim().replace(/\\+/g, "/").replace(/\/+$/, "");
  }, [folder]);

  const legacyMode = Boolean(ownerType && ownerId && !sanitizedFolder);
  const folderMode = Boolean(sanitizedFolder);
  const canUpload = legacyMode || folderMode;

  async function uploadToFolder(files) {
    if (!folderMode || files.length === 0) return [];
    const uploaded = [];

    for (const file of files) {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;
      const path = `${sanitizedFolder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error(uploadError);
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(path);
      uploaded.push(publicUrl);
    }

    return uploaded;
  }

  async function uploadWithOwner(files) {
    if (!legacyMode || files.length === 0) return [];
    const saved = [];

    for (const file of files) {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;
      const path = `${ownerType}/${ownerId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error(uploadError);
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(path);

      const { data, error: insertError } = await supabase
        .from("arquivos_multicell")
        .insert({
          owner_type: ownerType,
          owner_id: ownerId,
          file_path: path,
          public_url: publicUrl,
          file_name: file.name,
          file_size: file.size,
        })
        .select()
        .single();

      if (insertError) {
        console.error(insertError);
        continue;
      }

      saved.push(data);
    }

    return saved;
  }

  async function handleChange(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length || !canUpload) return;

    setUploading(true);
    try {
      let result = [];
      if (folderMode) {
        result = await uploadToFolder(files);
      } else if (legacyMode) {
        result = await uploadWithOwner(files);
      }
      if (result.length && typeof onUploaded === "function") {
        onUploaded(result);
      }
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="files-block">
      <div className="files-block-header">
        <span className="files-block-title">Fotos / Anexos</span>
        <span className="files-block-subtitle">
          Arraste ou selecione imagens do aparelho, nota, cliente, etc.
        </span>
      </div>

      <label
        className={`files-upload-area ${
          !canUpload ? "files-upload-disabled" : ""
        }`}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleChange}
          disabled={uploading || !canUpload}
        />
        <div>
          <span className="files-upload-main">
            {uploading ? "Enviando..." : "Clique para enviar imagens"}
          </span>
          {!canUpload && (
            <span className="files-upload-hint">
              Salve o registro ou informe a pasta de destino para liberar o
              upload.
            </span>
          )}
        </div>
      </label>
    </div>
  );
}

export default FileUploader;
