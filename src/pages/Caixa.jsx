import { useCallback, useEffect, useMemo, useState } from "react";
import { DollarSign, Plus, Printer, Share2, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  createVenda,
  getVendaDetalhe,
  getResumoVendas,
  listVendas,
} from "../services/caixaService";
import { imprimir, modeloCupomVenda, printElementById } from "../utils/print";
import { imprimirHtmlEmNovaJanela } from "../utils/impressao";
import { compartilharWhatsApp } from "../utils/whatsapp";
import { gerarCupom } from "../utils/cupom";
import { gerarPix } from "../utils/pix";
import PrimeCard from "../components/ui/PrimeCard";
import PrimeButton from "../components/ui/PrimeButton";
import PrimeInput from "../components/ui/PrimeInput";
import PrimeSectionTitle from "../components/ui/PrimeSectionTitle";

const paymentOptions = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "cartao", label: "Cartão" },
  { value: "pix", label: "Pix" },
  { value: "outro", label: "Outro" },
];

const paymentBadge = {
  dinheiro: "bg-emerald-500/20 text-emerald-200 border-emerald-500/40",
  cartao: "bg-indigo-500/20 text-indigo-200 border-indigo-500/40",
  pix: "bg-cyan-500/20 text-cyan-100 border-cyan-500/40",
  outro: "bg-slate-600/30 text-slate-200 border-slate-500/40",
};

const emptyItem = () => ({
  descricao: "",
  quantidade: 1,
  preco_unitario: "",
});

const toDateInput = (date) => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

const toDateTimeInput = (date) => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const formatCurrency = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "-";
  return numeric.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
};

const formatValueNumber = (value) => Number(value || 0).toFixed(2);

const formatDateTime = (iso) => {
  if (!iso) return "-";
  const date = new Date(iso);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toISODate = (value, endOfDay = false) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  }
  return date.toISOString();
};

const sanitizeDecimal = (value, fallback = 0) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Number(parsed.toFixed(2));
};

const paymentSummaryStyles = {
  dinheiro: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
  cartao: "border-indigo-500/30 bg-indigo-500/10 text-indigo-100",
  pix: "border-cyan-500/30 bg-cyan-500/10 text-cyan-100",
  outro: "border-slate-500/30 bg-slate-500/10 text-slate-200",
};

const RESUMO_INICIAL = {
  total: 0,
  quantidade: 0,
  porPagamento: {
    dinheiro: 0,
    cartao: 0,
    pix: 0,
    outro: 0,
  },
};

const generateTempId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const defaultCabecalho = () => ({
  data: toDateTimeInput(new Date()),
  cliente_nome: "",
  forma_pagamento: "dinheiro",
  observacoes: "",
});

const PRINTER_IP = import.meta.env.VITE_PRINTER_IP || "192.168.0.150";
const AUTO_PRINT_VENDA = import.meta.env.VITE_AUTO_PRINT_VENDA === "true";
const LOJA_NOME = import.meta.env.VITE_LOJA_NOME || "Multicell System";
const LOJA_CNPJ = import.meta.env.VITE_LOJA_CNPJ || "";
const LOJA_TELEFONE = import.meta.env.VITE_LOJA_TELEFONE || "";
const PIX_CHAVE = import.meta.env.VITE_PIX_CHAVE || "00000000000";

function montarCupomFromDetalhe(det) {
  if (!det) return null;
  const itens = (det.itens || []).map((item) => ({
    nome: item.descricao,
    qtd: item.quantidade,
    total: formatValueNumber(item.subtotal),
  }));
  return {
    cliente: det.venda?.cliente_nome || "Cliente não informado",
    data: formatDateTime(det.venda?.data),
    itens,
    total: formatValueNumber(det.venda?.total),
  };
}

function montarCupomFromForm(cabecalho, itens) {
  return {
    cliente: cabecalho.cliente_nome || "Cliente não informado",
    data: new Date(cabecalho.data || new Date()).toLocaleString("pt-BR"),
    itens: itens.map((item) => ({
      nome: item.descricao,
      qtd: item.quantidade,
      total: formatValueNumber(item.subtotal),
    })),
    total: formatValueNumber(
      itens.reduce((sum, item) => sum + Number(item.subtotal || 0), 0)
    ),
  };
}

export function gerarHtmlCupomVenda(venda = {}, itens = []) {
  const dataHora = venda.data
    ? new Date(venda.data).toLocaleString("pt-BR")
    : new Date().toLocaleString("pt-BR");
  const pagamentoLabel =
    paymentOptions.find((option) => option.value === venda.forma_pagamento)
      ?.label ||
    venda.forma_pagamento ||
    "Pagamento";
  const itensHtml = itens
    .map((item) => {
      const descricao = item.descricao || item.nome || "Item";
      const quantidade = item.quantidade || item.qtd || 1;
      const precoUnitario =
        item.preco_unitario ?? item.preco ?? item.valor_unitario ?? 0;
      const subtotal =
        item.subtotal ?? Number((quantidade * precoUnitario).toFixed(2));
      return `
        <div class="linha">
          <span>${descricao}</span>
          <span>${quantidade} x ${formatCurrency(precoUnitario)}</span>
        </div>
        <div class="linha">
          <span></span>
          <span>Subtotal: ${formatCurrency(subtotal)}</span>
        </div>
      `;
    })
    .join("");

  return `
    <div class="cupom">
      <h2>${LOJA_NOME.toUpperCase()}</h2>
      <div class="texto-centro">
        Operações inteligentes, resultados imediatos.
      </div>

      <div class="divisor"></div>
      <div class="linha">
        <span>Venda: ${venda.id || "-"}</span>
        <span>Data: ${dataHora}</span>
      </div>
      <div class="linha">
        <span>CNPJ:</span>
        <span>${LOJA_CNPJ || "-"}</span>
      </div>
      <div class="linha">
        <span>Telefone:</span>
        <span>${LOJA_TELEFONE || "-"}</span>
      </div>

      <div class="divisor"></div>
      <div>
        <strong>Cliente:</strong> ${
          venda.cliente_nome || "Cliente não informado"
        }
      </div>

      <div class="divisor"></div>
      ${
        itensHtml ||
        '<div class="linha"><span>Nenhum item registrado.</span></div>'
      }

      <div class="divisor"></div>
      <div class="linha">
        <strong>Total</strong>
        <strong>${formatCurrency(venda.total)}</strong>
      </div>
      <div class="linha">
        <span>Pagamento:</span>
        <span>${pagamentoLabel}</span>
      </div>

      ${
        venda.observacoes
          ? `
      <div class="divisor"></div>
      <div>${venda.observacoes}</div>
      `
          : ""
      }

      <div class="divisor"></div>
      <div class="texto-centro">
        Obrigado pela preferência!<br/>
        Volte sempre.
      </div>
    </div>
  `;
}

export default function Caixa() {
  const { proprietarioId, loading: authLoading } = useAuth();
  const [filters, setFilters] = useState(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 7);
    return {
      dataInicial: toDateInput(start),
      dataFinal: toDateInput(now),
    };
  });
  const [vendas, setVendas] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState("");
  const [selectedVenda, setSelectedVenda] = useState(null);
  const [loadingDetalhe, setLoadingDetalhe] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [cabecalho, setCabecalho] = useState(() => defaultCabecalho());
  const [itens, setItens] = useState([]);
  const [itemDraft, setItemDraft] = useState(() => emptyItem());
  const [saving, setSaving] = useState(false);
  const [formMessage, setFormMessage] = useState(null);
  const [cupomPreview, setCupomPreview] = useState("");
  const [pixPreview, setPixPreview] = useState(null);
  const [resumo, setResumo] = useState(RESUMO_INICIAL);
  const [loadingResumo, setLoadingResumo] = useState(false);

  const periodoFiltro = useMemo(
    () => ({
      inicial: toISODate(filters.dataInicial),
      final: toISODate(filters.dataFinal, true),
    }),
    [filters]
  );

  const totalVenda = useMemo(
    () => itens.reduce((sum, item) => sum + Number(item.subtotal || 0), 0),
    [itens]
  );

  const resumoPagamentoCards = useMemo(
    () =>
      paymentOptions.map((option) => ({
        ...option,
        valor: resumo?.porPagamento?.[option.value] || 0,
      })),
    [resumo]
  );

  const updatePixPreview = useCallback(async (vendaParaCupom) => {
    if (!vendaParaCupom?.total) {
      setPixPreview(null);
      return;
    }

    try {
      const pixData = await gerarPix(vendaParaCupom.total, {
        chavePix: PIX_CHAVE,
        descricao: vendaParaCupom.cliente_nome || "Venda Multicell",
      });
      setPixPreview({ ...pixData, valor: Number(vendaParaCupom.total) });
    } catch (pixError) {
      console.error("[Caixa] Falha ao gerar QR Code PIX", pixError);
      setPixPreview(null);
    }
  }, []);

  const carregarVendas = useCallback(async () => {
    if (!proprietarioId) return;
    setLoadingList(true);
    setListError("");
    try {
      const { data, error } = await listVendas(proprietarioId, {
        dataInicial: periodoFiltro.inicial,
        dataFinal: periodoFiltro.final,
      });
      if (error) throw error;
      setVendas(data);
    } catch (error) {
      console.error("[Caixa] Falha ao carregar vendas", error);
      setListError(
        error?.message || "Não foi possível carregar as vendas do período."
      );
      setVendas([]);
    } finally {
      setLoadingList(false);
    }
  }, [periodoFiltro, proprietarioId]);

  const carregarResumo = useCallback(async () => {
    if (!proprietarioId) return;
    setLoadingResumo(true);
    try {
      const { data, error } = await getResumoVendas(proprietarioId, {
        dataInicial: periodoFiltro.inicial,
        dataFinal: periodoFiltro.final,
      });
      if (error) throw error;
      setResumo(data);
    } catch (error) {
      console.error("[Caixa] Falha ao gerar resumo", error);
      setResumo(RESUMO_INICIAL);
    } finally {
      setLoadingResumo(false);
    }
  }, [periodoFiltro, proprietarioId]);

  useEffect(() => {
    carregarVendas();
    carregarResumo();
  }, [carregarResumo, carregarVendas]);

  useEffect(() => {
    const syncPix = async () => {
      if (drawerOpen) {
        await updatePixPreview({
          total: totalVenda,
          cliente_nome: cabecalho.cliente_nome,
        });
        return;
      }

      if (selectedVenda) {
        await updatePixPreview({
          total: selectedVenda.venda?.total,
          cliente_nome: selectedVenda.venda?.cliente_nome,
        });
        return;
      }

      setPixPreview(null);
    };

    syncPix().catch((error) =>
      console.error("[Caixa] Falha ao sincronizar pré-visualização PIX", error)
    );
  }, [
    cabecalho.cliente_nome,
    drawerOpen,
    selectedVenda,
    totalVenda,
    updatePixPreview,
  ]);

  const handleOpenDrawer = useCallback(() => {
    setDrawerOpen(true);
    setFormStep(1);
    setCabecalho(defaultCabecalho());
    setItens([]);
    setItemDraft(emptyItem());
    setFormMessage(null);
  }, []);

  const handleAddItem = useCallback(() => {
    const descricao = itemDraft.descricao?.trim();
    if (!descricao) {
      setFormMessage({
        type: "error",
        text: "Informe a descrição do item antes de adicioná-lo.",
      });
      return;
    }

    const quantidade = Math.max(1, Number(itemDraft.quantidade) || 1);
    const precoUnitario = Math.max(0, Number(itemDraft.preco_unitario) || 0);

    if (!precoUnitario) {
      setFormMessage({
        type: "error",
        text: "Informe o preço unitário do item.",
      });
      return;
    }

    const subtotal = sanitizeDecimal(quantidade * precoUnitario);

    setItens((prev) => [
      ...prev,
      {
        id: generateTempId(),
        descricao,
        quantidade,
        preco_unitario: Number(precoUnitario.toFixed(2)),
        subtotal,
      },
    ]);
    setItemDraft(emptyItem());
    setFormMessage(null);
  }, [itemDraft]);

  const handleRemoveItem = useCallback((id) => {
    setItens((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleSelectVenda = useCallback(
    async (venda) => {
      if (!venda?.id) return;
      setLoadingDetalhe(true);
      setSelectedVenda(null);

      try {
        const { data, error } = await getVendaDetalhe(venda.id, proprietarioId);
        if (error) throw error;
        setSelectedVenda(data);
        const cupom = montarCupomFromDetalhe(data);
        if (cupom) {
          setCupomPreview(modeloCupomVenda(cupom));
        }
      } catch (error) {
        console.error("[Caixa] Falha ao carregar detalhes da venda", error);
        setListError(
          error?.message || "Não foi possível carregar os detalhes da venda."
        );
      } finally {
        setLoadingDetalhe(false);
      }
    },
    [proprietarioId]
  );

  const handlePrintCupom = useCallback(() => {
    if (!selectedVenda) {
      alert("Selecione uma venda para imprimir o cupom.");
      return;
    }
    printElementById("cupom-print-area");
  }, [selectedVenda]);

  const handlePrintTermico = useCallback(async () => {
    if (!selectedVenda) {
      alert("Selecione uma venda para enviar à impressora térmica.");
      return;
    }

    const cupom = montarCupomFromDetalhe(selectedVenda);
    if (!cupom) return;

    const texto = modeloCupomVenda(cupom);
    await imprimir(PRINTER_IP, texto, { qrUrl: pixPreview?.payload });
  }, [pixPreview?.payload, selectedVenda]);

  const handleImprimirCupomHtml = useCallback(() => {
    if (!selectedVenda) {
      alert("Selecione uma venda para gerar o cupom em PDF.");
      return;
    }
    const html = gerarHtmlCupomVenda(selectedVenda.venda, selectedVenda.itens);
    imprimirHtmlEmNovaJanela({
      titulo: `Cupom da venda #${selectedVenda.venda.id}`,
      conteudoHtml: html,
    });
  }, [selectedVenda]);

  const handleEnviarVendaWhatsapp = useCallback(() => {
    if (!selectedVenda) {
      alert("Selecione uma venda para compartilhar.");
      return;
    }
    const cupom = montarCupomFromDetalhe(selectedVenda);
    if (!cupom) return;
    compartilharWhatsApp({ mensagem: modeloCupomVenda(cupom) });
  }, [selectedVenda]);

  const enviarCupomBluetoothPlaceholder = useCallback((texto) => {
    if (!texto) {
      alert("Gere um cupom antes de enviar via Bluetooth.");
      return;
    }

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(texto)
        .then(() =>
          alert(
            "Copiamos o cupom para a área de transferência. Cole no app móvel para imprimir via Bluetooth."
          )
        )
        .catch(() =>
          alert(
            "Copie manualmente o texto do cupom e utilize o aplicativo móvel para impressão Bluetooth."
          )
        );
      return;
    }

    alert(texto);
  }, []);

  const handleSaveVenda = useCallback(async () => {
    if (!proprietarioId) return;
    if (!itens.length) {
      setFormMessage({
        type: "error",
        text: "Adicione ao menos um item antes de salvar a venda.",
      });
      return;
    }

    setSaving(true);
    setFormMessage(null);

    const cabecalhoPayload = {
      ...cabecalho,
      data: cabecalho.data
        ? new Date(cabecalho.data).toISOString()
        : new Date().toISOString(),
    };

    const itensPayload = itens.map((item) => ({
      descricao: item.descricao,
      quantidade: Number(item.quantidade) || 1,
      preco_unitario: Number(item.preco_unitario) || 0,
      subtotal: item.subtotal,
    }));

    try {
      const { data, error } = await createVenda(proprietarioId, {
        cabecalho: cabecalhoPayload,
        itens: itensPayload,
      });
      if (error) throw error;
      if (!data?.venda) {
        throw new Error("Retorno inesperado do servidor ao salvar a venda.");
      }

      const cupom = montarCupomFromDetalhe({
        venda: data.venda,
        itens: data.itens,
      });
      if (cupom) {
        setCupomPreview(modeloCupomVenda(cupom));
      }
      setSelectedVenda(data);
      setFormMessage({
        type: "success",
        text: "Venda registrada com sucesso! Você já pode iniciar outra.",
      });
      setCabecalho(defaultCabecalho());
      setItens([]);
      setItemDraft(emptyItem());
      setFormStep(1);
      await carregarVendas();
      await carregarResumo();
    } catch (error) {
      console.error("[Caixa] Falha ao salvar venda", error);
      setFormMessage({
        type: "error",
        text: error?.message || "Não foi possível salvar a venda.",
      });
    } finally {
      setSaving(false);
    }
  }, [cabecalho, carregarResumo, carregarVendas, itens, proprietarioId]);

  if (authLoading) {
    return (
      <PrimeCard className="text-sm text-white/70">
        Validando sessão...
      </PrimeCard>
    );
  }

  if (!proprietarioId) {
    return (
      <PrimeCard className="text-sm text-white/70">
        Faça login para acessar o caixa.
      </PrimeCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <PrimeSectionTitle
          title="Caixa e vendas"
          subtitle="Registre operações rápidas e monitore o faturamento em tempo real."
          icon={DollarSign}
          className="flex-1"
        />
        <PrimeButton
          onClick={handleOpenDrawer}
          className="self-start lg:self-auto"
        >
          <Plus size={18} /> Nova venda
        </PrimeButton>
      </div>

      <PrimeCard className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <PrimeInput
            label="Data inicial"
            type="date"
            value={filters.dataInicial}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                dataInicial: event.target.value,
              }))
            }
          />
          <PrimeInput
            label="Data final"
            type="date"
            value={filters.dataFinal}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                dataFinal: event.target.value,
              }))
            }
          />
        </div>
        {listError && (
          <PrimeCard className="border-red-400/40 bg-red-900/40 text-red-100">
            {listError}
          </PrimeCard>
        )}
      </PrimeCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <PrimeCard>
          <p className="text-xs uppercase tracking-[0.35em] text-[#cdb88d]">
            Período selecionado
          </p>
          <p className="mt-2 text-3xl font-black text-white">
            {loadingResumo ? "--" : formatCurrency(resumo.total)}
          </p>
          <p className="text-xs text-white/60">
            Receita bruta do intervalo filtrado
          </p>
        </PrimeCard>
        <PrimeCard>
          <p className="text-xs uppercase tracking-[0.35em] text-[#cdb88d]">
            Vendas registradas
          </p>
          <p className="mt-2 text-3xl font-black text-white">
            {loadingResumo ? "--" : resumo.quantidade}
          </p>
          <p className="text-xs text-white/60">
            Número de operações realizadas
          </p>
        </PrimeCard>
        <PrimeCard>
          <p className="text-xs uppercase tracking-[0.35em] text-[#cdb88d]">
            Último filtro
          </p>
          <p className="mt-2 text-base font-semibold text-white">
            {filters.dataInicial} → {filters.dataFinal}
          </p>
          <p className="text-xs text-white/60">
            Ajuste as datas para refinar o painel
          </p>
        </PrimeCard>
        <PrimeCard>
          <p className="text-xs uppercase tracking-[0.35em] text-[#cdb88d]">
            Total em aberto
          </p>
          <p className="mt-2 text-3xl font-black text-white">
            {formatCurrency(totalVenda)}
          </p>
          <p className="text-xs text-white/60">
            Soma estimada da venda em edição
          </p>
        </PrimeCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {resumoPagamentoCards.map((option) => (
          <PrimeCard
            key={option.value}
            className={`${
              paymentSummaryStyles[option.value]
            } border text-sm font-medium`}
          >
            <p className="text-xs uppercase tracking-[0.35em]">
              {option.label}
            </p>
            <p className="mt-2 text-2xl font-black">
              {loadingResumo ? "--" : formatCurrency(option.valor)}
            </p>
            <p className="text-xs opacity-70">Participação no período</p>
          </PrimeCard>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <PrimeCard className="p-0">
          <div className="overflow-x-auto">
            <table className="table-premium w-full text-sm">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Cliente</th>
                  <th>Pagamento</th>
                  <th>Total</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {vendas.map((venda) => (
                  <tr key={venda.id}>
                    <td className="text-white/70">
                      {formatDateTime(venda.data)}
                    </td>
                    <td className="text-white">
                      {venda.cliente_nome || "Cliente não informado"}
                    </td>
                    <td>
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                          paymentBadge[venda.forma_pagamento] ||
                          paymentBadge.outro
                        }`}
                      >
                        {paymentOptions.find(
                          (option) => option.value === venda.forma_pagamento
                        )?.label || "Pagamento"}
                      </span>
                    </td>
                    <td className="text-[#ffe8a3]">
                      {formatCurrency(venda.total)}
                    </td>
                    <td>
                      <button
                        className="rounded-2xl border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/80 hover:border-white/40"
                        onClick={() => handleSelectVenda(venda)}
                      >
                        Ver detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!vendas.length && (
            <p className="px-6 py-6 text-center text-sm text-white/60">
              {loadingList
                ? "Carregando vendas..."
                : "Nenhuma venda para o período."}
            </p>
          )}
        </PrimeCard>

        <div className="space-y-6">
          <PrimeCard>
            <p className="text-xs uppercase tracking-[0.35em] text-[#cdb88d]">
              Faturamento
            </p>
            <p className="mt-2 text-4xl font-black text-white">
              {formatCurrency(totalVenda)}
            </p>
            <p className="text-xs text-white/60">Total da venda em edição</p>
          </PrimeCard>

          {loadingDetalhe && (
            <PrimeCard className="text-sm text-white/70">
              Carregando detalhes...
            </PrimeCard>
          )}

          {selectedVenda && !loadingDetalhe && (
            <PrimeCard className="space-y-5">
              <div className="flex flex-col gap-2">
                <p className="text-xs uppercase tracking-[0.35em] text-[#cdb88d]">
                  Venda selecionada
                </p>
                <h3 className="text-2xl font-semibold text-white">
                  {selectedVenda.venda.cliente_nome || "Cliente não informado"}
                </h3>
                <div className="flex flex-wrap gap-3">
                  <PrimeButton variant="ghost" onClick={handlePrintCupom}>
                    <Printer size={16} /> PDF/A4
                  </PrimeButton>
                  <PrimeButton variant="ghost" onClick={handlePrintTermico}>
                    <Printer size={16} /> Térmica
                  </PrimeButton>
                  <PrimeButton
                    variant="ghost"
                    onClick={handleImprimirCupomHtml}
                  >
                    <Printer size={16} /> Cupom
                  </PrimeButton>
                  <PrimeButton
                    variant="ghost"
                    onClick={handleEnviarVendaWhatsapp}
                  >
                    <Share2 size={16} /> WhatsApp
                  </PrimeButton>
                  <button
                    className="rounded-2xl border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/70"
                    onClick={() => setSelectedVenda(null)}
                  >
                    Fechar
                  </button>
                </div>
              </div>

              <div id="cupom-print-area" className="space-y-4">
                <dl className="space-y-2 text-sm text-white/80">
                  <div className="flex justify-between">
                    <dt className="text-white/60">Data</dt>
                    <dd>{formatDateTime(selectedVenda.venda.data)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/60">Pagamento</dt>
                    <dd>
                      {paymentOptions.find(
                        (option) =>
                          option.value === selectedVenda.venda.forma_pagamento
                      )?.label || "-"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/60">Total</dt>
                    <dd className="font-semibold text-[#ffe8a3]">
                      {formatCurrency(selectedVenda.venda.total)}
                    </dd>
                  </div>
                </dl>
                <div className="border-t border-white/10 pt-4">
                  <p className="mb-3 text-xs uppercase tracking-[0.35em] text-[#cdb88d]">
                    Itens
                  </p>
                  <ul className="space-y-2 text-sm text-white">
                    {selectedVenda.itens.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2"
                      >
                        <div>
                          <p>{item.descricao}</p>
                          <p className="text-xs text-white/60">
                            {item.quantidade} un ×{" "}
                            {formatCurrency(item.preco_unitario)}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-[#ffe8a3]">
                          {formatCurrency(item.subtotal)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </PrimeCard>
          )}

          {!selectedVenda && !loadingDetalhe && (
            <PrimeCard className="border-dashed border-white/20 bg-transparent text-center text-sm text-white/60">
              Selecione uma venda para ver os detalhes completos.
            </PrimeCard>
          )}

          {cupomPreview && (
            <PrimeCard className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-[#cdb88d]">
                    Cupom gerado
                  </p>
                  <h3 className="text-lg font-semibold text-white">
                    Última venda registrada
                  </h3>
                </div>
                <button
                  className="rounded-2xl border border-emerald-400/40 bg-white/5 px-3 py-1 text-xs text-emerald-200"
                  onClick={() => enviarCupomBluetoothPlaceholder(cupomPreview)}
                >
                  Bluetooth
                </button>
              </div>
              <pre className="max-h-56 overflow-auto rounded-xl bg-black/40 p-4 text-xs text-white/80">
                {cupomPreview}
              </pre>
            </PrimeCard>
          )}

          {pixPreview?.dataUrl && (
            <PrimeCard className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[#cdb88d]">
                  Pagamento PIX
                </p>
                <h3 className="text-lg font-semibold text-white">
                  Escaneie para receber
                </h3>
              </div>
              <div className="flex flex-col items-center gap-3">
                <img
                  src={pixPreview.dataUrl}
                  alt="QR Code PIX"
                  className="h-48 w-48 rounded-2xl border border-white/10 bg-white p-3"
                />
                <p className="text-sm text-white/80">
                  Valor: <strong>{formatCurrency(pixPreview.valor)}</strong>
                </p>
                <p className="break-all text-[11px] text-white/50">
                  Payload: {pixPreview.payload}
                </p>
              </div>
            </PrimeCard>
          )}
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative ml-auto h-full w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-[#050308] px-8 py-8 shadow-[0_0_60px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-[#cdb88d]">
                  Nova venda
                </p>
                <h2 className="text-2xl font-semibold text-white">
                  {formStep === 1 ? "Dados do cliente" : "Itens da venda"}
                </h2>
              </div>
              <button
                className="rounded-full border border-white/15 p-2 text-white/60 hover:border-white/40"
                onClick={() => setDrawerOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-6 flex items-center gap-3 text-xs font-semibold">
              <span
                className={`px-3 py-1 rounded-full border ${
                  formStep >= 1
                    ? "border-[#ffe8a3] text-[#ffe8a3]"
                    : "border-white/10 text-white/40"
                }`}
              >
                1. Cabeçalho
              </span>
              <span className="h-px flex-1 bg-white/10" />
              <span
                className={`px-3 py-1 rounded-full border ${
                  formStep === 2
                    ? "border-[#ffe8a3] text-[#ffe8a3]"
                    : "border-white/10 text-white/40"
                }`}
              >
                2. Itens
              </span>
            </div>

            {formStep === 1 && (
              <div className="mt-6 space-y-4">
                <PrimeInput
                  label="Data"
                  type="datetime-local"
                  value={cabecalho.data}
                  onChange={(event) =>
                    setCabecalho((prev) => ({
                      ...prev,
                      data: event.target.value,
                    }))
                  }
                />
                <PrimeInput
                  label="Cliente"
                  type="text"
                  placeholder="Opcional"
                  value={cabecalho.cliente_nome}
                  onChange={(event) =>
                    setCabecalho((prev) => ({
                      ...prev,
                      cliente_nome: event.target.value,
                    }))
                  }
                />
                <PrimeInput
                  as="select"
                  label="Forma de pagamento"
                  value={cabecalho.forma_pagamento}
                  onChange={(event) =>
                    setCabecalho((prev) => ({
                      ...prev,
                      forma_pagamento: event.target.value,
                    }))
                  }
                >
                  {paymentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </PrimeInput>
                <PrimeInput
                  as="textarea"
                  rows={3}
                  label="Observações"
                  placeholder="Anote informações extras sobre a venda"
                  value={cabecalho.observacoes}
                  onChange={(event) =>
                    setCabecalho((prev) => ({
                      ...prev,
                      observacoes: event.target.value,
                    }))
                  }
                />
                <div className="flex justify-end">
                  <PrimeButton variant="ghost" onClick={() => setFormStep(2)}>
                    Continuar
                  </PrimeButton>
                </div>
              </div>
            )}

            {formStep === 2 && (
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <PrimeInput
                      label="Descrição do item"
                      placeholder="Ex: Película iPhone 13"
                      value={itemDraft.descricao}
                      onChange={(event) =>
                        setItemDraft((prev) => ({
                          ...prev,
                          descricao: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <PrimeInput
                    label="Quantidade"
                    type="number"
                    min="1"
                    value={itemDraft.quantidade}
                    onChange={(event) =>
                      setItemDraft((prev) => ({
                        ...prev,
                        quantidade: event.target.value,
                      }))
                    }
                  />
                  <PrimeInput
                    label="Preço unitário"
                    type="number"
                    min="0"
                    step="0.01"
                    value={itemDraft.preco_unitario}
                    onChange={(event) =>
                      setItemDraft((prev) => ({
                        ...prev,
                        preco_unitario: event.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <PrimeButton variant="ghost" onClick={handleAddItem}>
                    Adicionar item
                  </PrimeButton>
                </div>

                <PrimeCard className="p-0">
                  <div className="overflow-x-auto">
                    <table className="table-premium w-full text-sm">
                      <thead>
                        <tr>
                          <th>Descrição</th>
                          <th>Qtd</th>
                          <th>Preço</th>
                          <th>Subtotal</th>
                          <th className="text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itens.map((item) => (
                          <tr key={item.id}>
                            <td className="text-white">{item.descricao}</td>
                            <td>{item.quantidade}</td>
                            <td className="text-white/70">
                              {formatCurrency(item.preco_unitario)}
                            </td>
                            <td className="text-[#ffe8a3]">
                              {formatCurrency(item.subtotal)}
                            </td>
                            <td>
                              <button
                                className="rounded-2xl border border-red-500/40 bg-white/5 px-3 py-1 text-xs text-red-200"
                                onClick={() => handleRemoveItem(item.id)}
                              >
                                Remover
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {!itens.length && (
                    <p className="px-6 py-6 text-center text-sm text-white/60">
                      Nenhum item adicionado.
                    </p>
                  )}
                </PrimeCard>

                <PrimeCard>
                  <div className="flex justify-between text-sm text-white/70">
                    <span>Itens</span>
                    <span>{itens.length}</span>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <p className="text-xs uppercase tracking-[0.35em] text-[#cdb88d]">
                      Total estimado
                    </p>
                    <p className="text-3xl font-black text-white">
                      {formatCurrency(totalVenda)}
                    </p>
                  </div>
                </PrimeCard>

                {formMessage && (
                  <div
                    className={`rounded-xl border px-4 py-2 text-sm ${
                      formMessage.type === "error"
                        ? "border-rose-700 bg-rose-900/40 text-rose-100"
                        : "border-emerald-500/60 bg-emerald-500/10 text-emerald-200"
                    }`}
                  >
                    {formMessage.text}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <PrimeButton variant="ghost" onClick={() => setFormStep(1)}>
                    Voltar
                  </PrimeButton>
                  <PrimeButton onClick={handleSaveVenda} disabled={saving}>
                    {saving ? "Salvando..." : "Salvar venda"}
                  </PrimeButton>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
