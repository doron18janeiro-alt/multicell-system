const SEPARADOR = "----------------------";

function formatarValor(valor) {
  const numero = Number(valor) || 0;
  return numero.toFixed(2);
}

export function gerarCupom(venda = {}, itens = []) {
  const linhas = [];
  linhas.push("----- MULTICELL -----");
  linhas.push(`Venda: ${venda.id ?? "--"}`);
  linhas.push(SEPARADOR);

  itens.forEach((item) => {
    const nome = item?.nome ?? item?.descricao ?? "Item";
    const quantidade = item?.quantidade ?? item?.qtd ?? 1;
    const preco = formatarValor(item?.preco ?? item?.preco_unitario ?? 0);
    linhas.push(`${nome} x${quantidade} — R$${preco}`);
  });

  linhas.push(SEPARADOR);
  linhas.push(`TOTAL: R$${formatarValor(venda.total)}`);
  linhas.push("");
  linhas.push("Obrigado pela preferência!");

  return `${linhas.join("\n")}\n`;
}

/**
 * Envia o texto do cupom para a impressora ESC/POS Bluetooth.
 * Em um ambiente React Native basta importar o módulo e passá-lo aqui:
 *
 * ```js
 * import { BluetoothEscposPrinter } from "react-native-bluetooth-escpos-printer";
 * await enviarCupomBluetooth(venda, itens, {}, BluetoothEscposPrinter);
 * ```
 */
export async function enviarCupomBluetooth(
  venda,
  itens,
  options = {},
  printerInstance
) {
  const cupom = gerarCupom(venda, itens);
  const printer = printerInstance ?? globalThis?.BluetoothEscposPrinter;

  if (!printer || typeof printer.printText !== "function") {
    throw new Error(
      "BluetoothEscposPrinter não disponível. Passe a instância do módulo ao chamar enviarCupomBluetooth."
    );
  }

  await printer.printText(cupom, options);
  return cupom;
}
