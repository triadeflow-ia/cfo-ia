# Módulos do Sistema

## Visão Geral

O sistema é dividido em módulos independentes, cada um com sua própria estrutura em camadas (domain/application/infra/ui).

## Estrutura de um Módulo

```
/src/modules/<nome-modulo>/
  /domain
    entities.ts          # Entidades de domínio
    value-objects.ts     # Value objects
    rules.ts            # Regras de negócio
  /application
    use-cases/
      create-entity.ts
      update-entity.ts
      list-entities.ts
    services/
      entity-service.ts
    dto.ts              # DTOs de entrada/saída
  /infra
    repositories/
      prisma-entity-repository.ts
    integrations/       # Integrações externas (se houver)
    queues/            # Jobs/filas (se houver)
  /ui
    components/        # Componentes React específicos
    pages/            # Páginas Next.js (se necessário)
  index.ts            # Facade - interface pública do módulo
```

## Módulos Planejados

### 1. Auth Module (Já implementado parcialmente)

**Localização**: `/src/shared/auth`

**Responsabilidade**: Autenticação e autorização

**Status**: ✅ Fundação completa

### 2. RBAC Module (Já implementado parcialmente)

**Localização**: `/src/shared/rbac`

**Responsabilidade**: Gerenciamento de roles e permissões

**Status**: ✅ Fundação completa

### 3. Audit Module (Já implementado parcialmente)

**Localização**: `/src/shared/utils/audit.ts`

**Responsabilidade**: Criação de logs de auditoria

**Status**: ✅ Fundação completa

### 4. Ledger Module (Marco 1) ✅

**Localização**: `/src/modules/ledger`

**Responsabilidade**: 
- Gerenciamento de transações financeiras
- Contas (FinancialAccount)
- Categorias e centros de custo
- Clientes e fornecedores
- Importação CSV
- Relatórios básicos

**Status**: ✅ Implementado no Marco 1

**Estrutura**:
- `/domain/validators.ts` - Schemas Zod
- `/application/ledger.service.ts` - Use cases
- `/infra/ledger.repo.ts` - Repositório Prisma
- `/index.ts` - Facade público

**Documentação**: Ver `/docs/modulos/modulo-01-ledger-mvp.md`

### 5. Automation Module (Marco 2) ✅

**Localização**: `/src/modules/automation`

**Responsabilidade**:
- Regras de categorização automática
- Recorrências (despesas/receitas fixas)
- Alertas e notificações
- Jobs e workers (BullMQ)

**Status**: ✅ Implementado no Marco 2

**Estrutura**:
- `/domain/schemas.ts` - Schemas Zod
- `/application/automation.service.ts` - Serviço principal
- `/application/categorization.service.ts` - Auto-categorização
- `/application/recurrence.service.ts` - Geração de recorrências
- `/application/alerts.service.ts` - Geração de alertas
- `/infra/automation.repo.ts` - Repositório Prisma
- `/infra/queue.ts` - BullMQ queue
- `/index.ts` - Facade público

**Documentação**: Ver `/docs/modulos/modulo-02-automacao.md`

### 6. WhatsApp Tools Module (Marco 2) ✅

**Localização**: `/src/modules/whatsapp-tools`

**Responsabilidade**:
- Tools (funções) para LLMs usarem via function calling
- Interface desacoplada do sistema

**Status**: ✅ Preparado no Marco 2 (integração completa no Marco 5)

**Tools disponíveis**:
- listTransactions, createTransaction, updateTransaction
- spendByCategory, listNotifications
- listRecurrences, createRecurrence

### 7. Report Module (Marco 3) ✅

**Localização**: `/src/modules/reports`

**Responsabilidade**:
- DRE gerencial (caixa e competência)
- Fluxo de caixa (real e projetado)
- Orçado vs Realizado
- Exportação CSV

**Status**: ✅ Implementado no Marco 3

**Estrutura**:
- `/domain/schemas.ts` - Schemas Zod
- `/application/reports.service.ts` - Serviços de relatórios
- `/infra/reports.repo.ts` - Repositório com queries otimizadas
- `/infra/csv-export.ts` - Utilitários de exportação CSV
- `/index.ts` - Facade público

**Documentação**: Ver `/docs/modulos/modulo-03-relatorios.md`

**Localização**: `/src/modules/report`

**Responsabilidade**:
- DRE gerencial
- Fluxo de caixa
- Relatórios customizados
- Exportação (CSV/PDF)

**Status**: ⏳ A ser implementado

### 8. Growth Module (Marco 4) ✅

**Localização**: `/src/modules/growth`

**Responsabilidade**:
- Métricas de negócio (MRR/ARR, churn, LTV, margem)
- Gestão de contratos de receita recorrente
- Metas e comparação vs realizado
- Painel de crescimento

**Status**: ✅ Implementado no Marco 4

**Estrutura**:
- `/domain/schemas.ts` - Schemas Zod
- `/application/growth.service.ts` - Serviços de métricas
- `/infra/growth.repo.ts` - Repositório com queries otimizadas
- `/index.ts` - Facade público

**Documentação**: Ver `/docs/modulos/modulo-04-metricas-negocio.md`

### 9. Integrations Module (Marco 4) ✅

**Localização**: `/src/modules/integrations`

**Responsabilidade**:
- Interfaces para integrações externas
- CRM Adapter (interface para CRM)

**Status**: ✅ Interface criada no Marco 4

**Estrutura**:
- `/crm/CrmAdapter.ts` - Interface para adapters de CRM
- Placeholder implementation disponível

### 6. Metrics Module (Marco 4) ✅

### 7. WhatsApp Assistant Module (Marco 5)

**Localização**: `/src/modules/whatsapp-assistant`

**Responsabilidade**:
- Webhook receiver
- Command router
- Integração com IA
- Notificações proativas

**Status**: ⏳ A ser implementado

### 8. Integration Module (Marco 6)

**Localização**: `/src/modules/integration`

**Responsabilidade**:
- Adapters para CRM, banco, NF, contabilidade
- Webhooks
- Event bus

**Status**: ⏳ A ser implementado

## Princípios de Módulos

1. **Independência**: Módulos não devem depender da implementação interna de outros
2. **Interface clara**: Cada módulo expõe apenas o necessário via `index.ts`
3. **Camadas**: Sempre respeitar domain → application → infra → ui
4. **Testabilidade**: Cada camada é testável independentemente

