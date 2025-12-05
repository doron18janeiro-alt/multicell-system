import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  obterFaturamentoDiario,
  obterResumoMensal,
  obterTopProdutos,
  obterVendasRecentes,
} from "../services/relatoriosService";

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
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (!proprietarioId) {
      return;
    }

    let ativo = true;
    setCarregando(true);
    setErro("");

    Promise.all([
      obterResumoMensal(proprietarioId),
      obterFaturamentoDiario(proprietarioId),
      obterTopProdutos(proprietarioId),
      obterVendasRecentes(proprietarioId),
    ])
      .then(([resumo, faturamentoDados, produtos, vendas]) => {
        if (!ativo) return;
        setResumoMensal(resumo);
        setFaturamento(faturamentoDados);
        setTopProdutos(produtos);
        setVendasRecentes(vendas?.itens || []);
      })
      .catch((error) => {
        console.error("[Dashboard] Falha ao carregar métricas", error);
        if (ativo) {
          setErro(
            error?.message ||
              "Não foi possível carregar o painel. Tente novamente."
          );
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [proprietarioId]);

  const vendasTotais = resumoMensal?.quantidade || 0;
  const ticketMedio = resumoMensal?.ticketMedio || 0;
  const totalLiquido = resumoMensal?.totalLiquido || 0;

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

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-[0.4em] text-slate-500">
          Visão geral
        </p>
        <h1 className="text-3xl font-bold text-slate-900">
          Desempenho da sua loja
        </h1>
        <p className="text-slate-500">
          Métricas consolidadas diretamente do Supabase para facilitar suas
          decisões.
        </p>
      </header>

      {erro && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <Card
          titulo="Faturamento líquido"
          valor={currency.format(totalLiquido)}
          destaque="text-emerald-600"
          carregando={carregando}
        />
        <Card
          titulo="Ticket médio"
          valor={currency.format(ticketMedio)}
          destaque="text-indigo-600"
          carregando={carregando}
        />
        <Card
          titulo="Vendas no mês"
          valor={vendasTotais}
          destaque="text-slate-900"
          carregando={carregando}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Últimos dias
              </p>
              <h2 className="text-lg font-semibold text-slate-900">
                Faturamento diário
              </h2>
            </div>
            {carregando && (
              <span className="text-xs text-slate-400">Atualizando...</span>
            )}
          </div>
          {faturamento.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">
              Ainda não há vendas registradas no período avaliado.
            </p>
          ) : (
            <div className="mt-6 flex items-end gap-3">
              {faturamento.map((dia) => (
                <div key={dia.dia} className="flex-1 text-center">
                  <div
                    className="mx-auto w-full rounded-t-xl bg-gradient-to-b from-indigo-500 to-indigo-300"
                    style={{
                      height: `${(dia.total / faturamentoMax) * 180}px`,
                    }}
                  />
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    {dia.dia?.slice(5) || "--"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {currency.format(dia.total)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Conversão
              </p>
              <h2 className="text-lg font-semibold text-slate-900">
                Produtos em destaque
              </h2>
            </div>
          </div>
          {topProdutos.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">
              Sem dados suficientes para o ranking de produtos.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {topProdutos.slice(0, 5).map((produto, index) => (
                <li
                  key={`${produto.produto}-${index}`}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {produto.produto}
                    </p>
                    <p className="text-xs text-slate-500">#{index + 1}</p>
                  </div>
                  <span className="text-sm font-semibold text-indigo-600">
                    {produto.quantidade} vendas
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Últimas movimentações
            </p>
            <h2 className="text-lg font-semibold text-slate-900">
              Vendas recentes
            </h2>
          </div>
        </div>
        {vendasRecentes.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">
            Nenhuma venda registrada nos últimos dias.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                <tr>
                  <th className="pb-2">Cliente</th>
                  <th className="pb-2">Data</th>
                  <th className="pb-2">Pagamento</th>
                  <th className="pb-2">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendasRecentes.slice(0, 6).map((venda) => (
                  <tr key={venda.id} className="text-slate-700">
                    <td className="py-3 font-semibold">
                      {venda.cliente?.nome || "Cliente não informado"}
                    </td>
                    <td className="py-3 text-sm text-slate-500">
                      {venda.data_venda
                        ? new Date(venda.data_venda).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "--"}
                    </td>
                    <td className="py-3 text-sm text-slate-500 capitalize">
                      {venda.forma_pagamento || "--"}
                    </td>
                    <td className="py-3 font-semibold text-right">
                      {currency.format(venda.total_liquido || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Card({ titulo, valor, destaque, carregando }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
        {titulo}
      </p>
      <p className={`mt-3 text-3xl font-bold ${destaque}`}>
        {carregando ? "--" : valor}
      </p>
    </div>
  );
}
