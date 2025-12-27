# ⚡ Início Rápido - 3 Comandos

## 🎯 Passo a Passo Simplificado

### 1️⃣ Criar banco no Supabase (2 min)

1. Acesse: **https://supabase.com**
2. Clique "Start your project"
3. Login com GitHub
4. Crie projeto (nome + senha)
5. Vá em: **Settings → Database → Connection string → URI**
6. **Copie** a string completa

### 2️⃣ Configurar .env

Crie arquivo `.env` na raiz:

```env
DATABASE_URL="cole-a-string-do-supabase-aqui"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="qualquer-string-aleatoria"
```

**⚠️ Lembre-se**: Substitua `[PASSWORD]` na string pela senha do projeto!

### 3️⃣ Rodar setup automático

```bash
npm run setup
```

Este comando vai:
- ✅ Verificar/criar .env
- ✅ Gerar Prisma Client
- ✅ Rodar migrations
- ✅ Criar todas as tabelas

### 4️⃣ Iniciar servidor

```bash
npm run dev
```

Acesse: **http://localhost:3000**

---

## 🎉 Pronto!

Agora você pode testar:
- `/integrations/connections` - Criar conexões
- `/integrations/bank/reconcile` - Ver transações
- `/integrations/invoices` - Ver invoices

---

## 📖 Mais Detalhes

- **`LEIA-ME-PRIMEIRO.md`** - Guia completo
- **`SETUP-BANCO.md`** - Opções de banco
- **`COMO-TESTAR.md`** - Como testar funcionalidades

---

**Tempo total**: ~5 minutos! 🚀




