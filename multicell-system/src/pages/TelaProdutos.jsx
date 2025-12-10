import { useEffect, useMemo, useState } from "react";
import {
  listarProdutos,
  createProduto,
  updateProduto,
} from "@/services/produtos";
import { useAuth } from "@/contexts/AuthContext.jsx";

const FORM_INICIAL = {
  nome: "",
  codigo: "",
  categoria: "",
  descricao: "",
  preco_custo: "",
  preco_venda: "",
  quantidade_estoque: "",
  estoque_minimo: "",
  ativo: true,
};

const formatCurrency = (valor) => {
  const numero = Number(valor) || 0;
  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
};

const extrairQuantidade = (produto) =>
  Number(produto?.quantidade_estoque ?? produto?.quantidade ?? 0);

export default function TelaProdutos() {
  const { proprietarioId } = useAuth();
  // Antes havia PROPRIETARIO_ID/LOJA_ID fixos; agora dependemos do ID do contexto.
  const donoAtual = proprietarioId;
  const [produtos, setProdutos] = useState([]);
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [filtroBusca, setFiltroBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);
  const [modo, setModo] = useState("novo");
  const [painelAberto, setPainelAberto] = useState(false);
  const [formulario, setFormulario] = useState(FORM_INICIAL);
  const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });

  // Carrega os produtos ao montar o componente
  useEffect(() => {
    if (!donoAtual) return;
    carregarProdutos();
  }, [donoAtual]);

  const categoriasDisponiveis = useMemo(() => {
    const valores = new Set();
    produtos.forEach((produto) => {
      if (produto.categoria) valores.add(produto.categoria);
    });
    return Array.from(valores);
  }, [produtos]);

  const produtosFiltrados = useMemo(() => {
    const termo = filtroBusca.trim().toLowerCase();
    return produtos.filter((produto) => {
      const nomeMatch = produto.nome?.toLowerCase().includes(termo);
      const codigoMatch = produto.codigo?.toLowerCase().includes(termo);
      const categoriaMatch = categoriaFiltro
        ? produto.categoria === categoriaFiltro
        : true;
      return nomeMatch || codigoMatch ? categoriaMatch : false;
    });
  }, [produtos, filtroBusca, categoriaFiltro]);

  async function carregarProdutos() {
    if (!donoAtual) return;
    setCarregandoLista(true);
    setMensagem({ tipo: "", texto: "" });

    const { data, error } = await listarProdutos(donoAtual, {
      busca: filtroBusca,
    });

    if (error) {
      const mensagem =
        error?.message || error || "Não foi possível carregar os produtos.";
      console.error("[TelaProdutos] Falha ao carregar produtos", mensagem);
      setMensagem({ tipo: "erro", texto: mensagem });
      alert(mensagem);
      setProdutos([]);
      setCarregandoLista(false);
      return;
    }

    setProdutos(data || []);
    setCarregandoLista(false);
  }

  function abrirFormularioNovo() {
    setModo("novo");
    setProdutoEmEdicao(null);
    setFormulario(FORM_INICIAL);
    setPainelAberto(true);
    setMensagem({ tipo: "", texto: "" });
  }

  function editarProduto(produto) {
    setModo("editar");
    setProdutoEmEdicao(produto);
    setFormulario({
      nome: produto.nome || "",
      codigo: produto.codigo || "",
      categoria: produto.categoria || "",
      descricao: produto.descricao || "",
      preco_custo: produto.preco_custo ?? "",
      preco_venda: produto.preco_venda ?? "",
      quantidade_estoque: extrairQuantidade(produto) ?? "",
      estoque_minimo: produto.estoque_minimo ?? "",
      ativo: produto.ativo !== false,
    });
    setPainelAberto(true);
    setMensagem({ tipo: "", texto: "" });
  }

  function fecharPainel() {
    setPainelAberto(false);
    setProdutoEmEdicao(null);
    setModo("novo");
    setFormulario(FORM_INICIAL);
  }

  function handleInputChange(event) {
    const { name, value, type, checked } = event.target;
    setFormulario((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function salvarProduto(event) {
    event.preventDefault();
    setMensagem({ tipo: "", texto: "" });

    if (!donoAtual) {
      setMensagem({
        tipo: "erro",
        texto:
          "Não foi possível identificar o proprietário. Faça login novamente.",
      });
      return;
    }

    if (!formulario.nome.trim()) {
      setMensagem({ tipo: "erro", texto: "Informe o nome do produto." });
      return;
    }

    if (!formulario.preco_venda) {
      setMensagem({ tipo: "erro", texto: "Defina o preço de venda." });
      return;
    }

    setSalvando(true);

    const quantidade = Number(formulario.quantidade_estoque) || 0;
    const payload = {
      nome: formulario.nome.trim(),
      codigo: formulario.codigo.trim() || null,
      categoria: formulario.categoria.trim() || null,
      descricao: formulario.descricao.trim() || null,
      preco_custo: Number(formulario.preco_custo) || 0,
      preco_venda: Number(formulario.preco_venda) || 0,
      quantidade,
      quantidade_estoque: quantidade,
      estoque_minimo: Number(formulario.estoque_minimo) || 0,
      ativo: Boolean(formulario.ativo),
      atualizado_em: new Date().toISOString(),
      // Antes utilizávamos IDs fixos; agora usamos o proprietarioId carregado no contexto.
      proprietario_id: donoAtual,
    };

    if (modo === "editar" && produtoEmEdicao?.id) {
      const { error } = await updateProduto(
        produtoEmEdicao.id,
        donoAtual,
        payload
      );
      if (error) {
        const mensagem = error?.message || error || "Falha ao salvar produto.";
        console.error("[TelaProdutos] Erro ao salvar produto", mensagem);
        setMensagem({ tipo: "erro", texto: mensagem });
        alert(mensagem);
        setSalvando(false);
        return;
      }
      setMensagem({
        tipo: "sucesso",
        texto: "Produto atualizado com sucesso.",
      });
    } else {
      const { error } = await createProduto(donoAtual, payload);
      if (error) {
        const mensagem = error?.message || error || "Falha ao salvar produto.";
        console.error("[TelaProdutos] Erro ao salvar produto", mensagem);
        setMensagem({ tipo: "erro", texto: mensagem });
        alert(mensagem);
        setSalvando(false);
        return;
      }
      setMensagem({ tipo: "sucesso", texto: "Produto criado com sucesso." });
    }

    await carregarProdutos();
    fecharPainel();
    setSalvando(false);
  }

  async function alternarAtivo(produto) {
    const novoStatus = !produto.ativo;
    const { error } = await updateProduto(produto.id, donoAtual, {
      ativo: novoStatus,
    });

    if (error) {
      const mensagem =
        error?.message || error || "Falha ao alterar status do produto.";
      console.error("[TelaProdutos] Não foi possível alterar status", mensagem);
      setMensagem({ tipo: "erro", texto: mensagem });
      alert(mensagem);
      return;
    }

    setMensagem({
      tipo: "sucesso",
      texto: `Produto ${novoStatus ? "ativado" : "inativado"} com sucesso.`,
    });
    carregarProdutos();
  }

  function badgeStatus(produto) {
    return produto.ativo
      ? "inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700"
      : "inline-flex rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600";
  }

  if (!donoAtual) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-6 text-sm text-gray-600">
        Conecte-se para visualizar o catálogo da loja.
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-gray-500">
              Catálogo
            </p>
            <h1 className="text-3xl font-bold text-gray-900">
              Produtos da loja
            </h1>
            <p className="text-gray-500">
              Gerencie o cadastro, acompanhe estoque mínimo e mantenha seus
              produtos organizados.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary self-start"
            onClick={abrirFormularioNovo}
          >
            Novo produto
          </button>
        </header>

        {mensagem.texto && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              mensagem.tipo === "erro"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {mensagem.texto}
          </div>
        )}

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-600">
                Buscar
              </label>
              <input
                className="input"
                placeholder="Nome ou código"
                value={filtroBusca}
                onChange={(event) => setFiltroBusca(event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-600">
                Categoria
              </label>
              <select
                className="input"
                value={categoriaFiltro}
                onChange={(event) => setCategoriaFiltro(event.target.value)}
              >
                <option value="">Todas</option>
                {categoriasDisponiveis.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Preço venda</th>
                  <th className="px-4 py-3">Estoque</th>
                  <th className="px-4 py-3">Estoque mínimo</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {carregandoLista && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      Carregando produtos...
                    </td>
                  </tr>
                )}

                {!carregandoLista && produtosFiltrados.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      Nenhum produto encontrado.
                    </td>
                  </tr>
                )}

                {!carregandoLista &&
                  produtosFiltrados.map((produto) => {
                    const quantidade = extrairQuantidade(produto);
                    const abaixoMinimo =
                      produto.estoque_minimo &&
                      quantidade < Number(produto.estoque_minimo);

                    return (
                      <tr key={produto.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">
                            {produto.nome}
                          </div>
                          <div className="text-xs text-gray-500">
                            {produto.codigo || "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {produto.categoria || "—"}
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          {formatCurrency(produto.preco_venda)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">
                            {quantidade}
                          </div>
                          {abaixoMinimo && (
                            <p className="text-xs text-red-600">
                              Abaixo do mínimo
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {produto.estoque_minimo ?? 0}
                        </td>
                        <td className="px-4 py-3">
                          <span className={badgeStatus(produto)}>
                            {produto.ativo ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            type="button"
                            className="text-sm font-semibold text-indigo-600 hover:underline"
                            onClick={() => editarProduto(produto)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="text-sm font-semibold text-gray-600 hover:underline"
                            onClick={() => alternarAtivo(produto)}
                          >
                            {produto.ativo ? "Inativar" : "Ativar"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {painelAberto && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={fecharPainel}
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md transform border-l border-gray-200 bg-white shadow-2xl transition-transform duration-300 ease-out ${
          painelAberto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-gray-400">
                {modo === "editar" ? "Editar" : "Novo"}
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {modo === "editar" ? "Editar produto" : "Cadastrar produto"}
              </p>
            </div>
            <button
              type="button"
              className="text-sm font-semibold text-gray-500 hover:text-gray-900"
              onClick={fecharPainel}
            >
              Fechar
            </button>
          </div>

          <form
            className="flex-1 overflow-y-auto px-6 py-6 space-y-4"
            onSubmit={salvarProduto}
          >
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Nome *
              </label>
              <input
                className="input"
                name="nome"
                value={formulario.nome}
                onChange={handleInputChange}
                placeholder="Digite o nome do produto"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Código interno
                </label>
                <input
                  className="input"
                  name="codigo"
                  value={formulario.codigo}
                  onChange={handleInputChange}
                  placeholder="SKU, código de barras..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Categoria
                </label>
                <input
                  className="input"
                  name="categoria"
                  value={formulario.categoria}
                  onChange={handleInputChange}
                  placeholder="Ex: Acessórios"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Descrição
              </label>
              <textarea
                className="input"
                rows={3}
                name="descricao"
                value={formulario.descricao}
                onChange={handleInputChange}
                placeholder="Características, observações..."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Preço de custo
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="input"
                  name="preco_custo"
                  value={formulario.preco_custo}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Preço de venda *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="input"
                  name="preco_venda"
                  value={formulario.preco_venda}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Quantidade em estoque
                </label>
                <input
                  type="number"
                  min="0"
                  className="input"
                  name="quantidade_estoque"
                  value={formulario.quantidade_estoque}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Estoque mínimo
                </label>
                <input
                  type="number"
                  min="0"
                  className="input"
                  name="estoque_minimo"
                  value={formulario.estoque_minimo}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                name="ativo"
                checked={formulario.ativo}
                onChange={handleInputChange}
              />
              Produto ativo
            </label>

            <div className="pt-4">
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={salvando}
              >
                {salvando
                  ? "Salvando..."
                  : modo === "editar"
                  ? "Atualizar produto"
                  : "Salvar produto"}
              </button>
            </div>
          </form>
        </div>
      </aside>
    </div>
  );
}
