import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Card from "../components/Card";
import GraficoDashboard from "../components/GraficoDashboard";

export default function Dashboard() {
  const [vendasHoje, setVendasHoje] = useState(0);
  const [vendasMes, setVendasMes] = useState(0);
  const [osAbertas, setOSAbertas] = useState(0);
  const [osConcluidas, setOSConcluidas] = useState(0);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    carregarDashboard();
  }, []);

  async function carregarDashboard() {
    const hoje = new Date().toISOString().split("T")[0];
    const mes = hoje.slice(0, 7);

    let { data: vendasDia } = await supabase.from("vendas").select("total,data");
    vendasDia = (vendasDia || []).filter((v) => (v.data || "").startsWith(hoje));

    let { data: vendasMensal } = await supabase.from("vendas").select("total,data");
    vendasMensal = (vendasMensal || []).filter((v) => (v.data || "").startsWith(mes));

    let { data: abertas } = await supabase.from("ordens").select("id").eq("status", "Aberto");
    let { data: concluidas } = await supabase.from("ordens").select("id").eq("status", "Concluída");

    setVendasHoje(vendasDia?.reduce((t, v) => t + (Number(v.total) || 0), 0) || 0);
    setVendasMes(vendasMensal?.reduce((t, v) => t + (Number(v.total) || 0), 0) || 0);
    setOSAbertas(abertas?.length || 0);
    setOSConcluidas(concluidas?.length || 0);

    // gráfico simples: soma por dia do mês atual
    const diasMap = {};
    (vendasMensal || []).forEach((v) => {
      const dia = (v.data || "").slice(8, 10);
      diasMap[dia] = (diasMap[dia] || 0) + (Number(v.total) || 0);
    });
    const diasOrdenados = Object.keys(diasMap).sort();
    setChartData(
      diasOrdenados.map((d) => ({
        label: d,
        valor: Number(diasMap[d].toFixed(2)),
      }))
    );
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="grid grid-4">
        <Card title="Vendas Hoje" value={`R$ ${vendasHoje.toFixed(2)}`} hint="Fluxo do dia" />
        <Card title="Vendas no Mês" value={`R$ ${vendasMes.toFixed(2)}`} hint="Performance mensal" />
        <Card title="OS em aberto" value={osAbertas} hint="Status Aberto" />
        <Card title="OS concluídas" value={osConcluidas} hint="Status Concluída" />
      </div>
      <GraficoDashboard data={chartData} />
    </div>
  );
}
