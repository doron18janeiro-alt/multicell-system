export function compartilharWhatsApp({ telefone, mensagem, url }) {
  if (!mensagem) {
    console.error("[whatsapp] mensagem é obrigatória");
    return;
  }

  const base = telefone ? `https://wa.me/${telefone}` : "https://wa.me/";
  const textoCompleto = url ? `${mensagem} - ${url}` : mensagem;
  const encoded = encodeURIComponent(textoCompleto);
  const finalUrl = `${base}?text=${encoded}`;

  window.open(finalUrl, "_blank");
}
