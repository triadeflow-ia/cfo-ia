# CFO IA - Visão Geral do Projeto

## Missão do Produto

Criar um "CFO Inteligente" com:

- **Dashboard web** (mobile + desktop) com UI clean, minimalista e extremamente funcional
- **Gestão financeira completa**: gastos fixos/variáveis por categoria, despesas com colaboradores, impostos, assinaturas, reembolsos, contas a pagar/receber, anexos, conciliação e competência
- **Métricas de negócio**: clientes, ticket médio, LTV, MRR/ARR, churn, margem por cliente, crescimento (MoM), metas
- **WhatsApp como interface principal** de consulta + comandos + notificações
- **Integrações plugáveis** (CRM, banco, NF, contabilidade, gateways), com arquitetura pronta para escalar
- **Documentação contínua**: do zero até produção, sem perder histórico e com marcos claros

## Regras de Ouro

1. **Modularidade absoluta**: cada feature é um módulo com interface clara (contratos)
2. **Sem recomeçar do zero**: tudo versionado com docs, migrações e changelog
3. **Minimalismo na UI**: menos componentes, mais clareza
4. **Auditabilidade**: tudo tem trilha de auditoria (quem fez, quando, de onde veio)
5. **Automação > manual**: manual só como fallback e com UX rápida
6. **Pronto pra integrar**: CRM e outros sistemas entram via "adapters"
7. **IA desacoplada**: o sistema funciona sem IA; IA melhora a experiência (sugestões, insights, chat)

## Stack Tecnológica

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- **Backend**: API interna no Next.js (route handlers) com camadas separadas (domain/application/infra)
- **DB**: Postgres + Prisma
- **Jobs/Filas**: BullMQ + Redis (importações, notificações, rotinas)
- **Auth/RBAC**: Auth.js (NextAuth) + roles + permissões por organização
- **Logs/Auditoria**: audit_log no Postgres + logs estruturados
- **Docs**: /docs em Markdown + diagramas Mermaid
- **Testes**: Vitest + Playwright (mínimo viável)

## Roadmap por Marcos

- **Marco 0** — Fundação ✅
- **Marco 1** — Ledger MVP
- **Marco 2** — Automação
- **Marco 3** — Relatórios
- **Marco 4** — Métricas do negócio
- **Marco 5** — WhatsApp + Assistente
- **Marco 6** — Integrações

## Estado Atual

✅ **Marco 0 - Fundação** (completo)

- Setup do projeto (Next.js, TypeScript, Tailwind, Prisma)
- Autenticação com NextAuth
- RBAC básico (roles e permissões)
- Layout base com sidebar e header
- Audit log no banco
- Documentação base

Próximo passo: **Marco 1 - Ledger MVP**



