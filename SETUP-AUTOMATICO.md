# 🚀 Setup Automático - Passo a Passo

## O que você precisa fazer (5 minutos):

### 1️⃣ Criar banco no Supabase (2 min)

1. Acesse: https://supabase.com
2. Clique "Start your project"
3. Login com GitHub
4. Crie projeto (escolha um nome e senha)
5. **Copie a Connection String** (Settings → Database → Connection string → URI)

### 2️⃣ Configurar .env

Crie arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="cole-a-string-do-supabase-aqui"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="qualquer-string-aleatoria-12345"
```

**Substitua** `[PASSWORD]` na DATABASE_URL pela senha do seu projeto Supabase.

### 3️⃣ Rodar migrations

```bash
npm run db:migrate
```

### 4️⃣ Iniciar servidor

```bash
npm run dev
```

### 5️⃣ Acessar

http://localhost:3000

---

## 🎯 Pronto!

Agora você pode testar todas as funcionalidades!

Veja `COMO-TESTAR.md` para guia completo de testes.




