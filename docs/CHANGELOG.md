# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [0.1.0] - 2024 - Marco 0: Fundação

### Adicionado

#### Configuração Inicial
- Setup do projeto Next.js 14 com App Router
- TypeScript configurado
- Tailwind CSS + shadcn/ui configurados
- ESLint configurado
- Estrutura de diretórios modular

#### Banco de Dados
- Prisma configurado com PostgreSQL
- Schema base com:
  - Organization, User, OrganizationUser
  - Role, Permission, RolePermission
  - Account, Session (NextAuth)
  - AuditLog
- Seed inicial com permissões e roles padrão

#### Autenticação e Autorização
- NextAuth (Auth.js) configurado
- Provider de credenciais básico
- RBAC básico (roles e permissões)
- Middleware de permissões para API routes
- Página de login

#### UI Base
- Layout com sidebar colapsável
- Header com menu de usuário
- Componentes shadcn/ui base (Button, DropdownMenu)
- Dashboard placeholder
- Design system minimalista

#### Utilitários Compartilhados
- Logger estruturado
- Funções de auditoria (createAuditLog)
- Helpers de RBAC (hasPermission, etc.)
- Utilitários de classes CSS (cn)

#### Documentação
- Visão geral do projeto
- Arquitetura do sistema
- Modelo de dados
- Documentação de módulos
- Especificação WhatsApp + IA
- Guia de deploy

### Estrutura Criada

```
/src
  /shared
    /auth          # NextAuth config
    /db            # Prisma client
    /rbac          # Permissões e middleware
    /logger        # Logger estruturado
    /utils         # Utilitários
    /types         # Tipos base
  /components
    /ui            # Componentes shadcn/ui
    /layout        # Layout components
    /providers     # Context providers
  /app
    /api/auth      # NextAuth API route
    /auth/signin   # Página de login
    /              # Dashboard
  /modules         # (Preparado para módulos futuros)
/docs              # Documentação completa
/prisma            # Schema e migrations
```

### Próximos Passos

- **Marco 2**: Automação
  - Regras de categorização
  - Recorrências
  - Alertas e notificações

## [0.2.0] - 2024 - Marco 1: Ledger MVP

### Adicionado

#### Modelos de Dados
- `FinancialAccount` - Contas bancárias, cartões, caixa
- `Category` - Categorias de transações
- `CostCenter` - Centros de custo
- `Client` - Clientes
- `Vendor` - Fornecedores
- `Transaction` - Lançamentos financeiros com suporte completo

#### Módulo Ledger
- **Domain**: Validators com Zod schemas
- **Application**: Serviços de aplicação (CRUD completo)
- **Infrastructure**: Repositório Prisma com queries otimizadas
- **Facade**: Interface pública do módulo

#### API Routes
- `/api/ledger/accounts` - CRUD de contas
- `/api/ledger/transactions` - CRUD de transações com filtros avançados
- `/api/ledger/categories` - CRUD de categorias
- `/api/ledger/cost-centers` - CRUD de centros de custo
- `/api/ledger/clients` - CRUD de clientes
- `/api/ledger/vendors` - CRUD de fornecedores
- `/api/ledger/import/csv` - Importação CSV com deduplicação
- `/api/ledger/reports/spend-by-category` - Relatório de gastos por categoria

#### UI
- Página de listagem de transações com filtros
- Página de criação de transação
- Página de listagem de contas
- Página de importação CSV
- Página de relatório de gastos por categoria
- Sidebar atualizada com links do Ledger

#### Funcionalidades
- Filtros avançados em transações (período, tipo, status, relacionamentos, busca textual)
- Paginação e ordenação
- Importação CSV com deduplicação via `importHash`
- Relatório de gastos por categoria com percentuais
- Validação de dados com Zod
- Isolamento multi-tenant (orgId em tudo)
- Valores sempre em centavos (amountCents)

#### Shared
- `requireAuth()` helper para API routes com orgId
- Context helper para autenticação

### Estrutura Criada

```
/src/modules/ledger/
  /domain
    validators.ts
  /application
    ledger.service.ts
  /infra
    ledger.repo.ts
  index.ts

/src/app/api/ledger/
  accounts/
  transactions/
  categories/
  cost-centers/
  clients/
  vendors/
  import/csv/
  reports/spend-by-category/

/src/app/(app)/ledger/
  transactions/
  accounts/
  import/csv/
  reports/spend-by-category/

/docs/modulos/
  modulo-01-ledger-mvp.md
```

### Próximos Passos

- **Marco 4**: Métricas do negócio
  - MRR/ARR
  - Ticket médio, LTV, churn
  - Margem por cliente

## [0.3.0] - 2024 - Marco 3: Relatórios

### Adicionado

#### Modelos de Dados
- `DreGroup` enum - Agrupamento de categorias para DRE
- `Budget` - Orçamento mensal por categoria
- Campo `dreGroup` em `Category`

#### Módulo Reports
- **Domain**: Schemas Zod para filtros de relatórios
- **Application**: Serviços de relatórios (DRE, Cashflow, Budget vs Actual)
- **Infrastructure**: Repositório com queries otimizadas e export CSV

#### Relatórios
- **DRE Gerencial**: Modo caixa e competência, agrupado por DRE Group
- **Fluxo de Caixa**: Real e projetado (inclui recorrências futuras)
- **Orçado vs Realizado**: Comparação entre orçamento e despesas realizadas
- **Exportação CSV**: Todos os relatórios exportáveis

#### API Routes
- `/api/reports/dre` - DRE gerencial
- `/api/reports/dre/export/csv` - Export DRE
- `/api/reports/cashflow` - Fluxo de caixa
- `/api/reports/cashflow/export/csv` - Export cashflow
- `/api/reports/budget-vs-actual` - Orçado vs Realizado
- `/api/reports/budget-vs-actual/export/csv` - Export budget vs actual
- `/api/reports/budgets` - CRUD de orçamentos

#### UI
- Página de DRE com filtros e tabela clara
- Página de Fluxo de Caixa com projeções
- Página de Orçado vs Realizado
- Cards de resumo em todos os relatórios
- Links de exportação CSV

#### Funcionalidades
- Agrupamento DRE por grupos (REVENUE, COGS, OPEX, PAYROLL, TAXES, TOOLS, OTHER)
- Projeção de fluxo de caixa incluindo recorrências
- Cálculo de mínimos/máximos no cashflow
- Variação e percentual de variação no budget vs actual
- Export CSV formatado para Excel (UTF-8, vírgula como decimal)

### Estrutura Criada

```
/src/modules/reports/
  /domain
    schemas.ts
  /application
    reports.service.ts
  /infra
    reports.repo.ts
    csv-export.ts
  index.ts

/src/app/api/reports/
  dre/
    route.ts
    export/csv/route.ts
  cashflow/
    route.ts
    export/csv/route.ts
  budget-vs-actual/
    route.ts
    export/csv/route.ts
  budgets/
    route.ts
    [id]/route.ts

/src/app/(app)/reports/
  dre/page.tsx
  cashflow/page.tsx
  budget/page.tsx
```

## [0.4.0] - 2024 - Marco 4: Métricas do Negócio

### Adicionado

#### Modelos de Dados
- `ClientContract` - Contratos de receita recorrente (MRR)
- `Goal` - Metas por métrica e período
- Campo `isDirectCost` em `Category` - Para marcar custos diretos
- Enums: `ContractStatus`, `GoalMetric`, `GoalPeriod`

#### Módulo Growth
- **Domain**: Schemas Zod para contratos, metas e filtros
- **Application**: Serviços de métricas de negócio
- **Infrastructure**: Repositório com queries otimizadas para métricas

#### Métricas Implementadas
- **Active Clients**: Clientes com contrato ativo ou receita nos últimos 60 dias
- **MRR/ARR**: Monthly/Annual Recurring Revenue baseado em contratos
- **Ticket Médio**: Receita total / clientes únicos com receita
- **Churn Rate**: Taxa de cancelamento mensal
- **LTV**: Lifetime Value (ticket médio / churn rate)
- **Margem por Cliente**: Receita - Custos diretos
- **Lucro Líquido**: Receitas - Despesas do mês
- **Margem %**: (Receitas - Despesas) / Receitas * 100
- **MoM Trend**: Comparação mês a mês (receita, lucro, MRR)
- **Receita Recorrente vs Avulsa**: Separação entre contratos e avulsos

#### Funcionalidades
- Painel de crescimento com cards de métricas principais
- Top 10 e Bottom 10 clientes por margem
- Tendência mês a mês (MoM) para receita, lucro e MRR
- CRUD completo de contratos
- CRUD completo de metas
- Comparação de metas vs realizado
- Ranking de clientes por lucratividade

#### API Routes
- `/api/growth/overview` - Painel completo de métricas
- `/api/growth/contracts` - CRUD de contratos
- `/api/growth/goals` - CRUD de metas
- `/api/growth/goals-vs-actual` - Comparação metas vs realizado

#### UI
- Página de Growth Overview com cards e tabelas
- Página de Clientes & Contratos
- Página de Metas com comparação vs realizado
- Sidebar atualizada com link "Crescimento"

#### Integrações
- Interface `CrmAdapter` criada para futuras integrações CRM
- Placeholder implementation disponível

#### Scripts
- `scripts/seed-dre-group.ts` - Script para classificar categorias automaticamente
- Comandos: `npm run seed:dre-group` e `npm run seed:dre-group:dry-run`

#### Estrutura Criada

```
/src/modules/growth/
  /domain
    schemas.ts
  /application
    growth.service.ts
  /infra
    growth.repo.ts
  index.ts

/src/modules/integrations/crm/
  CrmAdapter.ts
  index.ts

/src/app/api/growth/
  overview/route.ts
  contracts/route.ts
  contracts/[id]/route.ts
  goals/route.ts
  goals/[id]/route.ts
  goals-vs-actual/route.ts

/src/app/(app)/growth/
  overview/page.tsx
  clients/page.tsx
  goals/page.tsx

/scripts/
  seed-dre-group.ts
```

### Próximos Passos

- **Marco 5**: WhatsApp IA completo
  - NLP + function calling
  - Comandos naturais
  - Alertas proativos via WhatsApp

## [0.2.0] - 2024 - Marco 2: Automação

### Adicionado

#### Modelos de Dados
- `CategorizationRule` - Regras de categorização automática
- `Recurrence` - Recorrências (despesas/receitas fixas)
- `Notification` - Sistema de notificações

#### Módulo Automation
- **Domain**: Schemas Zod para regras e recorrências
- **Application**: Serviços de categorização, recorrência e alertas
- **Infrastructure**: Repositório e queue (BullMQ)

#### Funcionalidades de Automação
- Regras de categorização com prioridade e múltiplos tipos de match
- Aplicação automática ao criar/importar transações
- Endpoint para reprocessar transações não categorizadas
- Recorrências com suporte a diárias, semanais e mensais
- Job diário para gerar transações recorrentes
- Deduplicação de recorrências (evita duplicatas)
- Alertas automáticos (recorrências próximas, anomalias de gasto)
- Sistema de notificações com inbox

#### Worker e Jobs
- Worker BullMQ para processar jobs de automação
- Queue configurada com Redis
- Jobs: runRecurrences, runAlerts

#### Tools para WhatsApp
- Módulo `whatsapp-tools` com 7 tools prontas
- Interface desacoplada para LLMs (function calling)
- Tools: listTransactions, createTransaction, updateTransaction, spendByCategory, listNotifications, listRecurrences, createRecurrence

#### API Routes
- `/api/automation/rules` - CRUD de regras
- `/api/automation/recurrences` - CRUD de recorrências
- `/api/automation/notifications` - Listar e marcar como lidas
- `/api/automation/run` - Disparar jobs manualmente

#### UI
- Página de regras de categorização
- Página de recorrências
- Página de notificações (inbox)
- Sidebar atualizada com links de automação

#### Integrações
- Auto-categorização integrada no `ledgerService.createTransaction`
- Auto-categorização integrada no `ledgerService.importCsv`
- Audit log automático quando automação altera dados

#### Shared
- Redis client singleton configurado
- BullMQ queue configurada

### Estrutura Criada

```
/src/modules/automation/
  /domain
    schemas.ts
  /application
    automation.service.ts
    categorization.service.ts
    recurrence.service.ts
    alerts.service.ts
  /infra
    automation.repo.ts
    queue.ts
  index.ts

/src/modules/whatsapp-tools/
  tools.ts
  index.ts

/src/shared/redis/
  index.ts

/src/app/api/automation/
  rules/
  recurrences/
  notifications/
  run/

/src/app/(app)/automation/
  rules/
  recurrences/
  notifications/

/src/worker.ts
```

### Próximos Passos

- **Marco 3**: Relatórios
  - DRE gerencial (caixa e competência)
  - Fluxo de caixa projetado
  - Orçado vs realizado
  - Exportação CSV/PDF

