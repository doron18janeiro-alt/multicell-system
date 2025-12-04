const lojaPadrao = {
  nome: "Multicell Assistência Técnica",
  cnpj: "00.000.000/0000-00",
  endereco: "Av. Exemplo, 123 - Centro, Cidade/UF",
  telefone: "(00) 0000-0000",
};

const formatCurrency = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "R$ 0,00";
  return numeric.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
};

const formatFullDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const defaultConditions = `1. A garantia cobre exclusivamente o serviço executado e/ou peça substituída, desde que o lacre de segurança permaneça intacto.
2. Danos causados por queda, oxidação, umidade, mau uso ou intervenção de terceiros invalidam esta garantia.
3. O aparelho deve ser apresentado com este termo e o comprovante de serviço para atendimento.
4. Prazo de garantia contado a partir da data de entrega do aparelho.`;

export default function TermoGarantia({
  os,
  loja = lojaPadrao,
  prazoDias = 90,
  condicoes = defaultConditions,
}) {
  if (!os) {
    return (
      <div className="text-center text-sm text-slate-500">
        Selecione uma ordem de serviço para visualizar o termo.
      </div>
    );
  }

  const dataEntrega = os.data_entrega || os.updated_at || os.created_at;

  return (
    <article className="font-serif bg-white text-slate-900 shadow print:shadow-none print:bg-white">
      <header className="border-b border-slate-200 pb-4 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-slate-500">
              Termo de Garantia
            </p>
            <h1 className="text-2xl font-black text-slate-900">{loja.nome}</h1>
            <p className="text-sm text-slate-600">CNPJ: {loja.cnpj}</p>
            <p className="text-sm text-slate-600">{loja.endereco}</p>
            <p className="text-sm text-slate-600">Contato: {loja.telefone}</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>Data de emissão</p>
            <strong className="text-slate-800">
              {formatFullDate(new Date())}
            </strong>
          </div>
        </div>
      </header>

      <section className="space-y-4 text-sm leading-relaxed">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Cliente</h2>
          <p>
            <span className="font-semibold">Nome:</span> {os.cliente_nome}
          </p>
          {os.cliente_telefone && (
            <p>
              <span className="font-semibold">Telefone:</span>{" "}
              {os.cliente_telefone}
            </p>
          )}
        </div>

        <div>
          <h2 className="text-base font-semibold text-slate-900">Aparelho</h2>
          <p>
            <span className="font-semibold">Modelo:</span> {os.aparelho || "-"}
          </p>
          {os.imei && (
            <p>
              <span className="font-semibold">IMEI:</span> {os.imei}
            </p>
          )}
          {os.senha_aparelho && (
            <p>
              <span className="font-semibold">Senha:</span> {os.senha_aparelho}
            </p>
          )}
        </div>

        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Serviço executado
          </h2>
          <p>{os.problema_relatado || "—"}</p>
          {os.observacoes && (
            <p className="text-slate-600">Obs: {os.observacoes}</p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Valor
            </p>
            <p className="text-lg font-bold text-slate-900">
              {formatCurrency(os.valor_final ?? os.valor_orcado)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Garantia
            </p>
            <p className="text-lg font-bold text-slate-900">{prazoDias} dias</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Data de entrega
            </p>
            <p className="text-lg font-semibold text-slate-900">
              {formatFullDate(dataEntrega)}
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Condições gerais
          </h2>
          <div className="mt-2 whitespace-pre-line text-slate-700 text-justify">
            {condicoes}
          </div>
        </div>
      </section>

      <footer className="mt-8 pt-6 border-t border-slate-200">
        <div className="flex justify-between text-sm text-slate-700">
          <div className="w-1/2 pr-4">
            <p className="uppercase text-xs tracking-[0.3em] text-slate-500">
              Assinatura da loja
            </p>
            <div className="mt-6 border-t border-slate-400" />
          </div>
          <div className="w-1/2 pl-4">
            <p className="uppercase text-xs tracking-[0.3em] text-slate-500">
              Assinatura do cliente
            </p>
            <div className="mt-6 border-t border-slate-400" />
          </div>
        </div>
      </footer>
    </article>
  );
}
