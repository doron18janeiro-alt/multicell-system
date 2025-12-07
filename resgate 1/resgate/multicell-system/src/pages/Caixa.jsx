import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import { jsPDF } from "jspdf";
import Cupom from "../components/Cupom";

function formatBRL(value) {
  return (value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const LOGO_BASE64 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAALUlEQVR42mNkoBAwUqifYRgGphj9RwYGBhBmYHiA0UwGoWGYGEaQ8pABBgAEVgAhS1j0MrQAAAABJRU5ErkJggg==";

export default function Caixa() {
  const [aba, setAba] = useState("produtos");
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [selecionadosServico, setSelecionadosServico] = useState([]);
  const [pagamentoProdutos, setPagamentoProdutos] = useState("Pix");
  const [pagamentoServicos, setPagamentoServicos] = useState("Pix");
  const [ultimaVenda, setUltimaVenda] = useState(null);
  const [showCupomModal, setShowCupomModal] = useState(false);

  useEffect(() => {
    carregarProdutos();
    carregarServicos();
  }, []);

  async function carregarProdutos() {
    const { data } = await supabase.from("produtos").select("*").order("nome");
    setProdutos(data || []);
  }

  async function carregarServicos() {
    const { data } = await supabase
      .from("os")
      .select("*")
      .eq("status", "Concluído")
      .or("faturada.is.null,faturada.eq.false");
    setServicos(data || []);
  }

  function addCarrinho(produto) {
    setCarrinho((prev) => {
      const existe = prev.find((i) => i.id === produto.id);
      if (existe) {
        return prev.map((i) =>
          i.id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: produto.id,
          nome: produto.nome,
          quantidade: 1,
          preco: Number(produto.preco_venda || 0),
        },
      ];
    });
  }

  function mudarQtd(id, delta) {
    setCarrinho((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantidade: Math.max(1, i.quantidade + delta) } : i))
        .filter((i) => i.quantidade > 0)
    );
  }

  function removerCarrinho(id) {
    setCarrinho((prev) => prev.filter((i) => i.id !== id));
  }

  const totalProdutos = useMemo(
    () => carrinho.reduce((sum, i) => sum + i.quantidade * i.preco, 0),
    [carrinho]
  );

  async function finalizarVendaProdutos() {
    if (carrinho.length === 0) return;
    const items = carrinho.map((i) => ({
      id_produto: i.id,
      nome: i.nome,
      quantidade: i.quantidade,
      preco_unitario: i.preco,
    }));
    const payload = {
      data: new Date().toISOString(),
      total: totalProdutos,
      tipo: "produto",
      itens: items,
      pagamento: pagamentoProdutos,
    };
    const { data, error } = await supabase.from("vendas").insert(payload).select().single();
    if (error) {
      console.error(error);
      alert("Erro ao registrar venda.");
      return;
    }
    for (const item of carrinho) {
      await supabase.rpc("decrementar_estoque", { pid: item.id, qtd: item.quantidade });
    }
    setCarrinho([]);
    setUltimaVenda(data);
    setShowCupomModal(true);
    await carregarProdutos();
  }

  const totalServicos = useMemo(
    () =>
      servicos
        .filter((s) => selecionadosServico.includes(s.id))
        .reduce((sum, s) => sum + Number(s.valor || 0), 0),
    [servicos, selecionadosServico]
  );

  function toggleServico(id) {
    setSelecionadosServico((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function finalizarServicos() {
    if (selecionadosServico.length === 0) return;
    const osSelecionadas = servicos.filter((s) => selecionadosServico.includes(s.id));
    const itens = osSelecionadas.map((s) => ({
      id_os: s.id,
      cliente: s.cliente,
      servico: s.servico,
      valor: Number(s.valor || 0),
    }));
    const total = itens.reduce((sum, i) => sum + i.valor, 0);
    const payload = {
      data: new Date().toISOString(),
      total,
      tipo: "servico",
      itens,
      pagamento: pagamentoServicos,
    };
    const { data, error } = await supabase.from("vendas").insert(payload).select().single();
    if (error) {
      console.error(error);
      alert("Erro ao faturar serviços.");
      return;
    }
    await supabase
      .from("os")
      .update({ faturada: true })
      .in(
        "id",
        osSelecionadas.map((s) => s.id)
      );
    setSelecionadosServico([]);
    setUltimaVenda(data);
    setShowCupomModal(true);
    await carregarServicos();
  }

  function gerarCupomHTML(venda) {
    if (!venda) return "";
    const empresa = (() => {
      const saved = localStorage.getItem("multicell_settings");
      if (!saved) return {};
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    })();
    const itens = venda.itens || [];
    const linhas = itens
      .map((i) => {
        const nome = i.nome || i.servico || "Item";
        const qtd = i.quantidade || 1;
        const valor = i.preco_unitario || i.valor || 0;
        return `<tr><td>${nome}</td><td style="text-align:center">${qtd}</td><td style="text-align:right">R$ ${Number(
          valor
        ).toFixed(2)}</td></tr>`;
      })
      .join("");

    return `
      <html>
        <head>
          <style>
            body { font-family: 'Inter', sans-serif; font-size: 12px; }
            .cupom { width: 280px; }
            .title { text-align: center; font-weight: 700; font-size: 13px; }
            .center { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin: 8px 0; }
            td { padding: 2px 0; }
            .line { border-top: 1px dashed #555; margin: 6px 0; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="cupom">
            <div class="center"><img src="${LOGO_BASE64}" width="46" height="46" /></div>
            <div class="title">MULTICELL ASSISTÊNCIA TÉCNICA</div>
            <div class="center">${empresa.nome_empresa || ""}</div>
            <div class="center">${empresa.cnpj || "CNPJ: 00.000.000/0000-00"}</div>
            <div class="line"></div>
            <table>
              <thead>
                <tr><td>Produto/Serviço</td><td style="text-align:center">Qtd</td><td style="text-align:right">Valor</td></tr>
              </thead>
              <tbody>${linhas}</tbody>
            </table>
            <div class="line"></div>
            <div>Total: <strong>${formatBRL(venda.total)}</strong></div>
            <div>Pagamento: ${venda.pagamento || "Dinheiro"}</div>
            <div>Data: ${new Date(venda.data || Date.now()).toLocaleString("pt-BR")}</div>
            <div>Protocolo: ${venda.id || "-"}</div>
            <div class="line"></div>
            <div class="center">Obrigado pela preferência!</div>
            <div class="center">MULTICELL SYSTEM</div>
          </div>
        </body>
      </html>
    `;
  }

  function imprimirHTML() {
    if (!ultimaVenda) return;
    const html = gerarCupomHTML(ultimaVenda);
    const win = window.open("", "PRINT", "height=600,width=400");
    if (!win) return;
    win.document.write(html);
    win.document.close();
  }

  function gerarPDF() {
    if (!ultimaVenda) return;
    const doc = new jsPDF({
      unit: "mm",
      format: [80, 200],
    });
    let y = 10;
    doc.setFontSize(11);
    doc.text("MULTICELL ASSISTÊNCIA TÉCNICA", 5, y);
    y += 5;
    const empresa = (() => {
      const saved = localStorage.getItem("multicell_settings");
      if (!saved) return {};
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    })();
    if (empresa.cnpj) {
      doc.setFontSize(9);
      doc.text(`CNPJ: ${empresa.cnpj}`, 5, y);
      y += 4;
    }
    doc.line(5, y, 75, y);
    y += 4;
    doc.setFontSize(9);
    (ultimaVenda.itens || []).forEach((i) => {
      const nome = i.nome || i.servico || "Item";
      const qtd = i.quantidade || 1;
      const valor = i.preco_unitario || i.valor || 0;
      doc.text(`${nome}`, 5, y);
      doc.text(`Qtd: ${qtd}`, 5, y + 4);
      doc.text(`R$ ${Number(valor).toFixed(2)}`, 55, y + 4, { align: "right" });
      y += 8;
    });
    doc.line(5, y, 75, y);
    y += 5;
    doc.setFontSize(10);
    doc.text(`Total: ${formatBRL(ultimaVenda.total)}`, 5, y);
    y += 5;
    doc.text(`Pagamento: ${ultimaVenda.pagamento || "Dinheiro"}`, 5, y);
    y += 5;
    doc.text(`Data: ${new Date(ultimaVenda.data || Date.now()).toLocaleString("pt-BR")}`, 5, y);
    y += 5;
    doc.text(`Protocolo: ${ultimaVenda.id || "-"}`, 5, y);
    y += 6;
    doc.line(5, y, 75, y);
    y += 5;
    doc.text("Obrigado pela preferência!", 5, y);
    y += 5;
    doc.text("MULTICELL SYSTEM", 5, y);
    doc.save("cupom_venda.pdf");
  }

  const dadosEmpresa = {
    nome: "MULTICELL Assistência Técnica",
    cnpj: "48.002.640/0001-67",
    telefone: "(43) 99603-1208",
    endereco: "Av. Paraná, 470 - Cândido de Abreu - PR",
  };

  const imprimirCupomBasico = () => {
    const conteudo = document.getElementById("cupom")?.innerHTML;
    if (!conteudo) return;
    const janela = window.open("", "", "width=300,height=600");
    if (!janela) return;
    janela.document.write(conteudo);
    janela.print();
    janela.close();
  };

  function imprimirCupom(venda) {
    if (!venda) return;
    const janela = window.open("", "_blank", "width=300,height=600");
    const html = `
      <html>
      <head>
        <title>Cupom</title>
      </head>
      <body>
        <div id="root"></div>
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;
    janela.document.write(html);
    setTimeout(() => {
      const container = document.querySelector("#cupom-container");
      if (container) {
        janela.document.body.innerHTML = container.innerHTML;
        janela.print();
        janela.close();
      }
    }, 300);
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Caixa</h1>
          <p className="page-subtitle">Registre vendas de produtos e serviços concluídos.</p>
        </div>
      </header>

      <div id="cupom-container" style={{ display: "none" }}>
        <Cupom
          venda={{
            itens: carrinho,
            total: totalProdutos,
            formaPagamento: pagamentoProdutos,
            data: new Date().toLocaleString(),
            empresa: dadosEmpresa,
            endereco: dadosEmpresa.endereco,
            telefone: dadosEmpresa.telefone,
            pagamento: pagamentoProdutos,
          }}
        />
      </div>

      <div style={{ display: "none" }}>
        <Cupom
          venda={{
            itens: carrinho.map((i) => ({
              nome: i.nome,
              quant: i.quantidade || 1,
              preco: (i.preco || i.preco_venda || i.preco_unitario || 0).toFixed(2),
            })),
            total: totalProdutos.toFixed(2),
            pagamento: pagamentoProdutos,
            endereco: dadosEmpresa.endereco,
            telefone: dadosEmpresa.telefone,
          }}
        />
      </div>

      <div className="tabs">
        <button className={`tab ${aba === "produtos" ? "tab-active" : ""}`} onClick={() => setAba("produtos")}>
          Produtos
        </button>
        <button className={`tab ${aba === "servicos" ? "tab-active" : ""}`} onClick={() => setAba("servicos")}>
          Serviços (OS)
        </button>
      </div>

      {aba === "produtos" && (
        <div className="grid gap-4 md:grid-cols-[1.1fr,0.9fr]">
          <div className="panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Produtos</h2>
                <p className="panel-subtitle">Clique para adicionar ao carrinho.</p>
              </div>
            </div>
            <div className="lista-produtos">
              {produtos.map((p) => (
                <button key={p.id} className="produto-item" onClick={() => addCarrinho(p)}>
                  <div>
                    <div className="produto-nome">{p.nome}</div>
                    <div className="produto-sub">
                      {p.categoria || "Geral"} • Estoque: {p.quantidade ?? 0}
                    </div>
                  </div>
                  <div className="produto-preco">{formatBRL(p.preco_venda || 0)}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Carrinho</h2>
                <p className="panel-subtitle">Itens selecionados para venda.</p>
              </div>
            </div>
            <div className="carrinho">
              {carrinho.length === 0 && <p className="muted">Nenhum item no carrinho.</p>}
              {carrinho.map((item) => (
                <div key={item.id} className="carrinho-item">
                  <div>
                    <div className="produto-nome">{item.nome}</div>
                    <div className="produto-sub">
                      {formatBRL(item.preco)} • Qtd: {item.quantidade}
                    </div>
                  </div>
                  <div className="carrinho-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => mudarQtd(item.id, -1)}>
                      -
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => mudarQtd(item.id, 1)}>
                      +
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => removerCarrinho(item.id)}>
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-sm mb-1">Pagamento</label>
                <select
                  value={pagamentoProdutos}
                  onChange={(e) => setPagamentoProdutos(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                >
                  <option>Dinheiro</option>
                  <option>Pix</option>
                  <option>Débito</option>
                  <option>Crédito</option>
                </select>
              </div>
            </div>
            <div className="total-row">
              <span>Total</span>
              <strong>{formatBRL(totalProdutos)}</strong>
            </div>
            <div className="flex flex-col gap-2">
              <button
                className="btn btn-primary w-full"
                onClick={finalizarVendaProdutos}
                disabled={carrinho.length === 0}
              >
                Registrar venda
              </button>
              <button
                type="button"
                className="btn btn-secondary w-full"
                disabled={carrinho.length === 0}
                onClick={imprimirCupomBasico}
              >
                Imprimir Cupom
              </button>
            </div>
          </div>
        </div>
      )}

      {aba === "servicos" && (
        <div className="panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Serviços concluídos</h2>
              <p className="panel-subtitle">Selecione OS concluídas para faturar no caixa.</p>
            </div>
          </div>
          <div className="os-list">
            {servicos.length === 0 && <p className="muted">Nenhuma OS concluída pendente.</p>}
            {servicos.map((os) => (
              <label key={os.id} className="os-card">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selecionadosServico.includes(os.id)}
                    onChange={() => toggleServico(os.id)}
                  />
                  <div>
                    <div className="os-valor">{os.cliente}</div>
                    <div className="os-muted">
                      {os.aparelho} • {os.servico}
                    </div>
                  </div>
                </div>
                <div className="os-status">
                  <span className="tag">{os.status}</span>
                  <span className="os-valor">{formatBRL(os.valor || 0)}</span>
                </div>
              </label>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-sm mb-1">Pagamento</label>
              <select
                value={pagamentoServicos}
                onChange={(e) => setPagamentoServicos(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
              >
                <option>Dinheiro</option>
                <option>Pix</option>
                <option>Débito</option>
                <option>Crédito</option>
              </select>
            </div>
          </div>
          <div className="total-row">
            <span>Total</span>
            <strong>{formatBRL(totalServicos)}</strong>
          </div>
          <div className="flex flex-col gap-2">
            <button
              className="btn btn-primary w-full"
              onClick={finalizarServicos}
              disabled={selecionadosServico.length === 0}
            >
              Registrar venda
            </button>
            <button
              type="button"
              className="btn btn-secondary w-full"
              disabled={!ultimaVenda}
              onClick={() => setShowCupomModal(true)}
            >
              Imprimir Cupom
            </button>
          </div>
        </div>
      )}

      {showCupomModal && ultimaVenda && (
        <div className="modal-overlay active">
          <div className="modal">
            <div className="modal-header">
              <h3>Imprimir Cupom</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowCupomModal(false)}>
                Fechar
              </button>
            </div>
            <p className="muted">Escolha como deseja emitir o cupom da última venda registrada.</p>
            <div className="flex gap-3 mt-3">
              <button className="btn btn-primary w-full" onClick={imprimirHTML}>
                Imprimir direto
              </button>
              <button className="btn btn-secondary w-full" onClick={gerarPDF}>
                Baixar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
