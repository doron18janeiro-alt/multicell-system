import { NavLink, useNavigate } from "react-router-dom";
import LogoAnimada from "../components/LogoAnimada";

const navItems = [
  { label: "Dashboard", path: "/", icon: "[D]" },
  { label: "Caixa", path: "/caixa", icon: "[CX]" },
  { label: "Vendas", path: "/vendas", icon: "[VN]" },
  { label: "Produtos", path: "/produtos", icon: "[PR]" },
  { label: "Estoque", path: "/estoque", icon: "[ES]" },
  { label: "Usuarios", path: "/usuarios", icon: "[US]" },
  { label: "Configuracoes", path: "/config", icon: "[CF]" },
  { label: "Relatorios", path: "/relatorios", icon: "[RL]" },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("multicell_auth");
    navigate("/login", { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <LogoAnimada size={90} />
        <div>
          <div className="logo-title">MULTICELL</div>
          <div className="logo-sub">Painel Futurista</div>
        </div>
      </div>

      <nav className="nav-group">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-button ${isActive ? "active" : ""}`
            }
          >
            <span style={{ marginRight: 8 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
        <button className="nav-button" onClick={handleLogout}>
          <span style={{ marginRight: 8 }}>[SAIR]</span>
          Sair
        </button>
      </nav>
    </aside>
  );
}
