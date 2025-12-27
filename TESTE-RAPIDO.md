# Teste Rápido - Marco 6 Integrações

## Passo 1: Preparar Banco de Dados

```bash
# Gerar Prisma Client
npm run db:generate

# Rodar migrations (cria tabelas)
npm run db:migrate
```

## Passo 2: Iniciar Servidor

```bash
npm run dev
```

Acesse: http://localhost:3000

## Passo 3: Testar via UI

### 3.1 Criar Conexão Bank Mock

1. Vá em: http://localhost:3000/integrations/connections
2. Clique "Nova Conexão"
3. Tipo: `BANK`, Provider: `mock`
4. Criar

### 3.2 Ativar Conexão (via Prisma Studio)

```bash
npm run db:studio
```

- Abra tabela `integration_connections`
- Encontre sua conexão
- Mude `status` de `DISCONNECTED` para `CONNECTED`
- Salve

### 3.3 Sincronizar

1. Volte na página de conexões
2. Clique "Sync Banco"
3. Deve importar transações mockadas

### 3.4 Ver Reconciliação

1. Vá em: http://localhost:3000/integrations/bank/reconcile
2. Deve ver transações importadas

### 3.5 Testar Invoices

1. Crie conexão tipo `NF`, provider `mock`
2. Ative (status `CONNECTED` via Prisma Studio)
3. Acesse: http://localhost:3000/integrations/invoices
4. Clique "Sync" na conexão
5. Deve importar invoices mockados

## Verificação Rápida

Use Prisma Studio para verificar:

```bash
npm run db:studio
```

Verifique as tabelas:
- `integration_connections` - Suas conexões
- `bank_transactions` - Transações importadas
- `invoices` - Invoices importados

## Próximos Passos

Veja o guia completo: `docs/TESTE-MARCO-6.md`




