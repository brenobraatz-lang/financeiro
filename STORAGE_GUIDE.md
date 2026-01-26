# 💾 Gerenciamento de Armazenamento - Supabase Free Tier

## ⚠️ Limite do Supabase Free Tier

- **500 MB** de armazenamento total no PostgreSQL
- **Incluído**: Banco de dados, índices, logs, backups

## 📊 Estimativa de Uso

Com base no tamanho dos registros:
- **Despesa**: ~500 bytes cada (data, descrição, valor, tipo, status, etc)
- **Entrada de Caixa**: ~400 bytes cada
- **Sistema (índices, overhead)**: ~50 MB

### Exemplos:
- 10.000 despesas = ~5 MB + 50 MB overhead = 55 MB total (11% do limite)
- 50.000 despesas = ~25 MB + 50 MB overhead = 75 MB total (15% do limite)
- 100.000 despesas = ~50 MB + 50 MB overhead = 100 MB total (20% do limite)

## ✅ Monitorar Seu Uso

1. Acesse a aba **💾 Storage** no sistema
2. Veja o percentual de espaço usado
3. **Verde** (< 60%): Tudo bem
4. **Amarelo** (60-80%): Considere arquivar dados antigos
5. **Vermelho** (> 80%): Arquive dados imediatamente

## 📦 Como Arquivar Dados

### Passo 1: Preparar Arquivo
1. Vá para **💾 Storage**
2. Selecione a data limite (ex: 2023-01-01 para deletar tudo anterior)
3. Clique em "Preparar Arquivo"

### Passo 2: Baixar Backup
1. Sistema mostrará quantos registros serão arquivados
2. Clique em "Baixar Arquivo JSON"
3. Arquivo será salvo como `arquivo-dados-YYYY-MM-DD.json`

### Passo 3: Deletar do Banco
1. **⚠️ ANTES**: Certifique-se que o JSON foi baixado com sucesso
2. Clique em "Deletar Dados Antigos"
3. Confirme a ação (IRREVERSÍVEL)

## 💾 Armazenar Backup JSON Localmente

```bash
# Comprimir arquivo para economizar espaço local
# Windows - usar 7-Zip ou WinRAR
# Linux/Mac
gzip arquivo-dados-2024-01-01.json

# Resultará em arquivo-dados-2024-01-01.json.gz
# Reduz tamanho em ~90%
```

## 🔄 Estratégia Recomendada

### Mensal:
- [ ] Acessar **💾 Storage**
- [ ] Verificar percentual de uso
- [ ] Se > 60%, arquivar dados com 2-3 anos

### Trimestral:
- [ ] Revisar dados arquivados
- [ ] Comprimir antigos (.gz)
- [ ] Mover para serviço de backup (Google Drive, OneDrive, AWS S3)

### Anual:
- [ ] Fazer upgrade se necessário
- [ ] Revisar backup externo

## 📈 Quando Fazer Upgrade?

Considere um plano pago quando:
- Usar > 80% do limite regularmente
- Ter > 100.000 registros
- Precisar de mais de 2 usuários simultâneos
- Quiser melhor performance

### Opções de Upgrade:
1. **Plano Pro**: $25/mês - 8GB de storage
2. **Plano Enterprise**: Customizado

## 🔒 Backup Redundante

Para máxima segurança:
1. Backup automático do Supabase (7 dias)
2. Arquivos JSON mensais (seu sistema)
3. Serviço externo (Google Drive, S3, etc)

## 🚨 Erro: "Espaço Insuficiente"

Se encontrar este erro:
1. **Imediato**: Vá para **💾 Storage**
2. Arquive dados com > 2 anos
3. Confirme deleção
4. Aguarde ~1 minuto
5. Tente novamente

## ❓ FAQ

**P: Posso recuperar dados deletados?**
R: Não. Use a função de arquivamento ANTES de deletar. O Supabase tem backup de 7 dias, mas não é garantido.

**P: Onde armazeno os JSON arquivados?**
R: Recomendamos:
- Disco externo local
- Google Drive
- Dropbox
- AWS S3 (barato para armazenamento a longo prazo)

**P: Qual é o tamanho máximo do JSON?**
R: O navegador limita para ~100MB por arquivo. Se tiver muitos dados, o sistema divide automaticamente.

**P: Devo arquivar regularmente?**
R: Sim! Recomendamos arquivar dados com > 3 anos anualmente.

---

**Última atualização:** January 24, 2026
