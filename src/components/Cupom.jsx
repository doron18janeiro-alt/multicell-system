export default function Cupom({ venda }) {
  return (
    <div
      id="cupom"
      style={{
        width: "280px",
        fontFamily: "monospace",
        fontSize: "12px",
        padding: "10px",
      }}
    >
      <h2 style={{ textAlign: "center" }}>MULTICELL</h2>
      <p>Endereço: {venda.endereco}</p>
      <p>Telefone: {venda.telefone}</p>
      <hr />
      <p>Itens:</p>

      {venda.itens.map((i, idx) => (
        <p key={idx}>
          {i.nome} — {i.quant} un — R$ {i.preco}
        </p>
      ))}

      <hr />
      <p>Total: R$ {venda.total}</p>
      <p>Pagamento: {venda.pagamento}</p>
      <hr />
      <p style={{ textAlign: "center" }}>Obrigado pela preferência!</p>
    </div>
  );
}
