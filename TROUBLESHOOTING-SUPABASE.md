# 🔧 Troubleshooting - Conexão Supabase

## Problema: "Can't reach database server"

Se você está recebendo este erro, pode ser que:

### 1. Conexão Direta (porta 5432) não está habilitada

No Supabase, conexões diretas podem estar desabilitadas por padrão. 

**Solução**: Use o **Pooler** (porta 6543) que sempre funciona:

No dashboard do Supabase:
1. Settings → Database
2. Connection string
3. Selecione **Connection pooling** (não Direct connection)
4. Copie a string

Formato do pooler:
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

### 2. Verificar se o banco está ativo

Certifique-se de que o projeto não está pausado no Supabase.

### 3. Testar conexão

Você pode testar a conexão usando o Prisma Studio:

```bash
npm run db:studio
```

Se abrir, significa que a conexão está funcionando!

### 4. Formato correto da connection string

A connection string deve ter exatamente este formato:

```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

ou com pooler:

```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Importante**: 
- Substitua `[PASSWORD]` pela senha real (sem colchetes)
- Substitua `[PROJECT_REF]` pelo project ref do seu projeto
- O project_ref geralmente é diferente do Project ID

### 5. Pegar a string correta do dashboard

**A forma mais garantida** é copiar diretamente do dashboard:

1. Supabase Dashboard → Seu Projeto
2. Settings → Database  
3. Connection string → **URI** ou **Connection pooling**
4. Copiar a string completa
5. Colar no `.env`

A string já vem formatada corretamente!

---

## ✅ Depois de configurar corretamente:

```bash
npm run db:migrate
```

Se funcionar, você verá:
```
✔ Applied migration `xxxxx` to database
```

Depois:
```bash
npm run dev
```

Acesse: http://localhost:3000


