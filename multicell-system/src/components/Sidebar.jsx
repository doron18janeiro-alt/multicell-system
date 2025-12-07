import LogoAnimada from "./LogoAnimada";
import { useNavigate, useLocation } from "react-router-dom";

const links = [
  { label: "Dashboard", path: "/" },
  { label: "Estoque", path: "/estoque" },
  { label: "Caixa", path: "/caixa" },
  { label: "Historico", path: "/historico" },
  { label: "Ordens de Servico", path: "/os" },
  { label: "Termo de Garantia", path: "/garantia" },
  { label: "Configuracoes", path: "/config" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <LogoAnimada size={72} />
        <div className="logo-text">
          <div className="logo-title">MULTICELL</div>
          <div className="logo-sub">Painel Futurista</div>
        </div>
      </div>
      <div className="nav-group">
        {links.map((item) => {
          const active =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);
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
      </div>
    </aside>
  );
}
