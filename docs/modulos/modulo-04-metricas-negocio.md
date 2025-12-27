# Módulo 04 — Métricas do Negócio

## Objetivo

Fornecer métricas essenciais para gestão de agência/SaaS com foco em crescimento, lucratividade e saúde do negócio.

## Componentes

### 1. Painel de Crescimento (Growth Overview)

**Métricas Principais**:
- **Active Clients**: Clientes com contrato ACTIVE ou receita nos últimos 60 dias
- **MRR**: Monthly Recurring Revenue (soma de contratos ativos)
- **ARR**: Annual Recurring Revenue (MRR * 12)
- **Ticket Médio**: Receita total / número de clientes com receita no período
- **LTV**: Lifetime Value (ticket_médio / churn_rate)
- **Churn Rate**: Clientes cancelados no mês / clientes ativos no início do mês
- **Lucro Líquido**: Receitas - Despesas do mês
- **Margem %**: (Receitas - Despesas) / Receitas * 100

**Dados Adicionais**:
- Top 10 e Bottom 10 clientes por margem
- Tendência MoM (Mês a Mês) para receita, lucro e MRR
- Receita recorrente vs avulsa

**UI**: `/growth/overview`

### 2. Clientes & Contratos

**Funcionalidades**:
- Listagem de clientes com status e contratos ativos
- Listagem de contratos (todos)
- Visualização de MRR por cliente
- Contagem de transações por cliente

**Modelo**:
- `ClientContract`: Contrato de receita recorrente
  - `clientId`, `status` (ACTIVE/PAUSED/CANCELED)
  - `startAt`, `endAt?`
  - `mrrCents`, `currency`, `billingDay?`
  - `source` (manual/crm/imported)
  - `tags` (JSON opcional)

**UI**: `/growth/clients`

### 3. Metas (Goals)

**Funcionalidades**:
- CRUD de metas por métrica e período
- Comparação meta vs realizado
- Variação e percentual de variação

**Métricas Suportadas**:
- MRR, ARR
- ACTIVE_CLIENTS
- NET_PROFIT
- GROSS_MARGIN

**Períodos**:
- MONTH (ex: "2024-01")
- YEAR (ex: "2024")

**UI**: `/growth/goals`

### 4. Margem por Cliente

**Cálculo**:
- Receita do cliente (transações IN com `clientId`)
- Custos diretos do cliente (transações OUT com `clientId` ou `category.isDirectCost`)
- Margem = Receita - Custos

**Exibição**:
- Ranking TOP 10 (maiores margens)
- Ranking BOTTOM 10 (menores margens, possivelmente negativas)

### 5. Receita Recorrente vs Avulsa

**Definição**:
- **Recorrente**: Receitas de clientes com contrato ativo
- **Avulsa**: Receitas de clientes sem contrato ativo

**Uso**: Entender a previsibilidade da receita

## Fórmulas

### Active Clients
```
Clientes com contrato ACTIVE OU com receita nos últimos 60 dias
```

### MRR
```
MRR = soma(ClientContract.mrrCents WHERE status = 'ACTIVE')
```

### ARR
```
ARR = MRR * 12
```

### Ticket Médio
```
Ticket Médio = Receita Total (período) / Clientes Únicos com Receita (período)
```

### Churn Rate
```
Churn Rate = Clientes Cancelados no Mês / Clientes Ativos no Início do Mês
```

### LTV
```
LTV = Ticket Médio / Churn Rate (se churn_rate > 0)
Se churn_rate = 0 → indefinido
```

### Margem por Cliente
```
Margem = Receita do Cliente - Custos Diretos do Cliente
```

### MoM Trend
```
Comparar mês atual vs mês anterior:
- Receita: current vs previous, change, change%
- Lucro: current vs previous, change, change%
- MRR: current vs previous, change, change%
```

## Endpoints

### Overview
- `GET /api/growth/overview?month=YYYY-MM` - Painel completo

### Contracts
- `GET /api/growth/contracts?clientId?&status?` - Listar contratos
- `POST /api/growth/contracts` - Criar contrato
- `PATCH /api/growth/contracts/[id]` - Atualizar contrato
- `DELETE /api/growth/contracts/[id]` - Deletar contrato

### Goals
- `GET /api/growth/goals?metric?&period?&periodValue?` - Listar metas
- `POST /api/growth/goals` - Criar meta
- `PATCH /api/growth/goals/[id]` - Atualizar meta
- `DELETE /api/growth/goals/[id]` - Deletar meta
- `GET /api/growth/goals-vs-actual?period=YYYY-MM` - Comparar metas vs realizado

## Integração com CRM

**Interface**: `CrmAdapter`

Métodos:
- `pullClients()` - Puxar clientes do CRM
- `pullContracts()` - Puxar contratos do CRM
- `pushClientStatus()` - Enviar status atualizado para o CRM
- `syncTransactionsMapping()` - Sincronizar mapeamento de transações

**Status**: Interface criada, implementações específicas (Pipedrive, HubSpot, etc.) serão adicionadas no futuro.

## Seed de DRE Groups

**Script**: `scripts/seed-dre-group.ts`

**Uso**:
```bash
npm run seed:dre-group:dry-run  # Visualizar mudanças
npm run seed:dre-group          # Aplicar mudanças
```

**Regras**:
- Categorias com palavras-chave relacionadas são automaticamente classificadas
- Ex: "receita", "mensalidade" → REVENUE
- Ex: "meta", "ads" → COGS
- Ex: "salário", "folha" → PAYROLL

## Decisões Técnicas

### Por que MRR por contrato e não por transações?

Contratos são mais previsíveis e não são distorcidos por avulsos. Transações são usadas para ticket médio e margem.

### Por que Active Clients usa 60 dias?

60 dias é um período razoável para considerar um cliente "ativo" mesmo sem contrato formal. Pode ser ajustado no futuro.

### Por que LTV retorna null quando churn = 0?

Matematicamente indefinido. Melhor mostrar "indefinido" do que um número enganoso.

### Por que isDirectCost na Category?

Permite marcar categorias como "custo direto" para cálculo de margem mais preciso. Ex: "Meta Ads" pode ser marcada como custo direto.

## Próximos Upgrades

- Gráficos visuais (opcional)
- Histórico de métricas ao longo do tempo
- Projeções baseadas em tendências
- Alertas quando métricas ficam abaixo de metas
- Integrações reais com CRM (Pipedrive, HubSpot, etc.)
- Export de métricas para Excel/PDF





