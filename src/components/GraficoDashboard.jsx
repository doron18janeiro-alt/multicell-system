export default function GraficoDashboard({ data }) {
  const max = Math.max(...data.map((d) => d.valor || 0), 1);
  return (
    <div className="panel">
      <h3>Fluxo de Vendas</h3>
      <p className="panel-sub">Barras com glow roxo destacando a semana</p>
      <div className="chart-grid">
        {data.map((item) => (
          <div className="chart-bar" key={item.label}>
            <div
              className="bar"
              style={{
                height: `${(item.valor / max) * 160}px`,
                background: "linear-gradient(180deg, #C084FC, #8B5CF6)",
              }}
            />
            <div className="label">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
