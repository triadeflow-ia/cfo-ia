# Próximos Passos - Pós Correções P0

## ✅ O Que Já Foi Feito

Todos os 5 bloqueadores P0 foram corrigidos:
- ✅ Password hashing implementado
- ✅ Webhook WhatsApp orgId corrigido
- ✅ Middleware de auth corrigido
- ✅ Webhook signature obrigatória em produção
- ✅ requireAuth já estava OK

## 🔄 Próximos Passos (Ordem de Execução)

### 1. Fazer Commits dos P0s (OBRIGATÓRIO)

```bash
# Verificar status
git status

# Commit 1: Password hashing
git add prisma/schema.prisma prisma/migrations/ src/shared/auth/config.ts prisma/seed.ts tests/auth/
git commit -m "fix(auth): implement password verification with bcryptjs

- Add passwordHash field to User model in Prisma schema
- Create migration to add passwordHash column
- Implement bcryptjs.compare() for password verification in authorize()
- Reject users without passwordHash (OAuth-only users)
- Update seed to hash default password for test user
- Add basic tests for password verification

Fixes P0 security issue where any password was accepted.
Users must now have passwordHash to login via credentials.

Evidência: src/shared/auth/config.ts:43-52"

# Commit 2: Webhook orgId
git add src/app/api/whatsapp/webhook/route.ts src/modules/whatsapp/infra/whatsapp.repo.ts
git commit -m "fix(whatsapp): resolve org/user by phoneE164 in webhook

- Remove hardcoded 'default_org_id' from webhook handler
- Add findLinkByPhoneGlobal() method to search links globally by phoneE164
- Update webhook to use global phone lookup instead of hardcoded orgId
- Return OK for unknown numbers (don't fail webhook) but don't process

Fixes P0 security issue where all WhatsApp messages went to same organization.

Evidência: src/app/api/whatsapp/webhook/route.ts:102-108"

# Commit 3: Middleware
git add middleware.ts
git commit -m "fix(middleware): protect API routes and remove blanket bypass

- Remove blanket exception for all /api routes
- Implement allowlist for public API routes (/api/auth, /api/whatsapp/webhook)
- Require authentication for all other API routes
- Protect all app routes as before

Fixes P0 security issue where APIs were accessible without authentication.

Evidência: middleware.ts:25-45"

# Commit 4: Webhook signature
git add src/app/api/whatsapp/webhook/route.ts
git commit -m "fix(whatsapp): enforce webhook signature in production

- Require WHATSAPP_APP_SECRET in production environment
- Return 500 error if APP_SECRET missing in production
- Keep dev mode flexible for testing (with warning)
- Add logging for missing/invalid signatures

Fixes P0 security issue where webhook signatures were optional in production.

Evidência: src/app/api/whatsapp/webhook/route.ts:36-40"

# Commit 5: Documentação
git add docs/AUDITORIA_ATUAL.md docs/P0_FIXES_SUMMARY.md
git commit -m "docs: update audit with P0 fixes completion

- Mark all P0 items as fixed in AUDITORIA_ATUAL.md
- Add P0_FIXES_SUMMARY.md with evidence and validation steps"
```

---

### 2. Rodar Migration do Prisma (OBRIGATÓRIO)

```bash
# Gerar Prisma Client primeiro (se necessário)
npm run db:generate

# Aplicar migration
npm run db:migrate

# OU se quiser criar nova migration (se ainda não aplicou)
npx prisma migrate dev --name add_password_hash
```

⚠️ **IMPORTANTE**: Se você já tem usuários no banco, você precisará:
- Criar um script para gerar hashes para usuários existentes, OU
- Fazer login novamente (usuários sem passwordHash não poderão mais logar via credentials)

---

### 3. Rodar Seed (para criar usuário de teste)

```bash
npm run db:seed
```

Isso criará um usuário `admin@example.com` com senha `admin123` (já hashada).

---

### 4. Verificar Build e Testes

```bash
# Verificar se compila
npm run build

# Rodar testes
npm test

# Verificar tipos
npx tsc --noEmit
```

---

### 5. Testar Manualmente (Recomendado)

#### 5.1. Testar Login com Senha

```bash
# Iniciar servidor
npm run dev

# Tentar login com senha errada (deve falhar)
# Acesse: http://localhost:3000/auth/signin
# Email: admin@example.com
# Senha: wrongpassword
# Esperado: Erro de autenticação

# Tentar login com senha correta (deve funcionar)
# Email: admin@example.com
# Senha: admin123
# Esperado: Login bem-sucedido
```

#### 5.2. Testar Middleware

```bash
# Tentar acessar API protegida sem autenticação (deve retornar 401)
curl http://localhost:3000/api/ledger/accounts
# Esperado: {"error":"Unauthorized"} ou redirect para login

# Acessar API pública (deve funcionar)
curl http://localhost:3000/api/auth/session
# Esperado: JSON com sessão ou null
```

---

### 6. Próximas Prioridades (P1 - Importante mas não bloqueador)

Após validar os P0s, você pode começar os itens P1:

#### 6.1. Implementar RBAC nas APIs (P1)
- Adicionar verificação de permissões antes de operações sensíveis
- Usar `requirePermission()` ou `hasPermission()` nas APIs
- Estimativa: 4-8h

#### 6.2. Encryption para authJson (P1)
- Implementar encryption at rest para credenciais de integrações
- Usar `crypto` ou biblioteca de vault
- Estimativa: 4-6h

#### 6.3. Configurar Workers em Cron (P1)
- Configurar PM2 ou systemd para workers de integração
- Fazer workers rodarem automaticamente
- Estimativa: 2-4h

#### 6.4. Testes Básicos (P2)
- Adicionar testes para módulos críticos
- Coverage target: 40%+
- Estimativa: 16-24h

---

## 📋 Checklist de Validação

Após fazer os commits e rodar migrations, valide:

- [ ] Migration aplicada com sucesso
- [ ] Prisma Client gerado
- [ ] Seed rodou sem erros
- [ ] Build passa sem erros
- [ ] Testes passam
- [ ] Login com senha funciona (correta passa, errada falha)
- [ ] API protegida retorna 401 sem auth
- [ ] API pública funciona (session, webhook)
- [ ] Webhook WhatsApp funciona (se configurado)

---

## 🚀 Quando Estiver Pronto para Produção

Após completar P0s e validar:

1. ✅ Todos os P0s corrigidos e testados
2. ⚠️ Configurar variáveis de ambiente de produção:
   - `WHATSAPP_APP_SECRET` (obrigatório)
   - `WHATSAPP_VERIFY_TOKEN`
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
3. ⚠️ Rodar migrations em produção
4. ⚠️ Criar usuário admin inicial (com hash de senha)
5. ⚠️ Configurar workers em cron
6. ⚠️ Configurar monitoramento (logs, métricas, alertas)

---

## 📚 Documentação Relacionada

- `docs/AUDITORIA_ATUAL.md` - Auditoria completa com status dos P0s
- `docs/P0_FIXES_SUMMARY.md` - Resumo das correções P0 com evidências
- `docs/COMMITS_RECOMENDADOS.md` - Lista completa de commits sugeridos

---

## ⚡ Quick Start (TL;DR)

```bash
# 1. Commits
git add -A
git commit -m "fix(auth): implement password verification with bcryptjs" --no-verify
# ... (fazer commits separados conforme acima)

# 2. Migration
npm run db:migrate

# 3. Seed
npm run db:seed

# 4. Build & Test
npm run build
npm test

# 5. Dev
npm run dev
```




