export default function ProdutoCard({ produto, onSelect, onDelete, onAdd, onRemove, actionLabel = "Adicionar" }) {
  return (
    <div className="product-card">
      <img src={produto.foto_url || "https://via.placeholder.com/120x120"} alt={produto.nome} />
      <div className="product-info">
        <div className="title">{produto.nome}</div>
        <div className="meta">
          {produto.categoria} - {produto.quantidade} un
        </div>
        <div className="price">R$ {Number(produto.preco_venda || 0).toFixed(2)}</div>
      </div>
      {onSelect && (
        <button className="btn-ghost" onClick={() => onSelect(produto)}>
          {actionLabel}
        </button>
      )}
      {onAdd && (
        <button className="btn-ghost" onClick={() => onAdd(produto)}>
          +1
        </button>
      )}
      {onRemove && (
        <button className="btn-ghost" onClick={() => onRemove(produto)}>
          -1
        </button>
      )}
      {onDelete && (
        <button className="btn-ghost danger" onClick={() => onDelete(produto.id)}>
          Excluir
        </button>
      )}
    </div>
  );
}
