import { useEffect, useState } from "react";

const defaultForm = () => ({
  nome: "",
  codigo: "",
  categoria: "",
  preco_custo: "",
  preco_venda: "",
  quantidade: "",
  observacoes: "",
});

export default function ProdutoForm({
  initialData,
  onSave,
  onCancel,
  loading,
}) {
  const [form, setForm] = useState(() => defaultForm());
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        nome: initialData.nome || "",
        codigo: initialData.codigo || "",
        categoria: initialData.categoria || "",
        preco_custo: initialData.preco_custo ?? "",
        preco_venda: initialData.preco_venda ?? "",
        quantidade: initialData.quantidade ?? "",
        observacoes: initialData.observacoes || "",
      });
    } else {
      setForm(defaultForm());
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.nome.trim()) {
      setError("Informe um nome para o produto.");
      return;
    }
    setError(null);
    onSave?.({
      ...form,
      preco_custo: form.preco_custo === "" ? null : Number(form.preco_custo),
      preco_venda: form.preco_venda === "" ? null : Number(form.preco_venda),
      quantidade: form.quantidade === "" ? null : Number(form.quantidade),
    });
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-slate-400">
            Nome
          </label>
          <input
            type="text"
            className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-slate-100"
            value={form.nome}
            onChange={(event) => handleChange("nome", event.target.value)}
            placeholder="Ex: Película iPhone 13"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-slate-400">
            Código
          </label>
          <input
            type="text"
            className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-slate-100"
            value={form.codigo}
            onChange={(event) => handleChange("codigo", event.target.value)}
            placeholder="Opcional"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-slate-400">
            Categoria
          </label>
          <input
            type="text"
            className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-slate-100"
            value={form.categoria}
            onChange={(event) => handleChange("categoria", event.target.value)}
            placeholder="Ex: Acessórios"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-slate-400">
            Quantidade em estoque
          </label>
          <input
            type="number"
            min="0"
            className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-slate-100"
            value={form.quantidade}
            onChange={(event) => handleChange("quantidade", event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-slate-400">
            Preço de custo
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-slate-100"
            value={form.preco_custo}
            onChange={(event) =>
              handleChange("preco_custo", event.target.value)
            }
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-slate-400">
            Preço de venda
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-slate-100"
            value={form.preco_venda}
            onChange={(event) =>
              handleChange("preco_venda", event.target.value)
            }
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-wide text-slate-400">
          Observações
        </label>
        <textarea
          rows={3}
          className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-slate-100"
          value={form.observacoes}
          onChange={(event) => handleChange("observacoes", event.target.value)}
          placeholder="Ex: fornecedor, lote, informações adicionais"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-rose-700 bg-rose-900/40 px-4 py-2 text-sm text-rose-100">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white"
          disabled={loading}
        >
          {loading
            ? "Salvando..."
            : initialData
            ? "Salvar alterações"
            : "Cadastrar"}
        </button>
      </div>
    </form>
  );
}
