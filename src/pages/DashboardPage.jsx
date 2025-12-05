import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { BarChart3, DollarSign, Users, ShoppingCart } from "lucide-react";

export default function DashboardPage() {
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalVendas, setTotalVendas] = useState(0);
  const [faturamento, setFaturamento] = useState(0);
  const [produtosMaisVendidos, setProdutosMaisVendidos] = useState([]);

  useEffect(() => {
    carregarResumo();
    carregarProdutosMaisVendidos();
  }, []);

  async function carregarResumo() {
    const { count: clientes } = await supabase
      .from("clientes")
      .select("*", { count: "exact", head: true });

    const { data: vendas } = await supabase
      .from("vendas")
      .select("valor_total");

    const somaFaturamento = vendas?.reduce(
      (acc, item) => acc + Number(item.valor_total || 0),
      0
    );

    setTotalClientes(clientes || 0);
    setTotalVendas(vendas?.length || 0);
    setFaturamento(somaFaturamento || 0);
  }

  async function carregarProdutosMaisVendidos() {
    const { data } = await supabase.rpc("top_produtos_vendidos");

    if (data) setProdutosMaisVendidos(data);
  }

  return (
    <div className="space-y-6">
      {/* Título */}
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card
          titulo="Clientes"
          valor={totalClientes}
          icon={<Users className="w-8 h-8 text-blue-600" />}
        />

        <Card
          titulo="Vendas"
          valor={totalVendas}
          icon={<ShoppingCart className="w-8 h-8 text-green-600" />}
        />

        <Card
          titulo="Faturamento"
          valor={`R$ ${faturamento.toFixed(2)}`}
          icon={<DollarSign className="w-8 h-8 text-emerald-600" />}
        />

        <Card
          titulo="Produtos Ativos"
          valor={produtosMaisVendidos.length}
          icon={<BarChart3 className="w-8 h-8 text-purple-600" />}
        />
      </div>

      {/* Ranking de produtos */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Produtos Mais Vendidos</h2>

        {produtosMaisVendidos.length === 0 ? (
          <p className="text-gray-500">Nenhuma venda registrada ainda.</p>
        ) : (
          <ul className="divide-y">
            {produtosMaisVendidos.map((item, index) => (
              <li key={index} className="py-2 flex justify-between">
                <span>{item.nome}</span>
                <span className="font-bold">{item.quantidade} vendas</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* COMPONENTE CARD */
function Card({ titulo, valor, icon }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 flex items-center space-x-4">
      <div>{icon}</div>
      <div>
        <p className="text-gray-500 text-sm">{titulo}</p>
        <p className="text-2xl font-bold text-gray-800">{valor}</p>
      </div>
    </div>
  );
}
