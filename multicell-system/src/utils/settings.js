const KEY = "multicell_settings";

const defaults = {
  nome_empresa: "MULTICELL Assistencia Tecnica",
  cnpj: "",
  endereco: "",
  telefone: "",
  whatsapp: "",
  nome_tecnico_responsavel: "",
};

export function getSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch (e) {
    console.error("Erro ao ler settings", e);
    return defaults;
  }
}

export function saveSettings(data) {
  try {
    const merged = { ...defaults, ...data };
    localStorage.setItem(KEY, JSON.stringify(merged));
    return merged;
  } catch (e) {
    console.error("Erro ao salvar settings", e);
    return defaults;
  }
}
