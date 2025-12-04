import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const splashStyles = `
  @keyframes auroraDrift {
    0% { transform: translate3d(0, 0, 0) scale(1); }
    50% { transform: translate3d(-4%, -6%, 0) scale(1.05); }
    100% { transform: translate3d(0, 0, 0) scale(1); }
  }

  @keyframes meshFlow {
    0% { background-position: 0% 0%; }
    100% { background-position: 160% 160%; }
  }

  @keyframes sparkDrift {
    0% { transform: translate3d(0, 0, 0); opacity: 0; }
    15% { opacity: 1; }
    85% { opacity: 1; }
    100% { transform: translate3d(60px, -140px, 0); opacity: 0; }
  }

  @keyframes sparkPulse {
    0%, 100% { transform: scale(0.7); }
    50% { transform: scale(1.2); }
  }

  @keyframes ringRotate {
    0% { transform: rotate(var(--rotation, 0deg)); }
    100% { transform: rotate(calc(var(--rotation, 0deg) + 360deg)); }
  }

  @keyframes ringGlow {
    0%, 100% { box-shadow: 0 0 45px rgba(59, 130, 246, 0.35); opacity: 0.45; }
    50% { box-shadow: 0 0 70px rgba(250, 204, 21, 0.55); opacity: 0.75; }
  }

  @keyframes chipGlow {
    0%, 100% { box-shadow: 0 0 12px rgba(250, 204, 21, 0.35); }
    50% { box-shadow: 0 0 20px rgba(250, 204, 21, 0.65); }
  }

  @keyframes ticker {
    0%, 100% { transform: scale(0.85); opacity: 0.6; }
    50% { transform: scale(1.2); opacity: 1; }
  }

  @keyframes fadeSplash {
    0% { opacity: 1; filter: blur(0px); }
    100% { opacity: 0; filter: blur(18px); }
  }

  .splash-root {
    position: relative;
    min-height: 100vh;
    width: 100%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.25), transparent 60%),
                radial-gradient(circle at 80% 10%, rgba(99, 102, 241, 0.35), transparent 50%),
                radial-gradient(circle at 50% 80%, rgba(30, 64, 175, 0.35), transparent 40%),
                #020312;
    color: #f8fafc;
  }

  .splash-root::after {
    content: "";
    position: absolute;
    inset: -40% 0 0 0;
    background: radial-gradient(circle, rgba(147, 197, 253, 0.35), transparent 45%);
    opacity: 0.35;
    filter: blur(85px);
  }

  .splash-root.splash-fade-out {
    animation: fadeSplash 0.45s ease forwards;
  }

  .splash-aurora,
  .splash-mesh,
  .splash-noise {
    position: absolute;
    inset: -10%;
    pointer-events: none;
  }

  .splash-aurora {
    background: conic-gradient(from 120deg, rgba(37, 99, 235, 0.25), rgba(14, 165, 233, 0.2), rgba(99, 102, 241, 0.25), rgba(14, 116, 144, 0.3));
    filter: blur(80px);
    mix-blend-mode: screen;
    animation: auroraDrift 18s ease-in-out infinite;
  }

  .splash-mesh {
    background-image:
      linear-gradient(115deg, rgba(59, 130, 246, 0.08) 0%, transparent 65%),
      linear-gradient(245deg, rgba(14, 165, 233, 0.08) 0%, transparent 65%),
      repeating-linear-gradient(0deg, rgba(148, 163, 184, 0.05) 0px, rgba(148, 163, 184, 0.05) 2px, transparent 2px, transparent 90px),
      repeating-linear-gradient(90deg, rgba(148, 163, 184, 0.04) 0px, rgba(148, 163, 184, 0.04) 2px, transparent 2px, transparent 90px);
    mix-blend-mode: screen;
    opacity: 0.4;
    animation: meshFlow 24s linear infinite;
  }

  .splash-noise {
    background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect width="100%25" height="100%25" fill="none"/%3E%3Cg fill="rgba(148,163,184,0.05)"%3E%3Ccircle cx="10" cy="10" r="1"/%3E%3Ccircle cx="40" cy="40" r="1"/%3E%3Ccircle cx="70" cy="180" r="1"/%3E%3Ccircle cx="140" cy="90" r="1"/%3E%3Ccircle cx="200" cy="300" r="1"/%3E%3Ccircle cx="320" cy="120" r="1"/%3E%3C/g%3E%3C/svg%3E');
    opacity: 0.35;
    mix-blend-mode: screen;
  }

  .energy-ring {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(59, 130, 246, 0.35);
    box-shadow: 0 0 55px rgba(59, 130, 246, 0.45);
    mix-blend-mode: screen;
    animation: ringRotate var(--speed, 18s) linear infinite,
               ringGlow 4.5s ease-in-out infinite;
    opacity: 0.8;
  }

  .energy-ring::after {
    content: "";
    position: absolute;
    inset: 12%;
    border-radius: 50%;
    border: 1px solid rgba(250, 204, 21, 0.45);
    filter: blur(4px);
  }

  .spark {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: radial-gradient(circle, #fde68a 0%, rgba(253, 230, 138, 0.2) 70%);
    box-shadow: 0 0 30px rgba(250, 204, 21, 0.9);
    animation: sparkDrift var(--speed, 6s) linear infinite,
               sparkPulse 2.2s ease-in-out infinite;
    animation-delay: var(--delay, 0s);
    mix-blend-mode: screen;
  }

  .splash-content {
    position: relative;
    z-index: 5;
    text-align: center;
    padding: 3.5rem 3rem;
    border-radius: 40px;
    background: rgba(2, 6, 23, 0.55);
    border: 1px solid rgba(99, 102, 241, 0.3);
    backdrop-filter: blur(28px);
    box-shadow: 0 35px 100px rgba(2, 6, 23, 0.95), inset 0 0 60px rgba(59, 130, 246, 0.15);
    max-width: 560px;
    width: min(90%, 560px);
  }

  .intro-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 0.9rem;
    font-size: 0.75rem;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: #fef9c3;
    border: 1px solid rgba(250, 204, 21, 0.45);
    border-radius: 999px;
    background: rgba(146, 64, 14, 0.15);
    animation: chipGlow 3s ease-in-out infinite;
  }

  .logo-core {
    margin-top: 1.8rem;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .logo-title {
    font-size: clamp(2.6rem, 6vw, 4.2rem);
    font-weight: 800;
    letter-spacing: 0.45em;
    text-transform: uppercase;
    background: linear-gradient(110deg, #bfdbfe 0%, #60a5fa 35%, #c4b5fd 65%, #fcd34d 100%);
    -webkit-background-clip: text;
    color: transparent;
    text-shadow: 0 0 45px rgba(59, 130, 246, 0.45);
  }

  .logo-tagline {
    font-size: 1.05rem;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: rgba(226, 232, 240, 0.9);
  }

  .loading-ticker {
    margin: 2.4rem auto 0;
    display: inline-flex;
    gap: 0.9rem;
  }

  .loading-ticker span {
    width: 14px;
    height: 14px;
    border-radius: 999px;
    background: radial-gradient(circle, #bae6fd, #38bdf8);
    box-shadow: 0 0 15px rgba(56, 189, 248, 0.7);
    animation: ticker 1.2s ease-in-out infinite;
  }

  .loading-ticker span:nth-child(2) { animation-delay: 0.2s; }
  .loading-ticker span:nth-child(3) { animation-delay: 0.4s; }
`;

const SPARKS = 30;

const RINGS = [
  { id: 1, size: 320, speed: 14, blur: 10 },
  { id: 2, size: 460, speed: 18, blur: 14 },
  { id: 3, size: 640, speed: 22, blur: 18 },
];

const buildSparks = () =>
  Array.from({ length: SPARKS }, (_, index) => ({
    id: index,
    top: Math.random() * 100,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 4 + Math.random() * 4,
  }));

const buildEnergyRings = () =>
  RINGS.map((ring) => ({
    ...ring,
    rotation: Math.random() * 360,
  }));

function SplashScreen() {
  const navigate = useNavigate();
  const [fading, setFading] = useState(false);
  const sparks = useMemo(() => buildSparks(), []);
  const energyRings = useMemo(() => buildEnergyRings(), []);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 2000);
    const timer = setTimeout(() => {
      navigate("/login", { replace: true });
    }, 2400);

    return () => {
      clearTimeout(timer);
      clearTimeout(fadeTimer);
    };
  }, [navigate]);

  return (
    <div className={`splash-root ${fading ? "splash-fade-out" : ""}`}>
      <style>{splashStyles}</style>
      <div className="splash-aurora" aria-hidden="true" />
      <div className="splash-mesh" aria-hidden="true" />
      <div className="splash-noise" aria-hidden="true" />

      {energyRings.map((ring) => (
        <span
          key={ring.id}
          className="energy-ring"
          style={{
            width: `${ring.size}px`,
            height: `${ring.size}px`,
            "--speed": `${ring.speed}s`,
            "--rotation": `${ring.rotation}deg`,
            filter: `blur(${ring.blur}px)`,
          }}
          aria-hidden="true"
        />
      ))}

      {sparks.map((spark) => (
        <span
          key={spark.id}
          className="spark"
          style={{
            top: `${spark.top}%`,
            left: `${spark.left}%`,
            "--delay": `${spark.delay}s`,
            "--speed": `${spark.duration}s`,
          }}
          aria-hidden="true"
        />
      ))}

      <div className="splash-content">
        <span className="intro-chip">MULTICELL SYSTEM</span>
        <div className="logo-core">
          <h1 className="logo-title">MULTICELL</h1>
          <p className="logo-tagline">Tecnologia que move resultados.</p>
        </div>
        <div className="loading-ticker" aria-label="Carregando ambiente">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;
