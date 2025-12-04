import React, { Suspense, lazy } from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

const Login = lazy(() => import("../pages/Login"));
const AppLayout = lazy(() => import("../layout/AppLayout"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Os = lazy(() => import("../pages/Os"));
const Caixa = lazy(() => import("../pages/Caixa"));
const Estoque = lazy(() => import("../pages/Estoque"));
const DespesasList = lazy(() => import("../pages/Despesas/Despesas"));
const NovaDespesa = lazy(() => import("../pages/Despesas/NovaDespesa"));
const DetalhesDespesa = lazy(() => import("../pages/Despesas/DetalhesDespesa"));
const Historico = lazy(() => import("../pages/Historico"));
const Produtos = lazy(() => import("../pages/Produtos"));
const TermoGarantia = lazy(() => import("../pages/TermoGarantia"));
const Relatorios = lazy(() => import("../pages/Relatorios"));
const Config = lazy(() => import("../pages/Config"));
const ConfigUsuarios = lazy(() => import("../pages/ConfigUsuarios"));

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

const withSuspense = (children) => (
  <Suspense fallback={<CinematicFallback />}>{children}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/login",
    element: withSuspense(<Login />),
  },
  {
    path: "/",
    element: <ProtectedRoute>{withSuspense(<AppLayout />)}</ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: withSuspense(<Dashboard />) },
      { path: "os", element: withSuspense(<Os />) },
      { path: "caixa", element: withSuspense(<Caixa />) },
      { path: "despesas", element: withSuspense(<DespesasList />) },
      { path: "despesas/nova", element: withSuspense(<NovaDespesa />) },
      { path: "despesas/:id", element: withSuspense(<DetalhesDespesa />) },
      { path: "estoque", element: withSuspense(<Estoque />) },
      { path: "historico", element: withSuspense(<Historico />) },
      { path: "produtos", element: withSuspense(<Produtos />) },
      { path: "garantia", element: withSuspense(<TermoGarantia />) },
      { path: "garantia/:id", element: withSuspense(<TermoGarantia />) },
      { path: "relatorios", element: withSuspense(<Relatorios />) },
      { path: "config", element: withSuspense(<Config />) },
      { path: "config/usuarios", element: withSuspense(<ConfigUsuarios />) },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);
