import { useEffect, useState } from "react";
import FileUploader from "../components/files/FileUploader";
import FileGallery from "../components/files/FileGallery";
import { supabase } from "../supabaseClient";

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [galleryKey, setGalleryKey] = useState(0);
  const [form, setForm] = useState({
    id: null,
    nome: "",
    codigo_barras: "",
    preco_venda: "",
    ativo: true,
  });

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    setLoading(true);
    setMensagem("");
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setMensagem("Erro ao carregar produtos");
    setProdutos(data || []);
    setLoading(false);
  };

  const salvar = async (e) => {
    e.preventDefault();
    if (!form.nome.trim()) {
      setMensagem("Informe o nome");
      return;
    }
    const payload = {
      nome: form.nome.trim(),
      codigo_barras: form.codigo_barras.trim() || null,
      preco_venda: Number(form.preco_venda) || 0,
      ativo: form.ativo,
    };
    if (form.id) {
      const { error } = await supabase
        .from("produtos")
        .update(payload)
        .eq("id", form.id);
      if (error) {
        setMensagem("Erro ao atualizar produto");
        return;
      }
    } else {
      const { error } = await supabase.from("produtos").insert(payload);
      if (error) {
        setMensagem("Erro ao criar produto");
        return;
      }
    }
    setForm({
      id: null,
      nome: "",
      codigo_barras: "",
      preco_venda: "",
      ativo: true,
    });
    setGalleryKey(0);
    carregar();
  };

  const editar = (p) => {
    setForm({
      id: p.id,
      nome: p.nome || "",
      codigo_barras: p.codigo_barras || "",
      preco_venda: p.preco_venda ?? "",
      ativo: p.ativo !== false,
    });
    setGalleryKey(0);
  };

  const toggleAtivo = async (p) => {
    await supabase.from("produtos").update({ ativo: !p.ativo }).eq("id", p.id);
    carregar();
  };

  const filtrados = produtos.filter((p) => {
    const term = busca.toLowerCase();
    return (
      p.nome?.toLowerCase().includes(term) ||
      (p.codigo_barras || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="page">
      <h1 className="page-title">Produtos</h1>
      <p className="page-subtitle">
        Cadastro de produtos usados no Caixa e Estoque.
      </p>
      {mensagem && <div className="panel">{mensagem}</div>}

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            {form.id ? "Editar produto" : "Novo produto"}
          </div>
        </div>
        <form className="form-grid-estoque" onSubmit={salvar}>
          <div className="form-field">
            <label>Nome</label>
            <input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Nome do produto"
            />
          </div>
          <div className="form-field">
            <label>Código de barras</label>
            <input
              value={form.codigo_barras}
              onChange={(e) =>
                setForm({ ...form, codigo_barras: e.target.value })
              }
              placeholder="Opcional"
            />
          </div>
          <div className="form-field">
            <label>Preço venda (R$)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.preco_venda}
              onChange={(e) =>
                setForm({ ...form, preco_venda: e.target.value })
              }
            />
          </div>
          <div className="form-field">
            <label>Status</label>
            <select
              value={form.ativo ? "1" : "0"}
              onChange={(e) =>
                setForm({ ...form, ativo: e.target.value === "1" })
              }
            >
              <option value="1">Ativo</option>
              <option value="0">Inativo</option>
            </select>
          </div>
          <div className="form-actions-right">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                setForm({
                  id: null,
                  nome: "",
                  codigo_barras: "",
                  preco_venda: "",
                  ativo: true,
                })
              }
            >
              Limpar
            </button>
            <button type="submit" className="btn btn-primary">
              {form.id ? "Salvar edição" : "Criar produto"}
            </button>
          </div>
        </form>
      </div>

      <div className="panel card-bloco">
        <div className="panel-header" style={{ marginBottom: 12 }}>
          <div className="panel-title">Fotos do produto</div>
        </div>
        {form.id ? (
          <>
            <FileUploader
              entidade="produto"
              entidadeId={form.id}
              onUploaded={() => setGalleryKey((prev) => prev + 1)}
            />
            <FileGallery
              key={`${form.id}-${galleryKey}`}
              entidade="produto"
              entidadeId={form.id}
              allowDelete
            />
          </>
        ) : (
          <p className="muted">
            Selecione um produto salvo para registrar e visualizar as fotos no
            armazenamento.
          </p>
        )}
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Lista de produtos</div>
          <input
            className="input"
            placeholder="Buscar por nome ou código"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ maxWidth: 260 }}
          />
        </div>
        {loading ? (
          <div className="muted">Carregando...</div>
        ) : (
          <div className="lista-produtos">
            {filtrados.map((p) => (
              <div key={p.id} className="produto-item">
                <div>
                  <div className="produto-nome">{p.nome}</div>
                  <div className="produto-sub">
                    Código: {p.codigo_barras || "-"} • R${" "}
                    {(Number(p.preco_venda) || 0).toFixed(2)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className="tag">
                    {p.ativo !== false ? "Ativo" : "Inativo"}
                  </span>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => editar(p)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => toggleAtivo(p)}
                  >
                    {p.ativo !== false ? "Desativar" : "Ativar"}
                  </button>
                </div>
              </div>
            ))}
            {filtrados.length === 0 && (
              <div className="muted">Nenhum produto encontrado.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
