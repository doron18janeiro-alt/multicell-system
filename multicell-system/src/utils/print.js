// src/utils/print.js
// Utilitários de impressão e compartilhamento para o Multicell System

const PRINT_ENDPOINT = "http://localhost:3333/print";

export async function imprimir(ip, texto, options = {}) {
  if (!ip) {
    alert("IP da impressora não configurado.");
    return { error: "printer-ip-missing" };
  }
  try {
    const response = await fetch(PRINT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip, texto, qrUrl: options.qrUrl }),
    });

    if (!response.ok) {
      throw new Error(`Falha na impressão: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erro imprimir:", error);
    alert("Não foi possível conectar ao servidor de impressão.");
    return { error: error.message };
  }
}

export function sep() {
  return "--------------------------------";
}

export function bold(text) {
  if (!text) return "";
  return `*** ${String(text).toUpperCase()} ***`;
}

export function modeloCupomVenda(venda = {}) {
  const itens = Array.isArray(venda.itens) ? venda.itens : [];
  return `
${"MULTICELL SYSTEM".padStart(17)}
${"ASSISTÊNCIA TÉCNICA".padStart(20)}
${sep()}
${bold("CUPOM DE VENDA")}
${sep()}
Cliente: ${venda.cliente || "-"}
Data: ${venda.data || new Date().toLocaleString("pt-BR")}
${sep()}
Itens:
${itens
  .map((item) => `${item.nome}  x${item.qtd}  R$ ${item.total}`)
  .join("\n")}
${sep()}
TOTAL: R$ ${venda.total || "0,00"}
${sep()}
Obrigado pela preferência!
`;
}

export function modeloOS(os = {}) {
  return `
${bold(`ORDEM DE SERVIÇO #${os.numero || "---"}`)}
${sep()}
Cliente: ${os.cliente || "-"}
Aparelho: ${os.aparelho || "-"}
Problema: ${os.problema || os.defeito || "-"}
Técnico: ${os.tecnico || "-"}
Status: ${os.status || "-"}
Estimativa: R$ ${os.valor_estimado || os.valor || "0,00"}
${sep()}
Assinatura Técnica:
_____________________
Assinatura Cliente:
_____________________
`;
}

export function printElementById(elementId) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const node = document.getElementById(elementId);
  if (!node) {
    console.warn(`[printElementById] Elemento não encontrado: ${elementId}`);
    return;
  }

  const printWindow = window.open("", "_blank", "noopener,noreferrer");

  if (!printWindow) {
    console.error(
      "[printElementById] Não foi possível abrir a janela de impressão."
    );
    return;
  }

  const html = node.innerHTML;

  printWindow.document.open();
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>Impressão - Multicell System</title>
        <style>
          @page {
            size: A4;
            margin: 12mm;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
              sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: #f3f4f6;
          }

          .print-root {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 24px;
            border-radius: 8px;
          }

          img {
            max-width: 100%;
            height: auto;
          }

          h1, h2, h3, h4, h5 {
            margin-top: 0;
          }

          .muted {
            color: #6b7280;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="print-root">
          ${html}
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();

  // Aguarda o conteúdo carregar antes de disparar a impressão
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    // Fecha a janela após impressão em navegadores modernos
    printWindow.onafterprint = () => {
      printWindow.close();
    };
  };
}

/**
 * Extrai um texto "limpo" de um elemento para usar em compartilhamento (ex.: WhatsApp).
 */
export function getElementPlainText(elementId) {
  if (typeof document === "undefined") return "";

  const node = document.getElementById(elementId);
  if (!node) return "";

  const raw = node.innerText || "";
  return raw.replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Abre o WhatsApp com o texto do elemento + um prefixo opcional.
 */
export function shareElementOnWhatsApp(elementId, prefixText = "") {
  const body = getElementPlainText(elementId);
  if (!body) {
    console.warn(
      "[shareElementOnWhatsApp] Nenhum texto encontrado para compartilhar."
    );
    return;
  }

  const fullText = `${prefixText ? prefixText + "\n\n" : ""}${body}`;
  const url = `https://wa.me/?text=${encodeURIComponent(fullText)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
