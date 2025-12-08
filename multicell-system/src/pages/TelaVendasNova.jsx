import { useEffect, useMemo, useState } from "react";
import { Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import useClientes from "@/hooks/useClientes";
import useProdutos from "@/hooks/useProdutos";
import { registrarVenda } from "@/services/vendasService";
import { atualizarProduto } from "@/services/produtosService";
import PrimeCard from "@/components/ui/PrimeCard";
import PrimeButton from "@/components/ui/PrimeButton";
import PrimeInput from "@/components/ui/PrimeInput";
import PrimeSectionTitle from "@/components/ui/PrimeSectionTitle";

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

export default function TelaVendasNova() {
  const { proprietarioId, loading } = useAuth();
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

  const limparMensagem = () => setMensagem({ tipo: "", texto: "" });

  const handleAdicionarItem = () => {
    if (!itemProdutoId) {
      setMensagem({ tipo: "erro", texto: "Selecione um produto." });
      return;
    }

    const produto = produtos.find((p) => p.id === itemProdutoId);
    if (!produto) {
      setMensagem({ tipo: "erro", texto: "Produto não encontrado." });
      return;
    }

    const quantidade = Math.max(1, Number(itemQuantidade) || 1);
    const preco = Number(produto.preco_venda || produto.preco || 0);
    const subtotal = Number((quantidade * preco).toFixed(2));

    setItens((prev) => {
      const existente = prev.find((item) => item.produto_id === produto.id);
      if (existente) {
        return prev.map((item) =>
          item.produto_id === produto.id
            ? {
                ...item,
                quantidade: item.quantidade + quantidade,
                subtotal: Number((item.subtotal + subtotal).toFixed(2)),
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
          preco_unitario: preco,
          subtotal,
        },
      ];
    });

    setItemProdutoId("");
    setItemQuantidade(1);
    limparMensagem();
  };

  const handleRemoverItem = (produtoId) => {
    setItens((prev) => prev.filter((item) => item.produto_id !== produtoId));
  };

  const resetFormulario = () => {
    setClienteSelecionado("");
    setFormaPagamento("pix");
    setObservacoes("");
    setItemProdutoId("");
    setItemQuantidade(1);
    setItens([]);
    setDesconto(0);
  };

  const finalizarVenda = async () => {
    if (!donoAtual) {
      setMensagem({ tipo: "erro", texto: "Sessão expirada." });
      return;
    }

    if (!itens.length) {
      setMensagem({ tipo: "erro", texto: "Adicione ao menos um item." });
      return;
    }

    setSalvando(true);
    limparMensagem();

    const clienteInfo = clientes.find((c) => c.id === clienteSelecionado);

    const vendaPayload = {
      cliente_id: clienteSelecionado || null,
      cliente_nome: clienteInfo?.nome || null,
      forma_pagamento: formaPagamento,
      observacoes: observacoes.trim() || null,
      total_bruto: Number(totalBruto) || 0,
      desconto: Number(desconto) || 0,
      total_liquido: Number(totalLiquido) || 0,
    };

    const itensPayload = itens.map((item) => ({
      produto_id: item.produto_id,
      descricao: item.nome,
      quantidade: item.quantidade,
      preco_unitario: item.preco_unitario,
      subtotal: item.subtotal,
    }));

    try {
      const { error } = await registrarVenda(
        donoAtual,
        vendaPayload,
        itensPayload
      );
      if (error) throw error;

      await Promise.all(
        itens.map((item) => {
          const produtoAtual = produtos.find((p) => p.id === item.produto_id);
          if (!produtoAtual) return null;
          const estoqueAtual = Number(
            produtoAtual.quantidade_estoque ?? produtoAtual.quantidade ?? 0
          );
          const novoEstoque = Math.max(0, estoqueAtual - item.quantidade);
          return atualizarProduto(item.produto_id, donoAtual, {
            quantidade: novoEstoque,
            quantidade_estoque: novoEstoque,
          });
        })
      );

      setMensagem({ tipo: "sucesso", texto: "Venda registrada com sucesso." });
      resetFormulario();
      await carregarProdutos();
    } catch (error) {
      console.error("[TelaVendasNova] finalizarVenda", error);
      setMensagem({
        tipo: "erro",
        texto: error.message || "Não foi possível registrar a venda.",
      });
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <PrimeCard className="text-sm text-white/70">
        Validando sessão...
      </PrimeCard>
    );
  }

  if (!donoAtual) {
    return (
      <PrimeCard className="text-sm text-white/70">
        Faça login para acessar o módulo de vendas.
      </PrimeCard>
    );
  }

  return (
    <div className="space-y-8">
      <PrimeSectionTitle
        title="Console de vendas"
        subtitle="Registre operações completas com estoque automático e integração Supabase em tempo real."
        icon={ShoppingCart}
      />

      {mensagem.texto && (
        <PrimeCard
          className={
            mensagem.tipo === "erro"
              ? "border-red-400/40 bg-red-900/40 text-red-100"
              : "border-emerald-400/40 bg-emerald-900/30 text-emerald-100"
          }
        >
          {mensagem.texto}
        </PrimeCard>
      )}

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <PrimeCard className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#cdb88d]">
                Fluxo da venda
              </p>
              <h2 className="text-2xl font-semibold text-white">
                Dados principais
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <PrimeInput
                label="Buscar cliente"
                placeholder="Digite o nome para filtrar"
                value={clientesBusca}
                onChange={(event) => setClientesBusca(event.target.value)}
              />
              <PrimeInput
                as="select"
                label="Cliente"
                value={clienteSelecionado}
                onChange={(event) => setClienteSelecionado(event.target.value)}
                disabled={carregandoOpcoes}
              >
                <option value="">Selecione um cliente</option>
                {clientesFiltrados.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </option>
                ))}
              </PrimeInput>
              <PrimeInput
                as="select"
                label="Forma de pagamento"
                value={formaPagamento}
                onChange={(event) => setFormaPagamento(event.target.value)}
              >
                {FORMAS_PAGAMENTO.map((forma) => (
                  <option key={forma.value} value={forma.value}>
                    {forma.label}
                  </option>
                ))}
              </PrimeInput>
              <div className="md:col-span-2">
                <PrimeInput
                  as="textarea"
                  rows={3}
                  label="Observações"
                  placeholder="Informações adicionais, compromissos ou garantia"
                  value={observacoes}
                  onChange={(event) => setObservacoes(event.target.value)}
                />
              </div>
            </div>
          </PrimeCard>

          <PrimeCard className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#cdb88d]">
                Itens
              </p>
              <h2 className="text-2xl font-semibold text-white">
                Adicionar produtos
              </h2>
            </div>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex-1 space-y-4">
                <PrimeInput
                  label="Buscar produto"
                  placeholder="Digite para filtrar o catálogo"
                  value={produtosBusca}
                  onChange={(event) => setProdutosBusca(event.target.value)}
                />
                <PrimeInput
                  as="select"
                  label="Produto"
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
                </PrimeInput>
              </div>
              <div className="w-full space-y-4 lg:w-44">
                <PrimeInput
                  label="Quantidade"
                  type="number"
                  min="1"
                  value={itemQuantidade}
                  onChange={(event) => setItemQuantidade(event.target.value)}
                />
              </div>
              <PrimeButton
                onClick={handleAdicionarItem}
                className="whitespace-nowrap"
              >
                <Plus size={16} /> Adicionar item
              </PrimeButton>
            </div>

            <div className="overflow-x-auto">
              <table className="table-premium w-full text-sm">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Qtd.</th>
                    <th>Preço unit.</th>
                    <th>Subtotal</th>
                    <th className="text-right">Remover</th>
                  </tr>
                </thead>
                <tbody>
                  {itens.map((item) => (
                    <tr key={item.produto_id}>
                      <td className="font-semibold text-white">{item.nome}</td>
                      <td>{item.quantidade}</td>
                      <td className="text-white/80">
                        {formatCurrency(item.preco_unitario)}
                      </td>
                      <td className="text-[#ffe8a3] font-semibold">
                        {formatCurrency(item.subtotal)}
                      </td>
                      <td>
                        <button
                          className="ml-auto flex items-center justify-end gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-red-300 transition hover:border-red-300/60"
                          onClick={() => handleRemoverItem(item.produto_id)}
                        >
                          <Trash2 size={16} /> Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!itens.length && (
                <p className="mt-4 text-sm text-white/60">
                  Nenhum item adicionado. Selecione um produto e clique em
                  "Adicionar item".
                </p>
              )}
            </div>
          </PrimeCard>
        </div>

        <div className="space-y-6">
          <PrimeCard className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#cdb88d]">
                Resumo
              </p>
              <h2 className="text-2xl font-semibold text-white">Valores</h2>
            </div>
            <div>
              <p className="text-sm text-white/60">Total bruto</p>
              <p className="text-3xl font-black text-white">
                {formatCurrency(totalBruto)}
              </p>
            </div>
            <PrimeInput
              label="Desconto"
              type="number"
              min="0"
              step="0.01"
              value={desconto}
              onChange={(event) => setDesconto(event.target.value)}
            />
            <div>
              <p className="text-sm text-white/60">Total líquido</p>
              <p className="text-4xl font-black text-[#cda64d]">
                {formatCurrency(totalLiquido)}
              </p>
            </div>
          </PrimeCard>
          <PrimeButton
            onClick={finalizarVenda}
            disabled={salvando || carregandoOpcoes}
            className="w-full py-4 text-base tracking-[0.4em]"
          >
            {salvando ? "Salvando..." : "Finalizar venda"}
          </PrimeButton>
        </div>
      </div>
    </div>
  );
}
