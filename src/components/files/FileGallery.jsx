import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../services/supabase";
import "./files.css";

export function FileGallery({
  ownerType,
  ownerId,
  files: externalFiles,
  allowDelete = true,
  onDelete,
}) {
  const [internalFiles, setInternalFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const controlled = useMemo(
    () => Array.isArray(externalFiles),
    [externalFiles]
  );

  useEffect(() => {
    if (controlled) return;
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
          setInternalFiles(data || []);
        }
        setLoading(false);
      }
    }

    loadFiles();
    return () => {
      ignore = true;
    };
  }, [controlled, ownerId, ownerType]);

  async function handleDeleteFromDatabase(file) {
    if (!allowDelete) return;
    const ok = window.confirm("Remover esta imagem?");
    if (!ok) return;

    if (file.file_path) {
      await supabase.storage.from("multicell-files").remove([file.file_path]);
    }

    const { error } = await supabase
      .from("arquivos_multicell")
      .delete()
      .eq("id", file.id);

    if (error) {
      console.error(error);
      return;
    }

    setInternalFiles((prev) => prev.filter((f) => f.id !== file.id));
  }

  const filesToRender = controlled
    ? (externalFiles || []).map((url) => ({ id: url, public_url: url }))
    : internalFiles;

  const showEmptyState = !controlled
    ? filesToRender.length === 0 && !loading
    : filesToRender.length === 0;

  if (!controlled && !ownerId) return null;

  return (
    <div className="files-gallery">
      <div className="files-gallery-header">
        <span className="files-gallery-title">Galeria de imagens</span>
        {loading && !controlled && (
          <span className="files-gallery-badge">Carregando...</span>
        )}
      </div>

      {showEmptyState && (
        <p className="files-gallery-empty">Nenhuma imagem vinculada ainda.</p>
      )}

      <div className="files-grid">
        {filesToRender.map((file) => (
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
                onClick={(event) => {
                  event.stopPropagation();
                  if (controlled) {
                    onDelete?.(file.public_url);
                  } else {
                    handleDeleteFromDatabase(file);
                  }
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

export default FileGallery;
