export const exportCSV = (nome, dados) => {
  const csv = dados.map((row) => Object.values(row).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = nome + ".csv";
  a.click();
};
