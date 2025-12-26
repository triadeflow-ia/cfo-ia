# WhatsApp + IA - Especificação

## Visão Geral

O sistema terá WhatsApp como interface principal para consultas, comandos e notificações. A IA será desacoplada, permitindo que o sistema funcione sem ela.

## Arquitetura do Módulo WhatsApp

```
/src/modules/whatsapp-assistant
  /domain
    entities/
      whatsapp-message.ts
      whatsapp-session.ts
    rules/
      command-parser.ts
  /application
    use-cases/
      receive-message.ts
      send-message.ts
      execute-command.ts
    services/
      command-router.ts
      ai-service.ts
  /infra
    webhook/
      receiver.ts
    providers/
      whatsapp-provider.ts  # Twilio, Twilio API, etc.
      ai/
        heuristic-ai-provider.ts  # MVP - regras simples
        llm-provider.ts           # Futuro - OpenAI, Anthropic, etc.
  /ui
    # Sem UI (apenas API)
  index.ts
```

## Contrato de IA Provider

```typescript
interface AIProvider {
  // Processar mensagem do usuário e retornar resposta
  processMessage(
    message: string,
    context: UserContext,
    tools: AITool[]
  ): Promise<AIResponse>
}

interface AITool {
  name: string
  description: string
  parameters: Record<string, unknown>
  execute: (params: Record<string, unknown>) => Promise<unknown>
}
```

## Funcionalidades da IA

### 1. Consultas (Read-only)

- "Quanto gastamos este mês?"
- "Mostre as despesas de marketing"
- "Qual o MRR atual?"
- "Liste os clientes que pagaram ontem"

### 2. Criação/Edição (Com permissões)

- "Registre um gasto de R$ 100 em marketing hoje"
- "Marque a conta X como paga"
- "Cadastre um fornecedor chamado ABC"

### 3. Ações (Rotinas)

- "Marcar conta como paga"
- "Criar regra de categorização"
- "Enviar relatório mensal"

## Segurança e RBAC

1. **Autenticação**: Usuário do WhatsApp deve estar vinculado a um User do sistema
2. **Autorização**: Verificar permissões antes de executar qualquer ação
3. **Audit Log**: Todas as ações via WhatsApp registradas com `source: "whatsapp"`
4. **Rate Limiting**: Limitar número de comandos por usuário/tempo

## HeuristicAIProvider (MVP)

Implementação simples baseada em regras e padrões:

- Regex patterns para identificar comandos
- Mapeamento direto para use cases
- Respostas pré-definidas
- Sem dependência de LLM externo

## LLMProvider (Futuro)

- Integração com OpenAI/Anthropic
- Parsing de linguagem natural
- Chamadas para tools/funções
- Contexto da conversa

## Fluxo de Mensagem

```
WhatsApp Message
    ↓
Webhook Receiver
    ↓
Command Router
    ↓
AI Provider (parse intent)
    ↓
Execute Tool/Use Case
    ↓
Generate Response
    ↓
Send WhatsApp Message
```

## Notificações Proativas

- Alertas de vencimento de contas
- Resumo diário/semanal
- Alertas de meta atingida
- Notificações de integrações (banco, NF)



