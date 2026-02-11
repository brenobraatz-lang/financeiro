const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '..', 'financeiro.db');
const db = new sqlite3.Database(dbPath);

const mes = process.argv[2] || '2';
const ano = process.argv[3] || '2026';

function q(sql, params) {
  return new Promise((resolve, reject) => {
    db.all(sql, params || [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

(async () => {
  try {
    const mesStr = String(mes).padStart(2, '0');
    console.log('Inspectando despesas para', mesStr, ano, '...');

    const all = await q(
      `SELECT id, valor, data, descricao, formaPagamento, statusPagamento FROM despesas WHERE strftime('%m', data) = ? AND strftime('%Y', data) = ? ORDER BY data DESC, id DESC`,
      [mesStr, String(ano)]
    );

    const dinheiro = await q(
      `SELECT id, valor, data, descricao, formaPagamento, statusPagamento FROM despesas WHERE strftime('%m', data) = ? AND strftime('%Y', data) = ? AND formaPagamento = 'DINHEIRO' ORDER BY data DESC, id DESC`,
      [mesStr, String(ano)]
    );

    const dinheiroPaga = await q(
      `SELECT id, valor, data, descricao, formaPagamento, statusPagamento FROM despesas WHERE strftime('%m', data) = ? AND strftime('%Y', data) = ? AND formaPagamento = 'DINHEIRO' AND statusPagamento = 'PAGA' ORDER BY data DESC, id DESC`,
      [mesStr, String(ano)]
    );

    console.log('\nTodas as despesas do período:', JSON.stringify(all, null, 2));
    console.log('\nDespesas com formaPagamento=DINHEIRO:', JSON.stringify(dinheiro, null, 2));
    console.log('\nDespesas com DINHEIRO e PAGA:', JSON.stringify(dinheiroPaga, null, 2));
  } catch (err) {
    console.error('Erro na inspeção:', err);
  } finally {
    db.close();
  }
})();
