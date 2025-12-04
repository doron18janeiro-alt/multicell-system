import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import Logo from "../assets/logo.png";
import "./Header.css";

function Header() {
  const nav = useNavigate();

  async function logout() {
    await supabase.auth.signOut();
    nav("/login");
  }

  return (
    <header className="header-container header-animate">
      <div className="header-left">
        <img src={Logo} alt="Logo Multicell" className="header-logo" />

        <div className="header-title-block">
          <h1 className="header-title">MULTICELL SYSTEM</h1>
          <p className="header-subtitle">
            Operações inteligentes, resultados imediatos.
          </p>
        </div>
      </div>

      <div className="header-actions">
        <button
          onClick={logout}
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
