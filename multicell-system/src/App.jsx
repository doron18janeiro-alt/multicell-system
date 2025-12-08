import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import PrivateRoute from "./routes/PrivateRoute.jsx";
import AppLayout from "./layout/AppLayout.jsx";

const Login = lazy(() => import("./pages/Login.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Produtos = lazy(() => import("./pages/Produtos.jsx"));
const Clientes = lazy(() => import("./pages/Clientes.jsx"));
const Os = lazy(() => import("./pages/OS.jsx"));
const Estoque = lazy(() => import("./pages/Estoque.jsx"));
const Vendas = lazy(() => import("./pages/Vendas.jsx"));
const Relatorios = lazy(() => import("./pages/Relatorios.jsx"));
const Config = lazy(() => import("./pages/Config.jsx"));
const ConfigUsuarios = lazy(() => import("./pages/ConfigUsuarios.jsx"));
const TermoGarantia = lazy(() => import("./pages/TermoGarantia.jsx"));
const Historico = lazy(() => import("./pages/Historico.jsx"));
const DespesasList = lazy(() => import("./pages/Despesas/Despesas.jsx"));
const NovaDespesa = lazy(() => import("./pages/Despesas/NovaDespesa.jsx"));
const DetalhesDespesa = lazy(() =>
  import("./pages/Despesas/DetalhesDespesa.jsx")
);

function CinematicFallback() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050114] text-slate-100">
      <div className="relative px-10 py-8 rounded-3xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-2xl shadow-[0_30px_80px_rgba(3,7,18,0.9)]">
        <div
          className="absolute inset-3 rounded-2xl border border-slate-700/40 animate-pulse"
          aria-hidden
        />
        <div className="relative text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.5em] text-slate-400">
            Carregando cockpit
          </p>
          <p className="text-lg font-semibold text-white">
            Preparando módulos avançados…
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<CinematicFallback />}>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/"
              element={
                <PrivateRoute>
                  <AppLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/produtos" element={<Produtos />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/os" element={<Os />} />
              <Route path="/estoque" element={<Estoque />} />
              <Route path="/vendas" element={<Vendas />} />
              <Route path="/relatorios" element={<Relatorios />} />
              <Route path="/config" element={<Config />} />
              <Route path="/config/usuarios" element={<ConfigUsuarios />} />
              <Route path="/garantia" element={<TermoGarantia />} />
              <Route path="/garantia/:id" element={<TermoGarantia />} />
              <Route path="/historico" element={<Historico />} />
              <Route path="/despesas" element={<DespesasList />} />
              <Route path="/despesas/nova" element={<NovaDespesa />} />
              <Route path="/despesas/:id" element={<DetalhesDespesa />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
