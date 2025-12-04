import React, { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";
import "./files.css";

export function FileGallery({ ownerType, ownerId, allowDelete = true }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!ownerId) return;
    let ignore = false;

    async function loadFiles() {
      setLoading(true);
      const { data, error } = await supabase
        .from("arquivos_multicell")
        .select("*")
        .eq("owner_type", ownerType)
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false });

      if (!ignore) {
        if (error) {
          console.error(error);
        } else {
          setFiles(data || []);
        }
        setLoading(false);
      }
    }

    loadFiles();
    return () => {
      ignore = true;
    };
  }, [ownerType, ownerId]);

  async function handleDelete(file) {
    if (!allowDelete) return;
    const ok = window.confirm("Remover esta imagem?");
    if (!ok) return;

    // 1) Remove do storage
    if (file.file_path) {
      await supabase.storage.from("multicell-files").remove([file.file_path]);
    }

    // 2) Remove da tabela
    const { error } = await supabase
      .from("arquivos_multicell")
      .delete()
      .eq("id", file.id);

    if (error) {
      console.error(error);
      return;
    }

    setFiles((prev) => prev.filter((f) => f.id !== file.id));
  }

  if (!ownerId) return null;

  return (
    <div className="files-gallery">
      <div className="files-gallery-header">
        <span className="files-gallery-title">Galeria de imagens</span>
        {loading && <span className="files-gallery-badge">Carregando...</span>}
      </div>

      {files.length === 0 && !loading && (
        <p className="files-gallery-empty">Nenhuma imagem vinculada ainda.</p>
      )}

      <div className="files-grid">
        {files.map((file) => (
          <div
            key={file.id}
            className="files-item"
            onClick={() => setPreview(file.public_url)}
          >
            <img
              src={file.public_url}
              alt={file.file_name || "arquivo"}
              className="files-thumb"
            />
            {allowDelete && (
              <button
                className="files-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(file);
                }}
              >
                Remover
              </button>
            )}
          </div>
        ))}
      </div>

      {preview && (
        <div className="files-modal" onClick={() => setPreview(null)}>
          <div className="files-modal-inner">
            <img src={preview} alt="preview" />
          </div>
        </div>
      )}
    </div>
  );
}
