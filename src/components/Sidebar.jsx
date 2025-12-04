import LogoAnimada from "./LogoAnimada";
import { useNavigate, useLocation } from "react-router-dom";

const links = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Estoque", path: "/estoque" },
  { label: "Caixa", path: "/caixa" },
  { label: "Histórico", path: "/historico" },
  { label: "Ordens de Serviço", path: "/os" },
  { label: "Termo de Garantia", path: "/garantia" },
  { label: "Relatórios", path: "/relatorios" },
  { label: "Configurações", path: "/config" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("multicell_auth");
    navigate("/login", { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <LogoAnimada size={90} />
        <div className="logo-text">
          <div className="logo-title">MULTICELL</div>
          <div className="logo-sub">Painel Futurista</div>
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
