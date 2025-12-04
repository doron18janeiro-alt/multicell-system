import { NavLink, Outlet } from "react-router-dom";
import clsx from "clsx";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: "🏠" },
  { path: "/os", label: "Ordens de Serviço", icon: "🛠️" },
  { path: "/caixa", label: "Caixa", icon: "💰" },
  { path: "/estoque", label: "Estoque", icon: "📦" },
  { path: "/relatorios", label: "Relatórios", icon: "📊" },
  { path: "/config", label: "Configurações", icon: "⚙️" },
];

export default function AppLayout({ user, onLogout }) {
  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      <aside className="w-64 hidden md:flex flex-col border-r border-slate-800 bg-gradient-to-b from-slate-950 to-slate-900/60">
        <div className="px-6 py-8 border-b border-slate-800">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Multicell System
          </p>
          <p className="text-2xl font-black text-white">Control Hub</p>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition",
                  isActive
                    ? "bg-indigo-600/20 text-white border border-indigo-500/40 shadow-lg shadow-indigo-900/40"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                )
              }
            >
              <span className="text-lg" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-6 py-6 border-t border-slate-800 text-xs text-slate-400">
          © {new Date().getFullYear()} Multicell. Todos os direitos reservados.
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur flex items-center justify-between px-4 md:px-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Ambiente Autenticado
            </p>
            <p className="text-lg font-semibold">Bem-vindo de volta</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-slate-500">Logado como</p>
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="rounded-xl px-4 py-2 text-sm font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700"
            >
              Sair
            </button>
          </div>
        </header>

        <main className="flex-1 bg-slate-900/40 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
