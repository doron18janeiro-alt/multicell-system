import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./despesas.css";

export default function Despesas() {
  const nav = useNavigate();
  const [despesas, setDespesas] = useState([]);

  useEffect(() => {
    const mock = JSON.parse(localStorage.getItem("despesas")) || [];
    setDespesas(mock);
  }, []);

  function getStatus(despesa) {
    if (despesa.total_pago >= despesa.valor) return "pago";
    if (despesa.total_pago > 0) return "parcial";
    return "pendente";
  }

  return (
    <div className="despesas-container">
      <div className="despesas-card">
        <div className="flex-between">
          <h1 className="despesas-title">Despesas</h1>
          <Link to="/despesas/nova" className="btn-gold">
            + Nova despesa
          </Link>
        </div>

        <table className="despesas-table">
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Valor</th>
              <th>Pago</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {despesas.map((despesa) => (
              <tr
                key={despesa.id}
                style={{ cursor: "pointer" }}
                onClick={() => nav(`/despesas/${despesa.id}`)}
              >
                <td>{despesa.descricao}</td>
                <td>{despesa.categoria}</td>
                <td>R$ {despesa.valor.toFixed(2)}</td>
                <td>R$ {despesa.total_pago.toFixed(2)}</td>
                <td>
                  <span className={`status-badge status-${getStatus(despesa)}`}>
                    {getStatus(despesa).toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
            {despesas.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  style={{ textAlign: "center", padding: "1rem" }}
                >
                  Nenhuma despesa cadastrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
