import { useEffect, useState } from "react";
import { supabase } from "@/services/supabaseClient";

export default function ConfigUsuarios() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [form, setForm] = useState({
    nome: "",
    email: "",
    role: "GERENTE",
    ativo: true,
  });

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .order("nome", { ascending: true });
    if (error) setMensagem("Erro ao carregar usuarios");
    setUsers(data || []);
    setLoading(false);
  };

  const salvar = async (e) => {
    e.preventDefault();
    if (!form.nome.trim() || !form.email.trim()) {
      setMensagem("Informe nome e email");
      return;
    }
    const payload = {
      nome: form.nome.trim(),
      email: form.email.trim(),
      role: form.role,
      ativo: form.ativo,
      empresa_id: 1,
    };
    const { error } = await supabase.from("usuarios").insert(payload);
    if (error) {
      setMensagem("Erro ao criar usuário");
      return;
    }
    setForm({ nome: "", email: "", role: "GERENTE", ativo: true });
    carregar();
  };

  const toggleAtivo = async (u) => {
    await supabase.from("usuarios").update({ ativo: !u.ativo }).eq("id", u.id);
    carregar();
  };

  const mudarRole = async (u, role) => {
    await supabase.from("usuarios").update({ role }).eq("id", u.id);
    carregar();
  };

  return (
    <div className="page">
      <h1 className="page-title">Usuários e Permissões</h1>
      <p className="page-subtitle">
        Controle de perfis ADMIN, GERENTE e CAIXA.
      </p>
      {mensagem && <div className="panel">{mensagem}</div>}

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Criar usuário</div>
        </div>
        <form className="form-grid-estoque" onSubmit={salvar}>
          <div className="form-field">
            <label>Nome</label>
            <input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label>Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label>Papel</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="ADMIN">ADMIN</option>
              <option value="GERENTE">GERENTE</option>
              <option value="CAIXA">CAIXA</option>
            </select>
          </div>
          <div className="form-field">
            <label>Status</label>
            <select
              value={form.ativo ? "1" : "0"}
              onChange={(e) =>
                setForm({ ...form, ativo: e.target.value === "1" })
              }
            >
              <option value="1">Ativo</option>
              <option value="0">Inativo</option>
            </select>
          </div>
          <div className="form-actions-right">
            <button type="submit" className="btn btn-primary">
              Salvar
            </button>
          </div>
        </form>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Usuários cadastrados</div>
        </div>
        {loading ? (
          <div className="muted">Carregando...</div>
        ) : (
          <div className="lista-produtos">
            {users.map((u) => (
              <div key={u.id} className="produto-item">
                <div>
                  <div className="produto-nome">{u.nome}</div>
                  <div className="produto-sub">
                    {u.email} • {u.role}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <select
                    value={u.role}
                    onChange={(e) => mudarRole(u, e.target.value)}
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="GERENTE">GERENTE</option>
                    <option value="CAIXA">CAIXA</option>
                  </select>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => toggleAtivo(u)}
                  >
                    {u.ativo !== false ? "Desativar" : "Ativar"}
                  </button>
                </div>
              </div>
            ))}
            {users.length === 0 && <div className="muted">Nenhum usuário.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
