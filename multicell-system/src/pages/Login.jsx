import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/Logo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const { signed, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (signed) {
      navigate("/", { replace: true });
    }
  }, [signed, navigate]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setErro("");

    const { error } = await login(email, senha);

    if (error) {
      const mensagem = error?.message || "Credenciais inválidas";
      setErro(mensagem);
      window.alert(mensagem);
    } else {
      navigate("/", { replace: true });
    }

    setLoading(false);
  }

  return (
    <div className="tela-login">
      <div className="card-login">
        <Logo className="logo-login" />

        <h2>MULTICELL SYSTEM</h2>

        {erro && <p style={{ color: "red" }}>{erro}</p>}

        <form onSubmit={handleLogin}>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
