import { useEffect, useState } from "react";
import { Plus, Trash2, Wallet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import PrimeCard from "@/components/ui/PrimeCard";
import PrimeButton from "@/components/ui/PrimeButton";
import PrimeSectionTitle from "@/components/ui/PrimeSectionTitle";
import {
  getDespesas,
  novaDespesa,
  deletarDespesa,
  registrarPagamentoDespesa,
} from "@/hooks/useDespesas";
import NovaDespesa from "@/components/NovaDespesa";
import PagamentosModal from "@/pages/Despesas/PagamentosModal";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatDate(value) {
  if (!value) return "--";
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Despesas() {
  const { proprietarioId, loading: authLoading } = useAuth();
  const [despesas, setDespesas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [excluindoId, setExcluindoId] = useState(null);
  const [pagandoDespesa, setPagandoDespesa] = useState(null);

  useEffect(() => {
    if (!proprietarioId) return;
    carregarDespesas();
  }, [proprietarioId]);

  async function carregarDespesas() {
    setCarregando(true);
    setErro("");
    try {
      const data = await getDespesas();
      setDespesas(data);
    } catch (error) {
      console.error("[Despesas] carregar", error);
      setErro(error?.message || "Não foi possível carregar as despesas.");
    } finally {
      setCarregando(false);
    }
  }

  async function handleSalvar(dados) {
    try {
      await novaDespesa(dados);
      await carregarDespesas();
      setModalAberto(false);
    } catch (error) {
      console.error("[Despesas] salvar", error);
      setErro(error?.message || "Não foi possível salvar a despesa.");
      throw error;
    }
  }

  async function handleExcluir(id) {
    if (!window.confirm("Excluir esta despesa?")) return;
    setExcluindoId(id);
    setErro("");
    try {
      await deletarDespesa(id);
      await carregarDespesas();
    } catch (error) {
      console.error("[Despesas] excluir", error);
      setErro(error?.message || "Não foi possível excluir a despesa.");
    } finally {
      setExcluindoId(null);
    }
  }

  function getStatus(despesa) {
    const valor = Number(despesa.valor) || 0;
    const pago = Number(despesa.total_pago) || 0;
    if (pago >= valor && valor > 0) return "Pago";
    if (pago > 0) return "Parcial";
    return "Em aberto";
  }

  async function handleRegistrarPagamento(pagamento) {
    if (!pagandoDespesa) return;
    setErro("");
    try {
      await registrarPagamentoDespesa(pagandoDespesa.id, pagamento);
      await carregarDespesas();
      setPagandoDespesa(null);
    } catch (error) {
      console.error("[Despesas] registrar pagamento", error);
      setErro(error?.message || "Não foi possível registrar o pagamento.");
    }
  }

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
        Faça login para visualizar as despesas.
      </PrimeCard>
    );
  }

  return (
    <div className="space-y-8">
      <PrimeSectionTitle
        title="Despesas"
        subtitle="Controle os custos da operação com a mesma sofisticação do módulo Prime."
        icon={Wallet}
      />

      {erro && (
        <PrimeCard className="border-red-400/30 bg-red-900/30 text-red-100">
          {erro}
        </PrimeCard>
      )}

      <PrimeCard className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-white/60">
          Registre despesas e acompanhe lançamentos em tempo real via Supabase.
        </div>
        <PrimeButton onClick={() => setModalAberto(true)}>
          <Plus size={16} /> Nova despesa
        </PrimeButton>
      </PrimeCard>

      <PrimeCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-premium w-full">
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Restante</th>
                <th>Data</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {despesas.map((d) => (
                <tr key={d.id}>
                  <td className="text-white/80">{d.categoria || "—"}</td>
                  <td>
                    <p className="font-semibold text-white">
                      {d.descricao || "—"}
                    </p>
                  </td>
                  <td className="text-[#ffe8a3] font-semibold">
                    {currency.format(Number(d.valor) || 0)}
                  </td>
                  <td>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold border ${
                        getStatus(d) === "Pago"
                          ? "border-emerald-400/50 text-emerald-200 bg-emerald-500/15"
                          : getStatus(d) === "Parcial"
                          ? "border-amber-400/50 text-amber-200 bg-amber-500/15"
                          : "border-slate-400/40 text-slate-200 bg-slate-500/10"
                      }`}
                    >
                      {getStatus(d)}
                    </span>
                  </td>
                  <td className="text-white/80">
                    {currency.format(
                      Math.max(
                        0,
                        (Number(d.valor) || 0) - (Number(d.total_pago) || 0)
                      )
                    )}
                  </td>
                  <td className="text-white/70">{formatDate(d.created_at)}</td>
                  <td>
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setPagandoDespesa(d)}
                        className="rounded-2xl border border-blue-400/40 bg-white/5 px-3 py-1 text-xs text-blue-100 hover:border-blue-300/80 disabled:opacity-60"
                        disabled={getStatus(d) === "Pago"}
                      >
                        Registrar pagamento
                      </button>
                      <button
                        onClick={() => handleExcluir(d.id)}
                        title="Excluir"
                        disabled={excluindoId === d.id}
                        className="rounded-2xl border border-white/15 bg-white/10 p-2 text-red-300 transition hover:border-red-300/60 disabled:opacity-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!carregando && despesas.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-white/60">
                    Nenhuma despesa cadastrada.
                  </td>
                </tr>
              )}

              {carregando && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-white/60">
                    Carregando despesas...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </PrimeCard>

      {modalAberto && (
        <NovaDespesa
          onSave={handleSalvar}
          onClose={() => setModalAberto(false)}
        />
      )}

      {pagandoDespesa && (
        <PagamentosModal
          despesa={pagandoDespesa}
          open={!!pagandoDespesa}
          onClose={() => setPagandoDespesa(null)}
          onConfirm={handleRegistrarPagamento}
        />
      )}
    </div>
  );
}
