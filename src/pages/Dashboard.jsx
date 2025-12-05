/* LEGACY DASHBOARD (mantido para referência)
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../supabaseClient";
import InfoCard from "../components/dashboard/InfoCard";

const stats = [
  {
    label: "OS em execução",
    value: "18",
    trend: "+3 hoje",
    context: "Fluxo operacional vivo",
    accent: "from-cyan-400/40 via-sky-500/20 to-cyan-900/20",
  },
  {
    label: "Vendas do dia",
    value: "R$ 4.720",
    trend: "+12% vs ontem",
    context: "Loja Centro + Online",
    accent: "from-emerald-400/40 via-teal-500/20 to-emerald-900/20",
  },
  {
    label: "Produtos em estoque",
    value: "312 itens",
    trend: "27 críticos",
    context: "Reposição planejada",
    accent: "from-indigo-400/40 via-violet-500/20 to-indigo-900/20",
  },
];

const timeline = [
  {
    title: "OS #982 concluída",
    subtitle: "iPhone 13 Pro · troca de tela",
    time: "há 12 min",
  },
  {
    title: "Venda registrada",
    subtitle: "Caixa Loja Centro",
    time: "há 35 min",
  },
  {
    title: "Entrada em estoque",
    subtitle: "30x Displays Samsung A32",
    time: "há 2h",
  },
];

const priorities = [
  {
    title: "Revisar OS atrasadas",
    detail: "5 ordens acima de 3 dias",
    severity: "Alta",
  },
  {
    title: "Conferir lote de telas",
    detail: "NF 548-13 aguardando inspeção",
    severity: "Média",
  },
  {
    title: "Atualizar preços",
    detail: "Linha Samsung série A",
    severity: "Baixa",
  },
];

const quickSignals = [
  {
    label: "Tempo médio de reparo",
    value: "2h 17m",
    delta: "-18 min vs ontem",
  },
  {
    label: "Nível de satisfação",
    value: "9.4/10",
    delta: "+0.3 no dia",
  },
  {
    label: "Protocolos emitidos",
    value: "42",
    delta: "+8 em 1h",
  },
];

const squadBurndown = [
  {
    squad: "Equipe Técnico Alpha",
    load: 72,
    target: "OS prioridade alta",
  },
  {
    squad: "Equipe Campo",
    load: 58,
    target: "Visitas in-loco",
  },
  {
    squad: "Backoffice",
    load: 44,
    target: "Orçamentos pendentes",
  },
];

const fetchPerformance = async () => {
  return supabase.from("performance").select("*");
};

const fetchVendas = async () => {
  return supabase.from("vendas").select("*");
};

const fetchEstoque = async () => {
  return supabase.from("estoque").select("*");
};

const normalizeResponse = (response, label) => {
  if (!response) return [];
  if (response.error) {
    console.error(`[Dashboard] Erro ao carregar ${label}:`, response.error);
    return [];
  }
  return response.data || [];
};

const dashboardStyles = `
  @keyframes haloPulse {
    0%, 100% { opacity: 0.4; transform: scale(0.95); }
    50% { opacity: 0.9; transform: scale(1.05); }
  }

  @keyframes sweep {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  .dashboard-shell {
    position: relative;
  }

  .dashboard-shell::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 15% 20%, rgba(59, 130, 246, 0.4), transparent 60%),
                radial-gradient(circle at 80% 0%, rgba(236, 72, 153, 0.25), transparent 55%),
                linear-gradient(120deg, rgba(2, 6, 23, 0.6), rgba(15, 23, 42, 0.2));
    opacity: 0.9;
    z-index: 0;
    border-radius: 36px;
  }

  .dashboard-shell::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 36px;
    border: 1px solid rgba(255, 255, 255, 0.04);
  }

  .dashboard-hero {
    position: relative;
    z-index: 1;
    border-radius: 32px;
    padding: 2.75rem;
    backdrop-filter: blur(20px);
    background: rgba(2, 6, 23, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.05);
    overflow: hidden;
  }

  .dashboard-hero::before {
    content: "";
    position: absolute;
    inset: -30% 20% auto;
    height: 280px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.5), transparent 65%);
    filter: blur(40px);
    animation: haloPulse 6s ease-in-out infinite;
  }

  .hero-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.9rem;
    font-size: 0.7rem;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    border-radius: 999px;
    border: 1px solid rgba(59, 130, 246, 0.4);
    background: rgba(59, 130, 246, 0.1);
  }

  .hero-card {
    position: relative;
    border-radius: 28px;
    padding: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.05);
    background: rgba(13, 25, 54, 0.6);
    box-shadow: inset 0 0 45px rgba(15, 23, 42, 0.4);
  }

  .hero-card::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 28px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    mix-blend-mode: screen;
  }

  .timeline-glow {
    position: absolute;
    inset: 0;
    border-radius: 24px;
    background: linear-gradient(120deg, rgba(59, 130, 246, 0.15), transparent);
    pointer-events: none;
  }

  .timeline-line {
    position: relative;
    padding-left: 2.5rem;
  }

  .timeline-line::before {
    content: "";
    position: absolute;
    left: 1.25rem;
    top: 0.5rem;
    bottom: 0.5rem;
    width: 1px;
    background: linear-gradient(180deg, transparent, rgba(59, 130, 246, 0.5), transparent);
  }

  .timeline-dot {
    position: absolute;
    left: 0.8rem;
    top: 0.75rem;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: rgba(14, 165, 233, 0.9);
    box-shadow: 0 0 12px rgba(14, 165, 233, 0.8);
  }

  .priority-card {
    position: relative;
    border-radius: 24px;
    padding: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.05);
    background: rgba(2, 6, 23, 0.65);
    overflow: hidden;
  }

  .priority-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(120deg, rgba(59, 130, 246, 0.2), transparent);
    opacity: 0.4;
  }

  .priority-card::after {
    content: "";
    position: absolute;
    inset: 0.2rem;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.04);
  }

  .burndown-bar {
    position: relative;
    height: 6px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.05);
    overflow: hidden;
  }

  .burndown-bar::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(59, 130, 246, 0.6), rgba(14, 165, 233, 0.8));
    width: var(--load, 50%);
  }
`;

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function CinematicFallback({ message = "Carregando cockpit..." }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050114] text-slate-100">
      <div className="relative px-10 py-8 rounded-3xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-2xl shadow-[0_30px_80px_rgba(3,7,18,0.9)]">
        <div
          className="absolute inset-3 rounded-2xl border border-slate-700/40 animate-pulse"
          aria-hidden
        />
        <div className="relative text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.5em] text-slate-400">
            Sincronizando módulos
          </p>
          <p className="text-lg font-semibold text-white">{message}</p>
        </div>
      </div>
    </div>
  );
}
*/

import { useEffect, useMemo, useState } from "react";
import supabase from "../services/supabase";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const defaultSerie = [
  { label: "Seg", total: 0 },
  { label: "Ter", total: 0 },
  { label: "Qua", total: 0 },
  { label: "Qui", total: 0 },
  { label: "Sex", total: 0 },
  { label: "Sáb", total: 0 },
  { label: "Dom", total: 0 },
];

export default function Dashboard() {
  const [faturamento, setFaturamento] = useState(0);
  const [faturamentoSerie, setFaturamentoSerie] = useState(defaultSerie);
  const [topProdutos, setTopProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setLoading(true);
    setErro("");

    const [fatResp, topResp] = await Promise.all([
      supabase.rpc("faturamento_diario"),
      supabase.rpc("top_produtos"),
    ]);

    if (fatResp.error) {
      console.error(fatResp.error);
      setErro("Não foi possível carregar o faturamento");
    } else {
      setFaturamento(fatResp.data?.total || 0);
      setFaturamentoSerie(fatResp.data?.series || defaultSerie);
    }

    if (topResp.error) {
      console.error(topResp.error);
      setErro((prev) => prev || "Não foi possível carregar os produtos");
    } else {
      setTopProdutos(topResp.data || []);
    }

    setLoading(false);
  }

  const linhaData = useMemo(() => {
    const serie = faturamentoSerie?.length ? faturamentoSerie : defaultSerie;
    return {
      labels: serie.map((p) => p.label),
      datasets: [
        {
          label: "Faturamento diário",
          data: serie.map((p) => Number(p.total) || 0),
          borderColor: "#2563eb",
          backgroundColor: "rgba(37,99,235,0.2)",
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [faturamentoSerie]);

  const barrasData = useMemo(() => {
    const produtos = topProdutos.slice(0, 5);
    return {
      labels: produtos.map((p) => p.produto || p.nome || "Produto"),
      datasets: [
        {
          label: "Quantidade vendida",
          data: produtos.map((p) => Number(p.qtd || p.quantidade) || 0),
          backgroundColor: "#10b981",
        },
      ],
    };
  }, [topProdutos]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y ?? ctx.parsed}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `R$ ${value}`,
        },
      },
    },
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Multicell</h1>
          <p className="text-gray-500">Resumo em tempo real de vendas e produtos</p>
        </div>
        <button
          className="text-sm text-blue-600 hover:underline"
          onClick={carregar}
          disabled={loading}
        >
          {loading ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      {erro && <div className="bg-red-50 text-red-700 p-3 rounded">{erro}</div>}

      <div className="grid gap-4 md:grid-cols-3">
        <ResumoCard titulo="Faturamento Diário" valor={`R$ ${faturamento.toFixed(2)}`} />
        <ResumoCard titulo="Produtos Monitorados" valor={topProdutos.length} />
        <ResumoCard titulo="Ticket Médio" valor={`R$ ${(faturamento / Math.max(topProdutos.length, 1)).toFixed(2)}`} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Faturamento (7 dias)</h2>
          </div>
          <Line data={linhaData} options={chartOptions} height={200} />
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Top Produtos</h2>
          </div>
          <Bar
            data={barrasData}
            options={{
              ...chartOptions,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { callback: (value) => `${value} un.` },
                },
              },
            }}
            height={200}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Produtos mais vendidos</h2>
        {topProdutos.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhum dado disponível.</p>
        ) : (
          <ul className="divide-y">
            {topProdutos.map((p) => (
              <li
                key={p.produto || p.nome}
                className="py-3 flex items-center justify-between text-sm"
              >
                <span>{p.produto || p.nome}</span>
                <span className="font-semibold">{p.qtd || p.quantidade} un.</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ResumoCard({ titulo, valor }) {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <p className="text-sm text-gray-500">{titulo}</p>
      <p className="text-2xl font-bold text-gray-800 mt-2">{valor}</p>
    </div>
  );
}

const mapPerformanceSignals = (data = []) =>
  data.map((item, index) => ({
    label: item.label || item.metric || `Indicador ${index + 1}`,
    value: item.value || item.resultado || item.valor || "--",
    delta: item.delta || item.variacao || item.trend || "",
  }));

export default function Dashboard() {
  const [performance, setPerformance] = useState(null);
  const [vendas, setVendas] = useState(null);
  const [estoque, setEstoque] = useState(null);
  const [erroDados, setErroDados] = useState("");

  useEffect(() => {
    let ativo = true;

    const carregarDados = async () => {
      try {
        const [perf, vend, est] = await Promise.all([
          fetchPerformance(),
          fetchVendas(),
          fetchEstoque(),
        ]);

        if (!ativo) return;

        setPerformance(normalizeResponse(perf, "performance"));
        setVendas(normalizeResponse(vend, "vendas"));
        setEstoque(normalizeResponse(est, "estoque"));
      } catch (error) {
        if (!ativo) return;
        console.error("[Dashboard] Falha crítica ao sincronizar dados", error);
        setErroDados("Não foi possível sincronizar todas as fontes agora.");
        setPerformance([]);
        setVendas([]);
        setEstoque([]);
      }
    };

    carregarDados();

    return () => {
      ativo = false;
    };
  }, []);

  if (!performance || !vendas || !estoque) {
    return <CinematicFallback message="Sincronizando dados táticos..." />;
  }

  const performanceSignals = (
    performance.length ? mapPerformanceSignals(performance) : quickSignals
  ).slice(0, 3);

  const datasetOverview = [
    {
      title: "Insights de performance",
      value: `${performance.length} métricas`,
      subtitle: "Coleção performance",
    },
    {
      title: "Eventos de venda",
      value: vendas.length ? `${vendas.length} registros` : "Nenhuma venda",
      subtitle: "Tabela vendas",
    },
    {
      title: "Itens de estoque",
      value: estoque.length ? `${estoque.length} itens` : "Sem estoque ativo",
      subtitle: "Tabela estoque",
    },
  ];

  return (
    <div className="dashboard-shell space-y-10 relative z-10">
      <style>{dashboardStyles}</style>

      <section className="dashboard-hero grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          <span className="hero-chip">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            COMANDO ATIVO
          </span>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white">
              Centro de comando Multicell
            </h1>
            <p className="text-slate-300/90 max-w-2xl mt-3">
              Acompanhe o pulso da assistência técnica e vendas em tempo real —
              fluxo de OS, estoque e resultados conectados em um cockpit
              cinematográfico.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {performanceSignals.map((signal) => (
              <InfoCard
                key={signal.label + signal.value}
                title={signal.label}
                value={signal.value}
                subtitle={signal.delta}
              />
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {datasetOverview.map((card) => (
              <InfoCard
                key={card.title}
                title={card.title}
                value={card.value}
                subtitle={card.subtitle}
              />
            ))}
          </div>
          {erroDados && <p className="text-xs text-rose-200/70">{erroDados}</p>}
        </div>

        <div className="hero-card space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Sincronização do dia</p>
            <span className="text-xs px-3 py-1 rounded-full border border-cyan-400/30 text-cyan-200">
              99.2% uptime
            </span>
          </div>
          <div className="space-y-3 text-slate-200">
            <p className="text-4xl font-black text-white">Operação 24/7</p>
            <p className="text-sm text-slate-400">
              Automação, notificações e squads sincronizados com Supabase.
            </p>
          </div>
          <div
            className="burndown-bar"
            style={{ "--load": "82%" }}
            aria-hidden
          />
          <div className="text-xs text-slate-400">
            Próximo pico previsto em{" "}
            <strong className="text-white">48 min</strong>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((card, index) => (
          <motion.div
            key={card.label}
            className={`rounded-3xl border border-white/5 bg-gradient-to-br ${card.accent} p-6 backdrop-blur-xl shadow-[0_25px_70px_rgba(2,6,23,0.65)]`}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.08 }}
          >
            <p className="text-xs uppercase tracking-[0.4em] text-slate-100/80">
              {card.label}
            </p>
            <p className="text-4xl font-black text-white mt-4">{card.value}</p>
            <p className="text-sm text-emerald-200 mt-2">{card.trend}</p>
            <p className="text-xs text-slate-200/80 mt-4">{card.context}</p>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="relative rounded-3xl border border-white/5 bg-white/5 backdrop-blur-2xl p-6 overflow-hidden">
          <div className="timeline-glow" aria-hidden="true" />
          <div className="flex items-center justify-between mb-6 relative">
            <div>
              <p className="text-sm text-slate-300">Fluxo do dia</p>
              <h2 className="text-2xl font-semibold text-white">
                Linha do tempo
              </h2>
            </div>
            <span className="text-xs px-3 py-1 rounded-full border border-white/10 text-slate-200">
              Atualizado há 5 min
            </span>
          </div>
          <div className="space-y-6 relative timeline-line">
            {timeline.map((item) => (
              <div key={item.title} className="relative pl-6">
                <span className="timeline-dot" aria-hidden />
                <p className="text-xs text-slate-400">{item.time}</p>
                <p className="text-lg font-semibold text-white">{item.title}</p>
                <p className="text-sm text-slate-300">{item.subtitle}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/5 bg-white/5 backdrop-blur-2xl p-6 space-y-5">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300">Foco operacional</p>
              <h2 className="text-2xl font-semibold text-white">Prioridades</h2>
            </div>
            <button className="text-xs font-semibold px-3 py-1 rounded-full border border-cyan-400/40 text-cyan-200">
              Ver Kanban
            </button>
          </header>
          <div className="space-y-4">
            {priorities.map((item) => (
              <div key={item.title} className="priority-card">
                <div className="relative space-y-2">
                  <p className="text-xs text-slate-400">{item.detail}</p>
                  <p className="text-lg font-semibold text-white">
                    {item.title}
                  </p>
                  <span className="inline-flex text-xs px-3 py-1 rounded-full border border-white/15 text-white/80">
                    {item.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/5 bg-white/5 backdrop-blur-2xl p-6 space-y-6">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-300">Squads & energia</p>
            <h2 className="text-2xl font-semibold text-white">
              Carga operacional
            </h2>
          </div>
          <span className="text-xs px-3 py-1 rounded-full border border-emerald-400/30 text-emerald-200">
            Balanceado
          </span>
        </header>
        <div className="space-y-4">
          {squadBurndown.map((squad) => (
            <div key={squad.squad} className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm text-slate-200">
                <p className="font-semibold">{squad.squad}</p>
                <p className="text-slate-400">{squad.target}</p>
              </div>
              <div
                className="burndown-bar"
                style={{ "--load": `${squad.load}%` }}
                aria-label={`${squad.squad} em ${squad.load}% da capacidade`}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
