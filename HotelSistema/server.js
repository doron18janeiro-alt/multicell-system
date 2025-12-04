const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

const DB_PATH = path.resolve(__dirname, "./database/db.json");

function loadDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

function saveDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ROTAS UNIVERSAIS -------------------------------------------------------
app.get("/api/:table", (req, res) => {
  const db = loadDB();
  res.json(db[req.params.table] || []);
});

app.post("/api/:table", (req, res) => {
  const db = loadDB();
  const table = req.params.table;

  if (!db[table]) db[table] = [];

  const novo = { id: Date.now(), ...req.body };
  db[table].push(novo);

  saveDB(db);
  res.json(novo);
});

app.patch("/api/:table/:id", (req, res) => {
  const db = loadDB();
  const table = req.params.table;
  const id = Number(req.params.id);

  db[table] = (db[table] || []).map((item) =>
    item.id === id ? { ...item, ...req.body } : item
  );

  saveDB(db);
  res.json({ ok: true });
});

app.delete("/api/:table/:id", (req, res) => {
  const db = loadDB();
  const table = req.params.table;
  const id = Number(req.params.id);

  db[table] = (db[table] || []).filter((item) => item.id !== id);

  saveDB(db);
  res.json({ ok: true });
});

// ROTAS DO CAIXA ---------------------------------------------------------

// REGISTRO DE VENDA (FALTAVA ISSO!)
app.post("/api/caixa/venda", (req, res) => {
  const db = loadDB();

  if (!db.vendas) db.vendas = [];

  const venda = {
    id: Date.now(),
    itens: req.body.itens,
    total: req.body.total,
    pago: req.body.pago,
    formaPagamento: req.body.formaPagamento,
    horario: new Date().toISOString(),
  };

  db.vendas.push(venda);
  saveDB(db);

  res.json(venda);
});

// LISTAR VENDAS DO DIA
app.get("/api/caixa/vendas-dia", (req, res) => {
  const db = loadDB();
  const hoje = new Date().toISOString().slice(0, 10);

  const vendas = (db.vendas || []).filter((v) =>
    (v.horario || "").startsWith(hoje)
  );

  res.json(vendas);
});

// INICIAR SERVIDOR -------------------------------------------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor funcionando na porta ${PORT}`);
});
