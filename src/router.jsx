import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

const AppLayout = lazy(() => import("@/components/layout/MainLayout.jsx"));
const Dashboard = lazy(() => import("@/pages/Dashboard.jsx"));
const Os = lazy(() => import("@/pages/OS.jsx"));
const DetalhesOS = lazy(() => import("@/pages/OS/DetalhesOS.jsx"));
const Estoque = lazy(() => import("@/pages/Estoque.jsx"));
const DetalhesProduto = lazy(() =>
  import("@/pages/Produtos/DetalhesProduto.jsx")
);
const Relatorios = lazy(() => import("@/pages/Relatorios.jsx"));
const Config = lazy(() => import("@/pages/Config.jsx"));
const Despesas = lazy(() => import("@/pages/Despesas.jsx"));
const Login = lazy(() => import("@/pages/Login.jsx"));

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

const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export function createAppRouter({ user, onLogout }) {
  return createBrowserRouter([
    {
      path: "/login",
      element: withSuspense(<Login />),
    },
    {
      path: "/",
      element: (
        <ProtectedRoute user={user}>
          {withSuspense(<AppLayout user={user} onLogout={onLogout} />)}
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        {
          path: "dashboard",
          element: (
            <ProtectedRoute user={user}>
              {withSuspense(<Dashboard />)}
            </ProtectedRoute>
          ),
        },
        {
          path: "os",
          element: (
            <ProtectedRoute user={user}>{withSuspense(<Os />)}</ProtectedRoute>
          ),
        },
        {
          path: "os/:id",
          element: (
            <ProtectedRoute user={user}>
              {withSuspense(<DetalhesOS />)}
            </ProtectedRoute>
          ),
        },
        {
          path: "estoque",
          element: (
            <ProtectedRoute user={user}>
              {withSuspense(<Estoque />)}
            </ProtectedRoute>
          ),
        },
        {
          path: "produtos/:id",
          element: (
            <ProtectedRoute user={user}>
              {withSuspense(<DetalhesProduto />)}
            </ProtectedRoute>
          ),
        },
        {
          path: "relatorios",
          element: (
            <ProtectedRoute user={user}>
              {withSuspense(<Relatorios />)}
            </ProtectedRoute>
          ),
        },
        {
          path: "config",
          element: (
            <ProtectedRoute user={user}>
              {withSuspense(<Config />)}
            </ProtectedRoute>
          ),
        },
        {
          path: "despesas",
          element: (
            <ProtectedRoute user={user}>
              {withSuspense(<Despesas />)}
            </ProtectedRoute>
          ),
        },
      ],
    },
    {
      path: "*",
      element: <Navigate to="/dashboard" replace />,
    },
  ]);
}
