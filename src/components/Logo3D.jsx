import React, { useRef } from "react";

const logoStyles = `
  .logo-3d {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
    padding: 1.5rem 2rem;
    border-radius: 28px;
    background: rgba(5, 8, 20, 0.6);
    border: 1px solid rgba(250, 204, 21, 0.3);
    box-shadow:
      0 35px 90px rgba(3, 6, 23, 0.95),
      0 0 35px rgba(81, 173, 255, 0.35),
      inset 0 0 35px rgba(250, 204, 21, 0.3);
    transform-style: preserve-3d;
    transition: transform 0.2s ease-out, filter 0.4s ease-out;
    animation: logoGlow 4s ease-in-out infinite;
  }

  .logo-3d:hover {
    transform: rotateY(8deg) rotateX(4deg) scale(1.04);
    filter: drop-shadow(0px 0px 12px #ffdf70aa);
  }

  .logo-3d-text {
    font-size: clamp(2.5rem, 4vw, 4.25rem);
    font-weight: 800;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    background: linear-gradient(120deg, #fff3c4 0%, #ffd166 35%, #fcb045 55%, #f97316 100%);
    -webkit-background-clip: text;
    color: transparent;
    text-shadow: 0 0 35px rgba(252, 211, 77, 0.55), 0 0 65px rgba(56, 189, 248, 0.35);
    position: relative;
    overflow: hidden;
  }

  .logo-3d-text::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.8), transparent);
    animation: logoScan 4s linear infinite;
    mix-blend-mode: screen;
  }

  .logo-3d-subtext {
    font-size: 0.9rem;
    letter-spacing: 0.55em;
    text-transform: uppercase;
    color: rgba(241, 245, 249, 0.8);
  }

  @keyframes logoScan {
    0% { transform: translateX(-120%); }
    100% { transform: translateX(120%); }
  }

  @keyframes logoGlow {
    0%, 100% { box-shadow: 0 35px 90px rgba(3, 6, 23, 0.95), 0 0 35px rgba(81, 173, 255, 0.35), inset 0 0 35px rgba(250, 204, 21, 0.3); }
    50% { box-shadow: 0 35px 90px rgba(3, 6, 23, 0.95), 0 0 55px rgba(81, 173, 255, 0.55), inset 0 0 55px rgba(250, 204, 21, 0.5); }
  }
`;

function Logo3D() {
  const cardRef = useRef(null);

  function handleMouseMove(event) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    const rotateY = (x / rect.width) * 12;
    const rotateX = (-y / rect.height) * 8;
    cardRef.current.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
  }

  function handleMouseLeave() {
    if (!cardRef.current) return;
    cardRef.current.style.transform = "rotateY(0deg) rotateX(0deg)";
  }

  return (
    <div
      className="logo-3d-wrapper"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <style>{logoStyles}</style>
      <div ref={cardRef} className="logo-3d">
        <span className="logo-3d-text">MULTICELL</span>
        <span className="logo-3d-subtext">SYSTEM</span>
      </div>
    </div>
  );
}

export default Logo3D;
