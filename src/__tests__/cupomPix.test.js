import { gerarHtmlCupomVenda } from "../pages/Caixa";
import { gerarPix } from "../utils/pix";

const toDataURLMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue("data:image/png;base64,PIX")
);

vi.mock("qrcode", () => ({
  default: {
    toDataURL: toDataURLMock,
  },
}));

describe("Cupom e PIX", () => {
  beforeEach(() => {
    toDataURLMock.mockClear();
  });

  it("gera HTML do cupom com cliente, itens e total", () => {
    const venda = {
      id: 42,
      data: "2025-01-01T12:00:00Z",
      cliente_nome: "Maria",
      forma_pagamento: "dinheiro",
      total: 199.9,
      observacoes: "Obrigado",
    };

    const itens = [
      {
        descricao: "Display",
        quantidade: 1,
        preco_unitario: 120,
        subtotal: 120,
      },
      {
        descricao: "Película",
        quantidade: 2,
        preco_unitario: 39.95,
        subtotal: 79.9,
      },
    ];

    const html = gerarHtmlCupomVenda(venda, itens);

    expect(html).toContain("Maria");
    expect(html).toContain("Venda: 42");
    expect(html).toContain("Pagamento:");
    expect(html).toContain("Película");
    expect(html).toContain("Total");
  });

  it("monta payload e QRCode para o PIX", async () => {
    const resultado = await gerarPix(57.5, {
      chavePix: "12345",
      descricao: "Pedido 99",
    });

    expect(resultado.payload).toContain("54057.50");
    expect(resultado.valor).toBe(57.5);
    expect(resultado.descricao).toBe("Pedido 99");
    expect(resultado.dataUrl).toBe("data:image/png;base64,PIX");
    expect(toDataURLMock).toHaveBeenCalledWith(
      expect.stringContaining("12345"),
      expect.objectContaining({ width: 320 })
    );
  });
});
