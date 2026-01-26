# 💰 Sistema Financeiro com React + Supabase

Sistema de controle financeiro completo com CRUD de despesas, entradas de caixa, dashboard, relatórios e backup.

## ✨ Funcionalidades Principais

### 📊 Dashboard
- Relatório mensal/anual dinâmico
- Filtro por tipo (Pessoa Física, Jurídica, Dinheiro)
- Cards com totais em tempo real

### 💸 Despesas
- ✅ CRUD completo (criar, editar, deletar)
- 🔍 7 filtros avançados (mês, ano, empresa, tipo, banco, forma pagamento, status)
- 📄 Paginação (10 itens por página)
- 🎨 Status com cores (verde/amarelo/vermelho)
- 🔄 Sincronização WebSocket em tempo real

### 🏦 Caixa
- ✅ CRUD para entradas de caixa
- 📅 Período mensal/anual
- 📊 Resumo (Entradas, Saídas, Saldo)
- 📄 Paginação de movimentações
- 🔄 Sincronização em tempo real

### 📈 Relatórios
- 📊 Gráfico Pizza (status)
- 📊 Gráfico Barras (tipo)
- 💾 Export Excel/CSV/JSON

### 💾 Gerenciamento de Storage
- 📊 Monitorar uso (Free Tier = 500MB)
- 📦 Arquivar dados antigos
- 🗑️ Deletar com segurança
- ⚠️ Alertas de espaço crítico

### 🔐 Segurança & Backup
- 📥 Export múltiplos formatos
- 🔐 Autenticação Supabase Auth
- ✅ Validações de dados
- 🧪 Testes com Vitest

## 🛠️ Stack Técnico

**Frontend:**
- React 19 + TypeScript
- Vite (bundler rápido)
- React Router v6
- Socket.io-client (sync real-time)
- Recharts (gráficos)
- CSS responsivo (mobile-first)

**Backend:**
- Node.js + Express
- Supabase (PostgreSQL)
- Socket.io (WebSocket)
- Validações com Zod
- Testes com Vitest

**Deployment:**
- Docker pronto
- Build otimizado (1.4MB JS + 19.5KB CSS)
- Responsivo (480px, 768px, desktop)

## 🚀 Como Começar

### 1. Instalar Dependências
```bash
npm install
cd client && npm install && cd ..
```

### 2. Variáveis de Ambiente
```bash
# Backend (.env)
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_KEY=...
```

### 3. Executar
```bash
npm run dev          # Backend + Frontend
npm run build        # Build produção
npm run test         # Testes
```

### 4. Primeiro Uso
1. Criar conta no banco
2. Acessar Dashboard
3. Adicionar despesa no menu "Despesas"
4. Verificar Storage (💾 Storage) se espaço suficiente

## 📦 Gerenciamento de Storage Supabase

### ⚠️ Limitação Free Tier: 500MB

O Supabase Free oferece 500MB total de armazenamento. Com crescimento de dados, você pode:

### ✅ Solução Implementada

1. **Monitorar Uso** (página 💾 Storage)
   - Real-time tracking
   - Alertas em 60% e 80% de uso
   - Estimativa de espaço por tabela

2. **Arquivar Dados Antigos**
   - Selecione data limite
   - Sistema prepara JSON com histórico
   - Baixe arquivo para backup local
   - Opcionalmente delete dados

3. **Estratégia Recomendada**
   - Verificar storage mensalmente
   - Arquivar dados com 2+ anos
   - Manter backup externo (Google Drive, OneDrive)
   - Deletar dados somente após confirmar backup

### 📊 Estimativa de Espaço

```
1 Despesa = ~500 bytes
1 Entrada Caixa = ~400 bytes
Sistema Overhead = ~50MB

Exemplo:
- 10.000 despesas = 5MB
- 10.000 entradas = 4MB  
- Sistema = 50MB
- TOTAL ≈ 59MB (seguro)

- 50.000 despesas = 25MB
- 50.000 entradas = 20MB
- Sistema = 50MB
- TOTAL ≈ 95MB (seguro)

- 100.000 despesas = 50MB
- 100.000 entradas = 40MB
- Sistema = 50MB
- TOTAL ≈ 140MB (LIMPAR!)
```

### 🆘 Quando Fazer Upgrade

| Registros | Espaço | Ação |
|-----------|--------|------|
| < 50k | < 100MB | Seguro |
| 50k-100k | 100-150MB | Arquivar |
| > 100k | > 150MB | Fazer upgrade |

**Upgrade para Pro ($10/mês):**
- 5GB de storage
- Mais conexões WebSocket
- Better SLA

## 🔒 Segurança

- Autenticação com Supabase Auth
- Senhas com bcrypt
- Validações server-side
- CORS configurado
- Rate limiting

## 📱 Responsivo

Otimizado para:
- 📱 Mobile (480px+)
- 📱 Tablet (768px+)
- 🖥️ Desktop (1024px+)

## 🧪 Testes

```bash
npm run test              # Rodar testes
npm run test:watch      # Watch mode
npm run test:coverage   # Cobertura
```

Testes incluem:
- Validações de despesas
- Socket.io events
- Formatos de entrada
- Cálculos de resumo

## 📚 Documentação

- [STORAGE_GUIDE.md](./STORAGE_GUIDE.md) - Guia completo de gerenciamento de armazenamento
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deploy em produção
- [DOCUMENTACAO.md](./DOCUMENTACAO.md) - Documentação técnica
- [Dockerfile](./Dockerfile) - Deploy com Docker

## 🎯 Roadmap Futuro

- [ ] Gráficos de tendência (últimos 12 meses)
- [ ] Alertas por email
- [ ] Integração bancária
- [ ] Orçamento mensal
- [ ] Categorias customizáveis
- [ ] API pública
- [ ] Mobile app (React Native)

## 🔄 Última Atualização

**Janeiro 24, 2026:**
- ✅ Backup e Storage consolidados em Configurações (⚙️)
- ✅ Navbar simplificada (Dashboard, Despesas, Caixa, Configurações)
- ✅ Build otimizado (480KB JS, 19.77KB CSS)
- ✅ Sistema completo pronto para produção

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

MIT License - veja LICENSE para detalhes

## 👨‍💻 Desenvolvedor

Desenvolvido com ❤️ para otimizar controle financeiro

## 📞 Suporte

Dúvidas? Verifique:
1. STORAGE_GUIDE.md (para problemas de espaço)
2. Aba 💾 Storage (monitorar uso)
3. DEPLOYMENT.md (deploy)

---

**Última atualização:** Janeiro 2026
**Build Status:** ✅ Pronto para produção
**Storage:** 💾 Gerenciado com alertas automáticos

**Backend apenas:**
```bash
npm run dev:server
```

**Frontend apenas:**
```bash
npm run dev:client
```

## 📁 Estrutura do Projeto

```
financeiro/
├── src/                    # Código do backend
│   ├── server.ts          # Servidor Express
│   ├── routes/            # Rotas da API
│   │   └── despesas.routes.ts
│   ├── controllers/       # Lógica de negócio
│   │   └── DespesaController.ts
│   ├── models/           # Modelos de dados
│   │   └── Despesa.ts
│   └── database/        # Configuração do banco
│       ├── database.ts
│       └── init.ts
├── client/              # Aplicação React
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── pages/       # Páginas
│   │   ├── services/    # Serviços de API
│   │   └── types/       # Tipos TypeScript
│   └── package.json
├── dist/                # Código compilado (backend)
└── financeiro.db        # Banco de dados SQLite
```

## 🏢 Entidades

O sistema trabalha com três categorias fixas:
- **Pessoa Física** (PF)
- **Pessoa Jurídica** (PJ)
- **Holding**

Cada despesa deve estar vinculada a uma dessas três opções.

## 📊 Relatórios

Relatórios mensais automáticos mostram:
- Total gasto por mês
- Total separado por empresa (PF, PJ, Holding)
- Quantidade de despesas por empresa
- Despesas agrupadas por tipo

## 🔍 Filtros

Sistema de filtros permite buscar por:
- **Mês/Ano** - Filtrar por período específico
- **Empresa** - PF, PJ ou Holding
- **Tipo de despesa** - Ex: Aluguel, Imposto, Fornecedor
- **Banco** - Banco utilizado no pagamento
- **Forma de pagamento** - Pix, Boleto, Cartão, etc.
- **Status** - Paga ou Não paga

## 🧾 Campos da Despesa

Cada despesa contém:
- **Valor** - Valor da despesa (obrigatório)
- **Data** - Data da despesa (obrigatório)
- **Descrição** - Descrição detalhada (obrigatório)
- **Tipo de Despesa** - Categoria (ex: Aluguel, Imposto) (obrigatório)
- **Empresa** - PF, PJ ou Holding (obrigatório)
- **Status do Pagamento** - Paga ou Não paga (obrigatório)
- **Forma de Pagamento** - Pix, Boleto, Cartão, Transferência, Dinheiro (obrigatório)
- **Banco** - Banco utilizado (obrigatório)

## 🔧 Tecnologias

**Backend:**
- Node.js + Express
- TypeScript
- SQLite

**Frontend:**
- React 19
- TypeScript
- Vite
- React Router

## 📝 API Endpoints

- `GET /api/despesas` - Listar despesas (com filtros opcionais)
- `POST /api/despesas` - Criar nova despesa
- `GET /api/despesas/:id` - Obter despesa por ID
- `PUT /api/despesas/:id` - Atualizar despesa
- `DELETE /api/despesas/:id` - Excluir despesa
- `GET /api/despesas/relatorio-mensal?mes=X&ano=Y` - Gerar relatório mensal
- `GET /api/despesas/opcoes-filtros` - Obter opções para filtros

## 🚀 Build para Produção

```bash
# Build completo
npm run build

# Executar produção
npm start
```

## 📄 Licença

ISC
