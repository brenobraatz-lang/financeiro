import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import despesasRoutes from './routes/despesas.routes';
import caixaRoutes from './routes/caixa.routes';
import { database } from './database/database';

const app = express();
const httpServer = createServer(app);
const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: false
  }
});

const PORT = process.env.PORT || 3001;

// Exportar io para uso em controllers
export { io };

// Inicializar banco de dados
function initializeDatabase() {
  try {
    // Criar tabela de despesas
    database.run(`
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
    `).catch(err => console.error('Erro ao criar tabela despesas:', err));

    // Criar tabela de entradas de caixa
    database.run(`
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
    `).catch(err => console.error('Erro ao criar tabela entradas_caixa:', err));

    // Criar índices
    database.run(`CREATE INDEX IF NOT EXISTS idx_despesas_data ON despesas(data)`).catch(() => {});
    database.run(`CREATE INDEX IF NOT EXISTS idx_despesas_empresa ON despesas(empresa)`).catch(() => {});
    database.run(`CREATE INDEX IF NOT EXISTS idx_despesas_status ON despesas(statusPagamento)`).catch(() => {});
    database.run(`CREATE INDEX IF NOT EXISTS idx_entradas_caixa_mes_ano ON entradas_caixa(mes, ano)`).catch(() => {});

    console.log('✅ Banco de dados inicializado');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
  }
}

initializeDatabase();

// Middlewares
// CORS configurável via env (em produção defina ALLOWED_ORIGIN)
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log simples e rápido (sem try-catch que pode travar)
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.originalUrl}`);
  next();
});

// Rota raiz da API
app.get('/api', (req, res) => {
  res.json({
    message: 'Sistema Financeiro API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      despesas: {
        list: 'GET /api/despesas',
        create: 'POST /api/despesas',
        getById: 'GET /api/despesas/:id',
        update: 'PUT /api/despesas/:id',
        delete: 'DELETE /api/despesas/:id',
        relatorioMensal: 'GET /api/despesas/relatorio-mensal?mes=X&ano=Y',
        opcoesFiltros: 'GET /api/despesas/opcoes-filtros'
      },
      caixa: {
        mensal: 'GET /api/caixa/mensal?mes=X&ano=Y',
        entradas: {
          list: 'GET /api/caixa/entradas',
          create: 'POST /api/caixa/entradas',
          update: 'PUT /api/caixa/entradas/:id',
          delete: 'DELETE /api/caixa/entradas/:id'
        }
      }
    }
  });
});

// Rotas
app.use('/api/despesas', despesasRoutes);
app.use('/api/caixa', caixaRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Sistema Financeiro API' });
});

// Error handler para capturar erros não tratados e logar stack
app.use((err: any, req: any, res: any, next: any) => {
  console.error('💥 Unhandled error:', err && (err.stack || err));
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error', details: String(err) });
  } else {
    next(err);
  }
});

// Servir frontend estático em produção (se existir)
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Iniciar servidor
const server = httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 API disponível em http://localhost:${PORT}/api`);
  console.log(`🔌 WebSocket disponível (ALLOWED_ORIGIN=${allowedOrigin})`);
});

// Socket.IO conexão
io.on('connection', (socket) => {
  console.log(`👤 Cliente conectado: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`👤 Cliente desconectado: ${socket.id}`);
  });
});

// Tratamento de erros de servidor
server.on('error', (error: any) => {
  console.error('🔥 Erro no servidor:', error);
  process.exit(1);
});

// Tratamento de exceções não capturadas
process.on('uncaughtException', (error) => {
  console.error('💀 Exceção não capturada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Promise rejeitada sem tratamento:', reason);
  process.exit(1);
});

