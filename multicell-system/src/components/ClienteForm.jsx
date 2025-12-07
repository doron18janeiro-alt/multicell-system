import { useState } from "react";

export default function ClienteForm({ initialData, onSubmit, onCancel }) {
  const [form, setForm] = useState(
    initialData || {
      nome: "",
      telefone: "",
      email: "",
      cpf: "",
    }
  );

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function submit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={submit} className="border p-4 rounded bg-gray-50 space-y-3">
      <h2 className="font-semibold">
        {initialData ? "Editar Cliente" : "Novo Cliente"}
      </h2>

      <input
        name="nome"
        className="border p-2 rounded w-full"
        placeholder="Nome"
        value={form.nome}
        onChange={handleChange}
        required
      />

      <input
        name="telefone"
        className="border p-2 rounded w-full"
        placeholder="Telefone"
        value={form.telefone}
        onChange={handleChange}
      />

      <input
        name="email"
        className="border p-2 rounded w-full"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
      />

      <input
        name="cpf"
        className="border p-2 rounded w-full"
        placeholder="CPF"
        value={form.cpf}
        onChange={handleChange}
        required
      />

      <div className="flex gap-3">
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded"
          type="submit"
        >
          Salvar
        </button>
        {initialData && (
          <button
            className="bg-gray-300 px-3 py-1 rounded"
            type="button"
            onClick={onCancel}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
