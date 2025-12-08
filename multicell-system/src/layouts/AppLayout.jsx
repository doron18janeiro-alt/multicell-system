import { NavLink, Outlet } from "react-router-dom";
import clsx from "clsx";

const layoutStyles = `
  @keyframes nebulaDrift {
    0% { transform: translate3d(0, 0, 0); opacity: 0.55; }
    50% { transform: translate3d(-3%, -2%, 0) scale(1.05); opacity: 0.8; }
    100% { transform: translate3d(0, 0, 0); opacity: 0.55; }
  }

  @keyframes gridPulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 0.8; }
  }

  @keyframes orbitSpin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  .layout-shell {
    position: relative;
    min-height: 100vh;
    background: radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.35), transparent 60%),
                radial-gradient(circle at 80% 0%, rgba(236, 72, 153, 0.2), transparent 45%),
                #020311;
    color: #dbeafe;
    overflow: hidden;
  }

  .layout-gradient,
  .layout-grid,
  .layout-noise,
  .layout-orbit {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .layout-gradient {
    background: conic-gradient(from 120deg, rgba(59, 130, 246, 0.25), rgba(99, 102, 241, 0.25), rgba(14, 165, 233, 0.25));
    filter: blur(90px);
    animation: nebulaDrift 18s ease-in-out infinite;
  }

  .layout-grid {
    background-image:
      linear-gradient(rgba(148, 163, 184, 0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(148, 163, 184, 0.06) 1px, transparent 1px);
    background-size: 180px 180px;
    mix-blend-mode: screen;
    animation: gridPulse 8s ease-in-out infinite;
  }

  .layout-noise {
    background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320"%3E%3Cg fill="rgba(148,163,184,0.07)"%3E%3Ccircle cx="5" cy="5" r="1"/%3E%3Ccircle cx="80" cy="140" r="1"/%3E%3Ccircle cx="190" cy="80" r="1"/%3E%3Ccircle cx="230" cy="250" r="1"/%3E%3Ccircle cx="310" cy="60" r="1"/%3E%3C/g%3E%3C/svg%3E');
    opacity: 0.4;
  }

  .layout-orbit {
    border: 1px solid rgba(59, 130, 246, 0.25);
    border-radius: 50%;
    width: min(90vw, 1200px);
    height: min(90vw, 1200px);
    margin: auto;
    top: -20%;
    left: 50%;
    transform: translateX(-50%);
    animation: orbitSpin 35s linear infinite;
    opacity: 0.35;
  }

  .layout-orbit::after {
    content: "";
    position: absolute;
    inset: 10%;
    border-radius: 50%;
    border: 1px solid rgba(236, 72, 153, 0.3);
  }

  .layout-body {
    position: relative;
    z-index: 2;
    display: flex;
    min-height: 100vh;
    backdrop-filter: blur(6px);
    background: linear-gradient(120deg, rgba(2, 6, 23, 0.75), rgba(15, 23, 42, 0.25));
  }

  .panel-brand::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 28px;
    border: 1px solid rgba(59, 130, 246, 0.35);
    opacity: 0.6;
  }

  .nav-shimmer {
    position: absolute;
    inset: 0;
    border-radius: 18px;
    border: 1px solid rgba(99, 102, 241, 0.4);
    overflow: hidden;
  }

  .nav-shimmer::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    animation: shimmer 4s linear infinite;
  }
`;

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: "🏠" },
  { path: "/produtos", label: "Produtos", icon: "📦" },
  { path: "/clientes", label: "Clientes", icon: "👥" },
  { path: "/vendas", label: "Vendas", icon: "🛒" },
  { path: "/os", label: "Ordens de Serviço", icon: "🛠️" },
  { path: "/relatorios", label: "Relatórios", icon: "📊" },
  { path: "/config", label: "Configurações", icon: "⚙️" },
];

export default function AppLayout({ user, onLogout }) {
  return (
    <div className="layout-shell">
      <style>{layoutStyles}</style>
      <div className="layout-gradient" aria-hidden="true" />
      <div className="layout-grid" aria-hidden="true" />
      <div className="layout-noise" aria-hidden="true" />
      <div className="layout-orbit" aria-hidden="true" />

      <div className="layout-body">
        <aside className="hidden lg:flex w-72 flex-col border-r border-white/5 bg-white/5 backdrop-blur-2xl shadow-[0_30px_80px_rgba(2,6,23,0.85)]">
          <div className="px-7 pt-8 pb-6 space-y-2 relative">
            <div className="panel-brand relative rounded-3xl bg-gradient-to-br from-indigo-500/15 via-sky-500/10 to-purple-500/20 p-5">
              <p className="text-[0.65rem] uppercase tracking-[0.6em] text-slate-300">
                Multicell System
              </p>
              <p className="text-3xl font-black text-white">Control Hub</p>
              <p className="text-xs text-slate-200/80 mt-2">
                Operação premium, tempo real
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
              Núcleo sincronizado agora
            </div>
          </div>

          <nav className="flex-1 px-5 py-6 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  clsx(
                    "relative flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition",
                    "text-slate-200/80 hover:text-white",
                    isActive
                      ? "bg-gradient-to-r from-indigo-500/30 to-cyan-500/20 border border-indigo-400/40 shadow-lg shadow-indigo-900/40"
                      : "bg-white/5 border border-white/5 hover:border-white/20"
                  )
                }
              >
                <span className="text-xl" aria-hidden>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                <span
                  className="w-2 h-2 rounded-full bg-white/40"
                  aria-hidden
                />
                <span className="nav-shimmer" aria-hidden />
              </NavLink>
            ))}
          </nav>

          <div className="px-7 py-6 text-xs text-slate-400/80 border-t border-white/5">
            © {new Date().getFullYear()} Multicell • potência operacional
          </div>
        </aside>

        <div className="flex-1 flex flex-col">
          <header className="h-20 border-b border-white/5 bg-white/5 backdrop-blur-2xl flex items-center justify-between px-4 md:px-10">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.5em] text-slate-300">
                Ambiente autenticado
              </p>
              <p className="text-2xl font-semibold text-white">
                Bem-vindo de volta
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-slate-400">Logado como</p>
                <p className="text-sm font-semibold text-white">
                  {user?.email}
                </p>
              </div>
              <div className="hidden sm:flex flex-col text-xs text-slate-400 text-right">
                <span>
                  {new Date().toLocaleDateString("pt-BR", { weekday: "long" })}
                </span>
                <span>
                  {new Date().toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="rounded-2xl px-4 py-2 text-sm font-semibold bg-gradient-to-r from-rose-500/80 to-orange-400/80 text-white border border-white/10 shadow-lg shadow-rose-900/40 hover:scale-[1.02] transition"
              >
                Sair
              </button>
            </div>
          </header>

          <main className="flex-1 relative overflow-y-auto p-4 md:p-8">
            <div className="absolute inset-0" aria-hidden="true">
              <div className="w-full h-full opacity-30 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.35),transparent_45%)]" />
            </div>
            <div className="relative max-w-6xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
