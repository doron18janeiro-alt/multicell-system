import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

export default function ClientesModal({ cliente, fechar, atualizar }) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");

  useEffect(() => {
    if (cliente) {
      setNome(cliente.nome ?? "");
      setTelefone(cliente.telefone ?? "");
      setCpf(cliente.cpf ?? "");
    } else {
      setNome("");
      setTelefone("");
      setCpf("");
    }
  }, [cliente]);

  async function salvar() {
    const dados = {
      nome: nome.trim(),
      telefone: telefone.trim(),
      cpf: cpf.trim(),
    };

    if (cliente) {
      await supabase.from("clientes").update(dados).eq("id", cliente.id);
    } else {
      await supabase.from("clientes").insert(dados);
    }

    atualizar();
    fechar();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">
          {cliente ? "Editar Cliente" : "Novo Cliente"}
        </h2>

        <div className="space-y-3">
          <div>
            <label className="text-sm">Nome</label>
            <input
              className="w-full border rounded p-2"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm">Telefone</label>
            <input
              className="w-full border rounded p-2"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm">CPF</label>
            <input
              className="w-full border rounded p-2"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button onClick={fechar} className="px-4 py-2 bg-gray-300 rounded">
            Cancelar
          </button>
          <button
            onClick={salvar}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
