# 🔧 Solução para Erro "Tenant or user not found"

## 🐛 Problema

O erro "FATAL: Tenant or user not found" acontece porque:

1. O Prisma está tentando validar a conexão durante o `prisma generate`
2. A DATABASE_URL pode estar incorreta ou a senha pode ter mudado

## ✅ Soluções

### Solução 1: Verificar DATABASE_URL no Render (RECOMENDADO)

1. Acesse: https://dashboard.render.com → Serviço `cfo-ia` → **Environment**
2. Verifique se a variável `DATABASE_URL` está configurada
3. **Copie a connection string ATUAL do Supabase**:

   - Acesse: https://supabase.com/dashboard/project/mlhuhewsitnmkejsyfnn/settings/database
   - Vá em **Connection string**
   - Selecione **Connection pooling** (não Direct)
   - **Copie a string completa**
   - Cole no Render substituindo a DATABASE_URL atual

### Solução 2: Usar Direct Connection (Alternativa)

Se o Pooler não funcionar, tente a Direct Connection:

1. No Supabase, selecione **Direct connection** (não Pooling)
2. Copie a string
3. Cole no Render

**Formato esperado:**
```
postgresql://postgres:MDxzQgntotZZ5biC@db.mlhuhewsitnmkejsyfnn.supabase.co:5432/postgres
```

### Solução 3: Verificar se a Senha Está Correta

A senha pode ter mudado. Para verificar:

1. No Supabase: **Settings** → **Database** → **Database password**
2. Se precisar resetar, clique em **Reset database password**
3. **Anote a nova senha**
4. Atualize a DATABASE_URL no Render com a nova senha

### Solução 4: Ajustar Build Command (Temporário)

Se nada funcionar, podemos fazer o Prisma não validar durante o build. Mas isso não é ideal.

## 🔍 Como Verificar se a Connection String Está Correta

### Teste Local (Opcional)

1. Crie um arquivo `.env` local com a DATABASE_URL
2. Rode: `npm run db:generate`
3. Se funcionar localmente, a string está correta

### Verificar no Supabase

1. Acesse: https://supabase.com/dashboard/project/mlhuhewsitnmkejsyfnn
2. Vá em **Settings** → **Database**
3. Verifique se o projeto está **ativo** (não pausado)
4. Copie a connection string **mais recente**

## 📝 Connection Strings Possíveis

### Pooler (Recomendado - Porta 6543)
```
postgresql://postgres.mlhuhewsitnmkejsyfnn:MDxzQgntotZZ5biC@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### Direct (Alternativa - Porta 5432)
```
postgresql://postgres:MDxzQgntotZZ5biC@db.mlhuhewsitnmkejsyfnn.supabase.co:5432/postgres
```

## ⚠️ Importante

- A senha `MDxzQgntotZZ5biC` pode ter mudado
- Sempre copie a connection string **diretamente do dashboard do Supabase**
- Não use strings antigas ou desatualizadas

## 🚀 Próximos Passos

1. **Copie a connection string ATUAL do Supabase**
2. **Cole no Render** substituindo a DATABASE_URL
3. **Salve e faça novo deploy**

Se ainda não funcionar, pode ser que:
- A senha mudou (precisa resetar)
- O projeto Supabase está pausado
- Há algum problema de rede/firewall

