# ⚙️ Configurar .env - Passo Final

## ✅ Arquivo .env Criado!

O arquivo `.env` já foi criado, mas você precisa ajustar a `DATABASE_URL` com a connection string correta do Supabase.

## 📋 Como pegar a Connection String correta:

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto: **triadeflow-ia**
3. Vá em: **Settings** → **Database**
4. Role até a seção **Connection string**
5. Selecione **URI** (não Session mode)
6. **Copie** a string completa

Ela deve ter um formato como:
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

ou

```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

## ✏️ Editar .env

Abra o arquivo `.env` na raiz do projeto e substitua a linha:

```
DATABASE_URL="..."
```

Pela connection string completa que você copiou do Supabase.

**⚠️ IMPORTANTE**: A connection string já deve ter a senha incluída (substituindo `[PASSWORD]`).

## 🚀 Depois de editar:

```bash
npm run db:migrate
```

Isso criará todas as tabelas no banco!

---

## 📝 Exemplo de .env correto:

```env
DATABASE_URL="postgresql://postgres.xxxxx:MDxzQgntotZZ5biC@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="cfo-ia-secret-key-2024"
NODE_ENV="development"
```

---

**Depois de configurar, rode**: `npm run db:migrate`


