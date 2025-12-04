import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import OsForm from "../components/OsForm";
import TermoGarantia from "../components/TermoGarantia";
import FileUploader from "../components/files/FileUploader";
import { FileGallery } from "../components/files/FileGallery";
import { printElementById, shareElementOnWhatsApp } from "../utils/print";
import { createOs, deleteOs, listOs, updateOs } from "../services/osService";

const statusDictionary = {
  aberta: {
    label: "Aberta",
    badge: "bg-amber-500/20 text-amber-200 border-amber-400/40",
  },
  em_andamento: {
    label: "Em andamento",
    badge: "bg-indigo-500/20 text-indigo-200 border-indigo-400/40",
  },
  concluida: {
    label: "Concluída",
    badge: "bg-emerald-500/20 text-emerald-200 border-emerald-400/40",
  },
};

const statusFilters = [
  { value: "todos", label: "Todos" },
  { value: "aberta", label: "Aberta" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluida", label: "Concluída" },
];

function formatCurrency(value) {
  if (value === null || value === undefined) return "-";
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return "-";
  return numeric.toLocaleString("pt-BR", {
    currency: "BRL",
    style: "currency",
    minimumFractionDigits: 2,
  });
}

function formatDate(iso) {
  if (!iso) return "-";
  const date = new Date(iso);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

export default function OsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("todos");
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [editingOs, setEditingOs] = useState(null);
  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [termOs, setTermOs] = useState(null);

  const debouncedSearch = useDebounced(search, 350);

  const handlePrintOs = () => {
    printElementById("os-print-area", "Ordem de Serviço");
  };

  const handleShareOs = () => {
    if (!selected) return;
    shareElementOnWhatsApp(
      "os-print-area",
      `Ordem de Serviço - ${selected.cliente_nome || "Multicell"}`
    );
  };

  useEffect(() => {
    loadOs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, status]);

  async function loadOs() {
    setLoadingList(true);
    setFeedback("");
    const { data, error } = await listOs({ search: debouncedSearch, status });
    if (error) {
      console.error("Erro ao carregar OS", error);
      setFeedback(error.message);
    }
    setItems(data);
    setLoadingList(false);
  }

  function handleNew() {
    setEditingOs(null);
    setSelected(null);
    setOpenForm(true);
  }

  function handleEdit(os) {
    setEditingOs(os);
    setOpenForm(true);
  }

  async function handleDelete(os) {
    if (!window.confirm(`Deseja realmente excluir a OS de ${os.cliente_nome}?`))
      return;
    const { error } = await deleteOs(os.id);
    if (error) {
      alert(error.message);
      return;
    }
    if (selected?.id === os.id) {
      setSelected(null);
    }
    loadOs();
  }

  function handleOpenTermo(os) {
    setTermOs(os);
  }

  async function handleSave(formValues) {
    setSaving(true);
    const actionPromise = editingOs
      ? updateOs(editingOs.id, formValues)
      : createOs({ ...formValues, data_entrada: new Date().toISOString() });
    const { error } = await actionPromise;
    setSaving(false);
    if (error) {
      alert(error.message);
      return;
    }
    setOpenForm(false);
    setEditingOs(null);
    loadOs();
  }

  const emptyMessage = useMemo(() => {
    if (loadingList) return "Carregando ordens...";
    if (items.length === 0)
      return "Nenhuma OS encontrada para os filtros atuais.";
    return null;
  }, [items.length, loadingList]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-slate-500">
            Operações
          </p>
          <h1 className="text-3xl font-black text-white">Ordens de Serviço</h1>
          <p className="text-slate-400">
            Controle completo de cada aparelho recebido na assistência.
          </p>
        </div>
        <button
          onClick={handleNew}
          className="self-start inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-900/50"
        >
          <span className="text-xl">+</span>
          Nova OS
        </button>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Buscar
            </label>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-2 text-slate-100 focus:ring-2 focus:ring-indigo-500"
              placeholder="Cliente, aparelho ou IMEI"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Status
            </label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-2 text-slate-100"
            >
              {statusFilters.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {feedback && (
          <div className="mt-4 rounded-xl border border-rose-700 bg-rose-900/40 px-4 py-2 text-sm text-rose-100">
            {feedback}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-400">
                <tr className="border-b border-slate-800/80">
                  <th className="px-4 py-3 font-semibold">
                    Cliente / Aparelho
                  </th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Valor orçado</th>
                  <th className="px-4 py-3 font-semibold">Entrada</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {items.map((os) => {
                  const badge =
                    statusDictionary[os.status] || statusDictionary.aberta;
                  return (
                    <tr
                      key={os.id}
                      className="border-b border-slate-800/60 hover:bg-slate-900/80"
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold text-white">
                          {os.cliente_nome}
                        </p>
                        <p className="text-xs text-slate-400">
                          {os.aparelho || "-"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${badge.badge}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-100">
                        {formatCurrency(os.valor_orcado)}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {formatDate(os.data_entrada)}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          className="text-xs rounded-lg border border-slate-700 px-3 py-1 text-slate-200 hover:bg-slate-800"
                          onClick={() => setSelected(os)}
                        >
                          Ver detalhes
                        </button>
                        <button
                          className="text-xs rounded-lg border border-amber-600 px-3 py-1 text-amber-200 hover:bg-amber-600/20"
                          onClick={() => navigate(`/os/${os.id}`)}
                        >
                          Fotos
                        </button>
                        <button
                          className="text-xs rounded-lg border border-indigo-600 px-3 py-1 text-indigo-200 hover:bg-indigo-600/20"
                          onClick={() => handleEdit(os)}
                        >
                          Editar
                        </button>
                        {os.status === "concluida" && (
                          <button
                            className="text-xs rounded-lg border border-emerald-600 px-3 py-1 text-emerald-200 hover:bg-emerald-600/20"
                            onClick={() => handleOpenTermo(os)}
                          >
                            Termo de Garantia
                          </button>
                        )}
                        <button
                          className="text-xs rounded-lg border border-rose-700 px-3 py-1 text-rose-200 hover:bg-rose-900/30"
                          onClick={() => handleDelete(os)}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {emptyMessage && (
            <p className="px-4 py-6 text-center text-sm text-slate-400">
              {emptyMessage}
            </p>
          )}
        </section>

        <aside className="space-y-6">
          {openForm && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    {editingOs ? "Editar OS" : "Nova OS"}
                  </p>
                  <h2 className="text-xl font-semibold text-white">
                    {editingOs ? editingOs.cliente_nome : "Cadastro"}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setOpenForm(false);
                    setEditingOs(null);
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="mt-4">
                <OsForm
                  initialData={editingOs || null}
                  onCancel={() => {
                    setOpenForm(false);
                    setEditingOs(null);
                  }}
                  onSave={handleSave}
                  loading={saving}
                />
              </div>
            </div>
          )}

          {selected && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Detalhes
                  </p>
                  <h2 className="text-xl font-semibold text-white">
                    {selected.cliente_nome}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-gold" onClick={handlePrintOs}>
                    Imprimir OS
                  </button>
                  <button
                    className="btn-gold btn-ghost"
                    onClick={handleShareOs}
                  >
                    Compartilhar
                  </button>
                  <button
                    className="text-slate-500"
                    onClick={() => setSelected(null)}
                  >
                    Fechar
                  </button>
                </div>
              </div>
              <div
                id="os-print-area"
                className="mt-4 space-y-3 text-sm text-slate-200"
              >
                <dl className="space-y-3">
                  <div className="flex justify-between gap-4 border-b border-slate-800 pb-2">
                    <dt className="text-slate-400">Aparelho</dt>
                    <dd className="text-right">{selected.aparelho || "-"}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-slate-800 pb-2">
                    <dt className="text-slate-400">IMEI</dt>
                    <dd className="text-right">{selected.imei || "-"}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-slate-800 pb-2">
                    <dt className="text-slate-400">Problema</dt>
                    <dd className="text-right text-slate-100">
                      {selected.problema_relatado}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-slate-800 pb-2">
                    <dt className="text-slate-400">Senha</dt>
                    <dd className="text-right">
                      {selected.senha_aparelho || "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-slate-800 pb-2">
                    <dt className="text-slate-400">Observações</dt>
                    <dd className="text-right text-slate-100">
                      {selected.observacoes || "Sem observações"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-slate-800 pb-2">
                    <dt className="text-slate-400">Valor final</dt>
                    <dd className="text-right">
                      {formatCurrency(selected.valor_final)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">Entrega</dt>
                    <dd className="text-right">
                      {selected.data_entrega
                        ? formatDate(selected.data_entrega)
                        : "—"}
                    </dd>
                  </div>
                </dl>
              </div>

              <FileUploader
                folder={`os/${selected.id}`}
                onUploaded={(file) => console.log("Foto enviada:", file)}
              />
              <FileGallery ownerType="os" ownerId={selected.id} />
            </div>
          )}

          {!openForm && !selected && (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-5 text-center text-sm text-slate-400">
              Selecione uma OS para ver detalhes ou clique em "Nova OS" para
              cadastrar.
            </div>
          )}
        </aside>
      </div>

      {termOs && (
        <div className="fixed inset-0 z-40 flex items-center justify-center print:static print:block">
          <div
            className="absolute inset-0 bg-slate-950/70 print:hidden"
            onClick={() => setTermOs(null)}
          />
          <div className="relative z-10 w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl print:w-full print:max-w-none print:rounded-none print:border-0 print:bg-transparent print:p-0 print:shadow-none">
            <div className="flex items-center justify-between print:hidden">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                  Termo de Garantia
                </p>
                <h2 className="text-2xl font-semibold text-white">
                  {termOs.cliente_nome}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200"
                  onClick={() => window.print()}
                >
                  Imprimir
                </button>
                <button
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200"
                  onClick={() => setTermOs(null)}
                >
                  Fechar
                </button>
              </div>
            </div>
            <div className="mt-6 rounded-2xl bg-white p-6 text-slate-900 print:p-0">
              <TermoGarantia os={termOs} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function useDebounced(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
