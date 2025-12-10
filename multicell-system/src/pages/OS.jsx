import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Filter, Plus, Printer, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TermoGarantia from "@/components/TermoGarantia.jsx";
import FileUploader from "@/components/files/FileUploader.jsx";
import FileGallery from "@/components/files/FileGallery.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { imprimirHtmlEmNovaJanela } from "../utils/impressao";
import { compartilharWhatsApp } from "../utils/whatsapp";
import { deleteOs, listOs } from "@/services/os";
import PrimeCard from "@/components/ui/PrimeCard.jsx";
import PrimeButton from "@/components/ui/PrimeButton.jsx";
import PrimeInput from "@/components/ui/PrimeInput.jsx";
import PrimeSectionTitle from "@/components/ui/PrimeSectionTitle.jsx";

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
  const { proprietarioId, loading: authLoading } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("todos");
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loadingList, setLoadingList] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [termOs, setTermOs] = useState(null);
  const [galleryKey, setGalleryKey] = useState(0);
  const [fotosOs, setFotosOs] = useState([]);

  useEffect(() => {
    setGalleryKey(0);
    setFotosOs([]);
  }, [selected?.id]);

  const debouncedSearch = useDebounced(search, 350);

  function handleImprimirOs() {
    if (!selected) {
      alert("Selecione uma OS para imprimir.");
      return;
    }

    const dataEntrada = selected.data_entrada
      ? new Date(selected.data_entrada).toLocaleString("pt-BR")
      : "-";
    const valorEstimado = selected.valor_orcado ?? selected.valor_final ?? 0;
    const statusLabel =
      statusDictionary[selected.status]?.label || selected.status || "-";
    const fotoPrincipal = fotosOs[0]?.url_publica || fotosOs[0] || "";

    const html = `
      <div class="cupom">
        <h2>ORDEM DE SERVIÇO</h2>
        <div class="divisor"></div>

        <div class="linha">
          <span>OS: ${selected.id}</span>
          <span>Data: ${dataEntrada}</span>
        </div>
        <div class="linha">
          <span>Status:</span>
          <span>${statusLabel}</span>
        </div>

        <div class="divisor"></div>
        <div>
          <strong>Cliente:</strong> ${selected.cliente_nome || "-"}<br/>
          <strong>Telefone:</strong> ${
            selected.cliente_telefone || selected.telefone_cliente || "-"
          }
        </div>

        <div class="divisor"></div>
        <div>
          <strong>Aparelho:</strong> ${selected.aparelho || "-"}<br/>
          <strong>IMEI:</strong> ${selected.imei || "-"}
        </div>

        <div class="divisor"></div>
        <div>
          <strong>Serviço:</strong> ${
            selected.servico || selected.problema_relatado || "-"
          }<br/>
          <strong>Valor estimado:</strong> ${formatCurrency(valorEstimado)}
        </div>

        ${
          fotoPrincipal
            ? `
        <div class="divisor"></div>
        <div class="texto-centro">
          <img src="${fotoPrincipal}" class="foto-principal" />
          <div>Foto do aparelho na entrada</div>
        </div>
        `
            : ""
        }

        ${
          selected.observacoes
            ? `
        <div class="divisor"></div>
        <p><strong>Observações:</strong> ${selected.observacoes}</p>
        `
            : ""
        }

        <div class="divisor"></div>
        <p>
          Declaro que estou ciente das condições de orçamento, prazo e garantia desta ordem de serviço.
        </p>

        <div class="divisor"></div>
        <div class="texto-centro">
          ________________________________<br/>
          Assinatura do cliente
        </div>
      </div>
    `;

    imprimirHtmlEmNovaJanela({
      titulo: "Ordem de Serviço",
      conteudoHtml: html,
    });
  }

  function handleCompartilharOsWhatsapp() {
    if (!selected) {
      alert("Selecione uma OS para compartilhar.");
      return;
    }

    const telefone =
      selected.cliente_telefone || selected.telefone_cliente || "";
    const telefoneLimpo = telefone ? telefone.replace(/\D/g, "") : "";
    const msg = `Olá, ${selected.cliente_nome || "cliente"}! Sua OS #${
      selected.id
    } do aparelho ${selected.aparelho || "-"} está com status ${
      statusDictionary[selected.status]?.label || selected.status || "-"
    }. Valor estimado: ${formatCurrency(
      selected.valor_orcado ?? selected.valor_final ?? 0
    )}.`;

    compartilharWhatsApp({
      telefone: telefoneLimpo || undefined,
      mensagem: msg,
    });
  }

  useEffect(() => {
    if (!proprietarioId) return;
    loadOs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, status, proprietarioId]);

  async function loadOs() {
    if (!proprietarioId) {
      setFeedback("Sessão expirada. Faça login novamente.");
      setItems([]);
      return;
    }
    setLoadingList(true);
    setFeedback("");
    const { data, error } = await listOs(proprietarioId, {
      search: debouncedSearch,
      status,
    });
    if (error) {
      const mensagem =
        error?.message || error || "Não foi possível listar as OS.";
      console.error("OS:erro", mensagem);
      setFeedback(mensagem);
      window.alert(mensagem);
      setItems([]);
      setLoadingList(false);
      return;
    }
    setItems(data || []);
    setLoadingList(false);
  }

  async function handleDelete(os) {
    if (!window.confirm(`Deseja realmente excluir a OS de ${os.cliente_nome}?`))
      return;
    const { error } = await deleteOs(os.id, proprietarioId);
    if (error) {
      const mensagem =
        error?.message || error || "Não foi possível excluir a OS.";
      alert(mensagem);
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

  const emptyMessage = useMemo(() => {
    if (loadingList) return "Carregando ordens...";
    if (items.length === 0)
      return "Nenhuma OS encontrada para os filtros atuais.";
    return null;
  }, [items.length, loadingList]);

  if (authLoading) {
    return (
      <PrimeCard className="text-sm text-white/70">
        Validando sessão...
      </PrimeCard>
    );
  }

  if (!proprietarioId) {
    return (
      <PrimeCard className="text-sm text-white/70">
        Faça login para gerenciar as ordens de serviço.
      </PrimeCard>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <PrimeSectionTitle
          title="Ordens de serviço"
          subtitle="Controle completo de cada aparelho recebido, do check-in à entrega."
          icon={ClipboardList}
          className="flex-1"
        />
        <PrimeButton
          onClick={() =>
            alert("Cadastro/edição de OS não está disponível neste build.")
          }
          className="self-start lg:self-auto"
        >
          <Plus size={18} /> Nova OS
        </PrimeButton>
      </div>

      <PrimeCard className="space-y-6">
        <div className="flex items-center gap-3 text-[#cdb88d]">
          <Filter size={18} />
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">
            Filtros inteligentes
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <PrimeInput
            label="Buscar"
            placeholder="Cliente, aparelho ou IMEI"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <PrimeInput
            as="select"
            label="Status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {statusFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </PrimeInput>
        </div>
        {feedback && (
          <PrimeCard className="border-red-400/40 bg-red-900/40 text-red-100">
            {feedback}
          </PrimeCard>
        )}
      </PrimeCard>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <PrimeCard className="p-0">
          <div className="overflow-x-auto">
            <table className="table-premium w-full text-sm">
              <thead>
                <tr>
                  <th className="px-4">Cliente / Aparelho</th>
                  <th>Status</th>
                  <th>Valor orçado</th>
                  <th>Entrada</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((os) => {
                  const badge =
                    statusDictionary[os.status] || statusDictionary.aberta;
                  return (
                    <tr key={os.id}>
                      <td className="px-4">
                        <p className="font-semibold text-white">
                          {os.cliente_nome}
                        </p>
                        <p className="text-xs text-white/60">
                          {os.aparelho || "-"}
                        </p>
                      </td>
                      <td>
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${badge.badge}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="text-[#ffe8a3]">
                        {formatCurrency(os.valor_orcado)}
                      </td>
                      <td className="text-white/70">
                        {formatDate(os.data_entrada)}
                      </td>
                      <td>
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <button
                            className="rounded-2xl border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80 hover:border-white/40"
                            onClick={() => setSelected(os)}
                          >
                            Ver detalhes
                          </button>
                          <button
                            className="rounded-2xl border border-[#ffe8a3]/40 bg-white/5 px-3 py-1 text-xs text-[#ffe8a3] hover:border-[#ffe8a3]/80"
                            onClick={() => navigate(`/os/${os.id}`)}
                          >
                            Fotos
                          </button>
                          <button
                            className="rounded-2xl border border-[#8f5eff]/40 bg-white/5 px-3 py-1 text-xs text-[#c6b5ff] hover:border-[#8f5eff]/80"
                            onClick={() =>
                              alert(
                                "Edição de OS não está disponível neste build."
                              )
                            }
                          >
                            Editar
                          </button>
                          {os.status === "concluida" && (
                            <button
                              className="rounded-2xl border border-emerald-500/40 bg-white/5 px-3 py-1 text-xs text-emerald-200 hover:border-emerald-400/80"
                              onClick={() => handleOpenTermo(os)}
                            >
                              Termo
                            </button>
                          )}
                          <button
                            className="rounded-2xl border border-red-500/40 bg-white/5 px-3 py-1 text-xs text-red-200 hover:border-red-400/80"
                            onClick={() => handleDelete(os)}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {emptyMessage && (
            <p className="px-6 py-5 text-center text-sm text-white/60">
              {emptyMessage}
            </p>
          )}
        </PrimeCard>

        <div className="space-y-6">
          {selected && (
            <PrimeCard className="space-y-5">
              <div className="flex flex-col gap-3">
                <p className="text-xs uppercase tracking-[0.35em] text-[#cdb88d]">
                  Detalhes
                </p>
                <div className="flex flex-col gap-3">
                  <h2 className="text-2xl font-semibold text-white">
                    {selected.cliente_nome}
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    <PrimeButton variant="ghost" onClick={handleImprimirOs}>
                      <Printer size={16} /> Imprimir
                    </PrimeButton>
                    <PrimeButton
                      variant="ghost"
                      onClick={handleCompartilharOsWhatsapp}
                    >
                      <Share2 size={16} /> WhatsApp
                    </PrimeButton>
                    <button
                      className="rounded-2xl border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70"
                      onClick={() => setSelected(null)}
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </div>
              <div
                id="os-print-area"
                className="space-y-3 text-sm text-white/80"
              >
                <dl className="space-y-3">
                  <div className="grid grid-cols-2 items-center border-b border-white/10 pb-2 text-right">
                    <dt className="text-left text-white/60">Aparelho</dt>
                    <dd>{selected.aparelho || "-"}</dd>
                  </div>
                  <div className="grid grid-cols-2 items-center border-b border-white/10 pb-2 text-right">
                    <dt className="text-left text-white/60">IMEI</dt>
                    <dd>{selected.imei || "-"}</dd>
                  </div>
                  <div className="grid grid-cols-2 items-center border-b border-white/10 pb-2 text-right">
                    <dt className="text-left text-white/60">Problema</dt>
                    <dd>{selected.problema_relatado}</dd>
                  </div>
                  <div className="grid grid-cols-2 items-center border-b border-white/10 pb-2 text-right">
                    <dt className="text-left text-white/60">Senha</dt>
                    <dd>{selected.senha_aparelho || "—"}</dd>
                  </div>
                  <div className="grid grid-cols-2 items-center border-b border-white/10 pb-2 text-right">
                    <dt className="text-left text-white/60">Observações</dt>
                    <dd>{selected.observacoes || "Sem observações"}</dd>
                  </div>
                  <div className="grid grid-cols-2 items-center border-b border-white/10 pb-2 text-right">
                    <dt className="text-left text-white/60">Valor final</dt>
                    <dd>{formatCurrency(selected.valor_final)}</dd>
                  </div>
                  <div className="grid grid-cols-2 items-center text-right">
                    <dt className="text-left text-white/60">Entrega</dt>
                    <dd>
                      {selected.data_entrega
                        ? formatDate(selected.data_entrega)
                        : "—"}
                    </dd>
                  </div>
                </dl>
              </div>

              <PrimeCard className="border-white/5 bg-white/5">
                <h3 className="text-lg font-semibold text-white">
                  Fotos da ordem de serviço
                </h3>
                <p className="text-sm text-white/70">
                  Registre o estado do aparelho antes e depois para manter o
                  histórico visual.
                </p>
                <div className="mt-4 space-y-4">
                  <FileUploader
                    entidade="os"
                    entidadeId={selected.id}
                    onUploaded={(lista) => {
                      setFotosOs(lista || []);
                      setGalleryKey((prev) => prev + 1);
                    }}
                  />
                  <FileGallery
                    key={`${selected.id}-${galleryKey}`}
                    entidade="os"
                    entidadeId={selected.id}
                    allowDelete
                    onChange={(lista) => setFotosOs(lista || [])}
                  />
                </div>
              </PrimeCard>
            </PrimeCard>
          )}

          {!selected && (
            <PrimeCard className="border-dashed border-white/20 bg-transparent text-center text-sm text-white/60">
              Selecione uma OS para ver detalhes ou clique em “Nova OS” para
              cadastrar.
            </PrimeCard>
          )}
        </div>
      </div>

      {termOs && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm print:static print:block">
          <div
            className="absolute inset-0 print:hidden"
            onClick={() => setTermOs(null)}
          />
          <div className="relative z-10 w-full max-w-4xl rounded-[14px] border border-slate-200 bg-white p-6 shadow-2xl text-slate-900 print:w-full print:max-w-none print:rounded-none print:border-0 print:bg-transparent print:p-0 print:shadow-none">
            <div className="flex items-center justify-between print:hidden">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                  Termo de Garantia
                </p>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {termOs.cliente_nome}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-200"
                  onClick={() => window.print()}
                >
                  Imprimir
                </button>
                <button
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-200"
                  onClick={() => setTermOs(null)}
                >
                  Fechar
                </button>
              </div>
            </div>
            <div className="mt-6 rounded-[12px] bg-white p-0 text-slate-900 print:p-0">
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
