import { useEffect, useState } from "react";

const STATUS_OPTIONS = [
  { value: "aberta", label: "Aberta" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluida", label: "Concluída" },
];

const defaultForm = {
  cliente_nome: "",
  cliente_telefone: "",
  aparelho: "",
  imei: "",
  problema_relatado: "",
  senha_aparelho: "",
  valor_orcado: "",
  valor_final: "",
  status: "aberta",
  observacoes: "",
};

export default function OsForm({ initialData, onCancel, onSave, loading }) {
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (initialData) {
      setForm({
        ...defaultForm,
        ...initialData,
        valor_orcado: initialData.valor_orcado ?? "",
        valor_final: initialData.valor_final ?? "",
      });
    } else {
      setForm(defaultForm);
    }
  }, [initialData]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      valor_orcado: form.valor_orcado ? Number(form.valor_orcado) : 0,
      valor_final: form.valor_final ? Number(form.valor_final) : null,
    };
    onSave?.(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate-300">Nome do cliente</label>
          <input
            className="rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-2 text-slate-100 focus:ring-2 focus:ring-indigo-500"
            value={form.cliente_nome}
            onChange={handleChange("cliente_nome")}
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate-300">Telefone</label>
          <input
            className="rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-2 text-slate-100 focus:ring-2 focus:ring-indigo-500"
            value={form.cliente_telefone}
            onChange={handleChange("cliente_telefone")}
            placeholder="(11) 99999-9999"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate-300">Aparelho</label>
          <input
            className="rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-2 text-slate-100"
            value={form.aparelho}
            onChange={handleChange("aparelho")}
            placeholder="Ex: iPhone 13 Pro"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate-300">IMEI</label>
          <input
            className="rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-2 text-slate-100"
            value={form.imei}
            onChange={handleChange("imei")}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate-300">Senha do aparelho</label>
          <input
            className="rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-2 text-slate-100"
            value={form.senha_aparelho}
            onChange={handleChange("senha_aparelho")}
            placeholder="Opcional"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate-300">Status</label>
          <select
            className="rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-2 text-slate-100"
            value={form.status}
            onChange={handleChange("status")}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate-300">Valor orçado</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-2 text-slate-100"
            value={form.valor_orcado}
            onChange={handleChange("valor_orcado")}
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate-300">Valor final</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-2 text-slate-100"
            value={form.valor_final}
            onChange={handleChange("valor_final")}
            placeholder="Preencha quando concluir"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-300">Problema relatado</label>
        <textarea
          className="rounded-2xl bg-slate-900/70 border border-slate-700 px-4 py-3 text-slate-100 min-h-[120px]"
          value={form.problema_relatado}
          onChange={handleChange("problema_relatado")}
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-300">Observações internas</label>
        <textarea
          className="rounded-2xl bg-slate-900/70 border border-slate-700 px-4 py-3 text-slate-100 min-h-[120px]"
          value={form.observacoes}
          onChange={handleChange("observacoes")}
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 rounded-xl border border-slate-700 text-slate-200 hover:bg-slate-800"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold"
        >
          {loading ? "Salvando..." : initialData ? "Atualizar OS" : "Criar OS"}
        </button>
      </div>
    </form>
  );
}
