import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
  Outlet,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Estoque from "./pages/Estoque";
import Caixa from "./pages/Caixa";
import Historico from "./pages/Historico";
import OS from "./pages/OS";
import TermoGarantia from "./pages/TermoGarantia";
import Config from "./pages/Config";
import Splash from "./pages/Splash";
import {
  carregarProdutos,
  carregarVendas,
  criarProduto,
  registrarVenda,
  subscribeRealtime,
  listarOS,
  subscribeRealtimeOS,
} from "./supabaseClient";

function Header({ current }) {
  return (
    <div className="main-header">
      <div className="main-title">{current}</div>
    </div>
  );
}

function ProtectedLayout({
  authed,
  loading,
  currentTitle,
  produtos,
  vendas,
  ordens,
  onRegistrarVenda,
}) {
  if (!authed) return <Navigate to="/login" replace />;
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        <Header current={currentTitle} />
        {loading ? (
          <div className="panel">Carregando dados...</div>
        ) : (
          <Outlet
            context={{ produtos, vendas, ordens, onRegistrarVenda }}
          />
        )}
      </main>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthed, setIsAuthed] = useState(
    localStorage.getItem("multicell-auth") === "true"
  );
  const [produtos, setProdutos] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [ordens, setOrdens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // mantém comportamento para outras rotas; splash já é a rota inicial (/)
  }, []);

  const loadDados = async () => {
    setLoading(true);
    const [prods, vds, oss] = await Promise.all([
      carregarProdutos(),
      carregarVendas(),
      listarOS(),
    ]);
    setProdutos(prods);
    setVendas(vds);
    setOrdens(oss);
    setLoading(false);
  };

  useEffect(() => {
    if (!isAuthed) return;
    loadDados();
    const unsub = subscribeRealtime(() => loadDados(), () => loadDados());
    const unsubOS = subscribeRealtimeOS(() => loadDados());
    return () => {
      unsub && unsub();
      unsubOS && unsubOS();
    };
  }, [isAuthed]);

  const handleLogin = () => {
    setIsAuthed(true);
  };

  const handleCriarProduto = async (dados) => {
    const novo = await criarProduto(dados);
    if (novo) {
      setProdutos((p) => [novo, ...p]);
    }
  };

  const handleRegistrarVenda = async (itens, pagamento) => {
    const venda = await registrarVenda(itens, pagamento);
    if (venda) {
      await loadDados();
    }
  };

  const currentTitle =
    location.pathname === "/estoque"
      ? "Estoque"
      : location.pathname === "/caixa"
      ? "Caixa"
      : location.pathname === "/historico"
      ? "Historico"
      : location.pathname === "/os"
      ? "Ordens de Servico"
      : location.pathname === "/garantia"
      ? "Termo de Garantia"
      : location.pathname === "/config"
      ? "Configuracoes"
      : "Dashboard";

  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/splash" element={<Splash />} />
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route
        path="/*"
        element={
          <ProtectedLayout
            authed={isAuthed}
            loading={loading}
            currentTitle={currentTitle}
            produtos={produtos}
            vendas={vendas}
            ordens={ordens}
            onRegistrarVenda={handleRegistrarVenda}
          />
        }
      >
        <Route
          index
          element={
            <Dashboard vendas={vendas} produtos={produtos} ordens={ordens} />
          }
        />
        <Route
          path="estoque"
          element={<Estoque produtos={produtos} onCriarProduto={handleCriarProduto} />}
        />
        <Route
          path="caixa"
          element={
            <Caixa
              produtos={produtos}
              onRegistrarVenda={handleRegistrarVenda}
              vendas={vendas}
            />
          }
        />
        <Route path="historico" element={<Historico vendas={vendas} ordens={ordens} />} />
        <Route path="os" element={<OS />} />
        <Route path="garantia" element={<TermoGarantia />} />
        <Route path="config" element={<Config />} />
        <Route
          path="*"
          element={
            <Dashboard vendas={vendas} produtos={produtos} ordens={ordens} />
          }
        />
      </Route>
    </Routes>
  );
}
