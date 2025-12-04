import { useEffect, useMemo, useState } from "react";
import { Printer, RefreshCw, ShieldCheck } from "lucide-react";
import { FileGallery } from "../components/files/FileGallery";
import { supabase } from "../supabaseClient";
import { printElementById } from "../utils/print";

const garantiaStyles = `
  .garantia-shell {
    position: relative;
    min-height: 100vh;
    padding-bottom: 4rem;
  }

  .garantia-shell::before,
  .garantia-shell::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .garantia-shell::before {
    background: radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.45), transparent 60%),
                radial-gradient(circle at 70% 0%, rgba(236, 72, 153, 0.35), transparent 55%),
                #010311;
    opacity: 0.9;
  }

  .garantia-shell::after {
    background-image:
      linear-gradient(rgba(148, 163, 184, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(148, 163, 184, 0.04) 1px, transparent 1px);
    background-size: 120px 120px;
    mix-blend-mode: screen;
    opacity: 0.5;
  }

  .garantia-content {
    position: relative;
    z-index: 1;
    padding: 3rem 1.5rem;
  }

  .garantia-hero {
    border-radius: 36px;
    padding: 3rem;
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(2, 6, 23, 0.7);
    box-shadow: 0 35px 120px rgba(2, 6, 23, 0.8);
    backdrop-filter: blur(28px);
  }

  .garantia-panel,
  .garantia-preview {
    border-radius: 32px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(2, 6, 23, 0.72);
    box-shadow: 0 30px 100px rgba(3, 7, 18, 0.75);
    backdrop-filter: blur(26px);
    padding: 2.5rem;
  }

  .garantia-form-grid {
    display: grid;
    gap: 1.2rem;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  .garantia-form-grid .full {
    grid-column: 1 / -1;
  }

  .garantia-input {
    border-radius: 18px;
    border: 1px solid rgba(148, 163, 184, 0.2);
    background: rgba(15, 23, 42, 0.7);
    color: #e2e8f0;
    padding: 0.85rem 1.1rem;
    width: 100%;
  }

  .garantia-input:focus {
    outline: 2px solid rgba(59, 130, 246, 0.6);
    background: rgba(15, 23, 42, 0.9);
  }

  .garantia-preview {
    background: linear-gradient(135deg, #f8fafc, #ffffff);
    color: #0f172a;
    border: 1px solid rgba(15, 23, 42, 0.08);
    box-shadow:
      0 40px 120px rgba(2, 6, 23, 0.35),
      inset 0 0 0 1px rgba(255, 255, 255, 0.6);
  }

  .garantia-preview section + section {
    margin-top: 1.75rem;
  }

  .garantia-preview .section-title {
    font-size: 0.9rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: #475569;
    margin-bottom: 0.5rem;
  }

  .garantia-preview .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 0.85rem;
  }

  .garantia-preview .grid .full {
    grid-column: 1 / -1;
  }

  .garantia-preview .label {
    display: block;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.25em;
    color: #94a3b8;
    margin-bottom: 0.1rem;
  }

  .garantia-preview .value {
    font-weight: 600;
    color: #0f172a;
  }

  .assinaturas {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
  }

  .assinaturas .line {
    border-top: 1px solid rgba(15, 23, 42, 0.4);
    padding-top: 0.75rem;
    text-align: center;
    font-size: 0.85rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: #475569;
  }

  .garantia-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .garantia-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 1rem;
    border-radius: 999px;
    border: 1px solid rgba(96, 165, 250, 0.5);
    color: #e0f2fe;
    font-size: 0.75rem;
    letter-spacing: 0.35em;
    text-transform: uppercase;
  }

  .garantia-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border-radius: 16px;
    border: 1px solid rgba(148, 163, 184, 0.3);
    padding: 0.85rem 1.4rem;
    color: #e2e8f0;
    background: rgba(15, 23, 42, 0.6);
  }

  .garantia-btn.primary {
    border-color: transparent;
    background: linear-gradient(110deg, #7c3aed, #2563eb, #0ea5e9);
    color: white;
    box-shadow: 0 20px 45px rgba(14, 165, 233, 0.35);
  }

  .garantia-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .garantia-alert {
    border-radius: 18px;
    background: rgba(244, 63, 94, 0.12);
    border: 1px solid rgba(248, 113, 113, 0.4);
    color: #fecdd3;
    padding: 0.9rem 1rem;
  }

  @media print {
    body {
      background: white;
    }

    .garantia-shell::before,
    .garantia-shell::after,
    .garantia-hero,
    .garantia-panel,
    .garantia-actions,
    .garantia-chip,
    .garantia-alert {
      display: none !important;
    }

    #garantia-impressao {
      box-shadow: none !important;
      border: none !important;
      padding: 0;
      background: white !important;
      color: #0f172a;
    }
  }
`;

const empresaDefaults = {
  empresaNome: "Multicell System",
  empresaCnpj: "00.000.000/0000-00",
  empresaFone: "(43) 9 8800-0000",
  empresaEndereco: "Rua da Tecnologia, 450 - Centro, Londrina/PR",
  prazo: "90 dias",
};

const camposIniciais = {
  empresaNome: "",
  empresaCnpj: "",
  empresaFone: "",
  empresaEndereco: "",
  clienteNome: "",
  clienteFone: "",
  aparelho: "",
  imei: "",
  servico: "",
  valor: "",
  prazo: "",
  data: "",
  tecnico: "",
  condicoes: "",
};

const condicoesPadrao =
  "Garantia válida exclusivamente para o serviço descrito, por prazo determinado, com perda automática em casos de impacto, oxidação, violação de lacres, intervenção de terceiros ou mau uso do equipamento.";

function gerarProtocoloGarantia() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const sequencia = Math.floor(agora.getTime() % 100000);
  return `GAR-${ano}-${String(sequencia).padStart(5, "0")}`;
}

function formatDateBr(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
}

export default function TermoGarantia() {
  const [form, setForm] = useState({ ...camposIniciais, ...empresaDefaults });
  const [protocolo, setProtocolo] = useState("GAR-00000");
  const [emitidoEm, setEmitidoEm] = useState("");
  const [osList, setOsList] = useState([]);
  const [loadingOs, setLoadingOs] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [selectedOsId, setSelectedOsId] = useState("");
  const osSelecionada = useMemo(
    () =>
      osList.find((item) => String(item.id) === String(selectedOsId)) || null,
    [osList, selectedOsId]
  );

  useEffect(() => {
    carregarOS();
  }, []);

  async function carregarOS() {
    setLoadingOs(true);
    setFeedback("");
    const { data, error } = await supabase
      .from("os")
      .select(
        "id, cliente_nome, cliente_telefone, aparelho, imei, valor_final, valor_orcado, observacoes, problema_relatado, data_entrega, updated_at, data_entrada"
      )
      .eq("status", "concluida")
      .order("updated_at", { ascending: false })
      .limit(30);

    if (error) {
      console.error("[TermoGarantia] Erro ao carregar OS", error);
      setFeedback(
        "Não foi possível carregar OS concluídas. Confira conexão com o Supabase."
      );
    } else {
      setOsList(data || []);
    }
    setLoadingOs(false);
  }

  const handleField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSelectOs = (value) => {
    setSelectedOsId(value);
    const os = osList.find((item) => String(item.id) === String(value));
    if (!os) return;

    const fonteValor = os.valor_final ?? os.valor_orcado ?? "";

    setForm((prev) => ({
      ...prev,
      clienteNome: os.cliente_nome || "",
      clienteFone: os.cliente_telefone || "",
      aparelho: os.aparelho || "",
      imei: os.imei || "",
      servico: os.observacoes || os.problema_relatado || prev.servico,
      valor: fonteValor ? Number(fonteValor).toFixed(2) : "",
      data: (os.data_entrega || os.updated_at || os.data_entrada || "").slice(
        0,
        10
      ),
    }));
  };

  const atualizarPreview = () => {
    setProtocolo(gerarProtocoloGarantia());
    setEmitidoEm(new Date().toLocaleDateString("pt-BR"));
  };

  const handlePrintGarantia = () => {
    if (!emitidoEm) {
      const proceed = window.confirm(
        "Atualize a pré-visualização antes de imprimir para gerar protocolo e data. Deseja continuar assim mesmo?"
      );
      if (!proceed) return;
    }
    printElementById(
      "garantia-print-area",
      "CERTIFICADO DE GARANTIA MULTICELL"
    );
  };

  const preview = useMemo(() => {
    const valorNumerico = Number(
      String(form.valor).replace(/\./g, "").replace(",", ".")
    );
    const valorFmt = Number.isNaN(valorNumerico)
      ? form.valor || "0,00"
      : valorNumerico.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

    return {
      ...form,
      valorFmt,
      protocolo,
      emissao: emitidoEm,
      dataFmt: formatDateBr(form.data),
      condicoes: form.condicoes?.trim() || condicoesPadrao,
    };
  }, [form, protocolo, emitidoEm]);

  return (
    <div className="garantia-shell">
      <style>{garantiaStyles}</style>
      <div className="garantia-content space-y-8">
        <section className="garantia-hero space-y-4">
          <div className="garantia-chip">
            <ShieldCheck size={16} />
            garantia oficial multicell
          </div>
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.4em] text-slate-300">
              Assistência técnica premium
            </p>
            <h1 className="text-3xl md:text-4xl font-black text-white">
              Termo de Garantia cinematográfico
            </h1>
            <p className="text-slate-300 max-w-3xl">
              Gere protocolos assináveis e prontos para impressão em um fluxo
              elegante. Sincronize dados das ordens concluídas, personalize
              condições e entregue confiança para cada cliente.
            </p>
          </div>
          <div className="garantia-actions">
            <button
              type="button"
              className="garantia-btn"
              onClick={carregarOS}
              disabled={loadingOs}
            >
              <RefreshCw
                size={16}
                className={loadingOs ? "animate-spin" : ""}
              />
              Atualizar OS concluídas
            </button>
            <button
              type="button"
              className="btn-gold"
              onClick={handlePrintGarantia}
            >
              <Printer size={18} />
              Imprimir certificado
            </button>
          </div>
        </section>

        <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="garantia-panel space-y-6">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.4em] text-slate-400">
                Preenchimento inteligente
              </p>
              <h2 className="text-2xl font-semibold text-white">
                Dados da garantia
              </h2>
              <p className="text-slate-400">
                Escolha uma OS concluída para pré-preencher os campos ou digite
                manualmente.
              </p>
              <div className="grid gap-3 md:grid-cols-[2fr_auto]">
                <select
                  className="garantia-input"
                  value={selectedOsId}
                  onChange={(event) => handleSelectOs(event.target.value)}
                >
                  <option value="">Selecione uma OS concluída</option>
                  {osList.map((os) => (
                    <option key={os.id} value={os.id}>
                      #{String(os.id).padStart(4, "0")} · {os.cliente_nome} ·{" "}
                      {os.aparelho}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={atualizarPreview}
                  className="garantia-btn w-full md:w-auto justify-center"
                >
                  <ShieldCheck size={16} />
                  Atualizar pré-visualização
                </button>
              </div>
              {feedback && (
                <div className="garantia-alert text-sm">{feedback}</div>
              )}
            </div>

            <div className="garantia-form-grid">
              <div className="full">
                <label className="text-sm text-slate-300">
                  Nome da empresa
                </label>
                <input
                  className="garantia-input"
                  value={form.empresaNome}
                  onChange={handleField("empresaNome")}
                  placeholder="Multicell System"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300">CNPJ</label>
                <input
                  className="garantia-input"
                  value={form.empresaCnpj}
                  onChange={handleField("empresaCnpj")}
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300">Contato</label>
                <input
                  className="garantia-input"
                  value={form.empresaFone}
                  onChange={handleField("empresaFone")}
                  placeholder="(43) 9 8800-0000"
                />
              </div>
              <div className="full">
                <label className="text-sm text-slate-300">Endereço</label>
                <input
                  className="garantia-input"
                  value={form.empresaEndereco}
                  onChange={handleField("empresaEndereco")}
                  placeholder="Rua, número - bairro, cidade/UF"
                />
              </div>

              <div className="full border-t border-white/5 my-2" />

              <div>
                <label className="text-sm text-slate-300">Cliente</label>
                <input
                  className="garantia-input"
                  value={form.clienteNome}
                  onChange={handleField("clienteNome")}
                />
              </div>
              <div>
                <label className="text-sm text-slate-300">Telefone</label>
                <input
                  className="garantia-input"
                  value={form.clienteFone}
                  onChange={handleField("clienteFone")}
                />
              </div>
              <div>
                <label className="text-sm text-slate-300">Aparelho</label>
                <input
                  className="garantia-input"
                  value={form.aparelho}
                  onChange={handleField("aparelho")}
                />
              </div>
              <div>
                <label className="text-sm text-slate-300">
                  IMEI (opcional)
                </label>
                <input
                  className="garantia-input"
                  value={form.imei}
                  onChange={handleField("imei")}
                />
              </div>

              <div className="full">
                <label className="text-sm text-slate-300">
                  Descrição do serviço
                </label>
                <textarea
                  className="garantia-input"
                  rows={3}
                  value={form.servico}
                  onChange={handleField("servico")}
                  placeholder="Ex: troca de tela OLED e revisão completa"
                />
              </div>

              <div>
                <label className="text-sm text-slate-300">Valor (R$)</label>
                <input
                  className="garantia-input"
                  value={form.valor}
                  onChange={handleField("valor")}
                  placeholder="250,00"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300">
                  Prazo de garantia
                </label>
                <input
                  className="garantia-input"
                  value={form.prazo}
                  onChange={handleField("prazo")}
                  placeholder="90 dias"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300">
                  Data do serviço
                </label>
                <input
                  type="date"
                  className="garantia-input"
                  value={form.data}
                  onChange={handleField("data")}
                />
              </div>
              <div>
                <label className="text-sm text-slate-300">
                  Responsável técnico
                </label>
                <input
                  className="garantia-input"
                  value={form.tecnico}
                  onChange={handleField("tecnico")}
                />
              </div>

              <div className="full">
                <label className="text-sm text-slate-300">
                  Condições específicas da garantia
                </label>
                <textarea
                  className="garantia-input"
                  rows={3}
                  value={form.condicoes}
                  onChange={handleField("condicoes")}
                  placeholder={condicoesPadrao}
                />
              </div>
            </div>
          </section>

          <div className="space-y-6">
            <div id="garantia-print-area">
              <section id="garantia-impressao" className="garantia-preview">
                <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 mb-6">
                  <div className="text-sm tracking-[0.35em] text-slate-500 uppercase">
                    Termo de garantia Multicell
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <h2 className="text-2xl font-black text-slate-900">
                      CERTIFICADO DE GARANTIA MULTICELL
                    </h2>
                    <div className="text-right text-sm text-slate-500">
                      Protocolo:{" "}
                      <span className="font-semibold text-slate-900">
                        {preview.protocolo}
                      </span>
                      <br />
                      Emitido em:{" "}
                      <span className="font-semibold text-slate-900">
                        {preview.emissao || "--/--/----"}
                      </span>
                    </div>
                  </div>
                </div>

                <section>
                  <p className="section-title">Dados da empresa</p>
                  <div className="grid">
                    <div>
                      <span className="label">Empresa</span>
                      <span className="value">
                        {preview.empresaNome || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="label">CNPJ</span>
                      <span className="value">
                        {preview.empresaCnpj || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="label">Contato</span>
                      <span className="value">
                        {preview.empresaFone || "-"}
                      </span>
                    </div>
                    <div className="full">
                      <span className="label">Endereço</span>
                      <span className="value">
                        {preview.empresaEndereco || "-"}
                      </span>
                    </div>
                  </div>
                </section>

                <section>
                  <p className="section-title">Cliente e aparelho</p>
                  <div className="grid">
                    <div>
                      <span className="label">Cliente</span>
                      <span className="value">
                        {preview.clienteNome || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="label">Telefone</span>
                      <span className="value">
                        {preview.clienteFone || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="label">Aparelho</span>
                      <span className="value">{preview.aparelho || "-"}</span>
                    </div>
                    <div>
                      <span className="label">IMEI</span>
                      <span className="value">{preview.imei || "-"}</span>
                    </div>
                  </div>
                </section>

                <section>
                  <p className="section-title">Serviço executado</p>
                  <div className="grid">
                    <div className="full">
                      <span className="label">Descrição</span>
                      <span className="value">{preview.servico || "-"}</span>
                    </div>
                    <div>
                      <span className="label">Valor</span>
                      <span className="value">R$ {preview.valorFmt}</span>
                    </div>
                    <div>
                      <span className="label">Prazo da garantia</span>
                      <span className="value">{preview.prazo || "-"}</span>
                    </div>
                    <div>
                      <span className="label">Data do serviço</span>
                      <span className="value">{preview.dataFmt}</span>
                    </div>
                    <div>
                      <span className="label">Responsável técnico</span>
                      <span className="value">{preview.tecnico || "-"}</span>
                    </div>
                  </div>
                </section>

                <section>
                  <p className="section-title">Condições gerais</p>
                  <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-line">
                    {preview.condicoes}
                  </p>
                </section>

                <section className="assinaturas">
                  <div>
                    <div className="line">Assinatura do cliente</div>
                  </div>
                  <div>
                    <div className="line">Responsável técnico</div>
                  </div>
                </section>

                <p className="text-xs text-slate-500 mt-4">
                  Ao assinar, o cliente declara que recebeu o equipamento em
                  perfeito funcionamento e está ciente das condições desta
                  garantia. Documento gerado por Multicell System.
                </p>
              </section>
            </div>

            {osSelecionada && (
              <section className="garantia-panel">
                <FileGallery
                  ownerType="garantia"
                  ownerId={osSelecionada.id}
                  allowDelete={false}
                />
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
