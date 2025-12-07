import { useState } from "react";
import LogoAnimada from "../components/LogoAnimada";

const MASTER_PASSWORD = "1234";

export default function Login({ onLogin }) {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (senha === MASTER_PASSWORD) {
      localStorage.setItem("multicell-auth", "true");
      onLogin(true);
      return;
    }
    setErro("Senha incorreta. Tente novamente.");
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <LogoAnimada size={110} />
        <h1>Multicell System</h1>
        <p>Seguranca roxo futurista. Entre com a senha mestre.</p>

        <form onSubmit={handleSubmit}>
          <label className="pill">Senha Mestre</label>
          <input
            type="password"
            className="input"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Digite 1234"
          />
          {erro && <div className="error">{erro}</div>}
          <button className="btn mt-12" type="submit">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
