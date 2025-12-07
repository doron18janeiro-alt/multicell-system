import express from "express";
import makeWASocket, {
  useMultiFileAuthState,
  Browsers,
} from "@whiskeysockets/baileys";
import qrcode from "qrcode-terminal";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("🚀 LPTECH BOT ONLINE — servidor ativo!");
});

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    browser: Browsers.macOS("LPTECH BOT"),
  });

  // QR CODE E STATUS
  sock.ev.on("connection.update", ({ connection, qr }) => {
    if (qr) {
      console.log("\n📱 ESCANEIE O QR CODE ABAIXO:\n");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("✅ BOT CONECTADO AO WHATSAPP!");
    }

    if (connection === "close") {
      console.log("❌ Conexão perdida. Tentando reconectar...");
      startBot();
    }
  });

  sock.ev.on("creds.update", saveCreds);

  // MENSAGENS
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const texto =
      msg.message.conversation || msg.message.extendedTextMessage?.text || "";

    const chat = msg.key.remoteJid;

    if (texto) {
      await sock.sendMessage(chat, {
        text: "🤖 Recebi sua mensagem: " + texto,
      });
    }
  });
}

app.listen(PORT, () => console.log(`🚀 LPTECH BOT rodando na porta ${PORT}`));

startBot();
