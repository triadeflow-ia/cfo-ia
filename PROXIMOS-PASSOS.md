# 🚀 Próximos Passos - Teste do Sistema

## ✅ O que já está configurado:

1. ✅ Banco de dados conectado (Supabase PostgreSQL)
2. ✅ Schema aplicado (todas as tabelas criadas)
3. ✅ Dados iniciais criados (organização, roles, usuário de teste)
4. ✅ Servidor Next.js rodando em background

---

## 🔐 Login no Sistema

### Credenciais de Teste:

- **Email:** `admin@example.com`
- **Senha:** `qualquer senha` (em desenvolvimento, a validação de senha está desabilitada)

### Acessar:

1. Abra o navegador em: **http://localhost:3000**
2. Você será redirecionado para: **http://localhost:3000/auth/signin**
3. Faça login com as credenciais acima

---

## 📋 Testar Funcionalidades Implementadas

### 1. **Integrações - Conexões**
   - **URL:** http://localhost:3000/integrations/connections
   - **O que testar:**
     - Ver lista de conexões (vazia inicialmente)
     - Criar nova conexão (botão "Add Connection")
     - Tipos disponíveis: BANK, NF, ACCOUNTING, CRM
     - Providers: MockBank, MockInvoice, etc.

### 2. **Integrações - Reconciliação Bancária**
   - **URL:** http://localhost:3000/integrations/bank/reconcile
   - **O que testar:**
     - Ver transações bancárias importadas
     - Sugestões de match automático
     - Aprovar/rejeitar matches
     - Criar transações a partir de transações bancárias

### 3. **Integrações - Notas Fiscais**
   - **URL:** http://localhost:3000/integrations/invoices
   - **O que testar:**
     - Ver lista de notas fiscais importadas
     - Filtrar por status, cliente, período
     - Vincular nota fiscal a cliente manualmente

### 4. **Sync Manual de Dados**

Você pode testar a sincronização manual através das APIs:

#### Sincronizar Transações Bancárias:
```bash
# Primeiro, crie uma conexão bancária através da UI
# Depois, faça uma requisição POST para sincronizar:
curl -X POST http://localhost:3000/api/integrations/bank/sync \
  -H "Content-Type: application/json" \
  -d '{"connectionId": "id-da-conexao"}'
```

#### Sincronizar Notas Fiscais:
```bash
curl -X POST http://localhost:3000/api/integrations/invoices/sync \
  -H "Content-Type: application/json" \
  -d '{"connectionId": "id-da-conexao"}'
```

#### Sincronizar CRM:
```bash
curl -X POST http://localhost:3000/api/integrations/crm/sync \
  -H "Content-Type: application/json" \
  -d '{"connectionId": "id-da-conexao"}'
```

---

## 🧪 Fluxo Completo de Teste Recomendado

### Passo 1: Criar uma Conexão Bancária
1. Acesse `/integrations/connections`
2. Clique em "Add Connection"
3. Selecione:
   - **Type:** `BANK`
   - **Provider:** `MockBank`
   - **Name:** `Banco Teste`
   - **Settings:** `{}` (JSON vazio ou `{"accountId": "123"}`)
4. Salve

### Passo 2: Sincronizar Transações
1. Na lista de conexões, clique em "Sync" na conexão criada
   - OU use a API: `POST /api/integrations/bank/sync`
2. O sistema vai importar transações mockadas
3. Vá para `/integrations/bank/reconcile` para ver as transações

### Passo 3: Reconciliação
1. Em `/integrations/bank/reconcile`, você verá:
   - Transações bancárias importadas
   - Sugestões de match (se houver transações internas similares)
   - Botões para "Approve Match", "Create Transaction", "Reject"
2. Teste cada ação

### Passo 4: Criar Conexão de NFe e Testar
1. Crie uma conexão do tipo `NF`
2. Sincronize notas fiscais
3. Veja em `/integrations/invoices`

---

## 🔍 Verificar Dados no Banco

### Opção 1: Prisma Studio (Interface Visual)
```bash
npm run db:studio
```
Acesse http://localhost:5555 e explore as tabelas:
- `IntegrationConnection`
- `BankTransaction`
- `MatchSuggestion`
- `Invoice`
- `Transaction`
- `Organization`
- `User`

### Opção 2: Supabase Dashboard
Acesse: https://supabase.com/dashboard/project/mlhuhewsitnmkejsyfnn/editor
Veja todas as tabelas e dados diretamente no Supabase.

---

## 🐛 Troubleshooting

### Servidor não está rodando?
```bash
npm run dev
```

### Erro de conexão com banco?
- Verifique se o `.env` tem a `DATABASE_URL` correta
- Verifique se o Supabase está acessível

### Erro ao fazer login?
- Certifique-se de que o seed foi executado: `npm run db:seed`
- Verifique se o usuário `admin@example.com` existe

### Não vejo dados nas integrações?
- Crie conexões primeiro
- Execute sincronizações manualmente
- Os adapters mock retornam dados de exemplo

---

## 📚 Próximas Melhorias (Fora do Escopo Atual)

1. **Integrações Reais:**
   - Substituir `MockBankAdapter` por adapters reais (Belvo, Plaid, etc.)
   - Substituir `MockInvoiceAdapter` por integração real com NFe/NFSe
   - Implementar adapters de CRM reais (Kommo, GHL)

2. **Workers Automáticos:**
   - Configurar Redis/BullMQ para workers
   - Agendar syncs automáticos (diários)
   - Processar match engine a cada 10 minutos

3. **Segurança:**
   - Implementar criptografia para tokens armazenados
   - Adicionar validação de senha adequada
   - Implementar rotação de tokens

4. **UI/UX:**
   - Melhorar feedback visual durante syncs
   - Adicionar gráficos e estatísticas
   - Implementar notificações em tempo real

---

## 🎯 Pronto para Testar!

Tudo está configurado e funcionando. Comece pelo login e depois explore as funcionalidades de integração!

**Dúvidas?** Veja os arquivos:
- `TESTE-MARCO-6.md` - Guia detalhado de testes
- `docs/modulos/modulo-06-integracoes.md` - Documentação completa do módulo


