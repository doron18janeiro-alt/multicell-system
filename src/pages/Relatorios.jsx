import { useCallback, useEffect, useMemo, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { getResumoOs } from "@/services/os";
import { obterResumoVendas } from "@/services/relatorios";
import { exportCSV } from "@/utils/exportCSV";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

const paymentLabels = {
  dinheiro: "Dinheiro",
  cartao: "Cartão",
  pix: "Pix",
  outro: "Outros",
};

const paymentColors = {
  dinheiro: "bg-emerald-500",
  cartao: "bg-indigo-500",
  pix: "bg-cyan-500",
  outro: "bg-slate-500",
};

const statusLabels = {
  aberta: "Abertas",
  em_andamento: "Em andamento",
  concluida: "Concluídas",
};

const statusColors = {
  aberta: "bg-amber-500",
  em_andamento: "bg-sky-500",
  concluida: "bg-emerald-500",
};

const emptyResumoVendas = () => ({
  total: 0,
  quantidade: 0,
  porPagamento: {
    dinheiro: 0,
    cartao: 0,
    pix: 0,
    outro: 0,
  },
});

const emptyResumoOs = () => ({
  total: 0,
  status: {
    aberta: 0,
    em_andamento: 0,
    concluida: 0,
  },
});

const toInputDate = (date) => date.toISOString().split("T")[0];

const getInitialRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);
  return {
    dataInicial: toInputDate(start),
    dataFinal: toInputDate(end),
  };
};

const describeDay = (iso) => {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export default function Relatorios() {
  const { proprietarioId } = useAuth();
  const initialRange = useMemo(() => getInitialRange(), []);
  const [range, setRange] = useState(initialRange);
  const [formRange, setFormRange] = useState(initialRange);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resumo, setResumo] = useState({
    vendas: emptyResumoVendas(),
    os: emptyResumoOs(),
  });

  const ticketMedio = useMemo(() => {
    if (!resumo.vendas.quantidade) return 0;
    return resumo.vendas.total / resumo.vendas.quantidade;
  }, [resumo.vendas]);

  const resumoCards = useMemo(
    () => [
      {
        label: "Faturamento no período",
        value: currency.format(resumo.vendas.total || 0),
        trend: `${resumo.vendas.quantidade} vendas registradas`,
        accent: "from-emerald-500/60 to-emerald-500/10",
      },
      {
        label: "Ticket médio",
        value: currency.format(ticketMedio || 0),
        trend: resumo.vendas.quantidade
          ? "Baseado nas vendas filtradas"
          : "Ainda sem vendas no período",
        accent: "from-cyan-500/60 to-cyan-500/10",
      },
      {
        label: "Ordens de serviço",
        value: `${resumo.os.total} OS`,
        trend: `${resumo.os.status.aberta} abertas • ${resumo.os.status.em_andamento} em andamento • ${resumo.os.status.concluida} concluídas`,
        accent: "from-indigo-500/60 to-indigo-500/10",
      },
    ],
    [resumo, ticketMedio]
  );

  const loadResumo = useCallback(
    async (dataInicial, dataFinal) => {
      if (!proprietarioId) {
        setError("Sessão expirada. Faça login novamente.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const [vendasResp, osResp] = await Promise.all([
          obterResumoVendas(proprietarioId, { dataInicial, dataFinal }),
          getResumoOs(proprietarioId, { dataInicial, dataFinal }),
        ]);

        setResumo({
          vendas: vendasResp.data || emptyResumoVendas(),
          os: osResp.data || emptyResumoOs(),
        });

        if (vendasResp.error || osResp.error) {
          throw vendasResp.error || osResp.error;
        }
      } catch (err) {
        console.error("[Relatorios] Erro ao carregar resumos", err);
        setError(err?.message || "Não foi possível carregar os dados.");
      } finally {
        setLoading(false);
      }
    },
    [proprietarioId]
  );

  useEffect(() => {
    if (proprietarioId) {
      loadResumo(range.dataInicial, range.dataFinal);
    } else {
      setLoading(false);
    }
  }, [range, loadResumo, proprietarioId]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormRange((prev) => ({ ...prev, [name]: value }));
  };

  const applyRange = (event) => {
    event?.preventDefault();
    if (
      formRange.dataInicial &&
      formRange.dataFinal &&
      formRange.dataInicial > formRange.dataFinal
    ) {
      setError("A data inicial precisa ser anterior à data final.");
      return;
    }
    setRange(formRange);
  };

  const applyPreset = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    const preset = {
      dataInicial: toInputDate(start),
      dataFinal: toInputDate(end),
    };
    setFormRange(preset);
    setRange(preset);
  };

  const applyCurrentMonth = () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const preset = {
      dataInicial: toInputDate(start),
      dataFinal: toInputDate(today),
    };
    setFormRange(preset);
    setRange(preset);
  };

  const percent = (value, total) => {
    if (!total) return "0%";
    return `${Math.round((value / total) * 100)}%`;
  };

  const exportResumo = () => {
    const rows = [
      { indicador: "Período inicial", valor: range.dataInicial || "" },
      { indicador: "Período final", valor: range.dataFinal || "" },
      { indicador: "Faturamento", valor: resumo.vendas.total.toFixed(2) },
      { indicador: "Quantidade de vendas", valor: resumo.vendas.quantidade },
      { indicador: "Ticket médio", valor: ticketMedio.toFixed(2) },
    ];

    Object.entries(paymentLabels).forEach(([key, label]) => {
      rows.push({
        indicador: `Pagamentos - ${label}`,
        valor: resumo.vendas.porPagamento[key].toFixed(2),
      });
    });

    rows.push({ indicador: "Total de OS", valor: resumo.os.total });
    Object.entries(statusLabels).forEach(([key, label]) => {
      rows.push({ indicador: `OS - ${label}`, valor: resumo.os.status[key] });
    });

    exportCSV(
      `relatorio_${range.dataInicial || "inicio"}_${range.dataFinal || "fim"}`,
      rows
    );
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.4em] text-slate-500">
          Inteligência operacional
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-white">
          Relatórios e indicadores
        </h1>
        <p className="text-slate-400 max-w-2xl">
          Analise faturamento, comportamento de pagamentos e o fluxo de ordens
          de serviço em qualquer intervalo de datas.
        </p>
        <p className="text-xs text-slate-500">
          Período selecionado: {describeDay(range.dataInicial)} →{" "}
          {describeDay(range.dataFinal)}
        </p>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <form
          className="grid gap-4 md:grid-cols-[repeat(4,minmax(0,1fr))]"
          onSubmit={applyRange}
        >
          <label className="flex flex-col gap-2">
            <span className="text-sm text-slate-400">Data inicial</span>
            <input
              type="date"
              name="dataInicial"
              value={formRange.dataInicial}
              onChange={handleFormChange}
              className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm text-slate-400">Data final</span>
            <input
              type="date"
              name="dataFinal"
              value={formRange.dataFinal}
              onChange={handleFormChange}
              className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
            />
          </label>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-slate-400">Atalhos</span>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                className="flex-1 rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-xs uppercase tracking-wide text-slate-300 hover:border-emerald-400"
                onClick={() => applyPreset(6)}
              >
                Últimos 7 dias
              </button>
              <button
                type="button"
                className="flex-1 rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-xs uppercase tracking-wide text-slate-300 hover:border-emerald-400"
                onClick={() => applyPreset(29)}
              >
                Últimos 30 dias
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-slate-400">Outras ações</span>
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-xs uppercase tracking-wide text-slate-300 hover:border-emerald-400"
                onClick={applyCurrentMonth}
              >
                Este mês
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl border border-emerald-500 bg-emerald-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-50"
              >
                Aplicar
              </button>
            </div>
          </div>
        </form>

        <div className="flex flex-wrap gap-3 text-xs text-slate-400">
          <span className="px-3 py-1 rounded-full border border-slate-800 bg-slate-950/40">
            {loading ? "Atualizando dados…" : "Dados atualizados"}
          </span>
          <button
            type="button"
            onClick={exportResumo}
            className="px-3 py-1 rounded-full border border-slate-700 text-slate-200 hover:border-emerald-400"
          >
            Exportar CSV
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-100">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {resumoCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl border border-slate-800 bg-gradient-to-br ${
              card.accent
            } p-6 shadow-lg shadow-black/30 ${loading ? "animate-pulse" : ""}`}
          >
            <p className="text-sm uppercase tracking-wider text-slate-300">
              {card.label}
            </p>
            <p className="text-3xl font-black text-white mt-3">{card.value}</p>
            <p className="text-sm text-slate-200 mt-2">{card.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6">
          <header className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-400">Composição das vendas</p>
              <h2 className="text-xl font-semibold text-white">
                Pagamentos no período
              </h2>
            </div>
            <span className="text-xs px-3 py-1 rounded-full border border-slate-800 text-slate-300">
              {resumo.vendas.quantidade} vendas
            </span>
          </header>
          <div className="space-y-4">
            {Object.entries(paymentLabels).map(([key, label]) => {
              const valor = resumo.vendas.porPagamento[key] || 0;
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>{label}</span>
                    <span>{currency.format(valor)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full ${paymentColors[key]} transition-all duration-500`}
                      style={{ width: percent(valor, resumo.vendas.total) }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    {percent(valor, resumo.vendas.total)} do faturamento
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6">
          <header className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-400">Fluxo de ordens</p>
              <h2 className="text-xl font-semibold text-white">
                Status das OS
              </h2>
            </div>
            <span className="text-xs px-3 py-1 rounded-full border border-slate-800 text-slate-300">
              {resumo.os.total} registros
            </span>
          </header>
          <div className="space-y-4">
            {Object.entries(statusLabels).map(([key, label]) => {
              const valor = resumo.os.status[key] || 0;
              return (
                <div key={key} className="flex items-center gap-3">
                  <div
                    className={`w-2 h-10 rounded-full ${statusColors[key]}`}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between text-sm text-slate-300">
                      <span>{label}</span>
                      <span>
                        {valor} • {percent(valor, resumo.os.total)}
                      </span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full ${statusColors[key]} transition-all duration-500`}
                        style={{ width: percent(valor, resumo.os.total) }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
