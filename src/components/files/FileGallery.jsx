import React, { useCallback, useEffect, useState } from "react";
import {
  listFilesForEntity,
  deleteFileById,
} from "@/services/storageFiles";
import "./files.css";

function formatDate(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch (error) {
    return value;
  }
}

export default function FileGallery({
  entidade,
  entidadeId,
  allowDelete = false,
  onChange,
}) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const fetchFiles = useCallback(async () => {
    if (!entidadeId) return;
    setLoading(true);
    try {
      const data = await listFilesForEntity({ entidade, entidadeId });
      setFiles(data);
      onChange?.(data);
    } catch (error) {
      alert("Não foi possível carregar as fotos");
    } finally {
      setLoading(false);
    }
  }, [entidade, entidadeId, onChange]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  async function handleDelete(fotoId) {
    if (!allowDelete) return;
    const confirmDelete = window.confirm("Remover esta imagem?");
    if (!confirmDelete) return;
    try {
      await deleteFileById(fotoId);
      await fetchFiles();
    } catch (error) {
      alert("Erro ao remover arquivo");
    }
  }

  if (!entidadeId) {
    return (
      <p className="files-gallery-empty">
        Salve o registro para liberar o envio de fotos.
      </p>
    );
  }

  const showEmpty = !loading && files.length === 0;

  return (
    <div className="files-gallery">
      <div className="files-gallery-header">
        <span className="files-gallery-title">Galeria de imagens</span>
        {loading && <span className="files-gallery-badge">Carregando...</span>}
      </div>

      {showEmpty && (
        <p className="files-gallery-empty">Nenhuma imagem vinculada ainda.</p>
      )}

      <div className="files-grid">
        {files.map((file) => (
          <div
            key={file.id}
            className="files-item"
            onClick={() => setPreview(file.url_publica)}
          >
            <img
              src={file.url_publica}
              alt={file.nome_arquivo || "arquivo"}
              className="files-thumb"
            />
            <div className="files-item-meta">
              <span>{formatDate(file.criado_em)}</span>
            </div>
            {allowDelete && (
              <button
                type="button"
                className="files-delete"
                onClick={(event) => {
                  event.stopPropagation();
                  handleDelete(file.id);
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
