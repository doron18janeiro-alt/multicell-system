import { memo } from "react";

function InfoCard({ title, value, subtitle }) {
  return (
    <div className="info-card">
      <h3>{title}</h3>
      <strong>{value}</strong>
      <span>{subtitle}</span>
    </div>
  );
}

export default memo(InfoCard);
