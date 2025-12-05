import { useEffect, useState } from "react";
import {
  listOwners,
  createOwner,
  updateOwner,
  deleteOwner,
} from "../api/ownersService";
import ProprietarioForm from "../components/ProprietarioForm";
import Tabela from "../components/Tabela";

export default function ProprietariosPage() {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);

  async function carregarProprietarios() {
    setLoading(true);
    try {
      const lista = await listOwners({ search });
      setOwners(lista);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarProprietarios();
  }, [search]);

  async function salvar(data) {
    if (editing) {
      await updateOwner(editing.id, data);
    } else {
      await createOwner(data);
    }
    setEditing(null);
    carregarProprietarios();
  }

  async function remover(id) {
    if (!confirm("Excluir proprietário?")) return;
    await deleteOwner(id);
    carregarProprietarios();
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Proprietários</h1>

      <input
        className="border p-2 rounded w-full"
        placeholder="Buscar proprietário..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ProprietarioForm
        key={editing ? editing.id : "novo"}
        initialData={editing}
        onSubmit={salvar}
        onCancel={() => setEditing(null)}
      />

      <Tabela
        loading={loading}
        data={owners}
        columns={[
          { header: "Nome", accessor: "nome" },
          { header: "CPF", accessor: "cpf" },
        ]}
        actions={[
          {
            label: "Editar",
            onClick: (row) => setEditing(row),
          },
          {
            label: "Excluir",
            onClick: (row) => remover(row.id),
          },
        ]}
      />
    </div>
  );
}
