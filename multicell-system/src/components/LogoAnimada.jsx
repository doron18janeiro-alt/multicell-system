import { motion } from "framer-motion";

export default function LogoAnimada({ size = 120 }) {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <motion.div
        initial={{ rotate: -8, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 12 }}
        style={{
          width: size,
          height: size,
          borderRadius: 24,
          background: "linear-gradient(135deg, #1a0f2f, #0a0818)",
          border: "1px solid rgba(192,132,252,0.6)",
          position: "relative",
          boxShadow:
            "0 0 42px rgba(168,85,247,0.55), inset 0 0 28px rgba(139,92,246,0.35)",
        }}
      >
        <motion.div
          className="glow"
          animate={{ scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 3 }}
          style={{
            position: "absolute",
            inset: 12,
            borderRadius: 18,
            background: "linear-gradient(135deg, rgba(139,92,246,0.8), rgba(192,132,252,0.5))",
            filter: "blur(18px)",
            opacity: 0.85,
          }}
        />
        <motion.div
          animate={{ y: [-6, 6, -6] }}
          transition={{ repeat: Infinity, duration: 3.4, ease: "easeInOut" }}
          style={{
            position: "absolute",
            inset: 16,
            borderRadius: 16,
            background: "radial-gradient(circle at 50% 50%, rgba(10,8,24,0.9), rgba(7,6,16,0.95))",
            border: "1px solid rgba(192,132,252,0.65)",
            display: "grid",
            placeItems: "center",
            overflow: "hidden",
          }}
        >
          <video
            src="/mascot.mp4"
            autoPlay
            muted
            loop
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              background: "black",
              filter: "drop-shadow(0 0 12px rgba(168,85,247,0.6))",
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
