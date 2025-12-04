import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../services/supabase";
import Logo from "../assets/logo.png";

const links = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Estoque", path: "/estoque" },
  { label: "Caixa", path: "/caixa" },
  { label: "Despesas", path: "/despesas" },
  { label: "Histórico", path: "/historico" },
  { label: "Ordens de Serviço", path: "/os" },
  { label: "Termo de Garantia", path: "/garantia" },
  { label: "Relatórios", path: "/relatorios" },
  { label: "Configurações", path: "/config" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo-block">
        <img src={Logo} alt="Logo Multicell" className="sidebar-logo" />

        <div className="sidebar-title-wrapper">
          <h2 className="sidebar-title">CENTRAL DE COMANDO</h2>
          <p className="sidebar-subtitle">Operação premium, tempo real</p>
        </div>
      </div>
      <div className="nav-group">
        {links.map((item) => {
          const active = location.pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              className={`nav-button ${active ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <span>{item.label}</span>
            </button>
          );
        })}
        <button className="nav-button" onClick={handleLogout}>
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
