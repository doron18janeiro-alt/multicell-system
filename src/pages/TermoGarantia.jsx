import React, { useCallback, useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import FileUploader from "../components/files/FileUploader";
import FileGallery from "../components/files/FileGallery";
import { supabase } from "../services/supabaseClient";
import { printElementById, shareElementOnWhatsApp } from "../utils/print";
import "../styles/garantia.css";

const TERMOS_GARANTIA = [
  "A garantia cobre exclusivamente o serviço executado e/ou peça substituída na Multicell.",
  "Quaisquer sinais de queda, impacto, oxidação, líquidos ou mau uso anulam o certificado.",
  "A violação de lacres, intervenção de terceiros ou abertura não autorizada invalida a cobertura.",
  "Peças substituídas obedecem ao prazo legal do fornecedor e precisam ser avaliadas em nossa assistência.",
  "Para acionar a garantia, apresente este certificado junto a um documento pessoal.",
];

const CAMPOS_PRINCIPAIS = [
  { label: "Cliente", keys: ["cliente", "cliente_nome", "nome_cliente"] },
  { label: "Contato", keys: ["telefone", "cliente_telefone", "contato"] },
  { label: "Aparelho", keys: ["aparelho", "device", "equipamento"] },
  { label: "IMEI / Série", keys: ["imei", "serial", "numero_serie"] },
  {
    label: "Serviço executado",
    keys: ["servico", "descricao", "servico_executado"],
  },
  { label: "Valor total", keys: ["valor", "valor_total", "valor_servico"] },
  {
    label: "Garantia válida até",
    keys: ["data_validade", "validade", "garantia_fim"],
  },
  {
    label: "Data da entrega",
    keys: ["data_entrega", "entrega", "data_finalizacao"],
  },
  { label: "Responsável técnico", keys: ["tecnico", "responsavel", "usuario"] },
];

const OBS_KEYS = ["obs", "observacoes", "observacao", "notas"];

const PRINT_ROOT_ID = "garantia-print-root";

function getFirstValue(source, keys) {
  if (!source) return "";
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return "";
}

function formatarData(valor) {
  if (!valor) return "—";
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) {
    return String(valor);
  }
  return data.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function formatarDinheiro(valor) {
  if (valor === null || valor === undefined || valor === "") return "—";
  const numero = Number(valor);
  if (Number.isNaN(numero)) return String(valor);
  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

export default function TermoGarantia() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const garantiaState = location.state?.garantia || null;
  const garantiaId =
    params?.id ||
    searchParams.get("id") ||
    location.state?.garantiaId ||
    garantiaState?.id ||
    null;

  const [garantia, setGarantia] = useState(garantiaState);
  const [loading, setLoading] = useState(!garantiaState);
  const [erro, setErro] = useState(null);
  const [sincronizando, setSincronizando] = useState(false);
  const [fotosRegistro, setFotosRegistro] = useState([]);
  const [galleryKey, setGalleryKey] = useState(0);

  const carregarGarantia = useCallback(async () => {
    if (!garantiaId) return null;

    const { data, error } = await supabase
      .from("garantias")
      .select("*")
      .eq("id", garantiaId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }, [garantiaId]);

  useEffect(() => {
    if (garantiaState) {
      setGarantia(garantiaState);
      setLoading(false);
      return;
    }

    if (!garantiaId) {
      setLoading(false);
      return;
    }

    let ignore = false;
    setLoading(true);
    setErro(null);

    carregarGarantia()
      .then((data) => {
        if (ignore || !data) return;
        setGarantia(data);
      })
      .catch((error) => {
        if (ignore) return;
        console.error("[Garantias] erro ao carregar certificado", error);
        setErro("Não encontramos este certificado na base Multicell.");
        setGarantia(null);
      })
      .finally(() => {
        if (ignore) return;
        setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [garantiaId, garantiaState, carregarGarantia]);

  const fotos = fotosRegistro;
  const dataEmissao =
    garantia?.data_entrega || garantia?.created_at || new Date().toISOString();
  const dataEmissaoFormatada = formatarData(dataEmissao);
  const folhaStyle = {
    background: "#ffffff",
    color: "#0f1015",
    borderRadius: "24px",
    padding: "40px",
    boxShadow: "0 25px 65px rgba(0, 0, 0, 0.55)",
    position: "relative",
  };

  const infoListStyle = {
    display: "grid",
    gap: "12px",
    marginBottom: "24px",
  };

  const infoRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    borderBottom: "1px solid rgba(15, 16, 21, 0.08)",
    paddingBottom: "8px",
  };

  const fotosGridStyle = {
    display: "grid",
    gap: "12px",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    marginTop: "12px",
  };

  const handleAtualizarOSConcluidas = async () => {
    if (!garantiaId) return;
    setSincronizando(true);
    setErro(null);

    try {
      const data = await carregarGarantia();
      if (data) {
        setGarantia(data);
      }
    } catch (error) {
      console.error("[Garantias] erro ao sincronizar certificado", error);
      setErro("Não foi possível sincronizar as OS concluídas agora.");
    } finally {
      setSincronizando(false);
    }
  };

  const handlePrintGarantia = () => {
    if (!garantia) return;
    printElementById(PRINT_ROOT_ID);
  };

  const handleShareWhatsapp = () => {
    if (!garantia) return;
    shareElementOnWhatsApp(
      PRINT_ROOT_ID,
      "Certificado de garantia Multicell System"
    );
  };

  return (
    <div className="garantia-container">
      <button className="btn-voltar" onClick={handleVoltar}>
        Voltar
      </button>

      <h1 className="garantia-titulo">CERTIFICADO DE GARANTIA MULTICELL</h1>

      {garantia && (
        <div className="garantia-actions">
          <button
            type="button"
            className="btn-gold"
            onClick={handleAtualizarOSConcluidas}
            disabled={sincronizando}
          >
            {sincronizando ? "Sincronizando..." : "Atualizar OS concluídas"}
          </button>
          <button
            type="button"
            className="btn-gold"
            onClick={handlePrintGarantia}
          >
            Imprimir certificado
          </button>
          <button
            type="button"
            className="btn-gold btn-ghost"
            onClick={handleShareWhatsapp}
          >
            Enviar por WhatsApp
          </button>
        </div>
      )}

      {erro && (
        <div className="card-bloco erro-garantia">
          <h2 className="card-titulo">Ops!</h2>
          <p>{erro}</p>
        </div>
      )}

      {!garantia && (
        <div className="card-bloco">
          <h2 className="card-titulo">Selecione um certificado</h2>
          <p>
            Abra este módulo a partir de uma Ordem de Serviço ou do histórico
            para visualizar os detalhes e registrar fotos do aparelho.
          </p>
        </div>
      )}

      {garantia && (
        <div style={gridWrapperStyle}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "30px" }}
          >
            <div className="card-bloco">
              <h2 className="card-titulo">Informações do serviço</h2>

              {protocolo && (
                <p>
                  <strong>Protocolo:</strong> {protocolo}
                </p>
              )}

              {camposProcessados.map((campo) => (
                <p key={campo.label}>
                  <strong>{campo.label}:</strong> {campo.value}
                </p>
              ))}

              <p>
                <strong>Observações:</strong> {observacoes}
              </p>
            </div>

            <div className="card-bloco">
              <h2 className="card-titulo">Fotos do aparelho</h2>
              <FileUploader
                entidade="garantia"
                entidadeId={garantia.id}
                onUploaded={(lista) => {
                  setFotosRegistro(lista);
                  setGalleryKey((prev) => prev + 1);
                }}
              />
              <FileGallery
                key={`${garantia.id}-${galleryKey}`}
                entidade="garantia"
                entidadeId={garantia.id}
                allowDelete
                onChange={setFotosRegistro}
              />
            </div>
          </div>

          <div>
            <div id={PRINT_ROOT_ID} style={folhaStyle}>
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <p
                  className="muted"
                  style={{
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}
                >
                  Protocolo {protocolo || "—"}
                </p>
                <h2
                  className="garantia-title"
                  style={{ color: "#0f1015", fontSize: "1.5rem" }}
                >
                  CERTIFICADO DE GARANTIA MULTICELL
                </h2>
                <p className="muted">Emitido em {dataEmissaoFormatada}</p>
              </div>

              <div style={infoListStyle}>
                {camposProcessados.map((campo) => (
                  <div key={campo.label} style={infoRowStyle}>
                    <span
                      style={{
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        fontSize: "0.85rem",
                      }}
                    >
                      {campo.label}
                    </span>
                    <span style={{ fontSize: "0.95rem" }}>{campo.value}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: "24px" }}>
                <h3
                  style={{
                    letterSpacing: "0.18em",
                    fontSize: "0.9rem",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}
                >
                  Observações
                </h3>
                <p style={{ lineHeight: 1.6 }}>{observacoes}</p>
              </div>

              {fotos.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <h3
                    style={{
                      letterSpacing: "0.18em",
                      fontSize: "0.9rem",
                      textTransform: "uppercase",
                      marginBottom: "8px",
                    }}
                  >
                    Registro fotográfico
                  </h3>
                  <div style={fotosGridStyle}>
                    {fotos.map((foto) => (
                      <img
                        key={foto}
                        src={foto}
                        alt="Registro fotográfico do aparelho"
                        style={{
                          width: "100%",
                          borderRadius: "16px",
                          border: "1px solid rgba(15, 16, 21, 0.12)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: "24px" }}>
                <h3
                  style={{
                    letterSpacing: "0.18em",
                    fontSize: "0.9rem",
                    textTransform: "uppercase",
                    marginBottom: "12px",
                  }}
                >
                  Termos da garantia
                </h3>
                <ol className="garantia-termos">
                  {TERMOS_GARANTIA.map((texto, index) => (
                    <li key={texto}>
                      <strong>{index + 1}.</strong> {texto}
                    </li>
                  ))}
                </ol>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "24px",
                  marginTop: "24px",
                  textAlign: "center",
                }}
              >
                <div>
                  <p>_______________________________</p>
                  <span
                    style={{
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      fontSize: "0.85rem",
                    }}
                  >
                    Assinatura do Técnico
                  </span>
                </div>

                <div>
                  <p>_______________________________</p>
                  <span
                    style={{
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      fontSize: "0.85rem",
                    }}
                  >
                    Assinatura do Cliente
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
