import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import Os from "./pages/Os";
import Caixa from "./pages/Caixa";
import Estoque from "./pages/Estoque";
import Relatorios from "./pages/Relatorios";
import Config from "./pages/Config";

const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export function createAppRouter({ user, onLogout }) {
  return createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute user={user}>
          <AppLayout user={user} onLogout={onLogout} />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        {
          path: "dashboard",
          element: (
            <ProtectedRoute user={user}>
              <Dashboard />
            </ProtectedRoute>
          ),
        },
        {
          path: "os",
          element: (
            <ProtectedRoute user={user}>
              <Os />
            </ProtectedRoute>
          ),
        },
        {
          path: "caixa",
          element: (
            <ProtectedRoute user={user}>
              <Caixa />
            </ProtectedRoute>
          ),
        },
        {
          path: "estoque",
          element: (
            <ProtectedRoute user={user}>
              <Estoque />
            </ProtectedRoute>
          ),
        },
        {
          path: "relatorios",
          element: (
            <ProtectedRoute user={user}>
              <Relatorios />
            </ProtectedRoute>
          ),
        },
        {
          path: "config",
          element: (
            <ProtectedRoute user={user}>
              <Config />
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
