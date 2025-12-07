import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Splash() {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login", { replace: true });
    }, 3500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-black via-[#050012] to-[#12002c]">
      <div className="flex flex-col items-center justify-center">
        <video
          ref={videoRef}
          className="w-[260px] h-[260px] md:w-[340px] md:h-[340px] rounded-[32px] border border-violet-500/40 shadow-[0_0_80px_rgba(168,85,247,0.85)] object-contain bg-black/60"
          autoPlay
          muted
          playsInline
        >
          <source src="/mascot.mp4" type="video/mp4" />
          Seu navegador não suporta vídeo.
        </video>

        <p className="mt-6 text-sm tracking-[0.25em] text-violet-300 uppercase">
          Carregando MULTICELL…
        </p>
      </div>
    </div>
  );
}
