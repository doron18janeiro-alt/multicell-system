import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";

import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Produtos from "@/pages/Produtos";
import Vendas from "@/pages/Vendas";
import Clientes from "@/pages/Clientes";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/produtos"
          element={
            <PrivateRoute>
              <Produtos />
            </PrivateRoute>
          }
        />

        <Route
          path="/vendas"
          element={
            <PrivateRoute>
              <Vendas />
            </PrivateRoute>
          }
        />

        <Route
          path="/clientes"
          element={
            <PrivateRoute>
              <Clientes />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
