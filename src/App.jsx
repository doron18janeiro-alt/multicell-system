import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";

import ProdutosPage from "./pages/ProdutosPage";
import ClientesPage from "./pages/ClientesPage";
import CaixaPage from "./pages/CaixaPage";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/produtos" element={<ProdutosPage />} />
            <Route path="/clientes" element={<ClientesPage />} />
            <Route path="/caixa" element={<CaixaPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
