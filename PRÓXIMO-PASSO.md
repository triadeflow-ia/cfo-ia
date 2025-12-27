# 🎯 Próximo Passo - Configurar Connection String

## ✅ O que já está feito:

1. ✅ Arquivo `.env` criado
2. ✅ Variáveis básicas configuradas
3. ⏳ **Falta**: Ajustar `DATABASE_URL` com a connection string correta do Supabase

## 🔧 O que fazer agora:

### 1. Pegar Connection String do Supabase

1. Acesse: https://supabase.com/dashboard
2. Projeto: **triadeflow-ia**
3. **Settings** → **Database**
4. Seção **Connection string**
5. Selecione **URI**
6. **Copie** a string completa

### 2. Editar .env

Abra o arquivo `.env` (na raiz do projeto) e cole a connection string completa na linha `DATABASE_URL`.

### 3. Rodar migrations

```bash
npm run db:migrate
```

### 4. Iniciar servidor

```bash
npm run dev
```

---

## 💡 Dica

A connection string do Supabase geralmente tem um formato como:
- `postgresql://postgres.xxxxx:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`

Ou pode usar a direta (porta 5432):
- `postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres`

**Importante**: Use a que o Supabase mostrar no painel, ela já vem formatada corretamente!

---

Depois disso, tudo estará funcionando! 🚀




