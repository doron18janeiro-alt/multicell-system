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
          border: "1px solid rgba(192,132,252,0.45)",
          position: "relative",
          boxShadow:
            "0 0 32px rgba(168,85,247,0.35), inset 0 0 22px rgba(139,92,246,0.25)",
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
            background: "linear-gradient(135deg, rgba(139,92,246,0.9), rgba(192,132,252,0.6))",
            filter: "blur(16px)",
            opacity: 0.7,
          }}
        />
        <motion.div
          animate={{ y: [-6, 6, -6] }}
          transition={{ repeat: Infinity, duration: 3.4, ease: "easeInOut" }}
          style={{
            position: "absolute",
            inset: 16,
            borderRadius: 16,
            background: "linear-gradient(160deg, #0d0a1f, #120d2d)",
            border: "1px solid rgba(192,132,252,0.5)",
            display: "grid",
            placeItems: "center",
            color: "#f7f8fb",
            letterSpacing: "0.12em",
            fontWeight: 800,
          }}
        >
          <div style={{ textAlign: "center", fontSize: 18, lineHeight: 1.1 }}>
            MULTI
            <br />
            CELL
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
