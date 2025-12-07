export function gerarParcelas(despesa) {
  if (!despesa) return [];
  const parcelas = [];
  const base = Number((despesa.valor / despesa.parcelas).toFixed(2));
  const resto = Number((despesa.valor - base * despesa.parcelas).toFixed(2));

  for (let i = 0; i < despesa.parcelas; i++) {
    const valorParcela = i === despesa.parcelas - 1 ? base + resto : base;
    const vencimento = new Date(despesa.dataVencimento);
    vencimento.setMonth(vencimento.getMonth() + i);

    parcelas.push({
      numero: i + 1,
      valor: valorParcela,
      vencimento: vencimento.toISOString().slice(0, 10),
      status:
        despesa.total_pago >= valorParcela * (i + 1) ? "pago" : "pendente",
    });
  }

  return parcelas;
}
