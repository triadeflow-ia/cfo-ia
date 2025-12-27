# Módulo 01 — Ledger MVP

## Objetivo

Criar o núcleo financeiro do sistema (Ledger) com:

- Entidades base (Account, Category, CostCenter, Client, Vendor)
- Transações com filtros avançados
- Importação CSV com deduplicação
- Relatório simples de gastos por categoria

## Fluxos Principais

### 1. Gestão de Entidades Base

1. Usuário cria contas, categorias, centros de custo, clientes e fornecedores
2. Todas as entidades são isoladas por `orgId`
3. Validação de unicidade por organização (ex: não pode ter duas contas com mesmo nome)

### 2. Lançamento de Transações

1. Usuário lança transações manualmente ou via CSV
2. Cada transação tem:
   - Tipo: IN (entrada) ou OUT (saída)
   - Status: CLEARED (compensado) ou PENDING (pendente)
   - Data (caixa) e competência (opcional)
   - Valor em centavos (amountCents)
   - Relacionamentos opcionais: categoria, centro de custo, cliente, fornecedor

### 3. Importação CSV

1. Usuário cola CSV com formato: `date,description,amount,accountId`
2. Sistema faz parse e valida dados
3. Gera `importHash` para deduplicação
4. Cria transações em lote (skipDuplicates)

### 4. Relatórios

1. Usuário seleciona período
2. Sistema agrupa saídas (OUT) por categoria
3. Mostra total e percentual

## Regras do MVP

### Valores

- **Sempre em centavos** (`amountCents`) para evitar problemas de ponto flutuante
- Conversão na UI: `amountCents / 100`

### Multi-tenant

- Tudo filtrado por `orgId`
- Nunca retornar dados de outra organização

### Deduplicação

- `importHash` gerado a partir de: `orgId|dateISO|amountCents|accountId|description`
- Usado para evitar duplicatas em importações

### Source Tracking

- Campo `source`: `manual`, `csv`, `bank`, `whatsapp`, `integration`
- Permite rastrear origem de cada transação

## Endpoints

### Accounts

- `GET /api/ledger/accounts` - Lista contas
- `POST /api/ledger/accounts` - Cria conta
- `PATCH /api/ledger/accounts/[id]` - Atualiza conta
- `DELETE /api/ledger/accounts/[id]` - Exclui conta (apenas se não tiver transações)

### Transactions

- `GET /api/ledger/transactions` - Lista com filtros
- `POST /api/ledger/transactions` - Cria transação
- `PATCH /api/ledger/transactions/[id]` - Atualiza transação
- `DELETE /api/ledger/transactions/[id]` - Exclui transação

### Categories, Cost Centers, Clients, Vendors

- Mesmo padrão CRUD: `GET/POST /api/ledger/{entity}`, `PATCH/DELETE /api/ledger/{entity}/[id]`

### Import

- `POST /api/ledger/import/csv` - Importa CSV

### Reports

- `GET /api/ledger/reports/spend-by-category?from=YYYY-MM-DD&to=YYYY-MM-DD` - Gastos por categoria

## Filtros de Transações

- `q`: busca textual na descrição
- `from`, `to`: período por data
- `type`: IN ou OUT
- `status`: PENDING ou CLEARED
- `accountId`, `categoryId`, `costCenterId`, `clientId`, `vendorId`: filtros por relacionamento
- `page`, `pageSize`: paginação
- `sort`: `date_desc`, `date_asc`, `amount_desc`, `amount_asc`

## Estrutura de Dados

### Transaction

```typescript
{
  id: string
  orgId: string
  type: "IN" | "OUT"
  status: "PENDING" | "CLEARED"
  date: Date
  competence?: Date
  amountCents: number
  description: string
  accountId: string
  categoryId?: string
  costCenterId?: string
  clientId?: string
  vendorId?: string
  importHash?: string
  source: string
}
```

## UX/UI

### Design Minimalista

- Tabelas limpas com hover states
- Filtros rápidos acima das tabelas
- Forms curtos e objetivos
- Feedback visual claro (badges, cores)

### Responsividade

- Grid adaptativo
- Tabelas com scroll horizontal em mobile
- Inputs full-width em mobile

## Próximos Upgrades (Marco 2+)

- Regras de categorização automática
- Recorrências (despesas fixas)
- Conciliação bancária via integração
- Anexos e OCR
- WhatsApp Assistant com tools (criar/listar transações)
- Exportação CSV/PDF
- Mais relatórios (DRE, fluxo de caixa)
- Auditoria automática (createAuditLog em cada operação)

## Decisões Técnicas

### Por que FinancialAccount e não Account?

Evitar conflito com o modelo `Account` do NextAuth (OAuth accounts).

### Por que amountCents?

Precisão financeira. Evita problemas de `0.1 + 0.2 = 0.30000000000000004`.

### Por que importHash no banco?

Permite busca rápida de duplicatas sem precisar comparar todos os campos.

### Por que skipDuplicates no createMany?

MVP simples. Futuro: mostrar preview antes de importar, permitir escolher o que importar.





