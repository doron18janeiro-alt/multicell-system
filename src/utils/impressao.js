// Utilitário genérico para impressão de cupons e termos em janelas separadas
export function imprimirHtmlEmNovaJanela({
  titulo = "Documento Multicell",
  conteudoHtml,
  cssExtra = "",
}) {
  if (!conteudoHtml) {
    console.error("[impressao] conteudoHtml é obrigatório");
    return;
  }

  const printWindow = window.open("", "_blank", "width=800,height=600");

  if (!printWindow) {
    alert(
      "Não foi possível abrir a janela de impressão. Verifique se o bloqueio de pop-ups está ativo e permita pop-ups para continuar."
    );
    return;
  }

  printWindow.document.open();
  printWindow.document.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${titulo}</title>
    <style>
      @page {
        size: 80mm auto;
        margin: 4mm;
      }

      body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        font-size: 12px;
        color: #000;
      }

      .cupom {
        width: 100%;
      }

      .cupom h1,
      .cupom h2,
      .cupom h3 {
        margin: 0;
        text-align: center;
      }

      .linha {
        display: flex;
        justify-content: space-between;
        margin: 2px 0;
      }

      .divisor {
        border-top: 1px dashed #000;
        margin: 4px 0;
      }

      .foto-principal {
        max-width: 100%;
        margin: 6px 0;
        border-radius: 4px;
      }

      .texto-centro {
        text-align: center;
      }

      ${cssExtra || ""}
    </style>
  </head>
  <body onload="window.print(); window.close();">
    ${conteudoHtml}
  </body>
</html>`);
  printWindow.document.close();
}

export default imprimirHtmlEmNovaJanela;
