import { useEffect, useMemo, useState } from "react";
import {
  createVenda,
  getVendaDetalhe,
  listVendas,
} from "../services/caixaService";
import { imprimir, modeloCupomVenda, printElementById } from "../utils/print";
import { imprimirHtmlEmNovaJanela } from "../utils/impressao";
import { compartilharWhatsApp } from "../utils/whatsapp";

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

  const handlePrintCupom = () => {
    printElementById("cupom-print-area", "Cupom de Venda");
  };

  const handlePrintTermico = () => {
    if (!selectedVenda) return;
    const payload = montarCupomFromDetalhe(selectedVenda);
    if (!payload) return;
    const qrUrl = selectedVenda?.venda?.id
      ? `${window.location.origin}/vendas/${selectedVenda.venda.id}`
      : undefined;
    imprimir(PRINTER_IP, modeloCupomVenda(payload), { qrUrl });
  };

  const handleImprimirCupomHtml = () => {
    if (!selectedVenda) {
      alert("Selecione uma venda para imprimir.");
      return;
    }
    const html = gerarHtmlCupomVenda(selectedVenda.venda, selectedVenda.itens);
    imprimirHtmlEmNovaJanela({
      titulo: "Cupom de venda",
      conteudoHtml: html,
    });
  };

  const handleEnviarVendaWhatsapp = () => {
    if (!selectedVenda) {
      alert("Selecione uma venda para enviar pelo WhatsApp.");
      return;
    }

    const telefone =
      selectedVenda.venda?.telefone_cliente ||
      selectedVenda.venda?.cliente_telefone ||
      "";
    const telefoneLimpo = telefone ? telefone.replace(/\D/g, "") : "";
    const pagamentoLabel =
      paymentOptions.find(
        (option) => option.value === selectedVenda.venda?.forma_pagamento
      )?.label || "Pagamento";
    const msg = `Olá, ${
      selectedVenda.venda?.cliente_nome || "cliente"
    }! Segue o comprovante da venda #${
      selectedVenda.venda?.id || "-"
    } no valor de ${formatCurrency(
      selectedVenda.venda?.total
    )} pago via ${pagamentoLabel} em ${formatDateTime(
      selectedVenda.venda?.data
    )}. Obrigado pela preferência!`;

    compartilharWhatsApp({
      telefone: telefoneLimpo || undefined,
      mensagem: msg,
    });
  };

  useEffect(() => {
    loadVendas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.dataInicial, filters.dataFinal]);

  async function loadVendas() {
    setLoadingList(true);
    setListError("");
    const payload = {
      dataInicial: filters.dataInicial
        ? new Date(`${filters.dataInicial}T00:00:00`).toISOString()
        : undefined,
      dataFinal: filters.dataFinal
        ? new Date(`${filters.dataFinal}T23:59:59`).toISOString()
        : undefined,
    };
    const { data, error } = await listVendas(payload);
    if (error) {
      setListError(error.message || "Não foi possível carregar as vendas.");
    }
    setVendas(data || []);
    setLoadingList(false);
  }

  async function handleSelectVenda(venda) {
    setSelectedVenda(null);
    setLoadingDetalhe(true);
    const { data, error } = await getVendaDetalhe(venda.id);
    setLoadingDetalhe(false);
    if (error) {
      setListError(error.message || "Falha ao carregar detalhes da venda.");
      return;
    }
    setSelectedVenda(data);
  }

  function resetForm() {
    setCabecalho(defaultCabecalho());
    setItens([]);
    setItemDraft(emptyItem());
    setFormStep(1);
    setFormMessage(null);
  }

  function handleOpenDrawer() {
    resetForm();
    setDrawerOpen(true);
  }

  const totalVenda = useMemo(
    () => itens.reduce((sum, item) => sum + item.subtotal, 0),
    [itens]
  );

  function handleAddItem() {
    const quantidade = Number(itemDraft.quantidade);
    const preco = Number(itemDraft.preco_unitario);
    if (!itemDraft.descricao.trim() || !quantidade || !preco) {
      setFormMessage({
        type: "error",
        text: "Informe descrição, quantidade e preço para adicionar o item.",
      });
      return;
    }
    const novoItem = {
      id: crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`,
      descricao: itemDraft.descricao.trim(),
      quantidade,
      preco_unitario: preco,
      subtotal: Number((quantidade * preco).toFixed(2)),
    };
    setItens((prev) => [...prev, novoItem]);
    setItemDraft(emptyItem());
    setFormMessage(null);
  }

  function handleRemoveItem(id) {
    setItens((prev) => prev.filter((item) => item.id !== id));
  }

  async function handleSaveVenda() {
    if (!itens.length) {
      setFormMessage({ type: "error", text: "Adicione ao menos um item." });
      return;
    }
    setSaving(true);
    setFormMessage(null);
    const payload = {
      cabecalho: {
        ...cabecalho,
        data: cabecalho.data
          ? new Date(cabecalho.data).toISOString()
          : new Date().toISOString(),
      },
      itens: itens.map((item) => ({
        descricao: item.descricao,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
        subtotal: item.subtotal,
      })),
    };
    const { data: vendaRegistrada, error } = await createVenda(payload);
    setSaving(false);
    if (error) {
      setFormMessage({
        type: "error",
        text: error.message || "Não foi possível salvar a venda.",
      });
      return;
    }
    setFormMessage({ type: "success", text: "Venda registrada com sucesso." });
    if (AUTO_PRINT_VENDA) {
      const modelo = montarCupomFromForm(cabecalho, itens);
      imprimir(PRINTER_IP, modeloCupomVenda(modelo));
    }
    const vendaParaCupom = {
      id: vendaRegistrada?.venda?.id || "-",
      data: vendaRegistrada?.venda?.data || payload.cabecalho.data,
      cliente_nome:
        vendaRegistrada?.venda?.cliente_nome || payload.cabecalho.cliente_nome,
      forma_pagamento:
        vendaRegistrada?.venda?.forma_pagamento ||
        payload.cabecalho.forma_pagamento,
      total: vendaRegistrada?.venda?.total ?? totalVenda,
      observacoes:
        vendaRegistrada?.venda?.observacoes || payload.cabecalho.observacoes,
    };
    const itensParaCupom =
      (vendaRegistrada?.itens?.length ? vendaRegistrada.itens : null) ||
      payload.itens;
    const cupomHtml = gerarHtmlCupomVenda(vendaParaCupom, itensParaCupom);
    imprimirHtmlEmNovaJanela({
      titulo: "Cupom de venda",
      conteudoHtml: cupomHtml,
    });
    loadVendas();
    setTimeout(() => {
      setDrawerOpen(false);
      resetForm();
    }, 600);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-slate-500">
            Operações
          </p>
          <h1 className="text-3xl font-black text-white">Caixa & Vendas</h1>
          <p className="text-slate-400">
            Registre vendas rápidas e acompanhe o faturamento do período.
          </p>
        </div>
        <button
          onClick={handleOpenDrawer}
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 shadow-lg shadow-emerald-900/50"
        >
          <span className="text-xl">+</span>
          Nova venda
        </button>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Data inicial
            </label>
            <input
              type="date"
              value={filters.dataInicial}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  dataInicial: event.target.value,
                }))
              }
              className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-2 text-slate-100"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Data final
            </label>
            <input
              type="date"
              value={filters.dataFinal}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  dataFinal: event.target.value,
                }))
              }
              className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-2 text-slate-100"
            />
          </div>
        </div>
        {listError && (
          <div className="mt-4 rounded-xl border border-rose-700 bg-rose-900/40 px-4 py-2 text-sm text-rose-100">
            {listError}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-400">
                <tr className="border-b border-slate-800/80">
                  <th className="px-4 py-3 font-semibold">Data</th>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Pagamento</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {vendas.map((venda) => (
                  <tr
                    key={venda.id}
                    className="border-b border-slate-800/60 hover:bg-slate-900/80"
                  >
                    <td className="px-4 py-3 text-slate-300">
                      {formatDateTime(venda.data)}
                    </td>
                    <td className="px-4 py-3 text-white">
                      {venda.cliente_nome || "Cliente não informado"}
                    </td>
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3 text-slate-100">
                      {formatCurrency(venda.total)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        className="text-xs rounded-lg border border-slate-700 px-3 py-1 text-slate-200 hover:bg-slate-800"
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
            <p className="px-4 py-6 text-center text-sm text-slate-400">
              {loadingList
                ? "Carregando vendas..."
                : "Nenhuma venda para o período."}
            </p>
          )}
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Faturamento
                </p>
                <h2 className="text-3xl font-semibold text-white">
                  {formatCurrency(totalVenda)}
                </h2>
                <p className="text-xs text-slate-500">
                  Total da venda em edição
                </p>
              </div>
            </div>
          </div>

          {loadingDetalhe && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-300">
              Carregando detalhes...
            </div>
          )}

          {selectedVenda && !loadingDetalhe && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Venda selecionada
                  </p>
                  <h3 className="text-lg font-semibold text-white">
                    {selectedVenda.venda.cliente_nome ||
                      "Cliente não informado"}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-gold" onClick={handlePrintCupom}>
                    PDF/A4
                  </button>
                  <button className="btn-gold" onClick={handlePrintTermico}>
                    Imprimir térmica
                  </button>
                  <button
                    className="btn-gold"
                    onClick={handleImprimirCupomHtml}
                  >
                    Imprimir cupom
                  </button>
                  <button
                    className="btn-gold btn-ghost"
                    onClick={handleEnviarVendaWhatsapp}
                  >
                    Enviar comprovante no WhatsApp
                  </button>
                  <button
                    className="text-slate-500"
                    onClick={() => setSelectedVenda(null)}
                  >
                    Fechar
                  </button>
                </div>
              </div>
              <div id="cupom-print-area" className="space-y-4">
                <dl className="space-y-2 text-sm text-slate-200">
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Data</dt>
                    <dd>{formatDateTime(selectedVenda.venda.data)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Pagamento</dt>
                    <dd>
                      {paymentOptions.find(
                        (option) =>
                          option.value === selectedVenda.venda.forma_pagamento
                      )?.label || "-"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Total</dt>
                    <dd className="font-semibold text-white">
                      {formatCurrency(selectedVenda.venda.total)}
                    </dd>
                  </div>
                </dl>
                <div className="border-t border-slate-800 pt-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                    Itens
                  </p>
                  <ul className="space-y-2 text-sm text-slate-100">
                    {selectedVenda.itens.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between text-slate-300"
                      >
                        <div>
                          <p className="text-white">{item.descricao}</p>
                          <p className="text-xs text-slate-500">
                            {item.quantidade} un ×{" "}
                            {formatCurrency(item.preco_unitario)}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-white">
                          {formatCurrency(item.subtotal)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {!selectedVenda && !loadingDetalhe && (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-5 text-center text-sm text-slate-400">
              Selecione uma venda para ver os detalhes completos.
            </div>
          )}
        </aside>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-slate-950/70"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative ml-auto h-full w-full max-w-2xl overflow-y-auto border-l border-slate-800 bg-slate-950 px-6 py-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                  Nova venda
                </p>
                <h2 className="text-2xl font-semibold text-white">
                  {formStep === 1 ? "Dados do cliente" : "Itens da venda"}
                </h2>
              </div>
              <button
                className="text-slate-400 hover:text-white"
                onClick={() => setDrawerOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="mt-6 flex items-center gap-3 text-xs font-semibold text-slate-400">
              <span
                className={`px-3 py-1 rounded-full border ${
                  formStep >= 1
                    ? "border-emerald-500 text-emerald-300"
                    : "border-slate-700"
                }`}
              >
                1. Cabeçalho
              </span>
              <span className="h-px flex-1 bg-slate-700" />
              <span
                className={`px-3 py-1 rounded-full border ${
                  formStep === 2
                    ? "border-emerald-500 text-emerald-300"
                    : "border-slate-700"
                }`}
              >
                2. Itens
              </span>
            </div>

            {formStep === 1 && (
              <div className="mt-6 space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs uppercase tracking-wide text-slate-400">
                    Data
                  </label>
                  <input
                    type="datetime-local"
                    className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-slate-100"
                    value={cabecalho.data}
                    onChange={(event) =>
                      setCabecalho((prev) => ({
                        ...prev,
                        data: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs uppercase tracking-wide text-slate-400">
                    Cliente
                  </label>
                  <input
                    type="text"
                    className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-slate-100"
                    value={cabecalho.cliente_nome}
                    onChange={(event) =>
                      setCabecalho((prev) => ({
                        ...prev,
                        cliente_nome: event.target.value,
                      }))
                    }
                    placeholder="Opcional"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs uppercase tracking-wide text-slate-400">
                    Forma de pagamento
                  </label>
                  <select
                    className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-slate-100"
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
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs uppercase tracking-wide text-slate-400">
                    Observações
                  </label>
                  <textarea
                    rows={3}
                    className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-slate-100"
                    value={cabecalho.observacoes}
                    onChange={(event) =>
                      setCabecalho((prev) => ({
                        ...prev,
                        observacoes: event.target.value,
                      }))
                    }
                    placeholder="Anote informações extras sobre a venda"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    className="rounded-xl border border-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-300"
                    onClick={() => setFormStep(2)}
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {formStep === 2 && (
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-xs uppercase tracking-wide text-slate-400">
                      Descrição do item
                    </label>
                    <input
                      type="text"
                      className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-slate-100"
                      value={itemDraft.descricao}
                      onChange={(event) =>
                        setItemDraft((prev) => ({
                          ...prev,
                          descricao: event.target.value,
                        }))
                      }
                      placeholder="Ex: Película iPhone 13"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs uppercase tracking-wide text-slate-400">
                      Quantidade
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-slate-100"
                      value={itemDraft.quantidade}
                      onChange={(event) =>
                        setItemDraft((prev) => ({
                          ...prev,
                          quantidade: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs uppercase tracking-wide text-slate-400">
                      Preço unitário
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-slate-100"
                      value={itemDraft.preco_unitario}
                      onChange={(event) =>
                        setItemDraft((prev) => ({
                          ...prev,
                          preco_unitario: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <button
                    className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-800"
                    onClick={handleAddItem}
                  >
                    Adicionar item
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-800">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left text-slate-400">
                        <tr className="border-b border-slate-800/80">
                          <th className="px-4 py-3 font-semibold">Descrição</th>
                          <th className="px-4 py-3 font-semibold">Qtd</th>
                          <th className="px-4 py-3 font-semibold">Preço</th>
                          <th className="px-4 py-3 font-semibold">Subtotal</th>
                          <th className="px-4 py-3" />
                        </tr>
                      </thead>
                      <tbody>
                        {itens.map((item) => (
                          <tr
                            key={item.id}
                            className="border-b border-slate-800/60"
                          >
                            <td className="px-4 py-3 text-white">
                              {item.descricao}
                            </td>
                            <td className="px-4 py-3 text-slate-300">
                              {item.quantidade}
                            </td>
                            <td className="px-4 py-3 text-slate-300">
                              {formatCurrency(item.preco_unitario)}
                            </td>
                            <td className="px-4 py-3 text-slate-100">
                              {formatCurrency(item.subtotal)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                className="text-xs rounded-lg border border-rose-700 px-3 py-1 text-rose-200 hover:bg-rose-900/30"
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
                    <p className="px-4 py-6 text-center text-sm text-slate-500">
                      Nenhum item adicionado.
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Itens</span>
                    <span>{itens.length}</span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <p className="text-xs uppercase tracking-widest text-slate-500">
                      Total estimado
                    </p>
                    <p className="text-3xl font-semibold text-white">
                      {formatCurrency(totalVenda)}
                    </p>
                  </div>
                </div>

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
                  <button
                    className="rounded-xl border border-slate-700 px-5 py-2 text-sm font-semibold text-slate-200"
                    onClick={() => setFormStep(1)}
                  >
                    Voltar
                  </button>
                  <button
                    className="rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950"
                    onClick={handleSaveVenda}
                    disabled={saving}
                  >
                    {saving ? "Salvando..." : "Salvar venda"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
