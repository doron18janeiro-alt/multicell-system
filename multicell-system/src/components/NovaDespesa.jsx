import { useState } from "react";

export default function NovaDespesa({ onSave, onClose }) {
  const [form, setForm] = useState({ categoria: "", descricao: "", valor: "" });
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  function atualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (salvando) return;
    setErro("");

    const valorNumero = Number(form.valor);
    if (!form.categoria.trim()) {
      setErro("Informe a categoria.");
      return;
    }
    if (!form.descricao.trim()) {
      setErro("Informe a descrição.");
      return;
    }
    if (!valorNumero || Number.isNaN(valorNumero)) {
      setErro("Informe um valor válido.");
      return;
    }

    try {
      setSalvando(true);
      await onSave({
        categoria: form.categoria.trim(),
        descricao: form.descricao.trim(),
        valor: valorNumero,
      });
    } catch (error) {
      // onSave já trata exibição no pai
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#0d0b16] p-6 shadow-2xl border border-white/10">
        <h2 className="text-xl font-bold text-white">Nova Despesa</h2>
        <p className="text-sm text-white/60 mb-4">
          Cadastre rapidamente custos operacionais para manter o fluxo
          financeiro em dia.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm text-white/70">Categoria</label>
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none ring-[#8f5eff]/40 focus:border-[#8f5eff] focus:ring-2"
              value={form.categoria}
              onChange={(e) => atualizar("categoria", e.target.value)}
              placeholder="Ex.: Operacional, Fixas, Impostos"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/70">Descrição</label>
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none ring-[#8f5eff]/40 focus:border-[#8f5eff] focus:ring-2"
              value={form.descricao}
              onChange={(e) => atualizar("descricao", e.target.value)}
              placeholder="Ex.: Conta de energia"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/70">Valor</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none ring-[#8f5eff]/40 focus:border-[#8f5eff] focus:ring-2"
              value={form.valor}
              onChange={(e) => atualizar("valor", e.target.value)}
              placeholder="0,00"
            />
          </div>

          {erro && (
            <div className="rounded-xl border border-red-400/40 bg-red-900/30 px-3 py-2 text-sm text-red-100">
              {erro}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white hover:border-white/40"
              disabled={salvando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-[#8f5eff] to-[#ffe8a3] px-4 py-2 text-sm font-semibold text-black shadow-[0_15px_35px_rgba(143,94,255,0.35)] disabled:opacity-70"
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
