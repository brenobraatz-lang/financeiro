import { database } from './database';

async function initDatabase() {
  try {
    // Criar tabela de despesas
    await database.run(`
      CREATE TABLE IF NOT EXISTS despesas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        valor REAL NOT NULL,
        data TEXT NOT NULL,
        descricao TEXT NOT NULL,
        tipoDespesa TEXT NOT NULL CHECK(tipoDespesa IN ('PESSOAL', 'ESCRITORIO', 'IMOVEIS')),
        subcategoria TEXT CHECK(subcategoria IN ('CONDOMINIO_JASMIM', 'RUA_ITAPIRA', 'GRANVILLE', 'TERRENOS') OR subcategoria IS NULL),
        empresa TEXT NOT NULL CHECK(empresa IN ('PESSOA_FISICA', 'PESSOA_JURIDICA', 'DINHEIRO')),
        statusPagamento TEXT NOT NULL CHECK(statusPagamento IN ('PAGA', 'AGENDADO', 'NAO_PAGA')),
        formaPagamento TEXT NOT NULL CHECK(formaPagamento IN ('PIX', 'BOLETO', 'CARTAO', 'DINHEIRO')),
        banco TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de entradas de caixa
    await database.run(`
      CREATE TABLE IF NOT EXISTS entradas_caixa (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        valor REAL NOT NULL,
        data TEXT NOT NULL,
        descricao TEXT NOT NULL,
        mes INTEGER NOT NULL,
        ano INTEGER NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar índices para melhor performance
    await database.run(`
      CREATE INDEX IF NOT EXISTS idx_despesas_data ON despesas(data)
    `);

    await database.run(`
      CREATE INDEX IF NOT EXISTS idx_despesas_empresa ON despesas(empresa)
    `);

    await database.run(`
      CREATE INDEX IF NOT EXISTS idx_despesas_status ON despesas(statusPagamento)
    `);

    await database.run(`
      CREATE INDEX IF NOT EXISTS idx_entradas_caixa_mes_ano ON entradas_caixa(mes, ano)
    `);

    console.log('✅ Banco de dados inicializado com sucesso!');
    database.close();
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    process.exit(1);
  }
}

initDatabase();
