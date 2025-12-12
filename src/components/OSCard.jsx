export default function OSCard({ os, onEdit, onDelete, onGarantia }) {
  const statusColor =
    os.status === "Finalizado"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
      : os.status === "Em andamento"
        ? "bg-amber-500/15 text-amber-300 border-amber-500/40"
        : "bg-sky-500/10 text-sky-300 border-sky-500/40";

  return (
    <div className="os-item">
      <div className="flex items-center justify-between">
        <span className="os-protocolo">{os.protocolo}</span>
        <span className={`os-badge ${statusColor}`}>{os.status}</span>
      </div>
      <div className="text-base font-semibold">{os.nome_cliente}</div>
      <div className="text-sm text-slate-300">{os.aparelho}</div>
      <div className="text-sm text-slate-400">
        R$ {Number(os.valor || 0).toFixed(2)} • {formatDate(os.data_abertura)}
      </div>
      <div className="mt-2 flex gap-2 text-xs">
        <button className="btn-ghost" onClick={() => onEdit?.(os)}>
          ✏️ Editar
        </button>
        <button className="btn-ghost danger" onClick={() => onDelete?.(os)}>
          🗑 Deletar
        </button>
        <button className="btn-ghost" onClick={() => onGarantia?.(os)}>
          🖨 Gerar Garantia
        </button>
      </div>
    </div>
  );
}

function formatDate(d) {
  if (!d) return "-";
  const date = new Date(d);
  return isNaN(date.getTime()) ? d : date.toLocaleDateString("pt-BR");
}
