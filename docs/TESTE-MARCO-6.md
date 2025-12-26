# Guia de Teste - Marco 6 (Integrações)

Este guia te ajuda a testar todas as funcionalidades de integrações implementadas.

## 📋 Pré-requisitos

1. Node.js 18+ instalado
2. PostgreSQL rodando
3. Variáveis de ambiente configuradas (`.env`)

## 🔧 Passo 1: Preparar o Ambiente

### 1.1 Verificar/Instalar dependências

```bash
npm install
```

### 1.2 Verificar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto (se não existir):

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/gestor_financeira?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="seu-secret-aqui"  # Gere um secret aleatório

# Redis (opcional para testes básicos)
REDIS_URL="redis://localhost:6379"
```

### 1.3 Gerar Prisma Client

```bash
npm run db:generate
```

### 1.4 Rodar Migrations

```bash
npm run db:migrate
```

Isso criará todas as tabelas, incluindo:
- `integration_connections`
- `bank_transactions`
- `match_suggestions`
- `invoices`

## 🚀 Passo 2: Iniciar o Servidor

```bash
npm run dev
```

Acesse: http://localhost:3000

## 🧪 Passo 3: Testar Funcionalidades

### 3.1 Criar Conexão Mock (Bank)

1. Acesse: http://localhost:3000/integrations/connections
2. Clique em "Nova Conexão"
3. Preencha:
   - **Tipo**: `BANK`
   - **Provider**: `mock`
4. Clique em "Criar"

✅ **Resultado esperado**: Conexão criada com status `DISCONNECTED`

### 3.2 Conectar a Conexão (mudar status para CONNECTED)

**Via Prisma Studio** (mais fácil):
```bash
npm run db:studio
```

1. Abra `IntegrationConnection`
2. Encontre sua conexão criada
3. Mude `status` de `DISCONNECTED` para `CONNECTED`
4. Salve

**Ou via API** (mais técnico):
```bash
# Primeiro, pegue o ID da conexão (olhe no Prisma Studio ou no console do navegador)
# Depois, faça PATCH:

curl -X PATCH http://localhost:3000/api/integrations/connections/{connectionId} \
  -H "Content-Type: application/json" \
  -d '{"status": "CONNECTED"}'
```

### 3.3 Sincronizar Transações Bancárias

1. Na página de conexões, clique em "Sync Banco" na conexão criada
2. Ou acesse diretamente a API:

```bash
# Substitua {connectionId} pelo ID real
curl -X POST http://localhost:3000/api/integrations/bank/sync \
  -H "Content-Type: application/json" \
  -d '{
    "connectionId": "{connectionId}"
  }'
```

✅ **Resultado esperado**: 
- Response com `importedCount`, `skippedDuplicates`, `match`
- No Prisma Studio, você verá registros em `BankTransaction` (tabela `bank_transactions`)

### 3.4 Ver Transações Importadas

1. Acesse: http://localhost:3000/integrations/bank/reconcile
2. Você deve ver as transações importadas do mock

✅ **Resultado esperado**: Tabela com transações mockadas (valores e datas fictícias)

### 3.5 Testar Match Engine

**Via API** (worker manual):
```bash
# O match engine roda automaticamente após sync, mas você pode rodar manualmente via código
# Ou criar transações manuais e ver se aparecem matches

# Primeiro, crie algumas transações no ledger (via UI ou Prisma Studio)
# Depois, o match engine vai sugerir matches automaticamente
```

**Via Worker**:
```bash
npm run worker:integrations:match
```

### 3.6 Aprovar/Rejeitar Matches

1. Na página de reconciliação (`/integrations/bank/reconcile`)
2. Se houver sugestões (score 60-84), você verá botões de ação
3. Clique em "Aprovar Match" ou "Criar Transação"

✅ **Resultado esperado**: 
- Transação vinculada ou criada
- Status muda para `MATCHED`

### 3.7 Testar Invoice Sync

1. Criar nova conexão tipo `NF`, provider `mock`:
   - Acesse: http://localhost:3000/integrations/connections/new
   - Tipo: `NF`
   - Provider: `mock`
   
2. Mudar status para `CONNECTED` (via Prisma Studio)

3. Sincronizar invoices:
```bash
curl -X POST http://localhost:3000/api/integrations/invoices/sync \
  -H "Content-Type: application/json" \
  -d '{
    "connectionId": "{invoiceConnectionId}"
  }'
```

✅ **Resultado esperado**:
- Response com `importedCount`, `transactionsCreated`, `notificationsCreated`
- Ver invoices em: http://localhost:3000/integrations/invoices

### 3.8 Vincular Invoice a Cliente

1. Acesse: http://localhost:3000/integrations/invoices
2. Clique em "Vincular Cliente" em um invoice
3. Selecione cliente e conta
4. Clique em "Criar Transação"

✅ **Resultado esperado**:
- Transaction IN criada no ledger
- Invoice vinculada ao cliente

### 3.9 Testar CRM Sync

1. Criar conexão tipo `CRM`, provider `placeholder`
2. Mudar status para `CONNECTED`
3. Sincronizar:
```bash
curl -X POST http://localhost:3000/api/integrations/crm/sync \
  -H "Content-Type: application/json" \
  -d '{
    "connectionId": "{crmConnectionId}"
  }'
```

✅ **Resultado esperado**: 
- Response com `clientsCreated`, `contractsCreated`
- (Placeholder adapter retorna arrays vazios por enquanto)

## 🔍 Verificação no Banco de Dados

Use Prisma Studio para verificar dados:

```bash
npm run db:studio
```

**Tabelas para verificar:**
- `integration_connections` - Suas conexões criadas
- `bank_transactions` - Transações importadas do banco
- `match_suggestions` - Sugestões de match
- `invoices` - Invoices importados
- `transactions` - Transações criadas a partir de bank/invoice sync

## 🐛 Troubleshooting

### Erro: "Connection not found"
- Verifique se o `connectionId` está correto
- Verifique se a conexão pertence à sua organização (orgId)

### Erro: "No account found"
- Crie pelo menos uma conta financeira primeiro:
  - Acesse: http://localhost:3000/ledger/accounts
  - Ou via Prisma Studio na tabela `financial_accounts`

### Erro: Migrations não rodam
- Verifique se o PostgreSQL está rodando
- Verifique se `DATABASE_URL` está correto no `.env`
- Tente: `npx prisma migrate reset` (⚠️ apaga todos os dados)

### Nenhuma transação aparece no reconcile
- Verifique se o sync foi executado com sucesso
- Verifique se há registros na tabela `bank_transactions` no Prisma Studio
- Verifique se a conexão está com status `CONNECTED`

## ✅ Checklist de Teste

- [ ] Conexão BANK mock criada e conectada
- [ ] Sync de bank transactions executado
- [ ] Transações aparecem na página de reconcile
- [ ] Match engine gera sugestões (se houver transações similares no ledger)
- [ ] Aprovar match funciona
- [ ] Criar transação a partir de bank transaction funciona
- [ ] Conexão NF mock criada e conectada
- [ ] Sync de invoices executado
- [ ] Invoices aparecem na página de invoices
- [ ] Vincular invoice a cliente funciona
- [ ] Conexão CRM criada (placeholder)
- [ ] Sync CRM executado (mesmo que vazio com placeholder)

## 📝 Próximos Passos

Depois de testar o básico, você pode:

1. **Criar transações manuais** no ledger para testar match engine
2. **Testar workers** manualmente: `npm run worker:integrations:bank`
3. **Implementar providers reais** (Belvo, Kommo, etc.)
4. **Adicionar mais dados de teste** via Prisma Studio

## 🎯 Dados de Teste Sugeridos

Para testar melhor o match engine, crie transações no ledger que sejam similares às transações mock:

**Transações MockBankAdapter cria:**
- Valor: R$ 1.200,00 (120000 cents)
- Descrição: "Pagamento Meta Ads"
- Data: Hoje

**Crie no ledger:**
- Transaction OUT
- Valor: R$ 1.200,00
- Descrição: "Meta Ads - Campanha Janeiro"
- Data: Hoje ou ontem
- Account: qualquer conta

O match engine deve sugerir um match com score alto (80-90+).

---

**Boa sorte nos testes! 🚀**


