import { supabase } from "../supabaseClient";
import { useState } from "react";
import { exportCSV } from "../utils/exportCSV";

export default function Relatorios() {
  const [lista, setLista] = useState([]);

  const filtrar = async (dataInicial, dataFinal) => {
    const { data } = await supabase
      .from("vendas")
      .select("*")
      .gte("data", dataInicial)
      .lte("data", dataFinal);

    setLista(data || []);
  };

  return (
    <div>
      <h1>Relatórios</h1>
      <input type="date" id="ini" />
      <input type="date" id="fim" />
      <button
        onClick={() =>
          filtrar(
            document.getElementById("ini").value,
            document.getElementById("fim").value
          )
        }
      >
        Buscar
      </button>
      <button onClick={() => exportCSV("relatorio_vendas", lista)}>
        Exportar CSV
      </button>

      {lista.map((v) => (
        <div key={v.id}>
          R$ {v.total} — {v.forma_pagamento}
        </div>
      ))}
    </div>
  );
}
