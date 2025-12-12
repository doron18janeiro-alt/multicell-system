const SEPARADOR = "----------------------";

const LOJA_NOME = import.meta.env.VITE_LOJA_NOME || "Multicell System";
const LOJA_CNPJ = import.meta.env.VITE_LOJA_CNPJ || "";
const LOJA_TELEFONE = import.meta.env.VITE_LOJA_TELEFONE || "";

const paymentOptions = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "cartao", label: "Cartão" },
  { value: "pix", label: "Pix" },
  { value: "outro", label: "Outro" },
];

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

const formatCurrency = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "-";
  return numeric.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
};

export function gerarHtmlCupomVenda(venda = {}, itens = []) {
  const dataHora = venda.data
    ? new Date(venda.data).toLocaleString("pt-BR")
    : new Date().toLocaleString("pt-BR");

  const pagamentoLabel =
    paymentOptions.find((option) => option.value === venda.forma_pagamento)
      ?.label ||
    venda.forma_pagamento ||
    "Pagamento";

  const itensHtml = itens
    .map((item) => {
      const descricao = item.descricao || item.nome || "Item";
      const quantidade = item.quantidade || item.qtd || 1;
      const precoUnitario =
        item.preco_unitario ?? item.preco ?? item.valor_unitario ?? 0;
      const subtotal =
        item.subtotal ?? Number((quantidade * precoUnitario).toFixed(2));
      return `
        <div class="linha">
          <span>${descricao}</span>
          <span>${quantidade} x ${formatCurrency(precoUnitario)}</span>
        </div>
        <div class="linha">
          <span></span>
          <span>Subtotal: ${formatCurrency(subtotal)}</span>
        </div>
      `;
    })
    .join("");

  return `
    <div class="cupom">
      <h2>${LOJA_NOME.toUpperCase()}</h2>
      <div class="texto-centro">
        Operações inteligentes, resultados imediatos.
      </div>

      <div class="divisor"></div>
      <div class="linha">
        <span>Venda: ${venda.id || "-"}</span>
        <span>Data: ${dataHora}</span>
      </div>
      <div class="linha">
        <span>CNPJ:</span>
        <span>${LOJA_CNPJ || "-"}</span>
      </div>
      <div class="linha">
        <span>Telefone:</span>
        <span>${LOJA_TELEFONE || "-"}</span>
      </div>

      <div class="divisor"></div>
      <div>
        <strong>Cliente:</strong> ${
          venda.cliente_nome || "Cliente não informado"
        }
      </div>

      <div class="divisor"></div>
      ${
        itensHtml ||
        '<div class="linha"><span>Nenhum item registrado.</span></div>'
      }

      <div class="divisor"></div>
      <div class="linha">
        <strong>Total</strong>
        <strong>${formatCurrency(venda.total)}</strong>
      </div>
      <div class="linha">
        <span>Pagamento:</span>
        <span>${pagamentoLabel}</span>
      </div>

      ${
        venda.observacoes
          ? `
      <div class="divisor"></div>
      <div>${venda.observacoes}</div>
      `
          : ""
      }

      <div class="divisor"></div>
      <div class="texto-centro">
        Obrigado pela preferência!<br/>
        Volte sempre.
      </div>
    </div>
  `;
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
