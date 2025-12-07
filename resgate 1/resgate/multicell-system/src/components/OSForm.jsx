import { useEffect, useState } from "react";
import { generateProtocol } from "../utils/generateProtocol";

const initial = {
  nomeCliente: "",
  telefone: "",
  aparelho: "",
  senhaAparelho: "",
  defeitoRelatado: "",
  defeitoConstatado: "",
  acessorios: { chip: false, capa: false, pelicula: false, cartao: false },
  estadoAparelho: "",
  valorOrcamento: "",
  entrada: "",
  previsaoEntrega: "",
  tecnico: "",
  status: "pendente",
};

export default function OSForm({ onSubmit, sequencial = 1 }) {
  const [form, setForm] = useState(initial);
  const [files, setFiles] = useState([]);
  const [protocol, setProtocol] = useState(generateProtocol(sequencial));

  useEffect(() => {
    setProtocol(generateProtocol(sequencial));
  }, [sequencial]);

  const handleFile = (e) => {
    setFiles(Array.from(e.target.files || []));
  };

  const handleCheck = (key) => {
    setForm((f) => ({ ...f, acessorios: { ...f.acessorios, [key]: !f.acessorios[key] } }));
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, protocolo: protocol }, files);
    setForm(initial);
    setFiles([]);
    setProtocol(generateProtocol(sequencial + 1));
  };

  return (
    <form className="os-form panel" onSubmit={submit}>
      <div className="os-form-header">
        <div>
          <h3>Abertura de O.S.</h3>
          <p className="panel-sub">Protocolo gerado automaticamente</p>
        </div>
        <div className="os-protocol">{protocol}</div>
      </div>

      <div className="form-grid">
        <input
          className="input"
          placeholder="Nome do cliente"
          value={form.nomeCliente}
          onChange={(e) => setForm({ ...form, nomeCliente: e.target.value })}
          required
        />
        <input
          className="input"
          placeholder="Telefone"
          value={form.telefone}
          onChange={(e) => setForm({ ...form, telefone: e.target.value })}
          required
        />
        <input
          className="input"
          placeholder="Aparelho (ex: Samsung A32)"
          value={form.aparelho}
          onChange={(e) => setForm({ ...form, aparelho: e.target.value })}
          required
        />
        <input
          className="input"
          placeholder="Senha do aparelho (opcional)"
          value={form.senhaAparelho}
          onChange={(e) => setForm({ ...form, senhaAparelho: e.target.value })}
        />
        <input
          className="input"
          placeholder="Valor orcamento"
          type="number"
          value={form.valorOrcamento}
          onChange={(e) => setForm({ ...form, valorOrcamento: e.target.value })}
        />
        <input
          className="input"
          placeholder="Entrada"
          type="number"
          value={form.entrada}
          onChange={(e) => setForm({ ...form, entrada: e.target.value })}
        />
        <input
          className="input"
          placeholder="Previsao de entrega"
          value={form.previsaoEntrega}
          onChange={(e) => setForm({ ...form, previsaoEntrega: e.target.value })}
        />
        <input
          className="input"
          placeholder="Tecnico responsavel"
          value={form.tecnico}
          onChange={(e) => setForm({ ...form, tecnico: e.target.value })}
        />
      </div>

      <textarea
        className="input"
        placeholder="Defeito relatado"
        value={form.defeitoRelatado}
        onChange={(e) => setForm({ ...form, defeitoRelatado: e.target.value })}
        rows={2}
        required
      />
      <textarea
        className="input"
        placeholder="Defeito constatado"
        value={form.defeitoConstatado}
        onChange={(e) => setForm({ ...form, defeitoConstatado: e.target.value })}
        rows={2}
      />
      <textarea
        className="input"
        placeholder="Estado do aparelho (riscos, trincos, oxidacao...)"
        value={form.estadoAparelho}
        onChange={(e) => setForm({ ...form, estadoAparelho: e.target.value })}
        rows={2}
      />

      <div className="os-checks">
        {[
          ["chip", "Chip"],
          ["capa", "Capa"],
          ["pelicula", "Pelicula"],
          ["cartao", "Cartao SD"],
        ].map(([key, label]) => (
          <label key={key} className="os-check">
            <input type="checkbox" checked={form.acessorios[key]} onChange={() => handleCheck(key)} />
            <span>{label}</span>
          </label>
        ))}
      </div>

      <div className="row space-between mt-12">
        <select
          className="input"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="pendente">Pendente</option>
          <option value="andamento">Em andamento</option>
          <option value="finalizado">Finalizado</option>
          <option value="entregue">Entregue</option>
        </select>

        <label className="os-upload">
          <input type="file" accept="image/*" multiple onChange={handleFile} />
          Upload fotos ({files.length})
        </label>

        <button className="btn" type="submit">
          Salvar O.S.
        </button>
      </div>
    </form>
  );
}
