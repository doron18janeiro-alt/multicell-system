import React, { useState } from "react";
import {
  uploadFilesForEntity,
  listFilesForEntity,
} from "@/services/storageFiles";
import "./files.css";

export default function FileUploader({ entidade, entidadeId, onUploaded }) {
  const [loading, setLoading] = useState(false);

  async function handleUpload(event) {
    const arquivos = Array.from(event.target.files || []);
    if (!arquivos.length) return;
    if (!entidadeId) {
      alert("Salve o registro antes de enviar arquivos.");
      event.target.value = "";
      return;
    }

    setLoading(true);

    try {
      await uploadFilesForEntity({ entidade, entidadeId, files: arquivos });
      const listaAtualizada = await listFilesForEntity({
        entidade,
        entidadeId,
      });
      onUploaded?.(listaAtualizada);
    } catch (error) {
      alert(error?.message || "Erro ao enviar arquivos.");
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  }

  const disabled = !entidadeId || loading;

  return (
    <label className={`files-upload-area ${disabled ? "is-disabled" : ""}`}>
      <div className="files-upload-main">
        {loading ? "Enviando arquivos..." : "Selecionar imagem(ns)"}
        <span className="files-upload-hint">
          Formatos comuns até 5MB. Segure CTRL para múltiplas fotos.
        </span>
      </div>
      <input
        type="file"
        accept="image/*"
        multiple
        disabled={disabled}
        onChange={handleUpload}
      />
    </label>
  );
}
