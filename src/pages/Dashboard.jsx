const stats = [
  {
    label: "OS Abertas",
    value: "18",
    trend: "+3 hoje",
    accent: "from-cyan-500/60 to-cyan-500/10",
  },
  {
    label: "Vendas do dia",
    value: "R$ 4.720",
    trend: "+12% vs ontem",
    accent: "from-emerald-500/60 to-emerald-500/10",
  },
  {
    label: "Produtos em estoque",
    value: "312 itens",
    trend: "27 críticos",
    accent: "from-indigo-500/60 to-indigo-500/10",
  },
];

const timeline = [
  {
    title: "OS #982 concluída",
    subtitle: "iPhone 13 Pro - Troca de tela",
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

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.4em] text-slate-500">
          Visão geral
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-white mt-1">
          Painel Operacional
        </h1>
        <p className="text-slate-400 max-w-2xl">
          Acompanhe o pulso da assistência técnica: ordens de serviço, vendas e
          estoque reunidos em um único cockpit.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl border border-slate-800 bg-gradient-to-br ${card.accent} p-6 shadow-2xl shadow-black/30`}
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
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <header className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-400">Fluxo do dia</p>
              <h2 className="text-xl font-semibold">Linha do tempo</h2>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300">
              Atualizado há 5 min
            </span>
          </header>
          <div className="space-y-4">
            {timeline.map((item, idx) => (
              <div key={item.title} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  {idx !== timeline.length - 1 && (
                    <div className="flex-1 w-px bg-slate-700 mt-1" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-400">{item.time}</p>
                  <p className="text-base font-semibold text-white">
                    {item.title}
                  </p>
                  <p className="text-sm text-slate-300">{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <header className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-400">Foco operacional</p>
              <h2 className="text-xl font-semibold">Prioridades do dia</h2>
            </div>
            <button className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-600/20 text-indigo-200 border border-indigo-500/30">
              Ver Kanban
            </button>
          </header>
          <div className="space-y-3">
            {priorities.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 flex items-start justify-between"
              >
                <div>
                  <p className="text-sm text-slate-400">{item.detail}</p>
                  <p className="text-lg font-semibold text-white">
                    {item.title}
                  </p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full border border-slate-700 text-slate-200">
                  {item.severity}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
