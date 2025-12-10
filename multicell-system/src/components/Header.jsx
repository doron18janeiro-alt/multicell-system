import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/Logo";
import "./Header.css";

function Header() {
  const nav = useNavigate();
  const { usuario, logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
    } finally {
      nav("/login");
    }
  }

  return (
    <header className="header-container header-animate">
      <div className="header-left">
        <Logo alt="Logo" className="h-10 header-logo" />

        <div className="header-title-block">
          <h1 className="header-title">MULTICELL SYSTEM</h1>
          <p className="header-subtitle">
            Operações inteligentes, resultados imediatos.
          </p>
        </div>
      </div>

      <div className="header-actions">
        <div className="header-user">
          <p className="header-user-label">Logado como</p>
          <strong className="header-user-email">
            {usuario?.email || usuario?.nome || "usuário"}
          </strong>
        </div>

        <button
          onClick={handleLogout}
          className="btn-gold"
          style={{ padding: "6px 12px" }}
        >
          Sair
        </button>
      </div>
    </header>
  );
}

export default Header;
