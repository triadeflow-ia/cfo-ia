# 🎯 LEIA-ME PRIMEIRO - Setup Rápido

## ⚡ Setup em 3 Passos

### 1. Criar banco no Supabase (2 minutos)

1. Acesse: **https://supabase.com**
2. Clique "Start your project" 
3. Login com GitHub
4. Crie um projeto (escolha nome e senha)
5. Vá em **Settings → Database → Connection string → URI**
6. **Copie a string** (algo como: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)

### 2. Configurar .env

Crie arquivo `.env` na raiz com:

```env
DATABASE_URL="cole-a-string-do-supabase-aqui"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="qualquer-string-aleatoria"
```

**⚠️ IMPORTANTE**: Substitua `[PASSWORD]` pela senha do seu projeto Supabase!

### 3. Rodar migrations e iniciar

```bash
npm run db:migrate
npm run dev
```

Acesse: **http://localhost:3000**

---

## 📚 Documentação Completa

- **`SETUP-BANCO.md`** - Opções de banco (Supabase, local, Docker)
- **`COMO-TESTAR.md`** - Guia completo de testes
- **`docs/TESTE-MARCO-6.md`** - Testes específicos do Marco 6

---

## ✅ Status Atual

- ✅ Dependências instaladas
- ✅ Código corrigido e validado
- ✅ Prisma Client gerado
- ⏳ **Você precisa**: Configurar banco (Supabase) e rodar migrations

---

**Tempo estimado**: 5 minutos para ter tudo rodando! 🚀


