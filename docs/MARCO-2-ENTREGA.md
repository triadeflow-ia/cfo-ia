# Marco 2 - Automação - Entrega

## Resumo do que foi feito

Implementação completa do Marco 2 - Automação, incluindo:

1. ✅ Schema Prisma com modelos de automação (CategorizationRule, Recurrence, Notification)
2. ✅ Módulo Automation completo (domain, application, infra)
3. ✅ Auto-categorização integrada no ledger
4. ✅ Sistema de recorrências com job diário
5. ✅ Sistema de alertas e notificações
6. ✅ Worker BullMQ configurado
7. ✅ Tools para WhatsApp (preparação para Marco 5)
8. ✅ APIs completas para rules, recurrences, notifications
9. ✅ UI mínima para todas as funcionalidades
10. ✅ Documentação atualizada

## Checklist de Aceitação

### Regras de Categorização ✅
- [x] CRUD completo de CategorizationRule
- [x] Prioridade + condições (contains/regex/starts_with/ends_with)
- [x] Condições opcionais (vendor, account, type)
- [x] Aplicação automática ao criar transação manual
- [x] Aplicação automática ao importar CSV
- [x] Endpoint para reprocessar transações não categorizadas
- [x] Registro no AuditLog quando automação altera dados
- [x] Não sobrescreve campos já preenchidos manualmente

### Recorrências ✅
- [x] CRUD completo de Recurrence
- [x] Frequências: DAILY, WEEKLY, MONTHLY
- [x] Job diário que cria transações vencidas
- [x] Cálculo de nextRunAt automático
- [x] Deduplicação (evita duplicatas por recurrenceId + date)
- [x] UI para ver e ativar/desativar recorrências

### Alertas e Notificações ✅
- [x] Tabela Notification
- [x] Job diário que gera alertas
- [x] Recorrências próximas (3 dias)
- [x] Anomalias simples (gasto > 2x média diária)
- [x] UI inbox de notificações
- [x] Marcar como lida / marcar todas como lidas

### Tools para WhatsApp ✅
- [x] Tools implementadas com schemas Zod
- [x] listTransactions, createTransaction, updateTransaction
- [x] spendByCategory, listNotifications
- [x] listRecurrences, createRecurrence
- [x] Camada desacoplada (não depende de LLM específico)
- [x] Preparado para function calling

## Estrutura de Arquivos Criados

```
/prisma
  schema.prisma (atualizado com novos modelos)

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
    route.ts
    [id]/route.ts
  recurrences/
    route.ts
    [id]/route.ts
  notifications/
    route.ts
    [id]/read/route.ts
  run/route.ts

/src/app/(app)/automation/
  rules/page.tsx
  recurrences/page.tsx
  notifications/page.tsx

/src/worker.ts
```

## Como Rodar

### 1. Rodar migração do Prisma

```bash
npm run db:generate
npm run db:migrate
```

### 2. Configurar Redis

Certifique-se de que Redis está rodando:

```bash
# Localmente
redis-server

# Ou use variável de ambiente
REDIS_URL="redis://localhost:6379"
```

### 3. Iniciar Worker (em terminal separado)

```bash
npm run worker
```

O worker processa jobs de automação (recurrences, alerts).

### 4. Iniciar servidor de desenvolvimento

```bash
npm run dev
```

### 5. Disparar Jobs Manualmente (Opcional)

Para testar jobs em desenvolvimento:

```bash
# Via API (sync mode para dev)
curl -X POST http://localhost:3000/api/automation/run \
  -H "Content-Type: application/json" \
  -d '{"job": "recurrences", "sync": true}'
```

## Migração Prisma

A migração será criada com o nome `automation_rules_recurrences_notifications` quando você rodar:

```bash
npm run db:migrate
```

## Jobs e Cron

### Desenvolvimento

Em desenvolvimento, você pode rodar jobs manualmente via API com `sync: true`.

### Produção

Para produção, configure um cron job que chama:

```bash
# Via cron (exemplo: diário às 6h)
0 6 * * * curl -X POST https://yourdomain.com/api/automation/run \
  -H "Content-Type: application/json" \
  -d '{"job": "recurrences"}'
```

Ou use o worker rodando continuamente (processa jobs da fila).

## Mensagem de Commit Sugerida

```
feat(automation): add categorization rules, recurrences, notifications, and whatsapp tools

- Add Prisma models: CategorizationRule, Recurrence, Notification
- Implement Automation module (domain, application, infra layers)
- Add auto-categorization integrated with ledger
- Add recurrence system with daily job
- Add alerts and notifications system
- Add BullMQ worker for async jobs
- Add WhatsApp tools module (preparation for Marco 5)
- Add API routes for rules, recurrences, notifications
- Add UI pages for automation management
- Configure Redis client
- Update documentation

Marco 2 completo - Automation ready for use.
```

## Próximos Passos

**Marco 3 - Relatórios**

- DRE gerencial (caixa e competência)
- Fluxo de caixa projetado
- Orçado vs realizado
- Exportação CSV/PDF
- (Opcional) Centros de custo e rateio por cliente

## Observações Importantes

1. **Redis obrigatório**: O worker precisa de Redis rodando. Em desenvolvimento local, instale e inicie o Redis.

2. **Worker separado**: O worker deve rodar em processo separado. Em produção, use PM2, systemd, ou similar.

3. **Auto-categorização**: Funciona automaticamente, mas pode ser desabilitada temporariamente desativando regras.

4. **Deduplicação**: Recorrências têm deduplicação por `recurrenceId + date`, evitando duplicatas mesmo se job rodar múltiplas vezes.

5. **Tools WhatsApp**: Preparadas mas não integradas ainda. Integração completa será no Marco 5.

## Status

✅ **Marco 2 - COMPLETO**

Pronto para iniciar o desenvolvimento do Marco 3.





