import React, { useMemo, useState } from "react";
import "./Despesas.css";
export { default as default } from "./Despesas/Despesas";

function gerarId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const CATEGORIAS = [
  "Operacional",
  "Peças/Produtos",
  "Impostos",
  "Contas Fixas",
  "Outros",
];

const FORMAS_PAGAMENTO = [
  "Dinheiro",
  "Cartão Débito",
  "Cartão Crédito",
  "Pix",
  "Transferência",
];

function LegacyDespesas() {
  const [despesas, setDespesas] = useState([]);
  const [filtros, setFiltros] = useState({
    inicio: "",
    fim: "",
    categoria: "",
    status: "",
  });

  const [modalNovaAberto, setModalNovaAberto] = useState(false);
  const [modalPagamentoAberto, setModalPagamentoAberto] = useState(false);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);

  const [despesaSelecionada, setDespesaSelecionada] = useState(null);

  const [formNova, setFormNova] = useState({
    descricao: "",
    categoria: "",
    valorTotal: "",
    data: "",
    observacoes: "",
  });

  const [modoPagamento, setModoPagamento] = useState("total"); // total | parcial | parcelado
  const [valorPagamento, setValorPagamento] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [parcelasQtd, setParcelasQtd] = useState(3);
  const [dataPrimeiroVenc, setDataPrimeiroVenc] = useState("");
  const [tabDetalhes, setTabDetalhes] = useState("info"); // info | pagamentos | parcelas

  // ---------- FILTROS E TOTAL ----------
  const despesasFiltradas = useMemo(() => {
    return despesas.filter((d) => {
      if (filtros.categoria && d.categoria !== filtros.categoria) return false;
      if (filtros.status && d.status !== filtros.status) return false;

      if (filtros.inicio && d.data < filtros.inicio) return false;
      if (filtros.fim && d.data > filtros.fim) return false;

      return true;
    });
  }, [despesas, filtros]);

  const totalPeriodo = useMemo(() => {
    return despesasFiltradas.reduce(
      (acc, d) => acc + Number(d.valorTotal || 0),
      0
    );
  }, [despesasFiltradas]);

  const totalSaldo = useMemo(
    () => despesasFiltradas.reduce((acc, d) => acc + Number(d.saldo || 0), 0),
    [despesasFiltradas]
  );

  // ---------- NOVA DESPESA ----------
  function abrirModalNova() {
    setFormNova({
      descricao: "",
      categoria: "",
      valorTotal: "",
      data: "",
      observacoes: "",
    });
    setModalNovaAberto(true);
  }

  function fecharModalNova() {
    setModalNovaAberto(false);
  }

  function salvarNovaDespesa(e) {
    e.preventDefault();
    const valor = Number(formNova.valorTotal || 0);
    if (!formNova.descricao || !valor) {
      alert("Preencha pelo menos descrição e valor.");
      return;
    }

    const nova = {
      id: gerarId(),
      descricao: formNova.descricao,
      categoria: formNova.categoria || "Outros",
      valorTotal: valor,
      valorPago: 0,
      saldo: valor,
      data: formNova.data || new Date().toISOString().slice(0, 10),
      observacoes: formNova.observacoes || "",
      status: "Em aberto", // Em aberto | Parcialmente paga | Paga | Paga (cartão)
      pagamentos: [],
      parcelas: [],
    };

    setDespesas((prev) => [nova, ...prev]);
    setModalNovaAberto(false);
  }

  // ---------- PAGAMENTOS ----------
  function abrirModalPagamento(despesa) {
    setDespesaSelecionada(despesa);
    setModoPagamento("total");
    setValorPagamento("");
    setFormaPagamento("");
    setParcelasQtd(3);
    setDataPrimeiroVenc("");
    setModalPagamentoAberto(true);
  }

  function fecharModalPagamento() {
    setModalPagamentoAberto(false);
    setDespesaSelecionada(null);
  }

  function registrarPagamentoTotal() {
    if (!despesaSelecionada) return;
    if (!formaPagamento) {
      alert("Escolha a forma de pagamento.");
      return;
    }

    const agora = new Date().toISOString().slice(0, 10);
    const valor = despesaSelecionada.saldo;

    const novoPagamento = {
      id: gerarId(),
      tipo: "total",
      formaPagamento,
      valor,
      dataPagamento: agora,
      observacao: "Pagamento total",
    };

    const atualizada = {
      ...despesaSelecionada,
      valorPago: despesaSelecionada.valorPago + valor,
      saldo: 0,
      status: formaPagamento === "Cartão Crédito" ? "Paga (cartão)" : "Paga",
      pagamentos: [novoPagamento, ...despesaSelecionada.pagamentos],
    };

    setDespesas((prev) =>
      prev.map((d) => (d.id === atualizada.id ? atualizada : d))
    );
    fecharModalPagamento();
  }

  function registrarPagamentoParcial() {
    if (!despesaSelecionada) return;
    const valor = Number(valorPagamento || 0);
    if (!valor || valor <= 0) {
      alert("Informe um valor válido.");
      return;
    }
    if (valor > despesaSelecionada.saldo) {
      alert("O valor é maior que o saldo em aberto.");
      return;
    }
    if (!formaPagamento) {
      alert("Escolha a forma de pagamento.");
      return;
    }

    const agora = new Date().toISOString().slice(0, 10);
    const novoSaldo = despesaSelecionada.saldo - valor;
    const novoStatus = novoSaldo === 0 ? "Paga" : "Parcialmente paga";

    const novoPagamento = {
      id: gerarId(),
      tipo: "parcial",
      formaPagamento,
      valor,
      dataPagamento: agora,
      observacao: "Pagamento parcial",
    };

    const atualizada = {
      ...despesaSelecionada,
      valorPago: despesaSelecionada.valorPago + valor,
      saldo: novoSaldo,
      status: novoStatus,
      pagamentos: [novoPagamento, ...despesaSelecionada.pagamentos],
    };

    setDespesas((prev) =>
      prev.map((d) => (d.id === atualizada.id ? atualizada : d))
    );
    fecharModalPagamento();
  }

  function gerarParcelasCartao(total, qtd, primeiraData) {
    const parcelas = [];
    const valorBase = total / qtd;
    const arredondado = Number(valorBase.toFixed(2));

    let dataRef = primeiraData ? new Date(primeiraData) : new Date();

    for (let i = 1; i <= qtd; i++) {
      const d = new Date(dataRef);
      d.setMonth(d.getMonth() + (i - 1));
      parcelas.push({
        id: gerarId(),
        numero: i,
        valor: arredondado,
        dataVencimento: d.toISOString().slice(0, 10),
        pago: false,
      });
    }
    return parcelas;
  }

  function registrarParceladoCartao() {
    if (!despesaSelecionada) return;
    const qtd = Number(parcelasQtd || 0);
    if (!qtd || qtd <= 0) {
      alert("Informe a quantidade de parcelas.");
      return;
    }
    if (!dataPrimeiroVenc) {
      alert("Informe a data do primeiro vencimento.");
      return;
    }

    const parcelasGeradas = gerarParcelasCartao(
      despesaSelecionada.saldo,
      qtd,
      dataPrimeiroVenc
    );

    const agora = new Date().toISOString().slice(0, 10);

    const novoPagamento = {
      id: gerarId(),
      tipo: "parcelado",
      formaPagamento: "Cartão Crédito",
      valor: despesaSelecionada.saldo,
      dataPagamento: agora,
      observacao: `Parcelado em ${qtd}x no cartão`,
    };

    // Do ponto de vista da loja, a despesa foi quitada,
    // mas passa a existir um controle de parcelas do cartão.
    const atualizada = {
      ...despesaSelecionada,
      valorPago: despesaSelecionada.valorPago + despesaSelecionada.saldo,
      saldo: 0,
      status: "Paga (cartão)",
      pagamentos: [novoPagamento, ...despesaSelecionada.pagamentos],
      parcelas: parcelasGeradas,
    };

    setDespesas((prev) =>
      prev.map((d) => (d.id === atualizada.id ? atualizada : d))
    );
    fecharModalPagamento();
  }

  function confirmarPagamento(e) {
    e.preventDefault();
    if (!despesaSelecionada) return;

    if (modoPagamento === "total") {
      registrarPagamentoTotal();
    } else if (modoPagamento === "parcial") {
      registrarPagamentoParcial();
    } else if (modoPagamento === "parcelado") {
      registrarParceladoCartao();
    }
  }

  // ---------- DETALHES ----------
  function abrirModalDetalhes(despesa) {
    setDespesaSelecionada(despesa);
    setTabDetalhes("info");
    setModalDetalhesAberto(true);
  }

  function fecharModalDetalhes() {
    setModalDetalhesAberto(false);
    setDespesaSelecionada(null);
  }

  // ---------- REMOVER ----------
  function removerDespesa(id) {
    if (!window.confirm("Remover essa despesa?")) return;
    setDespesas((prev) => prev.filter((d) => d.id !== id));
  }

  // ---------- RENDER ----------
  return (
    <div className="despesas-page">
      <div className="despesas-header">
        <div>
          <h1>Controle de Despesas</h1>
          <p>Gerencie gastos, pagamentos e saldo devedor da Multicell.</p>
        </div>
        <button className="btn-primary" onClick={abrirModalNova}>
          + Nova despesa
        </button>
      </div>

      <div className="despesas-filtros">
        <div className="filtros-row">
          <div className="filtro-item">
            <label>Início</label>
            <input
              type="date"
              value={filtros.inicio}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, inicio: e.target.value }))
              }
            />
          </div>
          <div className="filtro-item">
            <label>Fim</label>
            <input
              type="date"
              value={filtros.fim}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, fim: e.target.value }))
              }
            />
          </div>
          <div className="filtro-item">
            <label>Categoria</label>
            <select
              value={filtros.categoria}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, categoria: e.target.value }))
              }
            >
              <option value="">Todas</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="filtro-item">
            <label>Status</label>
            <select
              value={filtros.status}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, status: e.target.value }))
              }
            >
              <option value="">Todos</option>
              <option value="Em aberto">Em aberto</option>
              <option value="Parcialmente paga">Parcialmente paga</option>
              <option value="Paga">Paga</option>
              <option value="Paga (cartão)">Paga (cartão)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="despesas-resumo">
        <div className="resumo-card">
          <span>Total em despesas no período</span>
          <strong>
            R${" "}
            {totalPeriodo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </strong>
        </div>
        <div className="resumo-card">
          <span>Saldo em aberto</span>
          <strong>
            R${" "}
            {totalSaldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </strong>
        </div>
      </div>

      <div className="despesas-tabela-card">
        {despesasFiltradas.length === 0 ? (
          <p className="despesas-vazio">Nenhuma despesa cadastrada.</p>
        ) : (
          <table className="despesas-tabela">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Valor total</th>
                <th>Valor pago</th>
                <th>Saldo</th>
                <th>Status</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {despesasFiltradas.map((d) => (
                <tr key={d.id}>
                  <td>{d.descricao}</td>
                  <td>{d.categoria}</td>
                  <td>
                    R{" "}
                    {Number(d.valorTotal).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td>
                    R{" "}
                    {Number(d.valorPago).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td>
                    R{" "}
                    {Number(d.saldo).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td>
                    <span
                      className={`tag-status status-${(d.status || "")
                        .replace(/\s|\(|\)/g, "")
                        .toLowerCase()}`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td>
                    {d.data
                      ? new Date(d.data).toLocaleDateString("pt-BR")
                      : "-"}
                  </td>
                  <td className="acoes-col">
                    <button
                      className="btn-ghost"
                      onClick={() => abrirModalDetalhes(d)}
                    >
                      Ver
                    </button>
                    {d.saldo > 0 && (
                      <button
                        className="btn-primary btn-menor"
                        onClick={() => abrirModalPagamento(d)}
                      >
                        Pagar
                      </button>
                    )}
                    <button
                      className="btn-ghost danger"
                      onClick={() => removerDespesa(d.id)}
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL NOVA DESPESA */}
      {modalNovaAberto && (
        <div className="modal-backdrop" onClick={fecharModalNova}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>Nova despesa</h2>
            <form className="modal-form" onSubmit={salvarNovaDespesa}>
              <label>
                Descrição
                <input
                  type="text"
                  value={formNova.descricao}
                  onChange={(e) =>
                    setFormNova((f) => ({ ...f, descricao: e.target.value }))
                  }
                  required
                />
              </label>

              <label>
                Categoria
                <select
                  value={formNova.categoria}
                  onChange={(e) =>
                    setFormNova((f) => ({ ...f, categoria: e.target.value }))
                  }
                >
                  <option value="">Selecione</option>
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Valor total
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formNova.valorTotal}
                  onChange={(e) =>
                    setFormNova((f) => ({ ...f, valorTotal: e.target.value }))
                  }
                  required
                />
              </label>

              <label>
                Data
                <input
                  type="date"
                  value={formNova.data}
                  onChange={(e) =>
                    setFormNova((f) => ({ ...f, data: e.target.value }))
                  }
                />
              </label>

              <label>
                Observações
                <textarea
                  rows={3}
                  value={formNova.observacoes}
                  onChange={(e) =>
                    setFormNova((f) => ({
                      ...f,
                      observacoes: e.target.value,
                    }))
                  }
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={fecharModalNova}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PAGAMENTO */}
      {modalPagamentoAberto && despesaSelecionada && (
        <div className="modal-backdrop" onClick={fecharModalPagamento}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>Pagamento da despesa</h2>
            <p className="modal-subtitle">
              {despesaSelecionada.descricao} — Saldo:{" "}
              <strong>
                R{" "}
                {Number(despesaSelecionada.saldo).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </strong>
            </p>

            <form className="modal-form" onSubmit={confirmarPagamento}>
              <div className="modo-row">
                <label className="modo-option">
                  <input
                    type="radio"
                    name="modo"
                    value="total"
                    checked={modoPagamento === "total"}
                    onChange={() => setModoPagamento("total")}
                  />
                  <span>Pagamento total</span>
                </label>
                <label className="modo-option">
                  <input
                    type="radio"
                    name="modo"
                    value="parcial"
                    checked={modoPagamento === "parcial"}
                    onChange={() => setModoPagamento("parcial")}
                  />
                  <span>Pagamento parcial</span>
                </label>
                <label className="modo-option">
                  <input
                    type="radio"
                    name="modo"
                    value="parcelado"
                    checked={modoPagamento === "parcelado"}
                    onChange={() => setModoPagamento("parcelado")}
                  />
                  <span>Parcelar no cartão</span>
                </label>
              </div>

              {modoPagamento === "parcial" && (
                <label>
                  Valor a pagar agora
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={valorPagamento}
                    onChange={(e) => setValorPagamento(e.target.value)}
                  />
                </label>
              )}

              {modoPagamento !== "parcelado" && (
                <label>
                  Forma de pagamento
                  <select
                    value={formaPagamento}
                    onChange={(e) => setFormaPagamento(e.target.value)}
                  >
                    <option value="">Selecione</option>
                    {FORMAS_PAGAMENTO.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {modoPagamento === "parcelado" && (
                <>
                  <label>
                    Número de parcelas
                    <input
                      type="number"
                      min="1"
                      value={parcelasQtd}
                      onChange={(e) => setParcelasQtd(e.target.value)}
                    />
                  </label>
                  <label>
                    Data do primeiro vencimento
                    <input
                      type="date"
                      value={dataPrimeiroVenc}
                      onChange={(e) => setDataPrimeiroVenc(e.target.value)}
                    />
                  </label>
                </>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={fecharModalPagamento}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALHES */}
      {modalDetalhesAberto && despesaSelecionada && (
        <div className="modal-backdrop" onClick={fecharModalDetalhes}>
          <div
            className="modal-card modal-detalhes"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Detalhes da despesa</h2>
            <p className="modal-subtitle">{despesaSelecionada.descricao}</p>

            <div className="tabs">
              <button
                className={tabDetalhes === "info" ? "tab active" : "tab"}
                onClick={() => setTabDetalhes("info")}
              >
                Informações
              </button>
              <button
                className={tabDetalhes === "pagamentos" ? "tab active" : "tab"}
                onClick={() => setTabDetalhes("pagamentos")}
              >
                Pagamentos
              </button>
              <button
                className={tabDetalhes === "parcelas" ? "tab active" : "tab"}
                onClick={() => setTabDetalhes("parcelas")}
              >
                Parcelas
              </button>
            </div>

            {tabDetalhes === "info" && (
              <div className="tab-content">
                <p>
                  <strong>Categoria:</strong> {despesaSelecionada.categoria}
                </p>
                <p>
                  <strong>Valor total:</strong> R{" "}
                  {Number(despesaSelecionada.valorTotal).toLocaleString(
                    "pt-BR",
                    {
                      minimumFractionDigits: 2,
                    }
                  )}
                </p>
                <p>
                  <strong>Valor pago:</strong> R{" "}
                  {Number(despesaSelecionada.valorPago).toLocaleString(
                    "pt-BR",
                    {
                      minimumFractionDigits: 2,
                    }
                  )}
                </p>
                <p>
                  <strong>Saldo:</strong> R{" "}
                  {Number(despesaSelecionada.saldo).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <p>
                  <strong>Status:</strong> {despesaSelecionada.status}
                </p>
                <p>
                  <strong>Data:</strong>{" "}
                  {despesaSelecionada.data
                    ? new Date(despesaSelecionada.data).toLocaleDateString(
                        "pt-BR"
                      )
                    : "-"}
                </p>
                {despesaSelecionada.observacoes && (
                  <p>
                    <strong>Observações:</strong>{" "}
                    {despesaSelecionada.observacoes}
                  </p>
                )}
              </div>
            )}

            {tabDetalhes === "pagamentos" && (
              <div className="tab-content">
                {despesaSelecionada.pagamentos.length === 0 ? (
                  <p>Nenhum pagamento registrado.</p>
                ) : (
                  <table className="mini-table">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Tipo</th>
                        <th>Forma</th>
                        <th>Valor</th>
                        <th>Obs.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {despesaSelecionada.pagamentos.map((p) => (
                        <tr key={p.id}>
                          <td>
                            {p.dataPagamento
                              ? new Date(p.dataPagamento).toLocaleDateString(
                                  "pt-BR"
                                )
                              : "-"}
                          </td>
                          <td>{p.tipo}</td>
                          <td>{p.formaPagamento}</td>
                          <td>
                            R{" "}
                            {Number(p.valor).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td>{p.observacao}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {tabDetalhes === "parcelas" && (
              <div className="tab-content">
                {despesaSelecionada.parcelas.length === 0 ? (
                  <p>Nenhuma parcela gerada.</p>
                ) : (
                  <table className="mini-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Valor</th>
                        <th>Vencimento</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {despesaSelecionada.parcelas.map((parcela) => (
                        <tr key={parcela.id}>
                          <td>{parcela.numero}</td>
                          <td>
                            R{" "}
                            {Number(parcela.valor).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td>
                            {parcela.dataVencimento
                              ? new Date(
                                  parcela.dataVencimento
                                ).toLocaleDateString("pt-BR")
                              : "-"}
                          </td>
                          <td>{parcela.pago ? "Paga" : "Pendente"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            <div className="modal-actions">
              <button className="btn-ghost" onClick={fecharModalDetalhes}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
