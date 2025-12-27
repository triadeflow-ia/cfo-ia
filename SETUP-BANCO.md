# 🗄️ Setup do Banco de Dados - Guia Rápido

## Opção 1: Supabase (Recomendado - Gratuito e Fácil) ⭐

### Passo 1: Criar conta no Supabase

1. Acesse: https://supabase.com
2. Clique em "Start your project"
3. Faça login com GitHub (mais rápido)
4. Crie um novo projeto

### Passo 2: Copiar Connection String

1. No dashboard do Supabase, vá em **Settings** → **Database**
2. Role até **Connection string**
3. Selecione **URI** (não Session mode)
4. Copie a string (algo como: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)

### Passo 3: Configurar .env

Crie/edite o arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="cole-aqui-a-string-do-supabase"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="qualquer-string-aleatoria-aqui-12345"
```

**Importante**: Substitua `[PASSWORD]` na string pela senha que você definiu ao criar o projeto.

### Passo 4: Rodar Migrations

```bash
npm run db:migrate
```

Pronto! Banco configurado! 🎉

---

## Opção 2: PostgreSQL Local (Se já tiver instalado)

Se você já tem PostgreSQL instalado localmente:

### 1. Criar banco

```sql
CREATE DATABASE gestor_financeira;
```

### 2. Configurar .env

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/gestor_financeira?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="qualquer-string-aleatoria"
```

### 3. Rodar migrations

```bash
npm run db:migrate
```

---

## Opção 3: Docker (Se tiver Docker instalado)

Crie um arquivo `docker-compose.yml`:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: gestor_financeira
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Depois:

```bash
docker-compose up -d
```

E configure `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gestor_financeira?schema=public"
```

---

## ✅ Verificar se funcionou

Depois de rodar `npm run db:migrate`, verifique:

```bash
npm run db:studio
```

Deve abrir o Prisma Studio mostrando todas as tabelas criadas.

---

## 🎯 Recomendação

**Use Supabase** - É gratuito, não precisa instalar nada, e funciona perfeitamente para desenvolvimento e até produção inicial.




