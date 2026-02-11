const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '..', 'financeiro.db');
const db = new sqlite3.Database(dbPath);

const despesa = {
  valor: 250.00,
  data: '2026-02-12',
  descricao: 'Despesa em dinheiro paga (teste)',
  tipoDespesa: 'PESSOAL',

  subcategoria: null,
  empresa: 'PESSOA_FISICA',
  statusPagamento: 'PAGA',
  formaPagamento: 'DINHEIRO',
  banco: null
};

db.serialize(() => {
  const sql = `INSERT INTO despesas (valor, data, descricao, tipoDespesa, subcategoria, empresa, statusPagamento, formaPagamento, banco, createdAt, updatedAt)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
  db.run(sql, [despesa.valor, despesa.data, despesa.descricao, despesa.tipoDespesa, despesa.subcategoria, despesa.empresa, despesa.statusPagamento, despesa.formaPagamento, despesa.banco], function(err) {
    if (err) {
      console.error('Erro ao inserir despesa:', err);
      process.exit(1);
    }
    console.log('Despesa inserida com id', this.lastID);
    db.close();
  });
});
