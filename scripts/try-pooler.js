/**
 * Testa diferentes formatos de Session Pooler do Supabase
 */

const { PrismaClient } = require('@prisma/client')

const password = 'MDxzQgntotZZ5biC'
const projectRef = 'mlhuhewsitnmkejsyfnn'

// Formatos de Session Pooler para testar
const formats = [
  // Formato com região específica (mais comum)
  `postgresql://postgres.${projectRef}:${password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`,
  `postgresql://postgres.${projectRef}:${password}@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true`,
  `postgresql://postgres.${projectRef}:${password}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true`,
  `postgresql://postgres.${projectRef}:${password}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true`,
  `postgresql://postgres.${projectRef}:${password}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true`,
  `postgresql://postgres.${projectRef}:${password}@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true`,
  
  // Formato sem região específica
  `postgresql://postgres.${projectRef}:${password}@${projectRef}.pooler.supabase.com:6543/postgres?pgbouncer=true`,
  
  // Formato alternativo
  `postgresql://postgres.${projectRef}:${password}@pooler.supabase.com:6543/postgres?pgbouncer=true`,
]

async function testConnection(url) {
  process.env.DATABASE_URL = url
  const prisma = new PrismaClient()
  
  try {
    await prisma.$connect()
    console.log(`\n✅ ✅ ✅ SUCESSO! ✅ ✅ ✅\n`)
    console.log(`Connection string válida:`)
    console.log(url)
    console.log(`\n📝 Configurando no arquivo .env...\n`)
    
    // Salvar no .env
    const fs = require('fs')
    const envContent = `DATABASE_URL="${url}"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="cfo-ia-secret-key-2024"
NODE_ENV="development"
`
    fs.writeFileSync('.env', envContent)
    console.log('✅ Arquivo .env atualizado com sucesso!')
    console.log('\n🚀 Agora rode: npm run db:migrate\n')
    
    await prisma.$disconnect()
    return true
  } catch (error) {
    return false
  } finally {
    await prisma.$disconnect().catch(() => {})
  }
}

async function main() {
  console.log('🔍 Testando formatos de Session Pooler...')
  console.log(`Project Ref: ${projectRef}\n`)
  
  for (let i = 0; i < formats.length; i++) {
    const region = formats[i].match(/aws-0-([^.]+)/)?.[1] || 'generic'
    process.stdout.write(`Testando ${region}... `)
    const success = await testConnection(formats[i])
    if (success) {
      process.exit(0)
    }
    console.log('❌')
  }
  
  console.log('\n❌ Nenhum formato funcionou automaticamente.')
  console.log('\n📋 Por favor, copie a connection string do Session Pooler no dashboard:')
  console.log('   1. No dashboard, selecione "Session Pooler" no dropdown Method')
  console.log('   2. Copie a connection string completa que aparecer')
  console.log('   3. Cole aqui ou no arquivo .env\n')
}

main()


