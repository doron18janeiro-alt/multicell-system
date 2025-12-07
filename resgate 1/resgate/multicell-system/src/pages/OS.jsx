import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function OS() {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState({
    cliente: "",
    telefone: "",
    aparelho: "",
    imei: "",
    problema: "",
    diagnostico: "",
    servico: "",
    valor: "",
    status: "Aberto",
  });

  const carregar = async () => {
    const { data } = await supabase
      .from("ordens")
      .select("*")
      .order("created_at", { ascending: false });
    setLista(data || []);
  };

  const salvar = async () => {
    await supabase.from("ordens").insert(form);
    carregar();
    setForm({
      cliente: "",
      telefone: "",
      aparelho: "",
      imei: "",
      problema: "",
      diagnostico: "",
      servico: "",
      valor: "",
      status: "Aberto",
    });
  };

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div className="os-modern">
      <h1>Ordens de Serviço</h1>

      <div className="os-form">
        <input
          placeholder="Cliente"
          value={form.cliente}
          onChange={(e) => setForm({ ...form, cliente: e.target.value })}
        />
        <input
          placeholder="Telefone"
          value={form.telefone}
          onChange={(e) => setForm({ ...form, telefone: e.target.value })}
        />
        <input
          placeholder="Aparelho"
          value={form.aparelho}
          onChange={(e) => setForm({ ...form, aparelho: e.target.value })}
        />
        <input
          placeholder="IMEI"
          value={form.imei}
          onChange={(e) => setForm({ ...form, imei: e.target.value })}
        />
        <textarea
          placeholder="Problema"
          value={form.problema}
          onChange={(e) => setForm({ ...form, problema: e.target.value })}
        />
        <textarea
          placeholder="Diagnóstico"
          value={form.diagnostico}
          onChange={(e) => setForm({ ...form, diagnostico: e.target.value })}
        />
        <textarea
          placeholder="Serviço"
          value={form.servico}
          onChange={(e) => setForm({ ...form, servico: e.target.value })}
        />
        <input
          placeholder="Valor"
          value={form.valor}
          onChange={(e) => setForm({ ...form, valor: e.target.value })}
        />
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option>Aberto</option>
          <option>Em andamento</option>
          <option>Concluída</option>
        </select>

        <button onClick={salvar}>Salvar OS</button>
      </div>

      <h2>OS cadastradas</h2>

      {lista.map((os) => (
        <div className="os-card" key={os.id}>
          <strong>{os.cliente}</strong> — {os.aparelho}
          <p>{os.servico}</p>
          <p>Status: {os.status}</p>
        </div>
      ))}
    </div>
  );
}
