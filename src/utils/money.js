export const money = (v) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
