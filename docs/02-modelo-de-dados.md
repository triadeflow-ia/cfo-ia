# Modelo de Dados

## Visão Geral

O modelo de dados é baseado em um **Ledger (Razão)** com transações e dimensões. Tudo é multi-tenant através do `organizationId`.

## Entidades Core

### Organization

Representa uma organização/empresa usando o sistema.

```prisma
model Organization {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### User

Usuários do sistema (podem pertencer a múltiplas organizações).

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  image         String?
  emailVerified DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### OrganizationUser

Relacionamento muitos-para-muitos entre User e Organization, com Role associada.

```prisma
model OrganizationUser {
  id             String   @id @default(cuid())
  organizationId String
  userId         String
  roleId         String?
  ...
}
```

### Role & Permission

Sistema RBAC baseado em roles e permissões por organização.

```prisma
model Role {
  id             String   @id @default(cuid())
  organizationId String
  name           String
  slug           String
  ...
}

model Permission {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique  // e.g., "transaction:create"
  module      String?  // e.g., "transaction"
  ...
}
```

### AuditLog

Registro de auditoria para todas as operações importantes.

```prisma
model AuditLog {
  id             String   @id @default(cuid())
  organizationId String
  action         String   // "create", "update", "delete", "read"
  entityType     String   // "Transaction", "Account", etc.
  entityId       String
  changes        Json?    // { old: {...}, new: {...} }
  metadata       Json?    // { source: "web" | "whatsapp" | "api", ip: "...", etc. }
  createdAt      DateTime @default(now())
  createdByUserId String?
  ...
}
```

## Padrão de Entidades

Todas as entidades de negócio seguem este padrão:

```prisma
model Entity {
  id        String   @id @default(cuid())
  orgId     String   // organizationId (padrão curto)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String?  // userId
  updatedBy String?  // userId
  
  // Relations
  organization Organization @relation(...)
  ...
}
```

## Entidades Financeiras (Marco 1 - Implementado)

As seguintes entidades foram criadas no Marco 1:

- **FinancialAccount**: Contas bancárias, cartões, caixa
  - `id`, `orgId`, `name`, `type`, `currency`, `isActive`
  - Tipos: "BANK", "CREDIT_CARD", "CASH"

- **Transaction**: Lançamentos financeiros (entrada/saída)
  - `id`, `orgId`, `type` (IN/OUT), `status` (PENDING/CLEARED)
  - `date` (caixa), `competence` (opcional)
  - `amountCents` (sempre em centavos)
  - Relacionamentos: `accountId`, `categoryId`, `costCenterId`, `clientId`, `vendorId`
  - `importHash` (deduplicação), `source` (manual/csv/bank/etc)

- **Category**: Categorias de transações
  - `id`, `orgId`, `name`, `kind` (EXPENSE/INCOME/BOTH), `dreGroup` (DRE Group enum), `isActive`
  - DRE Groups: REVENUE, COGS, OPEX, PAYROLL, TAXES, TOOLS, OTHER

- **CostCenter**: Centros de custo
  - `id`, `orgId`, `name`, `isActive`

- **Client**: Clientes
  - `id`, `orgId`, `name`, `status` (ACTIVE/PAUSED/CHURNED)

- **Vendor**: Fornecedores
  - `id`, `orgId`, `name`

### Entidades de Relatórios (Marco 3)

- **Budget**: Orçamento mensal por categoria
  - `id`, `orgId`, `year`, `month`, `categoryId`, `costCenterId?`, `amountCents`
  - Único por: orgId + year + month + categoryId + costCenterId

### Entidades de Métricas (Marco 4)

- **ClientContract**: Contrato de receita recorrente (MRR)
  - `id`, `orgId`, `clientId`, `status` (ACTIVE/PAUSED/CANCELED)
  - `startAt`, `endAt?`, `mrrCents`, `currency`, `billingDay?`
  - `source` (manual/crm/imported), `tags` (JSON opcional)

- **Goal**: Meta por métrica e período
  - `id`, `orgId`, `metric` (MRR/ARR/ACTIVE_CLIENTS/NET_PROFIT/GROSS_MARGIN)
  - `period` (MONTH/YEAR), `periodValue` ("2024-01" ou "2024")
  - `valueCents` (métricas monetárias) ou `valueInt` (métricas não-monetárias)
  - Único por: orgId + metric + period + periodValue

**Campos Adicionados**:
- `Category.isDirectCost` - Boolean para marcar custos diretos (ex: mídia paga)

### Entidades Futuras (Marco 5+)

- **Invoice**: Contas a receber/pagar
- **TaxObligation**: Impostos e vencimentos
- **PayrollItem**: Colaboradores e despesas relacionadas
- **Attachment**: Anexos/comprovantes

## Índices Importantes

- `organizationId` + `entityType` + `entityId` no AuditLog
- `organizationId` + `createdAt` no AuditLog
- `organizationId` + `slug` em Roles (unique)
- `organizationId` + `userId` em OrganizationUser (unique)

## Relacionamentos

- **Organization** → 1:N → **User** (via OrganizationUser)
- **Organization** → 1:N → **Role**
- **Role** → N:M → **Permission** (via RolePermission)
- **User** → N:M → **Organization** (via OrganizationUser)
- **AuditLog** → N:1 → **Organization**
- **AuditLog** → N:1 → **User** (createdBy/updatedBy)

