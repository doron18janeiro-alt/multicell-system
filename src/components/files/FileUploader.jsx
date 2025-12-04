import React, { useState } from "react";
import { supabase } from "../../services/supabase";
import "./files.css";

/**
 * ownerType: "produto" | "os" | "garantia" | "cliente"
 * ownerId: id relacionado (produto_id, os_id etc)
 */
export function FileUploader({ ownerType, ownerId, onUploaded }) {
  const [uploading, setUploading] = useState(false);

  async function handleChange(e) {
    try {
      const files = Array.from(e.target.files || []);
      if (!ownerId || files.length === 0) return;

      setUploading(true);

      for (const file of files) {
        const ext = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${ext}`;

        const path = `${ownerType}/${ownerId}/${fileName}`;

        // 1) Upload no bucket de arquivos
        const { error: uploadError } = await supabase.storage
          .from("multicell-files")
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error(uploadError);
          continue;
        }

        // 2) URL pública
        const {
          data: { publicUrl },
        } = supabase.storage.from("multicell-files").getPublicUrl(path);

        // 3) Registro na tabela de mídia
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

        if (onUploaded) onUploaded(data);
      }
    } finally {
      setUploading(false);
      e.target.value = "";
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

      <label className="files-upload-area">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleChange}
          disabled={uploading || !ownerId}
        />
        <div>
          <span className="files-upload-main">
            {uploading ? "Enviando..." : "Clique para enviar imagens"}
          </span>
          {!ownerId && (
            <span className="files-upload-hint">
              Salve o registro primeiro para liberar o upload.
            </span>
          )}
        </div>
      </label>
    </div>
  );
}
