# Arquitetura do Sistema

## Visão Geral

O sistema é construído com arquitetura modular em camadas, seguindo princípios de Domain-Driven Design (DDD) e Clean Architecture.

## Estrutura de Diretórios

```
/src
  /modules          # Módulos de negócio (cada um é independente)
    /<modulo>/
      /domain       # Entidades, value objects, regras de negócio
      /application  # Use cases, serviços de aplicação
      /infra        # Implementações (repos Prisma, integrações, filas)
      /ui           # Componentes React, páginas Next.js
      index.ts      # Facade/interface pública do módulo
  
  /shared           # Código compartilhado
    /auth           # Configuração NextAuth
    /db             # Prisma client singleton
    /rbac           # Permissões, middleware RBAC
    /logger         # Logger estruturado
    /utils          # Utilidades gerais
    /types          # Tipos base compartilhados
  
  /components       # Componentes UI compartilhados
    /ui             # Componentes shadcn/ui
    /layout         # Layout components
    /providers      # Context providers
  
  /app              # Next.js App Router
    /api            # API routes
    /auth           # Páginas de autenticação
    /(pages)        # Páginas da aplicação
```

## Camadas de Arquitetura

### 1. Domain Layer (`/domain`)

- **Entidades**: objetos de negócio com identidade
- **Value Objects**: objetos imutáveis sem identidade
- **Regras de negócio**: validações e lógica de domínio
- **Sem dependências externas**

### 2. Application Layer (`/application`)

- **Use Cases**: casos de uso da aplicação
- **DTOs**: objetos de transferência de dados
- **Services**: serviços de aplicação
- **Depende apenas do Domain**

### 3. Infrastructure Layer (`/infra`)

- **Repositories**: implementação de acesso a dados (Prisma)
- **Integrações**: APIs externas, webhooks
- **Filas**: jobs (BullMQ)
- **Depende do Domain e Application**

### 4. Presentation Layer (`/ui` + `/app`)

- **Componentes React**: UI components
- **Páginas Next.js**: rotas e páginas
- **API Routes**: endpoints HTTP
- **Depende de todas as outras camadas**

## Princípios de Design

### Modularidade

Cada módulo expõe apenas sua interface pública através de um `index.ts` (facade pattern). Módulos não devem depender diretamente da implementação interna de outros módulos.

### Auditoria

Toda alteração em entidades importantes deve ser registrada no `AuditLog` através da função `createAuditLog()`.

### Multi-tenant

Todos os dados são isolados por `organizationId`. Nunca retornar dados sem filtrar por organização.

### RBAC

Permissões são verificadas em múltiplos níveis:
- Middleware de API routes
- Componentes UI (ocultar/mostrar)
- Use cases (validação final)

## Fluxo de Dados

```
User Request
    ↓
Next.js API Route (/app/api)
    ↓
Application Layer (use case)
    ↓
Domain Layer (entities, rules)
    ↓
Infrastructure Layer (repository)
    ↓
Database (Prisma)
```

## Decisões Futuras

- Extrair backend para serviço separado (Node.js/Express ou similar)
- Multi-tenant SaaS com isolamento completo
- Event bus para comunicação assíncrona entre módulos
- BI separado para analytics pesados



