import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Logo from "../assets/logo.png";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const { login, proprietarioId, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");
  const [submetendo, setSubmetendo] = useState(false);

  useEffect(() => {
    if (proprietarioId) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, proprietarioId]);

  async function handleLogin(event) {
    event.preventDefault();
    if (submetendo || loading) return;

    setMensagemErro("");
    setSubmetendo(true);

    try {
      await login(email.trim(), senha);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("[Login] Falha ao autenticar", error);
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Não foi possível autenticar. Verifique suas credenciais.";
      setMensagemErro(message);
    } finally {
      setSubmetendo(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <img src={Logo} alt="Logo Multicell" className="login-logo" />

        <h1 className="login-title">MULTICELL SYSTEM</h1>
        <p className="login-subtitle">
          Operações inteligentes, resultados imediatos.
        </p>

        {mensagemErro && <div className="login-alert">{mensagemErro}</div>}

        <form className="login-form" onSubmit={handleLogin}>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            placeholder="Seu e-mail"
            className="login-input"
            autoComplete="username"
            required
          />

          <input
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            type="password"
            placeholder="Sua senha"
            className="login-input"
            autoComplete="current-password"
            required
          />

          <button
            type="submit"
            className="login-button"
            disabled={submetendo || loading}
          >
            {submetendo || loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="login-hint">
          Utilizamos o Supabase Auth para validar credenciais. Em ambientes de
          teste sem hash, troque esta chamada por uma checagem simples na tabela
          "proprietarios" e documente o uso de senha em texto plano.
        </p>
      </div>
    </div>
  );
}
