# Deploy e Infraestrutura

## Visão Geral

Este documento descreve o processo de deploy e configuração da infraestrutura.

## Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Redis (para BullMQ)
- Variáveis de ambiente configuradas

## Variáveis de Ambiente

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret-key-here"

# Redis
REDIS_URL="redis://localhost:6379"

# App
APP_URL="https://yourdomain.com"
NODE_ENV="production"
```

## Setup Local

1. **Clone o repositório**

```bash
git clone <repo>
cd gestor_financeira
```

2. **Instale dependências**

```bash
npm install
```

3. **Configure variáveis de ambiente**

```bash
cp .env.example .env
# Edite .env com suas configurações
```

4. **Setup do banco de dados**

```bash
# Gerar Prisma Client
npm run db:generate

# Rodar migrações
npm run db:migrate

# Seed inicial (opcional)
npm run db:seed
```

5. **Inicie o servidor de desenvolvimento**

```bash
npm run dev
```

6. **Acesse a aplicação**

```
http://localhost:3000
```

## Deploy em Produção

### Opção 1: Vercel (Recomendado para MVP)

1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente
3. Configure DATABASE_URL com um banco PostgreSQL (Supabase, Railway, etc.)
4. Configure REDIS_URL (Upstash, Railway, etc.)
5. Deploy automático via Git

### Opção 2: Docker

(Plano futuro - criar Dockerfile e docker-compose.yml)

### Opção 3: Servidor próprio

1. Build da aplicação: `npm run build`
2. Start: `npm start`
3. Use PM2 ou similar para gerenciar processos
4. Configure Nginx como reverse proxy

## Banco de Dados

### PostgreSQL

- Versão mínima: 14
- Extensões necessárias: nenhuma especial
- Backup: configurar backups automáticos

### Migrações

```bash
# Desenvolvimento
npm run db:migrate

# Produção (cuidado!)
npm run db:migrate -- --prod
```

## Redis

Necessário para:
- BullMQ (filas de jobs)
- Cache (futuro)
- Rate limiting (futuro)

### Opções de Redis

- **Upstash**: Serverless Redis, fácil setup
- **Railway**: Redis como serviço
- **Self-hosted**: Redis em servidor próprio

## Monitoramento (Futuro)

- Logs estruturados
- Error tracking (Sentry)
- Performance monitoring
- Database query monitoring

## Backup

- **Database**: Backups automáticos diários
- **Files/Attachments**: Armazenamento em S3 ou similar
- **Audit Logs**: Manter histórico mínimo de 2 anos

## Segurança

- HTTPS obrigatório em produção
- NEXTAUTH_SECRET forte e único
- Rate limiting em APIs públicas
- Validação de input em todos os endpoints
- CORS configurado adequadamente

## Escalabilidade

### Horizontal Scaling

- Stateless: aplicação pode rodar em múltiplas instâncias
- Session: usar JWT (stateless) ou session store compartilhado
- Database: connection pooling (Prisma já faz)

### Vertical Scaling

- Aumentar recursos da máquina/servidor
- Otimizar queries do banco
- Cache de queries frequentes

### Futuro

- Separar backend em serviço próprio
- Implementar event bus
- Cache distribuído (Redis Cluster)
- CDN para assets estáticos



