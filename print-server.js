// Servidor local para impressão ESC/POS Multicell
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const escpos = require("escpos");
escpos.Network = require("escpos-network");

const DEFAULT_QR = "https://www.multicellsystem.com.br";
const LOGO_PATH = path.join(__dirname, "public", "logo_print.png");

function logPrefix() {
  return "[print-server]";
}

const app = express();
app.use(bodyParser.json({ limit: "1mb" }));

app.post("/print", async (req, res) => {
  const { ip, texto = "", qrUrl } = req.body || {};

  if (!ip) {
    return res.status(400).json({ error: "IP da impressora não informado" });
  }
  if (!texto.trim()) {
    return res.status(400).json({ error: "Conteúdo vazio." });
  }

  try {
    const device = new escpos.Network(ip);
    const printer = new escpos.Printer(device);

    device.open(async function () {
      try {
        const logo = await escpos.Image.load(LOGO_PATH);
        printer.align("ct").image(logo, "s8").newline();
      } catch (logoError) {
        console.warn(
          logPrefix(),
          "Logo não encontrada ou inválida",
          logoError.message
        );
      }

      const url = qrUrl || DEFAULT_QR;
      printer.qr(url).newline();

      printer.align("lt").style("normal").size(0, 0).text(texto);
      printer.cut().close();

      return res.json({ ok: true });
    });
  } catch (error) {
    console.error(logPrefix(), error);
    return res.status(500).json({ error: error.toString() });
  }
});

const PORT = process.env.PRINT_SERVER_PORT || 3333;
app.listen(PORT, () =>
  console.log(`🖨 Servidor de impressão ESC/POS rodando na porta ${PORT}`)
);
