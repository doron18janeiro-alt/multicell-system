import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Config() {
  const [cfg, setCfg] = useState({
    nome_empresa: "",
    cnpj: "",
    endereco: "",
    telefone: "",
    responsavel: "",
    id: null,
  });

  const carregar = async () => {
    const { data } = await supabase.from("configuracoes").select("*").limit(1).single();
    if (data) setCfg(data);
  };

  const salvar = async () => {
    await supabase.from("configuracoes").update(cfg).eq("id", cfg.id);
    alert("Salvo!");
  };

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div>
      <h1>Configurações da Empresa</h1>
      <input
        value={cfg.nome_empresa}
        onChange={(e) => setCfg({ ...cfg, nome_empresa: e.target.value })}
        placeholder="Nome"
      />
      <input
        value={cfg.cnpj}
        onChange={(e) => setCfg({ ...cfg, cnpj: e.target.value })}
        placeholder="CNPJ"
      />
      <input
        value={cfg.endereco}
        onChange={(e) => setCfg({ ...cfg, endereco: e.target.value })}
        placeholder="Endereço"
      />
      <input
        value={cfg.telefone}
        onChange={(e) => setCfg({ ...cfg, telefone: e.target.value })}
        placeholder="Telefone"
      />
      <input
        value={cfg.responsavel}
        onChange={(e) => setCfg({ ...cfg, responsavel: e.target.value })}
        placeholder="Responsável"
      />
      <button onClick={salvar}>Salvar</button>
    </div>
  );
}
