/**
 * Script para tentar diferentes formatos de connection string
 */

const { PrismaClient } = require('@prisma/client')

const password = 'MDxzQgntotZZ5biC'
const projectRef = 'mlhuhewsitnmkejsyfnn'

// Formatos para testar
const formats = [
  // Formato direto (porta 5432)
  `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`,
  
  // Pooler - regiões comuns
  `postgresql://postgres.${projectRef}:${password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${projectRef}:${password}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${projectRef}:${password}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${projectRef}:${password}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`,
  
  // Formato alternativo de pooler
  `postgresql://postgres.${projectRef}:${password}@pooler.supabase.com:6543/postgres`,
]

async function testConnection(url) {
  process.env.DATABASE_URL = url
  const prisma = new PrismaClient()
  
  try {
    await prisma.$connect()
    console.log(`\n✅ ✅ ✅ SUCESSO! ✅ ✅ ✅`)
    console.log(`\nConnection string válida:`)
    console.log(url)
    console.log(`\n📝 Use esta string no seu arquivo .env\n`)
    await prisma.$disconnect()
    return true
  } catch (error) {
    // Não mostrar erro para não poluir
    return false
  } finally {
    await prisma.$disconnect().catch(() => {})
  }
}

async function main() {
  console.log('🔍 Testando formatos de connection string...')
  console.log(`Project Ref: ${projectRef}\n`)
  
  for (let i = 0; i < formats.length; i++) {
    process.stdout.write(`Testando formato ${i + 1}/${formats.length}... `)
    const success = await testConnection(formats[i])
    if (success) {
      process.exit(0)
    }
    console.log('❌')
  }
  
  console.log('\n❌ Nenhum formato funcionou automaticamente.')
  console.log('\n📋 Por favor, copie a connection string diretamente do dashboard:')
  console.log('   1. Acesse: https://supabase.com/dashboard/project/mlhuhewsitnmkejsyfnn/settings/database')
  console.log('   2. Settings → Database → Connection string')
  console.log('   3. Selecione "Connection pooling"')
  console.log('   4. Copie a string completa')
  console.log('   5. Cole no arquivo .env\n')
}

main()


