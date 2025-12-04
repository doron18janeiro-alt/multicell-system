import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Historico() {
  const navigate = useNavigate();
  const [vendas, setVendas] = useState([]);
  const [ordens, setOrdens] = useState([]);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const { data: vend } = await supabase.from("vendas").select("*").order("data", { ascending: false });
    const { data: os } = await supabase.from("ordens").select("*").order("created_at", { ascending: false });
    setVendas(vend || []);
    setOrdens(os || []);
  }

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Histórico</h1>
      </div>
      <div className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">Histórico de Vendas</div>
            <p className="panel-subtitle">Listagem de vendas registradas</p>
          </div>
        </div>
        <div className="os-list">
          {vendas.map((v) => (
            <div key={v.id} className="os-card">
              <div className="flex" style={{ justifyContent: "space-between" }}>
                <span>{new Date(v.data || v.created_at).toLocaleString("pt-BR")}</span>
                <strong>R$ {(Number(v.total) || 0).toFixed(2)}</strong>
              </div>
              <div className="muted">{v.pagamento || v.forma_pagamento || "Pagamento"}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">Histórico de OS</div>
            <p className="panel-subtitle">Ordens de serviço registradas</p>
          </div>
        </div>
        <div className="os-list">
          {ordens.map((o) => (
            <div key={o.id} className="os-card">
              <div className="flex" style={{ justifyContent: "space-between" }}>
                <span>{o.cliente}</span>
                <strong>{o.status}</strong>
              </div>
              <div className="muted">
                {o.aparelho} — {o.servico} — R$ {(Number(o.valor) || 0).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
