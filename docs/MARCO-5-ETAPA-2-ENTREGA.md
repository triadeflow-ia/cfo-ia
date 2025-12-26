# Marco 5 - Etapa 2 - Intent Router + Tool Execution - Entrega

## Resumo do que foi feito

Implementação do coração do Marco 5: transformar mensagens em intenções, executar tools com segurança e responder formatadamente.

1. ✅ WhatsAppSender - Envio com retry/backoff
2. ✅ IntentRouter - Slash commands + heurística
3. ✅ PendingActionService - Confirmação de ações
4. ✅ ToolExecutor - Execução com RBAC + audit
5. ✅ ResponseFormatter - Formatação consistente
6. ✅ MessageProcessor - Orquestração completa
7. ✅ Integração no webhook

## Checklist de Aceitação

### Intent Router ✅
- [x] Slash commands (/mrr, /dre, /gastos, /caixa, /lancar, /notifs, /ajuda, /confirmar, /cancelar)
- [x] Heurística para mensagens naturais
- [x] Parse de comando /lancar com argumentos
- [x] Resolução de referências (conta por nome)

### PendingAction Flow ✅
- [x] Criação de ação pendente para escrita
- [x] Confirmação (SIM/confirmar)
- [x] Cancelamento (NÃO/cancelar)
- [x] Expiração (10 minutos)
- [x] Mensagem de confirmação formatada

### Tool Execution ✅
- [x] Validação Zod de input
- [x] Checagem RBAC por tool
- [x] Audit log (origem: whatsapp)
- [x] Tratamento de erros

### Outbound Sender ✅
- [x] Envio via WhatsApp Cloud API
- [x] Retry/backoff (3 tentativas)
- [x] Log de mensagens OUT
- [x] Idempotência

### Response Formatting ✅
- [x] Formato padrão (headline + dados + sugestões)
- [x] Formatação por tipo de tool
- [x] Mensagem de ajuda
- [x] Mensagens de confirmação

## Estrutura de Arquivos Criados

```
/src/modules/whatsapp/
  /infra
    whatsapp-sender.ts (NEW)
  /application
    intent-router.ts (NEW)
    intent-router-helpers.ts (NEW)
    pending-action.service.ts (NEW)
    tool-executor.ts (NEW)
    response-formatter.ts (NEW)
    message-processor.ts (NEW)

/src/modules/whatsapp-tools/
  tools-extended.ts (NEW)

/src/app/api/whatsapp/webhook/route.ts (UPDATED)
```

## Como Rodar

### 1. Configurar variáveis de ambiente

```env
WHATSAPP_VERIFY_TOKEN=seu_token_aqui
WHATSAPP_APP_SECRET=seu_app_secret  # Para validar assinatura
WHATSAPP_PHONE_NUMBER_ID=seu_phone_number_id
WHATSAPP_ACCESS_TOKEN=seu_access_token
WHATSAPP_API_URL=https://graph.facebook.com/v20.0  # Opcional
```

### 2. Vincular número a usuário

```bash
POST /api/whatsapp/user-links
{
  "userId": "user_id",
  "phoneE164": "+5511999999999",
  "isActive": true
}
```

### 3. Testar comandos

Envie mensagens para o número vinculado:
- `/mrr` - Ver MRR e métricas
- `/dre 2025-01` - DRE do mês
- `/gastos 2025-01` - Gastos por categoria
- `/caixa 30` - Fluxo de caixa
- `/lancar 1200 meta ads hoje conta:itau tipo:out` - Criar transação (com confirmação)
- `/notifs` - Ver notificações
- `/ajuda` - Ver comandos

## Comandos Disponíveis

### Slash Commands

- `/ajuda` - Lista comandos disponíveis
- `/mrr` - MRR, ARR, clientes ativos
- `/dre [YYYY-MM]` - DRE do mês (padrão: mês atual)
- `/gastos [YYYY-MM]` - Top categorias de gasto
- `/caixa [dias]` - Fluxo de caixa projetado (padrão: 30 dias)
- `/lancar <valor> <descrição> [hoje|YYYY-MM-DD] [conta:NomeConta] [tipo:in|out]` - Criar transação
- `/notifs` - Últimas notificações
- `/confirmar` ou `/sim` - Confirmar ação pendente
- `/cancelar` ou `/não` - Cancelar ação pendente

### Mensagens Naturais

O sistema também entende mensagens naturais como:
- "qual meu mrr"
- "gastos por categoria esse mês"
- "fluxo de caixa 30 dias"
- "lança 1200 meta ads hoje conta itau"

## Fluxo de Confirmação

1. Usuário envia comando de escrita (ex: `/lancar`)
2. Sistema cria PendingAction e responde com resumo + "Confirmar? (SIM / NÃO)"
3. Usuário responde "SIM" ou "/confirmar"
4. Sistema executa tool, deleta PendingAction e responde com resultado
5. Se "NÃO" ou "/cancelar": cancela ação
6. Se expirar (10 min): ação é descartada

## RBAC

Permissões por tool:
- **VIEW_FINANCE**: read tools (mrr, dre, gastos, caixa, notifs)
- **EDIT_FINANCE**: write tools (createTransaction, etc)
- **ADMIN**: todas as permissões

## Observações Importantes

1. **Idempotência**: Mensagens são processadas apenas uma vez (baseado em messageId)
2. **Confirmação obrigatória**: Ações de escrita sempre pedem confirmação
3. **Expiração**: PendingActions expiram em 10 minutos
4. **Retry**: Envio de mensagens tem retry com backoff exponencial (3 tentativas)
5. **Audit Log**: Todas as execuções de tools são registradas no audit log

## Mensagem de Commit Sugerida

```
feat(whatsapp): add intent router, tool execution, and confirmation flow

- Add IntentRouter with slash commands and natural language parsing
- Add PendingActionService for confirmation flow
- Add ToolExecutor with RBAC and audit logging
- Add ResponseFormatter for consistent message formatting
- Add WhatsAppSender with retry/backoff
- Add MessageProcessor for orchestration
- Integrate message processing in webhook
- Add extended tools (dreSummary, cashflowSummary, growthOverview)

Marco 5 Etapa 2 - Core functionality ready for WhatsApp interactions.
```

## Próximos Passos

- LLMProvider com function calling (opcional)
- Worker para notificações proativas
- Melhorias na heurística de NLP
- Templates de mensagens mais ricos

## Status

✅ **Etapa 2 - COMPLETA**

Pronto para próxima etapa: LLMProvider e notificações proativas.



