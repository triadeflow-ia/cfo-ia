# Marco 5 - Etapa 3 - LLMProvider + Notificações Proativas - Entrega

## Resumo do que foi feito

Implementação da Etapa 3 do Marco 5: LLMProvider plugável com function calling e notificações proativas com anti-spam.

1. ✅ **AIProvider Interface** - Interface comum para providers
2. ✅ **HeuristicProvider** - Provider baseado em regex/patterns (fallback)
3. ✅ **LLMProvider** - Provider com function calling (OpenAI/Anthropic)
4. ✅ **NotificationDelivery Model** - Rastreamento de entregas
5. ✅ **WhatsappSettings Model** - Configurações por organização
6. ✅ **Notification Sender** - Lógica de envio com anti-spam
7. ✅ **Worker de Notificações** - Processamento periódico
8. ✅ **Admin Settings UI** - Interface para configurações
9. ✅ **Integração no MessageProcessor** - Uso de AI providers

## Checklist de Aceitação

### AI Provider ✅
- [x] Interface AIProvider com método decide()
- [x] HeuristicProvider (adaptado do IntentRouter)
- [x] LLMProvider com function calling
- [x] Fallback automático (LLM → Heuristic)
- [x] Suporte a OpenAI e Anthropic (via ENV)
- [x] Timeout e retry
- [x] Contexto limitado (10 mensagens recentes)

### Notificações Proativas ✅
- [x] Model NotificationDelivery (rastreamento)
- [x] Model WhatsappSettings (configurações)
- [x] NotificationSender com anti-spam
- [x] Janela de silêncio (quiet hours)
- [x] Agregação diária (digest)
- [x] Críticas furam quiet hours
- [x] Worker periódico
- [x] Templates de mensagens

### Admin Settings ✅
- [x] API GET/PATCH /api/whatsapp/settings
- [x] UI /whatsapp/settings
- [x] Toggle LLM enabled
- [x] Escolha de provider
- [x] Configuração de quiet hours
- [x] Configuração de digest diário
- [x] Modo "command only"

### Segurança ✅
- [x] LLM retorna apenas tool calls (nunca texto livre)
- [x] Todas as tools passam por Zod + RBAC
- [x] Escritas viram PendingAction (confirmação)
- [x] Timeout configurável
- [x] Fallback automático

## Estrutura de Arquivos Criados

```
/prisma/schema.prisma (UPDATED)
  - NotificationDelivery model
  - WhatsappSettings model

/src/modules/whatsapp-ai/
  /domain
    types.ts (NEW)
  /infra
    heuristic-provider.ts (NEW)
    llm-provider.ts (NEW)
    ai-provider-factory.ts (NEW)

/src/modules/whatsapp/
  /application
    notification-sender.ts (NEW)
    message-processor.ts (UPDATED)
  /infra
    whatsapp.repo.ts (UPDATED)

/src/workers/
  whatsapp-notifications.ts (NEW)

/src/app/api/whatsapp/settings/
  route.ts (NEW)

/src/app/(app)/whatsapp/settings/
  page.tsx (NEW)

/src/components/ui/sidebar.tsx (UPDATED)
```

## Como Rodar

### 1. Rodar Migração

```bash
pnpm prisma migrate dev
```

### 2. Configurar Variáveis de Ambiente

```env
# LLM (opcional - se usar LLM provider)
LLM_PROVIDER=openai  # ou "anthropic"
LLM_MODEL=gpt-4o-mini
LLM_API_KEY=sk-...
LLM_API_URL=https://api.openai.com/v1/chat/completions  # opcional
LLM_TIMEOUT_MS=5000
```

### 3. Configurar Worker (Cron)

Adicione um cron job para rodar o worker a cada 5-10 minutos:

```bash
# Exemplo com cron (Linux/Mac)
*/5 * * * * cd /path/to/project && pnpm tsx src/workers/whatsapp-notifications.ts
```

Ou configure via plataforma (Railway, Render, etc) como job periódico.

### 4. Configurar Settings via UI

1. Acesse `/whatsapp/settings`
2. Configure:
   - Habilitar LLM (se tiver API key)
   - Escolher provider
   - Configurar quiet hours
   - Configurar digest diário
   - Modo command only

## Fluxo de Notificações Proativas

1. **Worker roda** (cada 5-10 min)
2. **Busca notificações** não enviadas (últimas 24h)
3. **Verifica quiet hours** (skips normais se dentro)
4. **Separa críticas** (sempre enviam)
5. **Agrega ou envia individual**:
   - Se tem digest configurado → agrega no horário
   - Senão → envia individual
6. **Marca como enviada** (NotificationDelivery)
7. **Log de envio** (ConversationMessage OUT)

## Fluxo de LLM Provider

1. **Mensagem recebida** → MessageProcessor
2. **Verifica settings** → LLM habilitado?
3. **Cria contexto** → últimas 10 mensagens
4. **Chama LLMProvider** → function calling
5. **LLM retorna** → toolName + toolInput
6. **Se falhar** → fallback para HeuristicProvider
7. **Processa tool** → validação + RBAC + execução

## Templates de Mensagens

### Notificação Individual

```
⚠️ *Alerta financeiro*

Recorrência amanhã: Notion R$ 89,00

Caixa 30d: risco de mínimo < R$ 5.000

💡 *Sugestões:*
/caixa 30 | /dre 2025-12 | /notifs
```

### Digest Diário

```
📌 *Resumo do dia*

2 recorrências próximas
1 gasto fora do padrão
MRR: R$ X (+Y% MoM)

*Principais:*
• Recorrência Notion
• Gasto fora do padrão

💡 *Sugestões:*
/notifs | /dre 2025-12 | /gastos 2025-12
```

## Segurança

### Guardrails Implementados

1. **LLM não inventa respostas**: Retorna apenas tool calls
2. **Validação Zod**: Todos os inputs validados
3. **RBAC**: Permissões verificadas antes da execução
4. **Confirmação**: Escritas sempre pedem confirmação
5. **Timeout**: Limite de tempo para chamadas LLM
6. **Fallback**: Heurística sempre disponível
7. **Contexto limitado**: Máx 10 mensagens

### Limites

- Timeout padrão: 5 segundos
- Contexto: 10 mensagens recentes
- Tool calls: 1 por vez (MVP)
- Temperature: 0.3 (baixa criatividade)

## Testes Sugeridos

### Unit Tests

```typescript
// LLMProvider.decide()
test('LLM returns tool call', async () => {
  const provider = new LLMProvider()
  const decision = await provider.decide('qual meu mrr', context)
  expect(decision.kind).toBe('tool')
  expect(decision.toolName).toBe('growthOverview')
})

// NotificationSender.isQuietHours()
test('respects quiet hours', () => {
  const settings = { quietHoursStart: '22:00', quietHoursEnd: '07:00' }
  expect(isQuietHours(settings, new Date('2025-01-01T23:00:00'))).toBe(true)
})
```

### Integration Tests

```typescript
// Notification → WhatsApp
test('sends notification via WhatsApp', async () => {
  const result = await sendNotification(orgId, userId, notification, phone)
  expect(result).toBe(true)
  const delivery = await findDelivery(notification.id, userId)
  expect(delivery.status).toBe('SENT')
})
```

## Mensagem de Commit Sugerida

```
feat(whatsapp-ai): add LLM provider, proactive notifications, and settings

- Add AIProvider interface with HeuristicProvider and LLMProvider
- Add LLMProvider with function calling (OpenAI/Anthropic support)
- Add automatic fallback from LLM to heuristic
- Add NotificationDelivery model for tracking
- Add WhatsappSettings model for org configuration
- Add NotificationSender with anti-spam (quiet hours, daily digest)
- Add worker for proactive notifications
- Add admin settings UI (/whatsapp/settings)
- Integrate AI providers in MessageProcessor
- Add context limiting (10 recent messages)
- Add templates for notification messages

Marco 5 Etapa 3 - LLM support and proactive notifications ready.
```

## Próximos Passos

- Testes unitários e de integração
- Melhorias na precisão do LLM (few-shot examples)
- Suporte a mais providers (Gemini, Claude, etc)
- Analytics de uso (qual provider mais usado, taxa de sucesso)
- A/B testing de providers

## Status

✅ **Etapa 3 - COMPLETA**

Marco 5 está completo! Sistema agora é um "CFO no WhatsApp" funcional com:
- Comandos slash + linguagem natural
- LLM plugável com function calling
- Confirmação de ações sensíveis
- Notificações proativas com anti-spam
- Configurações administrativas





