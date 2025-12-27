# ⚡ Configurar .env AGORA - Instruções Simples

## 🎯 Passo a Passo (2 minutos)

### 1. Pegar Connection String do Supabase

1. Acesse: **https://supabase.com/dashboard/project/mlhuhewsitnmkejsyfnn/settings/database**
2. Role até **Connection string**
3. Selecione **Connection pooling** (não Direct connection)
4. Clique no botão de **copiar** ao lado da string
5. A string completa será copiada (algo como: `postgresql://postgres.xxxxx:MDxzQgntotZZ5biC@aws-0-us-east-1.pooler.supabase.com:6543/postgres`)

### 2. Editar arquivo .env

Abra o arquivo `.env` na raiz do projeto e substitua a linha:

```
DATABASE_URL="..."
```

Pela connection string que você copiou.

**Exemplo de .env correto:**
```env
DATABASE_URL="postgresql://postgres.xxxxxxxxxx:MDxzQgntotZZ5biC@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="cfo-ia-secret-key-2024"
NODE_ENV="development"
```

### 3. Rodar Migrations

```bash
npm run db:migrate
```

### 4. Iniciar Servidor

```bash
npm run dev
```

---

## 🎉 Pronto!

Acesse: **http://localhost:3000**

---

## 💡 Dica

A connection string do Supabase já vem formatada corretamente quando você copia do dashboard. 
Não precisa modificar nada, apenas copiar e colar!

---

## 📝 Sobre MCP Server

O MCP server do Supabase é para uso no Cursor/IDE (ferramentas MCP), mas o **Prisma precisa da connection string tradicional** do PostgreSQL para funcionar. Por isso precisamos copiar do dashboard mesmo.




