import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/login"), 4200);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "black",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <video
        src="/mascot.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        style={{
          width: "40%",
          height: "auto",
        }}
      />
    </div>
  );
}
