import { useEffect, useMemo, useState } from "react";
import { BarChart3, Activity, Diamond, ShoppingBag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import PrimeCard from "@/components/ui/PrimeCard";
import PrimeSectionTitle from "@/components/ui/PrimeSectionTitle";
import { getDespesas } from "@/hooks/useDespesas.js";
import {
  obterFaturamentoDiario,
  obterResumoMensal,
  obterTopProdutos,
  obterVendasRecentes,
} from "@/services/relatorios";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function Dashboard() {
  const { proprietarioId, loading } = useAuth();
  const [resumoMensal, setResumoMensal] = useState(null);
  const [faturamento, setFaturamento] = useState([]);
  const [topProdutos, setTopProdutos] = useState([]);
  const [vendasRecentes, setVendasRecentes] = useState([]);
  const [totalDespesas, setTotalDespesas] = useState(0);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (!proprietarioId) {
      return;
    }

    let ativo = true;
    setCarregando(true);
    setErro("");

    const carregar = async () => {
      const [resumo, faturamentoDados, produtos, vendas, despesasLista] =
        await Promise.all([
          obterResumoMensal(proprietarioId),
          obterFaturamentoDiario(proprietarioId),
          obterTopProdutos(proprietarioId),
          obterVendasRecentes(proprietarioId),
          getDespesas(proprietarioId),
        ]);

      if (!ativo) return;

      const erros = [
        resumo?.error,
        faturamentoDados?.error,
        produtos?.error,
        vendas?.error,
        despesasLista?.error,
      ].filter(Boolean);

      if (erros.length) {
        const mensagem =
          erros[0] || "Não foi possível carregar o painel. Tente novamente.";
        console.error("[Dashboard] Falha ao carregar métricas", erros);
        setErro(mensagem);
        window.alert(mensagem);
      }

      setResumoMensal(resumo?.data || null);
      setFaturamento(faturamentoDados?.data || []);
      setTopProdutos(produtos?.data || []);
      setVendasRecentes(vendas?.data?.itens || vendas?.data || []);

      const despesas = despesasLista?.data || [];
      const totalDespesasCalculado = despesas.reduce(
        (acc, item) => acc + Number(item.valor || 0),
        0
      );
      setTotalDespesas(totalDespesasCalculado);
    };

    carregar().finally(() => {
      if (ativo) setCarregando(false);
    });

    return () => {
      ativo = false;
    };
  }, [proprietarioId]);

  const vendasTotais = resumoMensal?.quantidade || 0;
  const ticketMedio = resumoMensal?.ticketMedio || 0;
  const totalValor =
    resumoMensal?.totalValor ?? resumoMensal?.totalLiquido ?? 0;
  const faturamentoLiquido = totalValor - totalDespesas;

  const faturamentoMax = useMemo(() => {
    return Math.max(...faturamento.map((item) => item.total || 0), 1);
  }, [faturamento]);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
        Validando sessão...
      </div>
    );
  }

  if (!proprietarioId) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
        Faça login para visualizar o dashboard.
      </div>
    );
  }

  const metricCards = [
    {
      label: "Faturamento líquido",
      value: currency.format(faturamentoLiquido),
      helper: `Descontadas despesas (${currency.format(totalDespesas)})`,
      icon: Diamond,
      gradient: "from-[#2b1c1f] via-[#1a1018] to-[#050308]",
    },
    {
      label: "Ticket médio",
      value: currency.format(ticketMedio),
      helper: "Ticket consolidado",
      icon: Activity,
      gradient: "from-[#1f1f2b] via-[#141423] to-[#050308]",
    },
    {
      label: "Vendas no mês",
      value: vendasTotais,
      helper: "Operações concluídas",
      icon: ShoppingBag,
      gradient: "from-[#1f1a2b] via-[#101120] to-[#050308]",
    },
  ];

  return (
    <div className="space-y-8">
      <PrimeSectionTitle
        title="Desempenho da loja"
        subtitle="Métricas consolidadas diretamente do Supabase para decisões rápidas."
        icon={BarChart3}
      />

      {erro && (
        <PrimeCard className="border-red-400/40 bg-red-950/30 text-red-100">
          {erro}
        </PrimeCard>
      )}

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {metricCards.map((card) => (
          <PrimeCard
            key={card.label}
            className={`bg-gradient-to-br ${card.gradient} border-transparent text-white`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                  {card.label}
                </p>
                <p className="mt-3 text-4xl font-black">
                  {carregando ? "--" : card.value}
                </p>
                <p className="mt-2 text-sm text-white/60">{card.helper}</p>
              </div>
              <span className="rounded-2xl bg-black/30 p-3 text-[#ffe8a3]">
                <card.icon size={26} />
              </span>
            </div>
          </PrimeCard>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <PrimeCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#cdb88d]">
                Últimos dias
              </p>
              <h2 className="text-2xl font-semibold">Faturamento diário</h2>
            </div>
            {carregando && (
              <span className="text-xs text-white/60">Atualizando…</span>
            )}
          </div>
          {faturamento.length === 0 ? (
            <p className="mt-6 text-sm text-white/70">
              Ainda não há vendas registradas no período.
            </p>
          ) : (
            <div className="mt-8 flex items-end gap-4">
              {faturamento.map((dia) => (
                <div key={dia.dia} className="flex-1 text-center">
                  <div
                    className="mx-auto w-full rounded-t-3xl bg-gradient-to-t from-[#8f5eff]/20 to-[#ffe8a3]/40"
                    style={{
                      height: `${(dia.total / faturamentoMax) * 180}px`,
                    }}
                  />
                  <p className="mt-3 text-xs font-semibold text-white/70">
                    {dia.dia?.slice(5) || "--"}
                  </p>
                  <p className="text-xs text-white/60">
                    {currency.format(dia.total)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </PrimeCard>

        <PrimeCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#cdb88d]">
                Conversão
              </p>
              <h2 className="text-2xl font-semibold">Produtos em destaque</h2>
            </div>
          </div>
          {topProdutos.length === 0 ? (
            <p className="mt-6 text-sm text-white/70">
              Sem dados suficientes para o ranking.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {topProdutos.slice(0, 5).map((produto, index) => (
                <li
                  key={`${produto.produto}-${index}`}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div>
                    <p className="text-base font-semibold text-white">
                      {produto.produto}
                    </p>
                    <p className="text-xs text-white/50">#{index + 1}</p>
                  </div>
                  <span className="text-sm font-semibold text-[#ffe8a3]">
                    {produto.quantidade} vendas
                  </span>
                </li>
              ))}
            </ul>
          )}
        </PrimeCard>
      </section>

      <PrimeCard>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#cdb88d]">
              Últimas movimentações
            </p>
            <h2 className="text-2xl font-semibold">Vendas recentes</h2>
          </div>
        </div>
        {vendasRecentes.length === 0 ? (
          <p className="mt-6 text-sm text-white/70">
            Nenhuma venda registrada nos últimos dias.
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="table-premium text-left text-sm">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Data</th>
                  <th>Pagamento</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {vendasRecentes.slice(0, 6).map((venda) => (
                  <tr key={venda.id}>
                    <td className="py-4 font-semibold text-white">
                      {venda.cliente?.nome ||
                        venda.cliente_nome ||
                        "Cliente não informado"}
                    </td>
                    <td className="text-white/70">
                      {venda.data_venda
                        ? new Date(venda.data_venda).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "--"}
                    </td>
                    <td className="capitalize text-white/70">
                      {venda.forma_pagamento || "--"}
                    </td>
                    <td className="text-right font-semibold text-[#ffe8a3]">
                      {currency.format(
                        Number(
                          venda.valor_total ??
                            venda.total_liquido ??
                            venda.total
                        ) || 0
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PrimeCard>
    </div>
  );
}
