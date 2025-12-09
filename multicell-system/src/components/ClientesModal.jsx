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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-[14px] bg-white text-slate-900 shadow-xl border border-slate-200 p-6">
        <h2 className="text-xl font-semibold mb-1">
          {cliente ? "Editar Cliente" : "Novo Cliente"}
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Cadastre ou edite os dados do cliente.
        </p>

        <form className="space-y-4" onSubmit={salvar}>
          <div className="space-y-2">
            <label className="text-sm text-slate-700">Nome</label>
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-slate-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
              value={dados.nome}
              onChange={(event) => handleChange("nome", event.target.value)}
              placeholder="Ex: Maria Souza"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-700">Telefone</label>
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-slate-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
              value={dados.telefone}
              onChange={(event) => handleChange("telefone", event.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-700">CPF</label>
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-slate-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
              value={dados.cpf}
              onChange={(event) => handleChange("cpf", event.target.value)}
              placeholder="000.000.000-00"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-700">Email</label>
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-slate-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
              value={dados.email}
              onChange={(event) => handleChange("email", event.target.value)}
              placeholder="cliente@exemplo.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-700">Observações</label>
            <textarea
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-slate-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none min-h-[96px]"
              rows={3}
              value={dados.observacoes}
              onChange={(event) =>
                handleChange("observacoes", event.target.value)
              }
              placeholder="Preferências, histórico, etc."
            />
          </div>

          {erro && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {erro}
            </div>
          )}

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={fechar}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition disabled:opacity-60"
              disabled={salvando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition disabled:opacity-60"
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
