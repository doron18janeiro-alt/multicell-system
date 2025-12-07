import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";

function gerarProtocoloGarantia() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const num = Math.floor(agora.getTime() % 100000);
  return `GAR-${ano}-${String(num).padStart(5, "0")}`;
}

function formatarDataBR(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("pt-BR");
}

const camposIniciais = {
  empresaNome: "MULTICELL Assistencia Tecnica",
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
  condicoes:
    "Garantia cobre apenas o servico realizado. Nao cobre queda, impacto, oxidacao, mau uso ou violacao do selo de garantia.",
};

export default function TermoGarantia() {
  const [form, setForm] = useState(camposIniciais);
  const [protocolo, setProtocolo] = useState("GERADO AO ATUALIZAR");
  const [emitidoEm, setEmitidoEm] = useState("");
  const [listaOS, setListaOS] = useState([]);

  const preview = useMemo(
    () => ({
      ...form,
      dataFmt: formatarDataBR(form.data),
      valorFmt: form.valor || "0,00",
      protocolo,
      emissao: emitidoEm,
    }),
    [form, protocolo, emitidoEm]
  );

  const preencher = () => {
    setProtocolo(gerarProtocoloGarantia());
    setEmitidoEm(new Date().toLocaleDateString("pt-BR"));
  };

  const imprimir = () => {
    if (protocolo === "GERADO AO ATUALIZAR") {
      const ok = window.confirm(
        "Voce ainda nao atualizou a pre-visualizacao. Deseja imprimir assim mesmo?"
      );
      if (!ok) return;
    }
    window.print();
  };

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const carregarOS = async () => {
    const { data } = await supabase
      .from("ordens")
      .select("*")
      .eq("status", "Concluída")
      .order("created_at", { ascending: false });

    setListaOS(data || []);
  };

  useEffect(() => {
    carregarOS();
  }, []);

  const selecionar = (os) => {
    if (!os) return;
    setForm({
      ...form,
      clienteNome: os.cliente,
      clienteFone: os.telefone || "",
      aparelho: os.aparelho,
      imei: os.imei || "",
      servico: os.servico || "",
      valor: os.valor || "",
      data: os.created_at ? os.created_at.split("T")[0] : "",
      empresaNome: form.empresaNome,
      empresaCnpj: form.empresaCnpj,
      empresaFone: form.empresaFone,
      empresaEndereco: form.empresaEndereco,
      prazo: form.prazo,
      tecnico: form.tecnico,
      condicoes: form.condicoes,
    });
  };

  return (
    <div className="grid" style={{ gap: 16 }}>
      <section className="garantia-panel panel">
        <div className="panel-title">Dados para preencher a garantia</div>
        <div className="panel-sub">
          Preencha os dados da empresa, cliente e servico. Clique em Atualizar pre-visualizacao e depois
          em Imprimir garantia.
        </div>

        <div className="garantia-grid-form">
          <div className="full">
            <label>Selecionar OS concluída</label>
            <select
              className="input"
              onChange={(e) => {
                const osSel = listaOS.find((o) => o.id === e.target.value);
                selecionar(osSel);
              }}
              defaultValue=""
            >
              <option value="" disabled>
                Escolha uma OS concluída
              </option>
              {listaOS.map((os) => (
                <option key={os.id} value={os.id}>
                  {os.cliente} — {os.aparelho} — {os.servico}
                </option>
              ))}
            </select>
          </div>
          <div className="full">
            <label>Nome da empresa</label>
            <input
              className="input"
              value={form.empresaNome}
              onChange={(e) => setField("empresaNome", e.target.value)}
              placeholder="MULTICELL Assistencia Tecnica"
            />
          </div>
          <div>
            <label>CNPJ</label>
            <input
              className="input"
              value={form.empresaCnpj}
              onChange={(e) => setField("empresaCnpj", e.target.value)}
              placeholder="00.000.000/0000-00"
            />
          </div>
          <div>
            <label>Telefone / WhatsApp</label>
            <input
              className="input"
              value={form.empresaFone}
              onChange={(e) => setField("empresaFone", e.target.value)}
              placeholder="(43) 9 0000-0000"
            />
          </div>
          <div className="full">
            <label>Endereco</label>
            <input
              className="input"
              value={form.empresaEndereco}
              onChange={(e) => setField("empresaEndereco", e.target.value)}
              placeholder="Rua, numero, bairro, cidade - UF"
            />
          </div>

          <div className="full garantia-divisor" />

          <div>
            <label>Nome do cliente</label>
            <input
              className="input"
              value={form.clienteNome}
              onChange={(e) => setField("clienteNome", e.target.value)}
            />
          </div>
          <div>
            <label>Telefone do cliente</label>
            <input
              className="input"
              value={form.clienteFone}
              onChange={(e) => setField("clienteFone", e.target.value)}
            />
          </div>
          <div>
            <label>Aparelho</label>
            <input
              className="input"
              value={form.aparelho}
              onChange={(e) => setField("aparelho", e.target.value)}
              placeholder="Ex: Samsung A32"
            />
          </div>
          <div>
            <label>IMEI (opcional)</label>
            <input className="input" value={form.imei} onChange={(e) => setField("imei", e.target.value)} />
          </div>

          <div className="full">
            <label>Servico realizado</label>
            <input
              className="input"
              value={form.servico}
              onChange={(e) => setField("servico", e.target.value)}
              placeholder="Ex: Troca de tela, troca de bateria..."
            />
          </div>

          <div>
            <label>Valor do servico (R$)</label>
            <input
              className="input"
              value={form.valor}
              onChange={(e) => setField("valor", e.target.value)}
              placeholder="Ex: 250,00"
            />
          </div>
          <div>
            <label>Prazo de garantia</label>
            <input
              className="input"
              value={form.prazo}
              onChange={(e) => setField("prazo", e.target.value)}
              placeholder="Ex: 90 dias"
            />
          </div>
          <div>
            <label>Data do servico</label>
            <input
              className="input"
              type="date"
              value={form.data}
              onChange={(e) => setField("data", e.target.value)}
            />
          </div>
          <div>
            <label>Responsavel / tecnico</label>
            <input
              className="input"
              value={form.tecnico}
              onChange={(e) => setField("tecnico", e.target.value)}
              placeholder="Nome do tecnico"
            />
          </div>

          <div className="full">
            <label>Condicoes especificas da garantia (opcional)</label>
            <textarea
              className="input"
              value={form.condicoes}
              onChange={(e) => setField("condicoes", e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="btn-row">
          <button type="button" className="btn btn-ghost" onClick={preencher}>
            Atualizar pre-visualizacao
          </button>
          <button type="button" className="btn" onClick={imprimir}>
            Imprimir garantia
          </button>
        </div>
      </section>

      <section className="garantia-card" id="garantia-card">
        <div className="garantia-header">
          <div>
            <div className="garantia-title">TERMO DE GARANTIA DE SERVICO</div>
            <div className="garantia-protocolo">
              Protocolo: <span>{preview.protocolo}</span>
            </div>
          </div>
          <div className="garantia-emissao">
            Emitido em: <span>{preview.emissao}</span>
          </div>
        </div>

        <div>
          <div className="garantia-section-title">Dados da empresa</div>
          <div className="garantia-grid">
            <div><span className="label-sm">Empresa:</span> <span>{preview.empresaNome || "-"}</span></div>
            <div><span className="label-sm">CNPJ:</span> <span>{preview.empresaCnpj || "-"}</span></div>
            <div><span className="label-sm">Telefone:</span> <span>{preview.empresaFone || "-"}</span></div>
            <div className="full"><span className="label-sm">Endereco:</span> <span>{preview.empresaEndereco || "-"}</span></div>
          </div>
        </div>

        <div>
          <div className="garantia-section-title">Dados do cliente e do aparelho</div>
          <div className="garantia-grid">
            <div><span className="label-sm">Cliente:</span> <span>{preview.clienteNome || "-"}</span></div>
            <div><span className="label-sm">Telefone:</span> <span>{preview.clienteFone || "-"}</span></div>
            <div><span className="label-sm">Aparelho:</span> <span>{preview.aparelho || "-"}</span></div>
            <div><span className="label-sm">IMEI:</span> <span>{preview.imei || "-"}</span></div>
          </div>
        </div>

        <div>
          <div className="garantia-section-title">Servico realizado</div>
          <div className="garantia-grid">
            <div className="full">
              <span className="label-sm">Descricao:</span>
              <span>{preview.servico || "-"}</span>
            </div>
            <div><span className="label-sm">Valor:</span> R$ <span>{preview.valorFmt}</span></div>
            <div><span className="label-sm">Prazo de garantia:</span> <span>{preview.prazo || "-"}</span></div>
            <div><span className="label-sm">Data do servico:</span> <span>{preview.dataFmt}</span></div>
            <div><span className="label-sm">Tecnico:</span> <span>{preview.tecnico || "-"}</span></div>
          </div>
        </div>

        <div>
          <div className="garantia-section-title">Condicoes gerais da garantia</div>
          <p className="garantia-text">
            {preview.condicoes ||
              "Garantia valida para o servico descrito. Perde validade em casos de queda, impacto, oxidacao, mau uso ou violacao por terceiros."}
          </p>
        </div>

        <div className="assinaturas">
          <div>
            <div className="linha-assinatura">Assinatura do cliente</div>
          </div>
          <div>
            <div className="linha-assinatura">Assinatura do responsavel tecnico</div>
          </div>
        </div>

        <div className="info-footer">
          Ao assinar, o cliente declara que recebeu o aparelho em perfeito funcionamento referente ao
          servico realizado e esta ciente das condicoes desta garantia.
        </div>
      </section>
    </div>
  );
}
