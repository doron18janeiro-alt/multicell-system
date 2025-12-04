export function printElementById(elementId, title = "Impressão") {
  const el = document.getElementById(elementId);
  if (!el) {
    console.warn("Elemento não encontrado para impressão:", elementId);
    return;
  }

  const win = window.open("", "_blank", "width=800,height=600");
  win.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 4mm;
          }
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont,
              "Segoe UI", sans-serif;
            font-size: 11px;
          }
          h1,h2,h3,h4 {
            margin: 0 0 4px 0;
            text-align: center;
          }
          .cupom-root {
            width: 100%;
          }
          .cupom-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
          }
          .cupom-small {
            font-size: 9px;
          }
          .cupom-center {
            text-align: center;
          }
          .cupom-divider {
            border-top: 1px dashed #000;
            margin: 4px 0;
          }
        </style>
      </head>
      <body>
        <div class="cupom-root">
          ${el.innerHTML}
        </div>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
  win.close();
}
