# Módulo 02 — Automação

## Objetivo

Implementar automação completa para reduzir trabalho manual:

- **Regras de categorização automática**: categorizar transações baseado em padrões
- **Recorrências**: gerar transações automaticamente (despesas fixas, assinaturas)
- **Alertas e notificações**: avisar sobre eventos importantes
- **Tools para WhatsApp**: preparar interface para IA usar o sistema

## Componentes

### 1. Regras de Categorização

**Modelo**: `CategorizationRule`

**Funcionalidades**:
- Criar regras com condições (padrão de texto, fornecedor, conta, tipo)
- Prioridade (menor número = mais prioritária)
- Tipos de match: CONTAINS, REGEX, STARTS_WITH, ENDS_WITH
- Ações: preencher categoria, centro de custo, cliente

**Aplicação automática**:
- Ao criar transação manual → auto-categoriza
- Ao importar CSV → auto-categoriza todas
- Endpoint `/api/automation/run?job=categorize` para reprocessar não categorizadas

**Regras importantes**:
- Não sobrescreve campos já preenchidos manualmente
- Aplica apenas campos vazios
- Registra no audit log quando automação altera dados

### 2. Recorrências

**Modelo**: `Recurrence`

**Funcionalidades**:
- Criar recorrências (diárias, semanais, mensais)
- Template de transação (tipo, valor, descrição, conta, etc.)
- Próxima execução (`nextRunAt`)
- Última execução (`lastRunAt`)

**Job diário**:
- Busca recorrências com `nextRunAt <= now`
- Cria transações para cada uma
- Evita duplicidade (verifica se já existe transação dessa recorrência na data)
- Calcula próxima execução
- Atualiza `lastRunAt` e `nextRunAt`

**Deduplicação**:
- Verifica `recurrenceId + date` antes de criar
- Evita duplicatas mesmo se job rodar múltiplas vezes

### 3. Alertas e Notificações

**Modelo**: `Notification`

**Tipos de notificação**:
- `RECURRENCE_DUE`: Recorrência próxima (3 dias)
- `ANOMALY_SPEND`: Gasto fora do padrão (>2x média diária)

**Job diário**:
- Busca recorrências próximas (nextRunAt <= now + 3 dias)
- Calcula anomalias (gastos do dia vs média dos últimos 30 dias)
- Cria notificações no banco

**UI**:
- Inbox de notificações
- Marcar como lida / marcar todas como lidas
- Filtrar apenas não lidas

### 4. Tools para WhatsApp

**Módulo**: `/src/modules/whatsapp-tools`

**Tools disponíveis**:
- `listTransactions`: Lista transações com filtros
- `createTransaction`: Cria transação (com auto-categorização)
- `updateTransaction`: Atualiza transação
- `spendByCategory`: Relatório de gastos por categoria
- `listNotifications`: Lista notificações
- `listRecurrences`: Lista recorrências
- `createRecurrence`: Cria recorrência

**Características**:
- Desacoplado de LLM (qualquer IA pode usar)
- Schemas Zod para validação
- Funções síncronas retornando dados
- Preparado para function calling

## Fluxos

### Auto-categorização

1. Transação criada/importada
2. `categorizationService.autoCategorize()` é chamado
3. Busca regras ativas ordenadas por prioridade
4. Primeira regra que bate (match) é aplicada
5. Preenche apenas campos vazios
6. Salva transação atualizada
7. Registra no audit log

### Recorrências

1. Job diário (`/api/automation/run?job=recurrences`)
2. Busca recorrências ativas com `nextRunAt <= now`
3. Para cada uma:
   - Verifica se já existe transação (dedup)
   - Se não existe, cria transação
   - Calcula próxima execução
   - Atualiza `nextRunAt` e `lastRunAt`
4. Auto-categoriza transações criadas (se houver regras)

### Alertas

1. Job diário (`/api/automation/run?job=alerts`)
2. Busca recorrências próximas (nextRunAt <= now + 3 dias)
3. Calcula média de gastos dos últimos 30 dias
4. Compara com gastos do dia atual
5. Se > 2x média, cria notificação de anomalia
6. Cria notificações para recorrências próximas

## Endpoints

### Rules
- `GET /api/automation/rules` - Lista regras
- `POST /api/automation/rules` - Cria regra
- `PATCH /api/automation/rules/[id]` - Atualiza regra
- `DELETE /api/automation/rules/[id]` - Exclui regra

### Recurrences
- `GET /api/automation/recurrences` - Lista recorrências
- `POST /api/automation/recurrences` - Cria recorrência
- `PATCH /api/automation/recurrences/[id]` - Atualiza recorrência
- `DELETE /api/automation/recurrences/[id]` - Exclui recorrência

### Notifications
- `GET /api/automation/notifications` - Lista notificações
- `POST /api/automation/notifications` - Marcar todas como lidas
- `POST /api/automation/notifications/[id]/read` - Marcar como lida

### Jobs
- `POST /api/automation/run` - Dispara jobs manualmente
  - Body: `{ job: "recurrences" | "alerts" | "categorize", sync?: boolean, limit?: number }`
  - `sync: true` roda diretamente (dev)
  - `sync: false` ou ausente: enfileira no BullMQ (produção)

## Worker

**Arquivo**: `src/worker.ts`

**Comandos**:
```bash
# Desenvolvimento
npm run worker

# Produção (PM2, systemd, etc)
```

**Jobs processados**:
- `runRecurrences`: Gera transações recorrentes
- `runAlerts`: Gera notificações

**Configuração**:
- Concorrência: 5 jobs simultâneos
- Connection: Redis configurado
- Logs: Estruturados via logger

## Decisões Técnicas

### Por que não sobrescrever campos já preenchidos?

Respeitar escolha manual do usuário. Se usuário já categorizou manualmente, a regra não deve sobrescrever.

### Por que deduplicação por recurrenceId + date?

Evita duplicatas mesmo se job rodar múltiplas vezes ou falhar parcialmente.

### Por que usar BullMQ?

Permite:
- Processamento assíncrono
- Retry automático
- Monitoramento de jobs
- Escalabilidade horizontal

### Por que tools desacopladas?

Permite usar qualquer LLM (OpenAI, Anthropic, local) sem alterar o código do sistema.

## Próximos Upgrades

- Mais tipos de match (fuzzy, ML-based)
- Regras condicionais mais complexas (AND/OR)
- Recorrências mais flexíveis (último dia do mês, primeiro dia útil, etc)
- Mais tipos de alertas (meta, churn, etc)
- Integração real com WhatsApp (webhook receiver)
- UI para criar regras visualmente (drag & drop)



