import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

// Lazy load pages for better performance
import { lazy, Suspense } from "react";
import { PageSkeleton } from "@/components/ui/Skeleton";

// Pages
const Login = lazy(() => import("@/pages/Login.jsx"));
const Dashboard = lazy(() => import("@/pages/Dashboard.jsx"));
const Produtos = lazy(() => import("@/pages/Produtos.jsx"));
const DetalhesProduto = lazy(() => import("@/pages/Produtos/DetalhesProduto.jsx"));
const NovoProduto = lazy(() => import("@/pages/Produtos/NovoProduto.jsx"));
const OS = lazy(() => import("@/pages/OS.jsx"));
const DetalhesOS = lazy(() => import("@/pages/OS/DetalhesOS.jsx"));
const Clientes = lazy(() => import("@/pages/Clientes.jsx"));
const DetalhesCliente = lazy(() => import("@/pages/Clientes/DetalhesCliente.jsx"));
const Vendas = lazy(() => import("@/pages/Vendas.jsx"));
const Estoque = lazy(() => import("@/pages/Estoque.jsx"));
const Despesas = lazy(() => import("@/pages/Despesas.jsx"));
const DetalhesDespesa = lazy(() => import("@/pages/Despesas/DetalhesDespesa.jsx"));
const NovaDespesa = lazy(() => import("@/pages/Despesas/NovaDespesa.jsx"));
const Relatorios = lazy(() => import("@/pages/Relatorios.jsx"));
const Config = lazy(() => import("@/pages/Config.jsx"));
const ConfigUsuarios = lazy(() => import("@/pages/ConfigUsuarios.jsx"));
const TermoGarantia = lazy(() => import("@/pages/TermoGarantia.jsx"));

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050114]">
      <div className="text-center space-y-4">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
        <p className="text-slate-300 text-sm">Carregando...</p>
      </div>
    </div>
  );
}

// Wrapper for suspense
function SuspenseWrapper({ children }) {
  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>;
}

/**
 * Centralized application routes
 * All routes are defined here for easy maintenance
 */
export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <SuspenseWrapper>
            <Login />
          </SuspenseWrapper>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <Dashboard />
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <Dashboard />
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />

      {/* Produtos Routes */}
      <Route
        path="/produtos"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <Produtos />
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/produtos/novo"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <NovoProduto />
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/produtos/:id"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <DetalhesProduto />
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />

      {/* OS Routes */}
      <Route
        path="/os"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <OS />
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/os/:id"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <DetalhesOS />
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />

      {/* Clientes Routes */}
      <Route
        path="/clientes"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <Clientes />
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/clientes/:id"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <DetalhesCliente />
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />

      {/* Vendas Routes */}
      <Route
        path="/vendas"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <Vendas />
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />

      {/* Estoque Routes */}
      <Route
        path="/estoque"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <Estoque />
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />

      {/* Despesas Routes */}
      <Route
        path="/despesas"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <Despesas />
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/despesas/nova"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <NovaDespesa />
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/despesas/:id"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <DetalhesDespesa />
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />

      {/* Relatórios Routes */}
      <Route
        path="/relatorios"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <Relatorios />
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />

      {/* Config Routes */}
      <Route
        path="/config"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <Config />
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/config/usuarios"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <ConfigUsuarios />
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />

      {/* Other Routes */}
      <Route
        path="/termo-garantia"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <TermoGarantia />
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />

      {/* 404 - Redirect to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRoutes;
