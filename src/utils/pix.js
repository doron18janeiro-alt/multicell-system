import QRCode from "qrcode";

function formatarValor(valor) {
  const numero = Number(valor) || 0;
  return numero.toFixed(2);
}

function montarPayloadPix(
  valor,
  chavePix = "00000000000",
  descricao = "MULTICELL"
) {
  const valorFormatado = formatarValor(valor);
  const descricaoSanitizada = (descricao || "MULTICELL").toUpperCase();
  return `00020101021226360014BR.GOV.BCB.PIX0114${chavePix}520400005303986540${valorFormatado}5802BR5913${descricaoSanitizada
    .padEnd(13)
    .slice(0, 13)}6009SAOPAULO62070503***6304`;
}

export async function gerarPix(valor, options = {}) {
  const payload =
    options.payload ??
    montarPayloadPix(valor, options.chavePix, options.descricao);
  return QRCode.toDataURL(payload, {
    margin: 1,
    width: 320,
    ...options.qrOptions,
  });
}
