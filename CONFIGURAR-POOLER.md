# 🔧 Configurar Session Pooler - Passo a Passo

## 📋 Instruções Simples

1. **No dashboard do Supabase:**
   - Na tela de "Connection String"
   - No dropdown **"Method"**, selecione **"Session Pooler"** (ou "Transaction Pooler")
   - A connection string vai mudar automaticamente

2. **Copie a connection string completa** (ela vai aparecer na caixa de texto)

3. **Cole aqui** (me envie) ou configure manualmente:

### Opção A: Me envie a string
Cole a connection string aqui e eu configuro automaticamente.

### Opção B: Configure manualmente
Cole no arquivo `.env` substituindo a linha `DATABASE_URL=`:

```env
DATABASE_URL="cole-a-string-aqui"
```

### Opção C: Use o script
```bash
node scripts/set-db-url.js "cole-a-string-aqui"
```

---

## ✅ Depois de configurar

Rode as migrations:

```bash
npm run db:migrate
```

Se funcionar, você verá as migrations sendo aplicadas! 🎉


