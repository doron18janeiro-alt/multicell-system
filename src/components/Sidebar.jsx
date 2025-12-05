import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/produtos", label: "Produtos" },
  { to: "/clientes", label: "Clientes" },
  { to: "/vendas", label: "Vendas" },
  { to: "/os", label: "Ordens de Serviço" },
  { to: "/caixa", label: "Caixa" },
];

export default function Sidebar() {
  const { usuario, signOut } = useAuth();

  return (
    <aside className="w-64 h-screen bg-gray-900 text-white p-5 flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.6em] text-gray-500">
          Multicell
        </p>
        <h2 className="text-2xl font-bold">Cockpit</h2>
        {usuario?.nome && (
          <p className="text-sm text-gray-400 mt-1">{usuario.nome}</p>
        )}
      </div>

      <nav className="flex flex-col gap-1 text-sm font-medium">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 transition hover:bg-white/10 ${
                isActive ? "bg-white/10 text-white" : "text-gray-300"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={signOut}
        className="mt-auto rounded-lg border border-white/20 px-3 py-2 text-sm text-gray-300 transition hover:bg-white/10"
      >
        Sair
      </button>
    </aside>
  );
}
