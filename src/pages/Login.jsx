import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import Logo from "../assets/logo.png";
import "./Login.css";

function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    setLoading(false);

    if (error) {
      alert("Credenciais inválidas");
      return;
    }

    nav("/");
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <img src={Logo} alt="Logo Multicell" className="login-logo" />

        <h1 className="login-title">MULTICELL SYSTEM</h1>
        <p className="login-subtitle">
          Operações inteligentes, resultados imediatos.
        </p>

        <form className="login-form" onSubmit={handleLogin}>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            placeholder="Seu e-mail"
            className="login-input"
            required
          />

          <input
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            type="password"
            placeholder="Sua senha"
            className="login-input"
            required
          />

          <button type="submit" className="login-button" disabled={loading}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
