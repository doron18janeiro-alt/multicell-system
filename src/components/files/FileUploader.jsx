import React, { useState } from "react";
import { uploadFile } from "../../services/uploadFile";

export default function FileUploader({ folder, onUploaded }) {
  const [loading, setLoading] = useState(false);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    try {
      const uploaded = await uploadFile(folder, file);
      onUploaded(uploaded); // retorna URL + path
    } catch (err) {
      alert("Erro ao enviar arquivo: " + err.message);
    }

    setLoading(false);
  }

  return (
    <div className="uploader-box">
      <label className="uploader-label">
        {loading ? "Enviando..." : "Enviar foto"}
        <input type="file" accept="image/*" onChange={handleUpload} hidden />
      </label>
    </div>
  );
}
