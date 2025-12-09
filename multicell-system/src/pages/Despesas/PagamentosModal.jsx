import React, { useEffect, useMemo } from "react";

const formas = ["pix", "boleto", "credito", "debito"];

export default function PagamentosModal({ despesa, open, onClose, onConfirm }) {
  const [form, setForm] = React.useState({
    valor: "",
    data: new Date().toISOString().slice(0, 10),
    forma: "pix",
    observacao: "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        valor: "",
        data: new Date().toISOString().slice(0, 10),
        forma: "pix",
        observacao: "",
      });
    }
  }, [open]);

  const restante = useMemo(() => despesa.valor - despesa.total_pago, [despesa]);

  if (!open) return null;

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const pagamento = {
      valor_pago: Number(form.valor),
      data_pagamento: form.data,
      forma_pagamento: form.forma,
      observacao: form.observacao,
    };
    onConfirm(pagamento);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-[14px] bg-white text-slate-900 shadow-xl border border-slate-200 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-1">Registrar pagamento</h2>
        <p className="text-sm text-slate-600 mb-4">
          Restante: <strong>R$ {restante.toFixed(2)}</strong>
        </p>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm text-slate-700">Valor</label>
            <input
              type="number"
              name="valor"
              step="0.01"
              min="0.01"
              max={restante}
              value={form.valor}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-slate-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-700">Data</label>
            <input
              type="date"
              name="data"
              value={form.data}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-slate-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-700">Forma</label>
            <select
              name="forma"
              value={form.forma}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {formas.map((forma) => (
                <option key={forma} value={forma}>
                  {forma.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-700">Observação</label>
            <textarea
              name="observacao"
              value={form.observacao}
              onChange={handleChange}
              rows="3"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-slate-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 disabled:opacity-60"
              disabled={!form.valor}
            >
              Confirmar pagamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
