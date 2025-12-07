import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Box,
  Users,
  ShoppingCart,
  Wrench,
  Wallet,
  LogOut,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/logo.png";

const links = [
  { label: "Dashboard", icon: BarChart3, to: "/dashboard" },
  { label: "Produtos", icon: Box, to: "/produtos" },
  { label: "Clientes", icon: Users, to: "/clientes" },
  { label: "Vendas", icon: ShoppingCart, to: "/vendas" },
  { label: "Ordens de Serviço", icon: Wrench, to: "/os" },
  { label: "Caixa", icon: Wallet, to: "/caixa" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const items = useMemo(
    () =>
      links.map((item) => ({
        ...item,
        active: location.pathname.startsWith(item.to),
      })),
    [location.pathname]
  );

  return (
    <aside className="sidebar-gradient w-[280px] h-screen text-white shadow-[0_0_40px_rgba(0,0,0,0.65)] border-r border-white/10">
      <div className="flex h-full flex-col justify-between">
        <div className="px-6 pt-10">
          <div className="flex flex-col items-center text-center gap-4">
            <img
              src={logo}
              alt="Multicell Logo"
              className="w-20 drop-shadow-[0_0_25px_rgba(255,215,0,0.55)]"
            />
            <div className="space-y-1">
              <p className="text-xs tracking-[0.6em] text-[#cdb88d]">
                MULTICELL SYSTEM
              </p>
              <p className="text-lg font-black text-[#ffe8a3]">
                Painel Prime Edition
              </p>
            </div>
            <p className="text-sm text-[#b8ab92]">{user?.email || ""}</p>
          </div>

          <nav className="mt-10 flex flex-col gap-2">
            {items.map(({ label, icon: Icon, to, active }) => (
              <button
                key={to}
                type="button"
                onClick={() => navigate(to)}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm uppercase tracking-[0.3em] transition duration-300 ${
                  active
                    ? "border-[#ffe8a3]/80 bg-white/10 text-white shadow-[0_0_25px_rgba(255,232,163,0.25)]"
                    : "border-white/5 text-white/70 hover:border-[#8f5eff]/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3 text-base tracking-normal">
                  <Icon size={18} />
                  {label}
                </span>
                <span className="text-xs text-white/50">↗</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="px-6 pb-10">
          <button
            type="button"
            onClick={() => logout?.()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff6b6b] to-[#b34343] py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-[0_15px_35px_rgba(179,67,67,0.35)]"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
}
