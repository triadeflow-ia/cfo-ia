# Módulo 03 — Relatórios

## Objetivo

Fornecer relatórios essenciais para gestão financeira com foco em clareza, rapidez e exportação.

## Componentes

### 1. DRE Gerencial (Demonstrativo de Resultados)

**Funcionalidades**:
- Modo Caixa: agrupa por `Transaction.date`
- Modo Competência: agrupa por `Transaction.competence` (fallback em `date`)
- Agrupado por DRE Group (REVENUE, COGS, OPEX, PAYROLL, TAXES, TOOLS, OTHER)
- Filtros: período, conta, centro de custo, cliente

**Fórmulas**:
- Receita = soma de transações IN
- Despesas = soma de transações OUT
- Resultado = Receita - Despesas

**UI**:
- Seletor de modo (caixa/competência)
- Filtro de período
- Cards de resumo (Receitas, Despesas, Resultado)
- Tabela por grupo DRE com categorias
- Subtotais por grupo
- Export CSV

### 2. Fluxo de Caixa

**Funcionalidades**:
- **Real**: saldo dia a dia com base em transações
- **Projetado** (30/60/90 dias):
  - Inclui recorrências futuras
  - Inclui transações PENDING
  - Calcula saldo acumulado

**Métricas**:
- Saldo atual
- Mínimo projetado (alerta: pode ficar negativo)
- Máximo projetado
- Destaque para "hoje" e dias futuros (projetados)

**UI**:
- Cards de resumo
- Tabela dia a dia
- Destaque visual para hoje e projeções
- Export CSV

### 3. Orçado vs Realizado

**Funcionalidades**:
- CRUD de Budget (orçamento mensal por categoria)
- Comparação com realizado (OUT apenas no MVP)
- Variação (orçado - realizado) e percentual
- Filtros: ano, mês, centro de custo

**Modelo**:
- Budget: orgId, year, month, categoryId, costCenterId?, amountCents
- Único por: orgId + year + month + categoryId + costCenterId

**UI**:
- Cards de resumo (Total Orçado, Total Realizado, Variação, % Variação)
- Tabela com comparação categoria a categoria
- Cores: verde (dentro do orçado), vermelho (ultrapassou)
- Export CSV

### 4. Exportação CSV

**Formato**:
- UTF-8 com BOM (para Excel abrir corretamente)
- Separador: vírgula
- Formato numérico brasileiro (vírgula como decimal)
- Headers descritivos

**Endpoints**:
- `/api/reports/dre/export/csv`
- `/api/reports/cashflow/export/csv`
- `/api/reports/budget-vs-actual/export/csv`

## DRE Groups

Enum de agrupamento para categorias:

- **REVENUE**: Receitas (entradas de clientes, recorrência, serviços)
- **COGS**: Custo dos Produtos Vendidos (custo direto de entrega, mídia se tratada como custo direto)
- **OPEX**: Despesas Operacionais (operacional geral)
- **PAYROLL**: Folha de Pagamento (time, pró-labore, encargos)
- **TAXES**: Impostos (DAS, ISS, impostos)
- **TOOLS**: Ferramentas e SaaS (assinaturas)
- **OTHER**: Outros

## Endpoints

### DRE
- `GET /api/reports/dre?mode=cash|accrual&from=YYYY-MM-DD&to=YYYY-MM-DD&accountId?&costCenterId?&clientId?`
- `GET /api/reports/dre/export/csv` (mesmos query params)

### Cashflow
- `GET /api/reports/cashflow?from=YYYY-MM-DD&to=YYYY-MM-DD&projection=90&accountId?`
- `GET /api/reports/cashflow/export/csv` (mesmos query params)

### Budget vs Actual
- `GET /api/reports/budget-vs-actual?year=YYYY&month=MM&costCenterId?`
- `GET /api/reports/budget-vs-actual/export/csv` (mesmos query params)

### Budgets CRUD
- `GET /api/reports/budgets?year?&month?&categoryId?&costCenterId?`
- `POST /api/reports/budgets` (body: CreateBudgetSchema)
- `DELETE /api/reports/budgets/[id]`

## Fluxos

### DRE

1. Usuário seleciona modo (caixa/competência) e período
2. Sistema busca transações no período
3. Agrupa por categoria e DRE Group
4. Calcula totais e subtotais
5. Exibe em tabela clara com cards de resumo

### Fluxo de Caixa

1. Usuário seleciona período e dias de projeção
2. Sistema busca transações reais até hoje
3. Busca recorrências futuras
4. Calcula saldo acumulado dia a dia
5. Identifica mínimo/máximo projetados
6. Exibe tabela com destaque para hoje e projeções

### Orçado vs Realizado

1. Usuário cadastra orçamento mensal por categoria (ou importa)
2. Seleciona ano/mês para comparar
3. Sistema busca orçamentos do mês
4. Calcula realizado (OUT apenas) por categoria
5. Compara e calcula variações
6. Exibe tabela com cores indicativas

## Decisões Técnicas

### Por que DRE Group?

Permite agrupar categorias de forma lógica para gestão, seguindo padrão contábil brasileiro.

### Por que Budget por mês?

Simplicidade. Futuro: pode ter orçamento anual com rateio mensal.

### Por que OUT apenas no Budget vs Actual?

Foco em despesas no MVP. Futuro: incluir receitas também.

### Por que CSV primeiro?

CSV é universal, funciona em Excel, Google Sheets, e qualquer sistema. PDF pode ser adicionado depois.

### Performance

- Queries otimizadas com índices
- Aggregations no banco quando possível
- Cache pode ser adicionado no futuro para relatórios frequentes

## Próximos Upgrades

- Modo competência completo (usar competence quando preenchido)
- Orçamento anual com rateio mensal
- Mais métricas no cashflow (quebras de caixa, dias até ficar negativo)
- Gráficos visuais (opcional, apenas se necessário)
- Export PDF
- Comparativo mês a mês
- Orçado vs Realizado incluindo receitas (IN)





