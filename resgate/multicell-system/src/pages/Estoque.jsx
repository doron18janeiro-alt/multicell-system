import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import EditarProdutoModal from "../components/EditarProdutoModal";

function formatMoney(value) {
  if (!value || isNaN(value)) return "R$ 0,00";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function Estoque() {
  const [loading, setLoading] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");

  // formulario de novo produto
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [precoCompra, setPrecoCompra] = useState("");
  const [precoVenda, setPrecoVenda] = useState("");
  const [fotoBase64, setFotoBase64] = useState("");

  // edicao (modal)
  const [editar, setEditar] = useState(null);

  async function carregarProdutos() {
    setLoading(true);
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar produtos:", error);
      setLoading(false);
      return;
    }
    setProdutos(data || []);
    setLoading(false);
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  function limparFormularioNovo() {
    setNome("");
    setCategoria("");
    setQuantidade("1");
    setPrecoCompra("");
    setPrecoVenda("");
    setFotoBase64("");
  }

  function handleUploadFoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFotoBase64(ev.target?.result || "");
    };
    reader.readAsDataURL(file);
  }

  async function salvarNovoProduto(e) {
    e.preventDefault();
    if (!nome.trim()) {
      alert("Digite o nome do produto.");
      return;
    }

    const qtd = Number(quantidade || "0");
    const compra = Number(precoCompra || "0");
    const venda = Number(precoVenda || "0");

    const { error } = await supabase.from("produtos").insert({
      nome: nome.trim(),
      categoria: categoria.trim() || "Geral",
      quantidade: isNaN(qtd) ? 0 : qtd,
      preco_compra: isNaN(compra) ? 0 : compra,
      preco_venda: isNaN(venda) ? 0 : venda,
      foto_url: fotoBase64 || null,
    });

    if (error) {
      console.error("Erro ao salvar produto:", error);
      alert("Erro ao salvar produto.");
      return;
    }

    limparFormularioNovo();
    await carregarProdutos();
  }

  async function excluirProduto(produto) {
    const ok = window.confirm(
      `Tem certeza que deseja excluir o produto "${produto.nome}"?`
    );
    if (!ok) return;

    const { error } = await supabase
      .from("produtos")
      .delete()
      .eq("id", produto.id);

    if (error) {
      console.error("Erro ao excluir produto:", error);
      alert("Erro ao excluir produto.");
      return;
    }

    await carregarProdutos();
  }

  const produtosFiltrados = produtos.filter((p) => {
    if (!busca.trim()) return true;
    const termo = busca.toLowerCase();
    return (
      p.nome?.toLowerCase().includes(termo) ||
      p.categoria?.toLowerCase().includes(termo)
    );
  });

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Estoque</h1>
          <p className="page-subtitle">
            Cadastre e gerencie pecas, acessorios e produtos da loja.
          </p>
        </div>
      </header>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Cadastro de Produto</h2>
            <p className="panel-subtitle">
              Nome, categoria, precos, quantidade e foto base64.
            </p>
          </div>
        </div>

        <form className="form-grid-estoque" onSubmit={salvarNovoProduto}>
          <div className="form-field">
            <label>Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Tela iPhone 13"
            />
          </div>

          <div className="form-field">
            <label>Categoria</label>
            <input
              type="text"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              placeholder="Pecas, Acessorios, Servicos..."
            />
          </div>

          <div className="form-field">
            <label>Quantidade</label>
            <input
              type="number"
              min="0"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label>Preco compra (R$)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={precoCompra}
              onChange={(e) => setPrecoCompra(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label>Preco venda (R$)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={precoVenda}
              onChange={(e) => setPrecoVenda(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label>Upload foto (base64)</label>
            <input type="file" accept="image/*" onChange={handleUploadFoto} />
          </div>

          <div className="form-actions-right">
            <button type="submit" className="btn btn-primary">
              Salvar Produto
            </button>
          </div>
        </form>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Produtos em Estoque</h2>
            <p className="panel-subtitle">
              Busque por nome ou categoria. Edite ou remova produtos quando
              precisar.
            </p>
          </div>

          <div className="pill-counter">
            {produtosFiltrados.length} itens
          </div>
        </div>

        <div className="estoque-search-row">
          <input
            type="text"
            placeholder="Buscar nome ou categoria..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="muted">Carregando produtos...</p>
        ) : produtosFiltrados.length === 0 ? (
          <p className="muted">Nenhum produto encontrado.</p>
        ) : (
          <div className="estoque-list">
            {produtosFiltrados.map((p) => (
              <div key={p.id} className="estoque-card">
                {p.foto_url && (
                  <div className="estoque-thumb-wrapper">
                    <img
                      src={p.foto_url}
                      alt={p.nome}
                      className="estoque-thumb"
                    />
                  </div>
                )}
                <div className="estoque-body">
                  <div className="estoque-title-row">
                    <h3>{p.nome}</h3>
                    <span className="tag">{p.categoria || "Geral"}</span>
                  </div>
                  <p className="estoque-text">
                    Qtd: <strong>{p.quantidade ?? 0}</strong>
                    {" · "}
                    Compra: <strong>{formatMoney(p.preco_compra || 0)}</strong>
                    {" · "}
                    Venda: <strong>{formatMoney(p.preco_venda || 0)}</strong>
                  </p>
            <div className="estoque-actions">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setEditar(p)}
              >
                Editar
              </button>
              <button
                type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => excluirProduto(p)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editar && (
        <EditarProdutoModal
          produto={editar}
          fechar={() => setEditar(null)}
          atualizar={carregarProdutos}
        />
      )}
    </div>
  );
}
