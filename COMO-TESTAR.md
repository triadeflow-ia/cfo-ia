# 🧪 Como Testar o Sistema - Guia Rápido

## ⚡ Início Rápido

### 1️⃣ Instalar Dependências (se ainda não instalou)

```bash
npm install
```

### 2️⃣ Configurar Banco de Dados

Certifique-se de ter PostgreSQL rodando e configurar `.env`:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/gestor_financeira?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="seu-secret-aqui"
```

### 3️⃣ Rodar Migrations

```bash
npm run db:generate
npm run db:migrate
```

### 4️⃣ Iniciar Servidor

```bash
npm run dev
```

Acesse: **http://localhost:3000**

---

## 🎯 Teste das Integrações (Marco 6)

### Teste 1: Criar Conexão Bank Mock

1. Acesse: http://localhost:3000/integrations/connections
2. Clique "Nova Conexão"
3. Escolha:
   - **Tipo**: `BANK`
   - **Provider**: `mock`
4. Clique "Criar"

### Teste 2: Ativar Conexão

**Opção A - Prisma Studio (Mais fácil):**
```bash
npm run db:studio
```
- Abra tabela `integration_connections`
- Encontre sua conexão
- Mude `status` de `DISCONNECTED` → `CONNECTED`
- Salve

**Opção B - Via API (com curl/Postman):**
```bash
# PATCH /api/integrations/connections/{id}
# Body: {"status": "CONNECTED"}
```

### Teste 3: Sincronizar Transações

1. Na página de conexões, clique **"Sync Banco"**
2. Deve aparecer mensagem de sucesso
3. Verifique: http://localhost:3000/integrations/bank/reconcile

### Teste 4: Ver Transações Importadas

1. Acesse: http://localhost:3000/integrations/bank/reconcile
2. Você deve ver transações mockadas na tabela

### Teste 5: Testar Invoices

1. Crie nova conexão: Tipo `NF`, Provider `mock`
2. Ative a conexão (status `CONNECTED`)
3. Acesse: http://localhost:3000/integrations/invoices
4. Clique **"Sync"** na conexão
5. Deve importar invoices mockados

### Teste 6: Vincular Invoice a Cliente

1. Na página de invoices, clique **"Vincular Cliente"**
2. Selecione cliente e conta
3. Clique **"Criar Transação"**
4. Verifique se Transaction foi criada no ledger

---

## 🔍 Verificação no Banco

Use Prisma Studio para verificar dados:

```bash
npm run db:studio
```

**Tabelas importantes:**
- ✅ `integration_connections` - Suas conexões
- ✅ `bank_transactions` - Transações importadas
- ✅ `invoices` - Invoices importados
- ✅ `match_suggestions` - Sugestões de match
- ✅ `transactions` - Transações criadas

---

## 📋 Checklist de Teste

- [ ] Servidor rodando (http://localhost:3000)
- [ ] Migrations aplicadas
- [ ] Conexão BANK mock criada
- [ ] Conexão ativada (status CONNECTED)
- [ ] Sync de bank executado com sucesso
- [ ] Transações aparecem na página de reconcile
- [ ] Conexão NF mock criada
- [ ] Sync de invoices executado
- [ ] Invoices aparecem na página de invoices
- [ ] Vincular invoice funciona

---

## 🐛 Problemas Comuns

### "prisma não é reconhecido"
**Solução**: Execute `npm install` primeiro

### "Connection not found"
**Solução**: Verifique se o connectionId está correto

### "No account found"
**Solução**: Crie uma conta primeiro:
- Acesse: http://localhost:3000/ledger/accounts
- Ou crie via Prisma Studio na tabela `financial_accounts`

### Nenhuma transação aparece
**Solução**: 
- Verifique se o sync foi executado
- Verifique se conexão está com status `CONNECTED`
- Veja no Prisma Studio se há dados em `bank_transactions`

---

## 📚 Documentação Completa

Para mais detalhes, veja:
- `docs/TESTE-MARCO-6.md` - Guia completo de teste
- `docs/MARCO-6-COMPLETO-ENTREGA.md` - Documentação do Marco 6

---

**Bons testes! 🚀**


