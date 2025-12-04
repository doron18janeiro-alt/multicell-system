import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";
import FileUploader from "../../components/files/FileUploader";
import FileGallery from "../../components/files/FileGallery";
import "./clientes.css";

export default function DetalhesCliente() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);

  async function carregar() {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setCliente(data);
    setLoading(false);
  }

  async function adicionarFotos(urls) {
    const lista = [...(cliente.fotos || []), ...urls];

    const { error } = await supabase
      .from("clientes")
      .update({ fotos: lista })
      .eq("id", cliente.id);

    if (!error) {
      setCliente({ ...cliente, fotos: lista });
    }
  }

  async function removerFoto(url) {
    const novaLista = cliente.fotos.filter((x) => x !== url);

    const { error } = await supabase
      .from("clientes")
      .update({ fotos: novaLista })
      .eq("id", cliente.id);

    if (!error) {
      setCliente({ ...cliente, fotos: novaLista });
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  if (loading) {
    return <h2 className="loading">Carregando cliente...</h2>;
  }

  if (!cliente) {
    return <h2 className="loading">Cliente não encontrado</h2>;
  }

  return (
    <div className="cliente-detalhes-container">
      <button className="btn-voltar" onClick={() => navigate("/clientes")}>
        Voltar
      </button>

      <h1 className="cliente-titulo">{cliente.nome}</h1>

      {/* DADOS DO CLIENTE */}
      <div className="card-bloco">
        <h2 className="card-titulo">Informações gerais</h2>

        <p>
          <strong>Nome:</strong> {cliente.nome}
        </p>
        <p>
          <strong>Telefone:</strong> {cliente.telefone}
        </p>
        <p>
          <strong>CPF:</strong> {cliente.cpf || "Não informado"}
        </p>
        <p>
          <strong>Email:</strong> {cliente.email || "Não informado"}
        </p>
        <p>
          <strong>Observações:</strong> {cliente.obs || "Nenhuma"}
        </p>
      </div>

      {/* FOTOS */}
      <div className="card-bloco">
        <h2 className="card-titulo">Fotos do cliente/documentos</h2>

        <FileUploader
          folder={`clientes/${cliente.id}`}
          label="Enviar fotos"
          onUploaded={(urls) => adicionarFotos(urls)}
        />

        <FileGallery files={cliente.fotos || []} onDelete={removerFoto} />
      </div>
    </div>
  );
}
