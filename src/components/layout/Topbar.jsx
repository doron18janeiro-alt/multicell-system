export default function Topbar({ empresa = "MULTICELL", usuario = "Proprietario", onLogout }) {
  const toggleTheme = () => {
    const body = document.body;
    const isDark = body.dataset.theme !== "dark";
    body.dataset.theme = isDark ? "dark" : "light";
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 14px",
        marginBottom: 14,
        borderRadius: 14,
        border: "1px solid var(--border)",
        background: "rgba(255,255,255,0.02)",
        boxShadow: "var(--shadow)",
      }}
    >
      <div>
        <div style={{ fontWeight: 700 }}>{empresa}</div>
        <div style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Painel Futurista</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button className="btn btn-secondary btn-sm" onClick={toggleTheme}>
          Tema
        </button>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 600 }}>{usuario}</div>
          <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>online</div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
