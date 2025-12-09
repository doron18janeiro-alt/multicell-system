import { useState } from "react";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";

const lojaPadrao = {
  nome: "Multicell Assistência Técnica",
  cnpj: "00.000.000/0000-00",
  endereco: "Av. Exemplo, 123 - Centro, Cidade/UF",
  telefone: "(00) 0000-0000",
};

const formatCurrency = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "R$ 0,00";
  return numeric.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
};

const formatFullDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const defaultConditions = `1. A garantia cobre exclusivamente o serviço executado e/ou peça substituída, desde que o lacre de segurança permaneça intacto.
2. Danos causados por queda, oxidação, umidade, mau uso ou intervenção de terceiros invalidam esta garantia.
3. O aparelho deve ser apresentado com este termo e o comprovante de serviço para atendimento.
4. Prazo de garantia contado a partir da data de entrega do aparelho.`;

const getField = (os, keys, fallback = "-") => {
  if (!os) return fallback;
  for (const key of keys) {
    const value = os[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return fallback;
};

export default function TermoGarantia({
  os,
  loja = lojaPadrao,
  prazoDias = 90,
  condicoes = defaultConditions,
  showActions = false,
  showPreview = true,
  className = "",
}) {
  const [processing, setProcessing] = useState(false);

  if (!os) {
    return (
      <div className="text-center text-sm text-slate-500">
        Selecione uma ordem de serviço para visualizar o termo.
      </div>
    );
  }

  const cliente = getField(os, ["cliente", "cliente_nome", "nome_cliente"]);
  const aparelho = getField(os, ["aparelho", "device", "equipamento"]);
  const imei = getField(os, ["imei", "serial", "numero_serie"], "—");
  const defeito = getField(os, ["problema", "problema_relatado", "servico"]);
  const valorBruto =
    os.valor_final ?? os.valor_orcado ?? os.valor_estimado ?? os.valor;
  const prazo = os.prazo || os.prazo_garantia || prazoDias;
  const dataEntrega = os.data_entrega || os.updated_at || os.created_at;

  const buildPdf = async () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 48;
    let cursorY = margin;

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(loja.nome, margin, cursorY);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    cursorY += 18;
    doc.text(`CNPJ: ${loja.cnpj}`, margin, cursorY);
    cursorY += 14;
    doc.text(loja.endereco, margin, cursorY);
    cursorY += 14;
    doc.text(`Contato: ${loja.telefone}`, margin, cursorY);

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Termo de Garantia", pageWidth / 2, margin, { align: "center" });

    // QRCode
    const qrContent = os.id
      ? `${window.location.origin}/os/${os.id}`
      : `OS-${cliente}-${aparelho}`;
    const qrDataUrl = await QRCode.toDataURL(qrContent, { width: 256 });
    const qrSize = 96;
    doc.addImage(
      qrDataUrl,
      "PNG",
      pageWidth - margin - qrSize,
      margin - 12,
      qrSize,
      qrSize
    );
    doc.setFontSize(9);
    doc.text(`OS #${os.id || ""}`, pageWidth - margin - 4, margin + qrSize, {
      align: "right",
    });

    cursorY += 30;
    doc.setDrawColor(200);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 22;

    // Cliente
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Cliente", margin, cursorY);
    doc.setFont("helvetica", "normal");
    doc.text(cliente || "—", margin, cursorY + 16);
    if (os.cliente_telefone) {
      doc.text(`Telefone: ${os.cliente_telefone}`, margin, cursorY + 32);
      cursorY += 32;
    } else {
      cursorY += 20;
    }
    cursorY += 20;

    // Aparelho
    doc.setFont("helvetica", "bold");
    doc.text("Aparelho", margin, cursorY);
    doc.setFont("helvetica", "normal");
    doc.text(aparelho || "—", margin, cursorY + 16);
    doc.text(`IMEI / Série: ${imei}`, margin, cursorY + 32);
    cursorY += 52;

    // Defeito
    doc.setFont("helvetica", "bold");
    doc.text("Defeito / Serviço", margin, cursorY);
    doc.setFont("helvetica", "normal");
    const defeitoLines = doc.splitTextToSize(
      defeito || "—",
      pageWidth - margin * 2
    );
    doc.text(defeitoLines, margin, cursorY + 16);
    cursorY += 16 + defeitoLines.length * 14;

    // Valor e prazo
    doc.setFont("helvetica", "bold");
    doc.text("Valor", margin, cursorY);
    doc.setFont("helvetica", "normal");
    doc.text(formatCurrency(valorBruto), margin, cursorY + 16);

    doc.setFont("helvetica", "bold");
    doc.text("Prazo de garantia", margin + 240, cursorY);
    doc.setFont("helvetica", "normal");
    doc.text(`${prazo} dias`, margin + 240, cursorY + 16);

    doc.setFont("helvetica", "bold");
    doc.text("Data de entrega", margin + 420, cursorY);
    doc.setFont("helvetica", "normal");
    doc.text(formatFullDate(dataEntrega), margin + 420, cursorY + 16);

    cursorY += 48;
    doc.setDrawColor(200);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 22;

    // Condições
    doc.setFont("helvetica", "bold");
    doc.text("Condições Gerais", margin, cursorY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const condLines = doc.splitTextToSize(condicoes, pageWidth - margin * 2);
    doc.text(condLines, margin, cursorY + 18);
    cursorY += 18 + condLines.length * 14;

    // Assinaturas
    cursorY += 40;
    doc.setDrawColor(150);
    doc.line(margin, cursorY, margin + 180, cursorY);
    doc.line(pageWidth - margin - 180, cursorY, pageWidth - margin, cursorY);
    doc.setFontSize(10);
    doc.text("Assinatura da loja", margin + 90, cursorY + 14, {
      align: "center",
    });
    doc.text("Assinatura do cliente", pageWidth - margin - 90, cursorY + 14, {
      align: "center",
    });

    return doc;
  };

  const handleDownload = async () => {
    try {
      setProcessing(true);
      const doc = await buildPdf();
      const filename = `termo-garantia-os-${os.id || "multicell"}.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error("Erro ao gerar PDF de garantia", error);
      alert("Não foi possível gerar o PDF. Tente novamente.");
    } finally {
      setProcessing(false);
    }
  };

  const handlePrint = async () => {
    try {
      setProcessing(true);
      const doc = await buildPdf();
      const blobUrl = doc.output("bloburl");
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = blobUrl;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      };
    } catch (error) {
      console.error("Erro ao imprimir PDF de garantia", error);
      alert("Não foi possível imprimir agora. Tente novamente.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className={className}>
      {showActions && (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleDownload}
            disabled={processing}
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-amber-400 to-amber-300 px-4 py-2 font-semibold text-slate-900 shadow-md transition hover:brightness-105 disabled:opacity-60"
          >
            {processing ? "Gerando..." : "Gerar Termo de Garantia"}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            disabled={processing}
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white shadow-md transition hover:bg-slate-800 disabled:opacity-60"
          >
            {processing ? "Aguarde..." : "Imprimir PDF"}
          </button>
        </div>
      )}

      {showPreview && (
        <article className="mt-4 font-serif bg-white text-slate-900 shadow print:shadow-none print:bg-white">
          <header className="border-b border-slate-200 pb-4 mb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-slate-500">
                  Termo de Garantia
                </p>
                <h1 className="text-2xl font-black text-slate-900">
                  {loja.nome}
                </h1>
                <p className="text-sm text-slate-600">CNPJ: {loja.cnpj}</p>
                <p className="text-sm text-slate-600">{loja.endereco}</p>
                <p className="text-sm text-slate-600">
                  Contato: {loja.telefone}
                </p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <p>Data de emissão</p>
                <strong className="text-slate-800">
                  {formatFullDate(new Date())}
                </strong>
              </div>
            </div>
          </header>

          <section className="space-y-4 text-sm leading-relaxed">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Cliente
              </h2>
              <p>
                <span className="font-semibold">Nome:</span> {cliente}
              </p>
              {os.cliente_telefone && (
                <p>
                  <span className="font-semibold">Telefone:</span>{" "}
                  {os.cliente_telefone}
                </p>
              )}
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Aparelho
              </h2>
              <p>
                <span className="font-semibold">Modelo:</span> {aparelho || "-"}
              </p>
              {imei && imei !== "-" && (
                <p>
                  <span className="font-semibold">IMEI:</span> {imei}
                </p>
              )}
              {os.senha_aparelho && (
                <p>
                  <span className="font-semibold">Senha:</span>{" "}
                  {os.senha_aparelho}
                </p>
              )}
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Serviço executado
              </h2>
              <p>{defeito || "—"}</p>
              {os.observacoes && (
                <p className="text-slate-600">Obs: {os.observacoes}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Valor
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {formatCurrency(valorBruto)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Garantia
                </p>
                <p className="text-lg font-bold text-slate-900">{prazo} dias</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Data de entrega
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {formatFullDate(dataEntrega)}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Condições gerais
              </h2>
              <div className="mt-2 whitespace-pre-line text-slate-700 text-justify">
                {condicoes}
              </div>
            </div>
          </section>

          <footer className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex justify-between text-sm text-slate-700">
              <div className="w-1/2 pr-4">
                <p className="uppercase text-xs tracking-[0.3em] text-slate-500">
                  Assinatura da loja
                </p>
                <div className="mt-6 border-t border-slate-400" />
              </div>
              <div className="w-1/2 pl-4">
                <p className="uppercase text-xs tracking-[0.3em] text-slate-500">
                  Assinatura do cliente
                </p>
                <div className="mt-6 border-t border-slate-400" />
              </div>
            </div>
          </footer>
        </article>
      )}
    </div>
  );
}
