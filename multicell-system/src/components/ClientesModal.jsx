import { useEffect, useState } from "react";

export default function ClientesModal({ cliente, fechar, onSubmit }) {
  const [dados, setDados] = useState({
    nome: "",
    telefone: "",
    cpf: "",
    email: "",
    observacoes: "",
  });
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (cliente) {
      setDados({
        nome: cliente.nome ?? "",
        telefone: cliente.telefone ?? "",
        cpf: cliente.cpf ?? "",
        email: cliente.email ?? "",
        observacoes: cliente.observacoes ?? "",
      });
    } else {
      setDados({
        nome: "",
        telefone: "",
        cpf: "",
        email: "",
        observacoes: "",
      });
    }
    setErro("");
  }, [cliente]);

  function handleChange(campo, valor) {
    setDados((prev) => ({ ...prev, [campo]: valor }));
  }

  async function salvar(event) {
    event.preventDefault();
    if (salvando) return;
    setErro("");

    if (!dados.nome.trim()) {
      setErro("Informe o nome do cliente.");
      return;
    }

    try {
      setSalvando(true);
      await onSubmit(dados);
      fechar();
    } catch (error) {
      console.error("[ClientesModal] salvar", error);
      setErro(
        error?.message || "Não foi possível salvar o cliente. Tente novamente."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">
          {cliente ? "Editar Cliente" : "Novo Cliente"}
        </h2>

        <form className="space-y-3" onSubmit={salvar}>
          <div>
            <label className="text-sm">Nome</label>
            <input
              className="w-full border rounded p-2"
              value={dados.nome}
              onChange={(event) => handleChange("nome", event.target.value)}
              placeholder="Ex: Maria Souza"
            />
          </div>

          <div>
            <label className="text-sm">Telefone</label>
            <input
              className="w-full border rounded p-2"
              value={dados.telefone}
              onChange={(event) => handleChange("telefone", event.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div>
            <label className="text-sm">CPF</label>
            <input
              className="w-full border rounded p-2"
              value={dados.cpf}
              onChange={(event) => handleChange("cpf", event.target.value)}
              placeholder="000.000.000-00"
            />
          </div>

          <div>
            <label className="text-sm">Email</label>
            <input
              className="w-full border rounded p-2"
              value={dados.email}
              onChange={(event) => handleChange("email", event.target.value)}
              placeholder="cliente@exemplo.com"
            />
          </div>

          <div>
            <label className="text-sm">Observações</label>
            <textarea
              className="w-full border rounded p-2"
              rows={3}
              value={dados.observacoes}
              onChange={(event) =>
                handleChange("observacoes", event.target.value)
              }
              placeholder="Preferências, histórico, etc."
            />
          </div>

          {erro && (
            <div className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
              {erro}
            </div>
          )}

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={fechar}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded"
              disabled={salvando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60"
              disabled={salvando}
            >
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
