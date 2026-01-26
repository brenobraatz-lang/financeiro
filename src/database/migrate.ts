import { database } from './database';

async function migrate() {
  try {
    console.log('🔄 Iniciando migração do banco de dados...');

    // Criar nova tabela com schema correto
    await database.run(`
      CREATE TABLE IF NOT EXISTS despesas_new (
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

    // Copiar dados existentes (se houver)
    await database.run(`
      INSERT INTO despesas_new (id, valor, data, descricao, tipoDespesa, subcategoria, empresa, statusPagamento, formaPagamento, banco, createdAt, updatedAt)
      SELECT id, valor, data, descricao, 
             CASE 
               WHEN tipoDespesa IN ('PESSOAL', 'ESCRITORIO', 'IMOVEIS') THEN tipoDespesa
               ELSE 'PESSOAL'
             END as tipoDespesa,
             NULL as subcategoria,
             CASE 
               WHEN empresa = 'HOLDING' THEN 'DINHEIRO'
               ELSE empresa
             END as empresa,
             CASE 
               WHEN statusPagamento = 'NAO_PAGA' THEN 'NAO_PAGA'
               WHEN statusPagamento = 'PAGA' THEN 'PAGA'
               ELSE 'NAO_PAGA'
             END as statusPagamento,
             CASE 
               WHEN formaPagamento = 'TRANSFERENCIA' THEN 'PIX'
               ELSE formaPagamento
             END as formaPagamento,
             banco, createdAt, updatedAt
      FROM despesas
    `).catch(() => {
      // Se não existir tabela antiga, ignora
      console.log('Tabela antiga não encontrada, criando nova...');
    });

    // Remover tabela antiga
    await database.run('DROP TABLE IF EXISTS despesas');

    // Renomear nova tabela
    await database.run('ALTER TABLE despesas_new RENAME TO despesas');

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

    // Recriar índices
    await database.run('DROP INDEX IF EXISTS idx_despesas_data');
    await database.run('DROP INDEX IF EXISTS idx_despesas_empresa');
    await database.run('DROP INDEX IF EXISTS idx_despesas_status');
    
    await database.run('CREATE INDEX IF NOT EXISTS idx_despesas_data ON despesas(data)');
    await database.run('CREATE INDEX IF NOT EXISTS idx_despesas_empresa ON despesas(empresa)');
    await database.run('CREATE INDEX IF NOT EXISTS idx_despesas_status ON despesas(statusPagamento)');
    await database.run('CREATE INDEX IF NOT EXISTS idx_entradas_caixa_mes_ano ON entradas_caixa(mes, ano)');

    console.log('✅ Migração concluída com sucesso!');
    database.close();
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  }
}

migrate();

