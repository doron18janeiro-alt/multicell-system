import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";
import { signInWithEmail, signUpWithEmail } from "../utils/auth";
import Logo3D from "../components/Logo3D";
import BackgroundObjects from "../components/BackgroundObjects";

const loginStyles = `
  @keyframes circuitFlowOne {
    0% { background-position: 0% 0%; }
    100% { background-position: 200% 200%; }
  }

  @keyframes circuitFlowTwo {
    0% { background-position: 0% 0%; opacity: 0.1; }
    50% { opacity: 0.4; }
    100% { background-position: -200% -200%; opacity: 0.1; }
  }

  @keyframes particleFloat {
    0% { transform: translate3d(0, 0, 0) scale(var(--scale, 1)); opacity: 0; }
    10% { opacity: 0.7; }
    90% { opacity: 0.7; }
    100% { transform: translate3d(0, -140px, 0) scale(var(--scale, 1)); opacity: 0; }
  }

  @keyframes fadeUp {
    0% { opacity: 0; transform: translate3d(0, 30px, 0); }
    100% { opacity: 1; transform: translate3d(0, 0, 0); }
  }

  @keyframes borderPulse {
    0%, 100% { opacity: 0.8; filter: drop-shadow(0 25px 50px rgba(15, 23, 42, 0.8)); }
    50% { opacity: 1; filter: drop-shadow(0 35px 70px rgba(59, 130, 246, 0.35)); }
  }

  @keyframes floatObject {
    0% { transform: translate3d(0, 0, 0); }
    100% { transform: translate3d(0, -30px, 0); }
  }

  @keyframes rotateObject {
    0% { transform: rotate3d(0.2, 1, 0, 0deg); }
    100% { transform: rotate3d(0.2, 1, 0, 360deg); }
  }

  @keyframes fadeObject {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.8; }
  }

  @keyframes scan {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  @keyframes glow {
    0% { opacity: 0.5; }
    50% { opacity: 1; }
    100% { opacity: 0.5; }
  }

  @keyframes shake {
    0% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    50% { transform: translateX(4px); }
    75% { transform: translateX(-4px); }
    100% { transform: translateX(0); }
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.1; }
  }

  @keyframes keyFloat {
    0% { transform: translateY(0) scale(1); opacity: 1; }
    100% { transform: translateY(-40px) scale(1.6); opacity: 0; }
  }

  .login-gradient {
    background: radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.55), transparent 55%),
                radial-gradient(circle at 80% 0%, rgba(147, 51, 234, 0.45), transparent 40%),
                radial-gradient(circle at 15% 80%, rgba(34, 197, 94, 0.25), transparent 45%),
                linear-gradient(135deg, #01030d 0%, #040018 45%, #080023 100%);
  }

  .circuit-overlay {
    background-image:
      linear-gradient(120deg, rgba(56, 189, 248, 0.25) 0%, transparent 60%),
      linear-gradient(90deg, rgba(14, 165, 233, 0.2) 0%, transparent 70%),
      repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.05) 0px, rgba(255, 255, 255, 0.05) 2px, transparent 2px, transparent 80px),
      repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.04) 0px, rgba(255, 255, 255, 0.04) 2px, transparent 2px, transparent 80px);
    animation: circuitFlowOne 35s linear infinite;
    opacity: 0.35;
    mix-blend-mode: screen;
  }

  .circuit-overlay::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(60deg, transparent, rgba(59, 130, 246, 0.35), transparent);
    animation: circuitFlowTwo 20s linear infinite;
  }

  .neon-grid {
    background-image:
      linear-gradient(rgba(56, 189, 248, 0.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(56, 189, 248, 0.08) 1px, transparent 1px);
    background-size: 160px 160px;
    opacity: 0.15;
  }

  .background-objects {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 2;
    overflow: hidden;
  }

  .floating-object {
    position: absolute;
    animation: floatObject var(--float, 8s) ease-in-out infinite alternate,
               fadeObject var(--fade, 10s) ease-in-out infinite;
  }

  .floating-shape {
    filter: blur(3px) drop-shadow(0 0 18px rgba(77, 208, 255, 0.4));
    opacity: 0.6;
    animation: rotateObject 16s linear infinite;
  }

  .floating-icon {
    width: 110px;
    height: auto;
    opacity: 0.8;
  }

  .mouse-light {
    position: fixed;
    width: 280px;
    height: 280px;
    border-radius: 50%;
    pointer-events: none;
    background: radial-gradient(circle, #00c3ff33, transparent 70%);
    mix-blend-mode: screen;
    z-index: 5;
    transform: translate3d(-999px, -999px, 0);
  }

  .particle {
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: rgba(125, 211, 252, 0.85);
    box-shadow: 0 0 12px rgba(59, 130, 246, 0.8);
    top: var(--y, 50%);
    left: var(--x, 50%);
    animation: particleFloat var(--duration, 15s) linear infinite;
    animation-delay: var(--delay, 0s);
    opacity: 0.4;
  }

  .status-badge {
    border-radius: 999px;
    padding: 0.35rem 0.9rem;
    font-size: 0.7rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    background: rgba(22, 78, 99, 0.35);
    border: 1px solid rgba(56, 189, 248, 0.35);
    color: #c7f9ff;
  }

  .card-frame {
    position: relative;
    border-radius: 36px;
    padding: 2px;
    background: linear-gradient(140deg, rgba(77, 208, 255, 0.6), rgba(93, 53, 195, 0.6));
    animation: borderPulse 3.5s ease-in-out infinite;
    box-shadow:
      0 30px 80px rgba(2, 6, 23, 0.9),
      0 0 40px rgba(79, 70, 229, 0.35);
  }

  .card-frame::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(120deg, rgba(77, 208, 255, 0.4), rgba(168, 85, 247, 0.4));
    filter: blur(12px);
    opacity: 0.6;
  }

  .card-surface {
    position: relative;
    border-radius: 32px;
    background: rgba(6, 10, 25, 0.92);
    border: 1px solid rgba(94, 143, 255, 0.2);
    backdrop-filter: blur(22px);
    padding: 3rem 3rem 2.75rem;
    box-shadow: inset 0 0 45px rgba(15, 23, 42, 0.35);
    overflow: hidden;
  }

  .card-surface::after {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 20% 20%, rgba(77, 208, 255, 0.15), transparent 50%);
    opacity: 0.3;
    pointer-events: none;
  }

  .glass-crack {
    animation: crack 0.5s forwards;
  }

  .glass-crack::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Cpath d="M0 220 L90 190 L160 230 L210 170 L290 210 L400 160" stroke="rgba(255,255,255,0.35)" stroke-width="2" fill="none"/%3E%3Cpath d="M80 400 L140 320 L200 360 L260 300 L320 340" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" fill="none"/%3E%3C/svg%3E');
    opacity: 0;
    animation: crackOverlay 0.4s forwards;
    pointer-events: none;
  }

  @keyframes crack {
    0% { filter: none; }
    40% { filter: drop-shadow(0 0 10px #ff4f4f); transform: scale(1.02); }
    100% { filter: none; transform: scale(1); }
  }

  @keyframes crackOverlay {
    0% { opacity: 0.45; }
    100% { opacity: 0; }
  }

  .input-field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .input-label {
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: #c7d2fe;
  }

  .neon-border {
    position: relative;
    border-radius: 12px;
  }

  .neon-border::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 12px;
    padding: 1px;
    background: linear-gradient(90deg, #11c8ff, #6b5bff, #11c8ff);
    background-size: 300% 300%;
    animation: borderRun 4s linear infinite;
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
            mask-composite: exclude;
    pointer-events: none;
  }

  @keyframes borderRun {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }

  .tech-lines {
    position: relative;
    display: block;
  }

  .tech-lines::before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: -3px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #00d0ff, transparent);
    animation: scan 1.8s infinite linear;
  }

  .neon-input {
    position: relative;
  }

  .neon-input::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(120deg, rgba(77, 208, 255, 0.15), rgba(83, 51, 195, 0.25));
    opacity: 0.2;
    transition: opacity 0.3s ease;
  }

  .neon-input:focus-within::before {
    opacity: 0.4;
  }

  .glow-placeholder::placeholder {
    color: #9fc8ff99;
    animation: glow 2.5s infinite ease-in-out;
  }

  .typed-text {
    font-size: clamp(1.5rem, 3vw, 2.4rem);
    font-weight: 600;
    color: #e4e7ff;
    letter-spacing: 0.08em;
  }

  .typed-cursor {
    display: inline-block;
    width: 2px;
    height: 1.2em;
    margin-left: 4px;
    background: #4dc9ff;
    animation: blink 0.9s steps(1) infinite;
  }

  .neon-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    border-radius: 999px;
    padding: 1rem 1.5rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    background: linear-gradient(120deg, #7c3aed, #2563eb, #22d3ee);
    color: #f8fafc;
    box-shadow: 0 15px 35px rgba(79, 70, 229, 0.45);
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .neon-button::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 999px;
    background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.35), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .neon-button:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 25px 55px rgba(14, 165, 233, 0.55);
  }

  .neon-button:hover:not(:disabled)::after {
    opacity: 1;
  }

  .key-particle {
    position: fixed;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #58e1ff;
    opacity: 0.9;
    pointer-events: none;
    animation: keyFloat 0.7s ease-out forwards;
    z-index: 40;
  }
`;

const loginHeadline = "Entre e transforme tecnologia em resultados.";
const signupHeadline = "Cadastre-se para pilotar";

const PARTICLE_COUNT = 32;

const createParticles = (count = PARTICLE_COUNT) =>
  Array.from({ length: count }, (_, index) => ({
    id: index,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 12,
    duration: 14 + Math.random() * 12,
    scale: 0.5 + Math.random() * 1.8,
  }));

function Login() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(null);
  const [shake, setShake] = useState(false);
  const [cracked, setCracked] = useState(false);
  const [typedText, setTypedText] = useState(loginHeadline);
  const mouseLightRef = useRef(null);
  const cardRef = useRef(null);
  const navigate = useNavigate();
  const particles = useMemo(() => createParticles(), []);

  useEffect(() => {
    if (mode === "login") {
      setTypedText("");
      let index = 0;
      const interval = setInterval(() => {
        setTypedText(loginHeadline.slice(0, index + 1));
        index += 1;
        if (index === loginHeadline.length) {
          clearInterval(interval);
        }
      }, 30);
      return () => clearInterval(interval);
    }
    setTypedText(signupHeadline);
  }, [mode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const moveLight = (event) => {
      if (!mouseLightRef.current) return;
      const offset = 160;
      mouseLightRef.current.style.transform = `translate3d(${
        event.clientX - offset
      }px, ${event.clientY - offset}px, 0)`;
    };
    window.addEventListener("mousemove", moveLight);
    return () => window.removeEventListener("mousemove", moveLight);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleKey = () => {
      const particle = document.createElement("div");
      particle.className = "key-particle";
      const rect = cardRef.current?.getBoundingClientRect();
      const x = rect
        ? rect.left + Math.random() * rect.width
        : window.innerWidth / 2;
      const y = rect
        ? rect.top + rect.height / 2 + (Math.random() - 0.5) * 80
        : window.innerHeight / 2;
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 700);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setMessageType(null);
    setLoading(true);

    try {
      if (mode === "login") {
        await signInWithEmail(email, password);
        setMessage("✅ Login realizado com sucesso!");
        setMessageType("success");
        navigate("/dashboard", { replace: true });
      } else {
        await signUpWithEmail(email, password, name);
        setMessage("✅ Conta criada! Verifique seu e-mail se necessário.");
        setMessageType("success");
        setMode("login");
      }
    } catch (error) {
      console.error(error);
      setMessage(error?.message || "Erro ao autenticar.");
      setMessageType("error");
      setShake(true);
      setCracked(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setCracked(false), 400);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#030410] text-white">
      <style>{loginStyles}</style>

      <div className="absolute inset-0 login-gradient" aria-hidden="true" />
      <div className="absolute inset-0 circuit-overlay" aria-hidden="true" />
      <div className="absolute inset-0 neon-grid" aria-hidden="true" />
      <BackgroundObjects />
      <div
        id="mouseLight"
        ref={mouseLightRef}
        className="mouse-light"
        aria-hidden="true"
      />
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="particle"
          style={{
            "--x": `${particle.x}%`,
            "--y": `${particle.y}%`,
            "--delay": `${particle.delay}s`,
            "--duration": `${particle.duration}s`,
            "--scale": particle.scale,
          }}
          aria-hidden="true"
        />
      ))}

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="text-center space-y-4 mb-10 animate-fade-up">
          <Logo3D />
          <p className="text-base text-slate-200 max-w-2xl">
            Operação premium para assistência técnica e vendas — feito para
            equipes que tratam tecnologia como arte.
          </p>
          <div className="status-badge inline-flex items-center gap-2 animate-pulse">
            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
            acesso seguro
          </div>
        </div>

        <div
          className={`card-frame w-full max-w-2xl animate-fade-up ${
            cracked ? "glass-crack" : ""
          }`}
          ref={cardRef}
        >
          <div className="card-surface">
            <div className="flex flex-col gap-1 text-center mb-8">
              <p className="text-sm uppercase tracking-[0.6em] text-slate-300">
                {mode === "login" ? "Acesso autorizado" : "Nova credencial"}
              </p>
              <h2 className="typed-text">
                {typedText}
                {mode === "login" &&
                  typedText.length < loginHeadline.length && (
                    <span className="typed-cursor" />
                  )}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "signup" && (
                <label className="input-field">
                  <span className="input-label">Nome completo</span>
                  <div className="group neon-input neon-border tech-lines w-full px-4 py-3 bg-transparent border border-[#1f3a70] focus-within:border-[#4dc9ff] text-[#d6e2ff] placeholder-[#9fc8ff99] rounded-xl backdrop-blur-sm transition-all duration-300">
                    <User className="h-5 w-5 text-[#7aa8ff] transition-all duration-300 group-focus-within:text-[#a9c8ff]" />
                    <input
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Seu nome completo"
                      autoComplete="name"
                      required
                      className="glow-placeholder w-full bg-transparent text-[#d6e2ff] placeholder-[#9fc8ff99] focus:outline-none"
                    />
                  </div>
                </label>
              )}

              <label className="input-field">
                <span className="input-label">E-mail corporativo</span>
                <div className="group neon-input neon-border tech-lines w-full px-4 py-3 bg-transparent border border-[#1f3a70] focus-within:border-[#4dc9ff] text-[#d6e2ff] placeholder-[#9fc8ff99] rounded-xl backdrop-blur-sm transition-all duration-300">
                  <Mail className="h-5 w-5 text-[#7aa8ff] transition-all duration-300 group-focus-within:text-[#a9c8ff]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="voce@multicell.com"
                    autoComplete="email"
                    required
                    className="glow-placeholder w-full bg-transparent text-[#d6e2ff] placeholder-[#9fc8ff99] focus:outline-none"
                  />
                </div>
              </label>

              <label className="input-field">
                <span className="input-label">Senha de acesso</span>
                <div
                  className={`group neon-input neon-border tech-lines w-full px-4 py-3 bg-transparent border border-[#1f3a70] focus-within:border-[#4dc9ff] text-[#d6e2ff] placeholder-[#9fc8ff99] rounded-xl backdrop-blur-sm transition-all duration-300 ${
                    shake ? "shake" : ""
                  }`}
                >
                  <Lock className="h-5 w-5 text-[#7aa8ff] transition-all duration-300 group-focus-within:text-[#a9c8ff]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    required
                    className="glow-placeholder w-full bg-transparent text-[#d6e2ff] placeholder-[#9fc8ff99] focus:outline-none"
                  />
                </div>
              </label>

              {message && (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm tracking-wide ${
                    messageType === "error"
                      ? "border-rose-400/40 bg-rose-500/10 text-rose-100"
                      : "border-emerald-400/40 bg-emerald-500/10 text-emerald-50"
                  }`}
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="neon-button disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Sincronizando..."
                  : mode === "login"
                  ? "Acessar agora"
                  : "Criar acesso"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-300">
              {mode === "login"
                ? "Primeira vez por aqui?"
                : "Já possui credenciais?"}
            </p>
            <button
              type="button"
              className="mx-auto mt-2 text-sm font-semibold text-sky-200 hover:text-white transition"
              onClick={() => {
                setMode((value) => (value === "login" ? "signup" : "login"));
                setMessage("");
                setMessageType(null);
              }}
            >
              {mode === "login" ? "Cadastrar-se" : "Voltar para login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
