import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import "../styles/historico.css";

function formatCurrency(value) {
  const numero = Number(value) || 0;
  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

function formatDate(value) {
  if (!value) return "—";
  const data = new Date(value);
  if (Number.isNaN(data.getTime())) return value;
  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Historico() {
  const [vendas, setVendas] = useState([]);
  const [ordens, setOrdens] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setLoading(true);
    const [{ data: vend }, { data: os }] = await Promise.all([
      supabase.from("vendas").select("*").order("data", { ascending: false }),
      supabase
        .from("ordens")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    setVendas(vend || []);
    setOrdens(os || []);
    setLoading(false);
  }

  return (
    <div className="historico-page">
      <header className="historico-header">
        <p className="historico-eyebrow">Operações</p>
        <h1 className="historico-title">Central de Histórico</h1>
        <p className="historico-description">
          Acompanhe cada venda registrada e a trajetória completa das ordens de
          serviço com o mesmo visual premium das demais telas.
        </p>
      </header>

      <section className="historico-section">
        <div className="historico-section-head">
          <div>
            <span className="historico-kicker">Vendas</span>
            <h2>Histórico de Vendas</h2>
            <p>Listagem de vendas registradas</p>
          </div>
        </div>

        <div className="historico-grid">
          {vendas.length === 0 && !loading && (
            <p className="historico-empty">Nenhuma venda encontrada.</p>
          )}
          {vendas.map((venda) => (
            <article key={venda.id} className="historico-card">
              <div className="historico-card-top">
                <span>{formatDate(venda.data || venda.created_at)}</span>
                <strong>{formatCurrency(venda.total)}</strong>
              </div>
              <div className="historico-card-bottom">
                <p>{venda.pagamento || venda.forma_pagamento || "Pagamento"}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="historico-section">
        <div className="historico-section-head">
          <div>
            <span className="historico-kicker">Ordens de Serviço</span>
            <h2>Histórico de OS</h2>
            <p>Ordens de serviço registradas</p>
          </div>
        </div>

        <div className="historico-grid">
          {ordens.length === 0 && !loading && (
            <p className="historico-empty">Nenhuma OS encontrada.</p>
          )}
          {ordens.map((ordem) => (
            <article key={ordem.id} className="historico-card">
              <div className="historico-card-top">
                <span>{ordem.cliente || "Cliente desconhecido"}</span>
                <strong>{ordem.status || "—"}</strong>
              </div>
              <div className="historico-card-bottom">
                <p>
                  {ordem.aparelho || "Aparelho"}
                  {ordem.servico ? ` • ${ordem.servico}` : ""}
                </p>
                <span>{formatCurrency(ordem.valor)}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
