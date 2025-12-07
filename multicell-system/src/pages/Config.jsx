import { useEffect, useState } from "react";
import { getConfig, saveConfig } from "../services/configService";

const themes = [
  { value: "multicell", label: "Multicell" },
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
];

const defaultForm = () => ({
  nome_loja: "",
  cnpj: "",
  telefone: "",
  email: "",
  endereco: "",
  cidade: "",
  uf: "",
  tema: "multicell",
});

export default function Config() {
  const [form, setForm] = useState(() => defaultForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [persistedData, setPersistedData] = useState(null);

  useEffect(() => {
    async function loadConfig() {
      setLoading(true);
      const { data, error } = await getConfig();
      if (error) {
        setFeedback({
          type: "error",
          text: "Não foi possível carregar as configurações.",
        });
      }
      if (data) {
        setForm({
          nome_loja: data.nome_loja || "",
          cnpj: data.cnpj || "",
          telefone: data.telefone || "",
          email: data.email || "",
          endereco: data.endereco || "",
          cidade: data.cidade || "",
          uf: data.uf || "",
          tema: data.tema || "multicell",
        });
        setPersistedData(data);
      }
      setLoading(false);
    }

    loadConfig();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);
    const payload = { ...form };
    if (persistedData?.created_at) {
      payload.created_at = persistedData.created_at;
    }
    const { error, data } = await saveConfig(payload);
    setSaving(false);
    if (error) {
      setFeedback({
        type: "error",
        text: error.message || "Falha ao salvar configurações.",
      });
      return;
    }
    setFeedback({ type: "success", text: "Configurações salvas com sucesso." });
    setPersistedData(data);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.4em] text-slate-500">
          Sistema
        </p>
        <h1 className="text-3xl font-black text-white">Configurações</h1>
        <p className="text-slate-400">
          Personalize os dados da sua loja e o tema básico da plataforma.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Nome da loja
            </label>
            <input
              type="text"
              className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-2 text-slate-100"
              value={form.nome_loja}
              onChange={(event) =>
                handleChange("nome_loja", event.target.value)
              }
              placeholder="Multicell Store"
              disabled={loading || saving}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              CNPJ
            </label>
            <input
              type="text"
              className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-2 text-slate-100"
              value={form.cnpj}
              onChange={(event) => handleChange("cnpj", event.target.value)}
              placeholder="00.000.000/0000-00"
              disabled={loading || saving}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Telefone
            </label>
            <input
              type="text"
              className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-2 text-slate-100"
              value={form.telefone}
              onChange={(event) => handleChange("telefone", event.target.value)}
              placeholder="(00) 0000-0000"
              disabled={loading || saving}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Email
            </label>
            <input
              type="email"
              className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-2 text-slate-100"
              value={form.email}
              onChange={(event) => handleChange("email", event.target.value)}
              placeholder="contato@multicell.com"
              disabled={loading || saving}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Endereço
            </label>
            <input
              type="text"
              className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-2 text-slate-100"
              value={form.endereco}
              onChange={(event) => handleChange("endereco", event.target.value)}
              placeholder="Rua, número, bairro"
              disabled={loading || saving}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Cidade
            </label>
            <input
              type="text"
              className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-2 text-slate-100"
              value={form.cidade}
              onChange={(event) => handleChange("cidade", event.target.value)}
              placeholder="Cidade"
              disabled={loading || saving}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              UF
            </label>
            <input
              type="text"
              maxLength={2}
              className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-2 text-slate-100 uppercase"
              value={form.uf}
              onChange={(event) => handleChange("uf", event.target.value)}
              placeholder="UF"
              disabled={loading || saving}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Tema
            </label>
            <select
              className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-2 text-slate-100"
              value={form.tema}
              onChange={(event) => handleChange("tema", event.target.value)}
              disabled={loading || saving}
            >
              {themes.map((theme) => (
                <option key={theme.value} value={theme.value}>
                  {theme.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {feedback && (
          <div
            className={`rounded-xl border px-4 py-2 text-sm ${
              feedback.type === "error"
                ? "border-rose-700 bg-rose-900/40 text-rose-100"
                : "border-emerald-600/70 bg-emerald-500/10 text-emerald-200"
            }`}
          >
            {feedback.text}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 disabled:opacity-70"
            disabled={saving || loading}
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
