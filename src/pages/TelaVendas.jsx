import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import useClientes from "../hooks/useClientes";
import useProdutos from "../hooks/useProdutos";
import { registrarVenda } from "../services/vendasService";
import { atualizarProduto } from "../services/produtosService";

const FORMAS_PAGAMENTO = [
  { label: "Pix", value: "pix" },
  { label: "Dinheiro", value: "dinheiro" },
  { label: "Cartão de crédito", value: "cartao_credito" },
  { label: "Cartão de débito", value: "cartao_debito" },
  { label: "Transferência", value: "transferencia" },
];

const formatCurrency = (value) => {
  const numeric = Number(value) || 0;
  return numeric.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
};

export default function TelaVendas() {
  const { proprietarioId, loading } = useAuth();
  // Antes utilizávamos PROPRIETARIO_ID/LOJA_ID fixos; agora tudo depende do proprietarioId do contexto.
  const donoAtual = proprietarioId;
  const {
    clientes,
    carregando: carregandoClientes,
    erro: erroClientes,
  } = useClientes(donoAtual);
  const {
    produtos,
    carregando: carregandoProdutos,
    erro: erroProdutos,
    carregarProdutos,
  } = useProdutos(donoAtual);
  const carregandoOpcoes = carregandoClientes || carregandoProdutos;
  const [clientesBusca, setClientesBusca] = useState("");
  const [produtosBusca, setProdutosBusca] = useState("");

  const [clienteSelecionado, setClienteSelecionado] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("pix");
  const [observacoes, setObservacoes] = useState("");

  const [itemProdutoId, setItemProdutoId] = useState("");
  const [itemQuantidade, setItemQuantidade] = useState(1);
  const [itens, setItens] = useState([]);

  const [desconto, setDesconto] = useState(0);
  const [totalBruto, setTotalBruto] = useState(0);
  const [totalLiquido, setTotalLiquido] = useState(0);

  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });

  useEffect(() => {
    if (erroClientes || erroProdutos) {
      setMensagem({ tipo: "erro", texto: erroClientes || erroProdutos });
    }
  }, [erroClientes, erroProdutos]);

  useEffect(() => {
    const bruto = itens.reduce((acc, item) => acc + item.subtotal, 0);
    const desc = Number(desconto) || 0;
    setTotalBruto(bruto);
    setTotalLiquido(Math.max(0, bruto - desc));
  }, [itens, desconto]);

  const clientesFiltrados = useMemo(() => {
    const termo = clientesBusca.toLowerCase().trim();
    if (!termo) return clientes;
    return clientes.filter((cliente) =>
      cliente.nome?.toLowerCase().includes(termo)
    );
  }, [clientes, clientesBusca]);

  const produtosFiltrados = useMemo(() => {
    const termo = produtosBusca.toLowerCase().trim();
    if (!termo) return produtos;
    return produtos.filter((produto) =>
      produto.nome?.toLowerCase().includes(termo)
    );
  }, [produtos, produtosBusca]);

  function handleAdicionarItem() {
    if (!itemProdutoId) {
      setMensagem({
        tipo: "erro",
        texto: "Selecione um produto para adicionar.",
      });
      return;
    }
    const produto = produtos.find((p) => p.id === itemProdutoId);
    if (!produto) {
      setMensagem({ tipo: "erro", texto: "Produto inválido." });
      return;
    }
    const quantidade = Number(itemQuantidade);
    if (!Number.isFinite(quantidade) || quantidade <= 0) {
      setMensagem({ tipo: "erro", texto: "Informe uma quantidade válida." });
      return;
    }
    const estoqueDisponivel = Number(
      produto.quantidade ?? produto.quantidade_estoque ?? 0
    );
    const itemExistente = itens.find((item) => item.produto_id === produto.id);
    const quantidadeTotal = quantidade + (itemExistente?.quantidade || 0);

    if (quantidadeTotal > estoqueDisponivel) {
      setMensagem({
        tipo: "erro",
        texto: `Quantidade solicitada (${quantidadeTotal}) maior que estoque disponível (${estoqueDisponivel}).`,
      });
      return;
    }

    const precoUnitario = Number(produto.preco_venda) || 0;
    const subtotal = Number((precoUnitario * quantidade).toFixed(2));

    setItens((prev) => {
      const existentePrev = prev.find((item) => item.produto_id === produto.id);
      if (existentePrev) {
        return prev.map((item) =>
          item.produto_id === produto.id
            ? {
                ...item,
                quantidade: item.quantidade + quantidade,
                subtotal: Number(
                  (
                    (item.quantidade + quantidade) *
                    item.preco_unitario
                  ).toFixed(2)
                ),
              }
            : item
        );
      }
      return [
        ...prev,
        {
          produto_id: produto.id,
          nome: produto.nome,
          quantidade,
          preco_unitario: precoUnitario,
          subtotal,
        },
      ];
    });

    setItemProdutoId("");
    setItemQuantidade(1);
    setMensagem({ tipo: "", texto: "" });
  }

  function handleRemoverItem(produtoId) {
    setItens((prev) => prev.filter((item) => item.produto_id !== produtoId));
  }

  async function finalizarVenda() {
    if (!donoAtual) {
      setMensagem({
        tipo: "erro",
        texto:
          "Não foi possível identificar o proprietário. Faça login novamente.",
      });
      return;
    }
    if (!clienteSelecionado) {
      setMensagem({ tipo: "erro", texto: "Selecione um cliente." });
      return;
    }
    if (!formaPagamento) {
      setMensagem({ tipo: "erro", texto: "Informe a forma de pagamento." });
      return;
    }
    if (!itens.length) {
      setMensagem({ tipo: "erro", texto: "Adicione pelo menos um item." });
      return;
    }

    setSalvando(true);
    setMensagem({ tipo: "", texto: "" });

    const descontoValor = Number(desconto) || 0;
    const payloadVenda = {
      cliente_id: clienteSelecionado,
      forma_pagamento: formaPagamento,
      observacoes: observacoes?.trim() || null,
      status: "concluido",
      total_bruto: Number(totalBruto.toFixed(2)),
      desconto: Number(descontoValor.toFixed(2)),
      total_liquido: Number(Math.max(0, totalLiquido).toFixed(2)),
      data_venda: new Date().toISOString(),
    };

    try {
      const itensPayload = itens.map((item) => ({
        produto_id: item.produto_id,
        descricao: item.nome,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
        subtotal: item.subtotal,
      }));

      const { error } = await registrarVenda(
        donoAtual,
        payloadVenda,
        itensPayload
      );
      if (error) throw error;

      await atualizarEstoque(itens);
      await carregarProdutos();

      setMensagem({ tipo: "sucesso", texto: "Venda registrada com sucesso!" });
      resetarFormulario();
    } catch (error) {
      console.error("[TelaVendas] Falha ao finalizar venda", error);
      setMensagem({
        tipo: "erro",
        texto: error.message || "Não foi possível finalizar a venda.",
      });
    } finally {
      setSalvando(false);
    }
  }

  async function atualizarEstoque(itensVenda) {
    if (!donoAtual) return;
    const updates = itensVenda.map(async (item) => {
      const produtoBase = produtos.find((p) => p.id === item.produto_id);
      if (!produtoBase) return null;
      const possuiQuantidade = Object.prototype.hasOwnProperty.call(
        produtoBase,
        "quantidade"
      );
      const quantidadeAtual = Number(
        possuiQuantidade
          ? produtoBase.quantidade
          : produtoBase.quantidade_estoque
      );
      const novoValor = Math.max(0, quantidadeAtual - item.quantidade);
      const payload = possuiQuantidade
        ? { quantidade: novoValor }
        : { quantidade_estoque: novoValor };
      return atualizarProduto(item.produto_id, donoAtual, payload);
    });

    await Promise.all(updates);
  }

  function resetarFormulario() {
    setClienteSelecionado("");
    setFormaPagamento("pix");
    setObservacoes("");
    setItens([]);
    setDesconto(0);
    setItemProdutoId("");
    setItemQuantidade(1);
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-6 text-sm text-gray-600">
        Validando sessão...
      </div>
    );
  }

  if (!donoAtual) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-6 text-sm text-gray-600">
        Conclua o login para registrar vendas.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-[0.4em] text-gray-500">
          Operações
        </p>
        <h1 className="text-3xl font-bold text-gray-900">Tela de Vendas</h1>
        <p className="text-gray-500">
          Registre vendas com itens, estoque automático e integração com
          Supabase.
        </p>
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

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Dados da venda
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Cliente
                </label>
                <input
                  className="input"
                  placeholder="Buscar cliente pelo nome"
                  value={clientesBusca}
                  onChange={(event) => setClientesBusca(event.target.value)}
                />
                <select
                  className="input"
                  value={clienteSelecionado}
                  onChange={(event) =>
                    setClienteSelecionado(event.target.value)
                  }
                  disabled={carregandoOpcoes}
                >
                  <option value="">Selecione um cliente</option>
                  {clientesFiltrados.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Forma de pagamento
                </label>
                <select
                  className="input"
                  value={formaPagamento}
                  onChange={(event) => setFormaPagamento(event.target.value)}
                >
                  {FORMAS_PAGAMENTO.map((forma) => (
                    <option key={forma.value} value={forma.value}>
                      {forma.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Observações
                </label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Informações adicionais, compromissos ou garantia"
                  value={observacoes}
                  onChange={(event) => setObservacoes(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Produto
                </label>
                <input
                  className="input"
                  placeholder="Buscar produto"
                  value={produtosBusca}
                  onChange={(event) => setProdutosBusca(event.target.value)}
                />
                <select
                  className="input"
                  value={itemProdutoId}
                  onChange={(event) => setItemProdutoId(event.target.value)}
                  disabled={carregandoOpcoes}
                >
                  <option value="">Selecione um produto</option>
                  {produtosFiltrados.map((produto) => {
                    const estoque = Number(
                      produto.quantidade ?? produto.quantidade_estoque ?? 0
                    );
                    return (
                      <option key={produto.id} value={produto.id}>
                        {produto.nome} •{" "}
                        {formatCurrency(produto.preco_venda || 0)} • estoque:{" "}
                        {estoque}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="w-full lg:w-40 space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Quantidade
                </label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  value={itemQuantidade}
                  onChange={(event) => setItemQuantidade(event.target.value)}
                />
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAdicionarItem}
              >
                Adicionar item
              </button>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm text-gray-700">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-gray-400">
                    <th className="pb-2">Produto</th>
                    <th className="pb-2">Qtd.</th>
                    <th className="pb-2">Preço unit.</th>
                    <th className="pb-2">Subtotal</th>
                    <th />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {itens.map((item) => (
                    <tr key={item.produto_id}>
                      <td className="py-2 font-medium text-gray-900">
                        {item.nome}
                      </td>
                      <td className="py-2">{item.quantidade}</td>
                      <td className="py-2">
                        {formatCurrency(item.preco_unitario)}
                      </td>
                      <td className="py-2 font-semibold">
                        {formatCurrency(item.subtotal)}
                      </td>
                      <td className="py-2 text-right">
                        <button
                          className="text-red-600 hover:underline"
                          onClick={() => handleRemoverItem(item.produto_id)}
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!itens.length && (
                <p className="mt-4 text-sm text-gray-500">
                  Nenhum item adicionado ainda. Selecione um produto e clique em
                  “Adicionar item”.
                </p>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <div>
              <p className="text-sm text-gray-500">Total bruto</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalBruto)}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Desconto
              </label>
              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                value={desconto}
                onChange={(event) => setDesconto(event.target.value)}
              />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total líquido</p>
              <p className="text-3xl font-bold text-emerald-600">
                {formatCurrency(totalLiquido)}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary w-full py-4 text-base"
            onClick={finalizarVenda}
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Finalizar venda"}
          </button>
        </aside>
      </section>
    </div>
  );
}
