export default function Historico({ vendas }) {
  return (
    <div className="panel">
      <h3>Historico de Vendas</h3>
      <p className="panel-sub">Data, valor, pagamento e itens comprados.</p>
      <div className="table-like">
        {vendas.map((venda) => {
          const data = new Date(venda.created_at || venda.data);
          return (
            <div className="history-item" key={venda.id}>
              <div className="history-top">
                <div>
                  <div className="tag">{venda.pagamento}</div>
                  <div className="panel-sub">
                    {data.toLocaleDateString()} - {data.toLocaleTimeString()}
                  </div>
                </div>
                <div className="value">R$ {Number(venda.total || 0).toFixed(2)}</div>
              </div>
              <div className="history-items">
                {(venda.itens || []).map((item) => (
                  <div key={`${venda.id}-${item.id}`}>
                    {item.quantidade}x {item.nome} - R$ {Number(item.precoVenda).toFixed(2)}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {!vendas.length && <div className="panel-sub">Sem vendas registradas.</div>}
      </div>
    </div>
  );
}
