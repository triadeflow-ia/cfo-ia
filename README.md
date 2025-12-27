# CFO IA - Gestão Financeira

Sistema de gestão financeira empresarial com dashboard web, métricas de negócio e integração via WhatsApp com IA.

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Redis (para BullMQ)

### Instalação

1. Clone o repositório

```bash
git clone <repo-url>
cd gestor_financeira
```

2. Instale as dependências

```bash
npm install
```

3. Configure as variáveis de ambiente

```bash
cp .env.example .env
# Edite .env com suas configurações
```

4. Configure o banco de dados

```bash
# Gerar Prisma Client
npm run db:generate

# Rodar migrações
npm run db:migrate

# Seed inicial (opcional)
npm run db:seed
```

5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

6. Acesse a aplicação

```
http://localhost:3000
```

## 📚 Documentação

A documentação completa está na pasta `/docs`:

- [00-visao-geral.md](./docs/00-visao-geral.md) - Visão geral do projeto
- [01-arquitetura.md](./docs/01-arquitetura.md) - Arquitetura do sistema
- [02-modelo-de-dados.md](./docs/02-modelo-de-dados.md) - Modelo de dados
- [03-modulos.md](./docs/03-modulos.md) - Módulos do sistema
- [04-whatsapp-e-ia.md](./docs/04-whatsapp-e-ia.md) - Especificação WhatsApp + IA
- [05-deploy.md](./docs/05-deploy.md) - Guia de deploy
- [CHANGELOG.md](./docs/CHANGELOG.md) - Histórico de mudanças

## 🏗️ Stack Tecnológica

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: API Routes do Next.js
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (Auth.js)
- **Jobs**: BullMQ + Redis
- **Testes**: Vitest + Playwright

## 📋 Roadmap

- ✅ **Marco 0** - Fundação
- ✅ **Marco 1** - Ledger MVP
- ✅ **Marco 2** - Automação
- ✅ **Marco 3** - Relatórios
- ✅ **Marco 4** - Métricas do negócio
- 🔄 **Marco 5** - WhatsApp + Assistente (parcial - ver pendências)
- ✅ **Marco 6** - Integrações

> **Nota**: Consulte `O-QUE-FALTA-FINALIZAR.md` para ver pendências e próximos passos

## 🧪 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Iniciar servidor de produção
npm run lint         # Linter
npm run db:generate  # Gerar Prisma Client
npm run db:migrate   # Rodar migrações
npm run db:studio    # Abrir Prisma Studio
npm run db:seed      # Popular banco com dados iniciais
npm test             # Rodar testes
npm run test:e2e     # Testes end-to-end
```

## 🏛️ Arquitetura

O sistema segue uma arquitetura modular em camadas:

- **Domain**: Entidades e regras de negócio
- **Application**: Use cases e serviços
- **Infrastructure**: Repositórios, integrações, filas
- **Presentation**: UI e API routes

Cada módulo é independente e expõe sua interface através de um facade.

## 🔐 Segurança

- Autenticação via NextAuth.js
- RBAC (Role-Based Access Control)
- Audit log completo
- Isolamento multi-tenant por organização
- Validação de input em todas as APIs

## 📝 Licença

[Adicionar licença quando definida]

## 🤝 Contribuindo

[Adicionar guidelines quando necessário]




