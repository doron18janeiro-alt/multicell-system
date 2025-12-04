export default function Card({ title, value, hint, children }) {
  return (
    <div className="panel card-metric">
      <div className="label">{title}</div>
      <div className="value">{value}</div>
      {hint && <div className="hint">{hint}</div>}
      {children}
    </div>
  );
}
