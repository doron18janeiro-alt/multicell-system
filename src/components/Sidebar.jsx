import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, Users, ShoppingCart } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/produtos", label: "Produtos", icon: Package },
    { to: "/clientes", label: "Clientes", icon: Users },
    { to: "/caixa", label: "Caixa", icon: ShoppingCart },
  ];

  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-6">Sistema App</h2>

      <nav className="space-y-3">
        {links.map(({ to, label, icon: Icon }) => {
          const active = location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 p-3 rounded hover:bg-gray-700 transition ${
                active ? "bg-gray-800" : ""
              }`}
            >
              <Icon size={20} /> {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
