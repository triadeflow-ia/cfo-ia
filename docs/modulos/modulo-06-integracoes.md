# Módulo 06 — Integrações

## Objetivo

Conectar o sistema a serviços externos (banco/extrato, NF, CRM, contabilidade) para importar dados automaticamente e manter consistência no Ledger/Relatórios/Growth.

## Arquitetura

### Adapter Pattern

Todas as integrações seguem o padrão adapter para manter desacoplamento:

```
/src/modules/integrations/
  /domain          # Types e schemas Zod
  /application     # Services (sync, match)
  /infra
    /repositories  # Data access
    /adapters      # Interfaces e implementações por provider
      /bank
      /nf
      /crm
      /accounting
```

### Principais Conceitos

1. **IntegrationConnection**: Gerencia credenciais e configurações de cada conexão
2. **BankTransaction**: Transações importadas do banco (raw)
3. **Match Engine**: Reconcilia BankTransactions com Transactions existentes
4. **MatchSuggestion**: Sugestões de match com score (0-100)

## Fluxos

### 1. Banco/Extrato

1. Usuário cria `IntegrationConnection` (provider + credenciais)
2. Sistema sincroniza via `syncBankTransactions`:
   - Busca transações do período (padrão: 90 dias)
   - Salva como `BankTransaction` (idempotente por `externalId`)
   - Atualiza `lastSyncAt` e `lastError`
3. Sistema roda `generateMatchSuggestions`:
   - Calcula score para cada BankTransaction vs Transactions existentes
   - Score >= 85: auto-match (cria vínculo)
   - Score 60-84: cria `MatchSuggestion`
   - Score < 60: marca como `UNMATCHED`
4. Usuário revisa sugestões na UI `/integrations/bank/reconcile`
5. Usuário aprova/rejeita matches ou cria nova Transaction

### 2. Nota Fiscal (NFe/NFSe) ✅

1. Sistema sincroniza via `syncInvoices`:
   - Busca invoices do período (padrão: 30 dias)
   - Salva como `Invoice` (idempotente por `externalId`)
   - Tenta vincular a `Client` (por nome ou documento futuro)
   - Se encontrar cliente: cria `Transaction` IN automaticamente
   - Se não mapear cliente: cria `Notification` para vincular manualmente
2. Atualiza `lastSyncAt` e `lastError`

### 3. CRM ✅

1. Sistema sincroniza via `syncCrm`:
   - Pull de `CrmClient[]` do adapter
   - Cria ou atualiza `Client` local (por nome)
   - Pull de `CrmContract[]` do adapter
   - Cria ou atualiza `ClientContract` local (por clientId + overlap de datas)
   - Atualiza MRR automaticamente (via `ClientContract`)
2. Atualiza `lastSyncAt` e `lastError`

## Modelos de Dados

### IntegrationConnection

```prisma
- id, orgId
- type: BANK | NF | ACCOUNTING | CRM
- provider: string (belvo, plaid, kommo, etc.)
- status: CONNECTED | DISCONNECTED | ERROR
- authJson: encrypted credentials
- settingsJson: configurações
- lastSyncAt, lastError
```

### BankTransaction

```prisma
- id, orgId, connectionId
- externalId (unique per connection)
- postedAt, amountCents, description, currency
- raw: Json (payload original)
- matchedTransactionId (nullable)
- matchStatus: UNMATCHED | SUGGESTED | MATCHED
```

### MatchSuggestion

```prisma
- id, orgId
- bankTransactionId, transactionId
- score: 0-100
- reason: Json (explicação do match)
```

### Invoice

```prisma
- id, orgId, connectionId?
- externalId (unique per connection)
- issuedAt, totalCents
- customerName, customerDoc?
- raw: Json
```

## Match Engine

### Score Calculation

Score de 0-100 baseado em:

1. **Valor igual** (40 pts): `Math.abs(bankTx.amountCents) === Math.abs(transaction.amountCents)`
2. **Data próxima** (30 pts): Diferença <= 2 dias (decai linearmente)
3. **Descrição similar** (30 pts): Similaridade de palavras (Jaccard)

### Regras de Match

- **Score >= 85**: Auto-match (vincula automaticamente)
- **Score 60-84**: Cria `MatchSuggestion` (requer aprovação)
- **Score < 60**: Ignora

## APIs

### Connections

- `GET /api/integrations/connections` - Lista conexões (filtros: type, status, provider)
- `POST /api/integrations/connections` - Cria conexão
- `PATCH /api/integrations/connections/:id` - Atualiza conexão
- `DELETE /api/integrations/connections/:id` - Desconecta (soft delete)

### Bank Sync

- `POST /api/integrations/bank/sync`
  - Body: `{ connectionId, from?, to?, mode?: "dry-run" | "apply" }`
  - Response: `{ importedCount, skippedDuplicates, errors, match: { autoMatched, suggested, unmatched } }`

### Reconcile

- `GET /api/integrations/bank/reconcile` - Lista transações com sugestões (filtros: connectionId, status, from, to, page, pageSize)
- `POST /api/integrations/bank/reconcile/approve` - Aprova match (vincula ou cria Transaction)
- `POST /api/integrations/bank/reconcile/reject` - Rejeita match (volta para UNMATCHED)

### Invoice Sync

- `GET /api/integrations/invoices` - Lista invoices (filtros: connectionId, from, to, page, pageSize)
- `POST /api/integrations/invoices/sync`
  - Body: `{ connectionId, from?, to? }`
  - Response: `{ importedCount, skippedDuplicates, transactionsCreated, notificationsCreated, errors }`

### CRM Sync

- `POST /api/integrations/crm/sync`
  - Body: `{ connectionId }`
  - Response: `{ clientsCreated, clientsUpdated, contractsCreated, contractsUpdated, errors }`

## UI

### /integrations/connections

- Cards com status, lastSyncAt, lastError
- Ações: "Sync banco", "Ver reconciliação", "Desconectar"
- Filtros: tipo, status

### /integrations/bank/reconcile

- Tabela com BankTransactions
- Colunas: Data, Descrição, Valor, Status, Sugestão (com score), Ações
- Ações: "Aprovar match", "Rejeitar"
- Filtros: connectionId, status, período

## Providers

### Bank (MVP)

- **Mock**: Para desenvolvimento/testes (MockBankAdapter)
- **Belvo**: Open Finance Brasil (preparado para implementar)
- **Plaid**: EUA/Canadá (preparado)
- **Nordigen**: Europa (preparado)

### Invoice ✅

- **Mock**: Para desenvolvimento/testes (MockInvoiceAdapter)
- **NFe/NFSe**: Preparado para implementar adapters reais

### CRM ✅

- **Placeholder**: Implementação básica (PlaceholderCrmAdapter)
- **Kommo (GoHighLevel)**: Preparado para implementar
- **GHL**: Preparado para implementar

### Accounting (Futuro)

- Conta Azul
- Omie
- QuickBooks

## Segurança

1. **Credenciais**: Armazenadas em `authJson` (encrypted em produção)
2. **RBAC**: Permissões `VIEW_INTEGRATIONS` e `EDIT_INTEGRATIONS` (ou roles)
3. **Audit Log**: Todas ações criam audit log com `source=integrations`
4. **Idempotência**: Sync é idempotente por `externalId`

## Testes

### Unit Tests

- Match engine scoring boundaries
- Bank adapter interface compliance

### Integration Tests

- `/bank/sync` cria BankTransaction e não duplica
- `approve` reconcile vincula corretamente

## Como Testar com MockBankAdapter

1. Criar conexão tipo `BANK`, provider `mock`
2. Fazer sync (gera transações mockadas)
3. Rodar match engine (gera sugestões)
4. Revisar e aprovar matches na UI

## Workers / Cron Jobs ✅

Workers implementados para sincronização automática:

### Bank Sync Worker
- **Arquivo**: `src/workers/integrations-bank-sync.ts`
- **Cron sugerido**: `0 2 * * *` (2h da manhã diariamente)
- **Script**: `npm run worker:integrations:bank`
- Processa todas conexões BANK com status CONNECTED

### Invoice Sync Worker
- **Arquivo**: `src/workers/integrations-invoice-sync.ts`
- **Cron sugerido**: `0 3 * * *` (3h da manhã diariamente)
- **Script**: `npm run worker:integrations:invoice`
- Processa todas conexões NF com status CONNECTED

### CRM Sync Worker
- **Arquivo**: `src/workers/integrations-crm-sync.ts`
- **Cron sugerido**: `0 4 * * *` (4h da manhã diariamente)
- **Script**: `npm run worker:integrations:crm`
- Processa todas conexões CRM com status CONNECTED

### Match Engine Worker
- **Arquivo**: `src/workers/integrations-match-engine.ts`
- **Cron sugerido**: `*/10 * * * *` (a cada 10 minutos)
- **Script**: `npm run worker:integrations:match`
- Processa todas organizações com BankTransactions não matchadas

### Como configurar Cron (exemplo)

```bash
# No crontab (crontab -e)
0 2 * * * cd /path/to/project && npm run worker:integrations:bank
0 3 * * * cd /path/to/project && npm run worker:integrations:invoice
0 4 * * * cd /path/to/project && npm run worker:integrations:crm
*/10 * * * * cd /path/to/project && npm run worker:integrations:match
```

## Próximos Passos

- [ ] UI de invoices (/integrations/invoices)
- [ ] Notificação WhatsApp: "Chegaram X lançamentos; Y reconciliados automaticamente"
- [ ] Encryption at rest para `authJson`
- [ ] Implementar providers reais (Belvo, Kommo, GHL, etc.)
- [ ] Adicionar campo `customerDoc` ao model Client para melhor matching de invoices
- [ ] Webhook handlers para invoices (além de polling)

## Decisões

1. **Soft delete**: Connections são marcadas como DISCONNECTED, não deletadas
2. **Auto-match threshold**: 85 (configurável no futuro)
3. **Período padrão sync**: 90 dias (configurável)
4. **Pagination**: Server-side, 25 itens por página


