/**
 * Script para testar connection string do Supabase
 */

const { PrismaClient } = require('@prisma/client')

const formats = [
  // Formato direto padrão
  'postgresql://postgres:MDxzQgntotZZ5biC@db.mlhuhewsitnmkejsyfnn.supabase.co:5432/postgres',
  // Formato com pooler
  'postgresql://postgres.mlhuhewsitnmkejsyfnn:MDxzQgntotZZ5biC@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
  'postgresql://postgres.mlhuhewsitnmkejsyfnn:MDxzQgntotZZ5biC@aws-0-us-west-1.pooler.supabase.com:6543/postgres',
]

async function testConnection(url) {
  process.env.DATABASE_URL = url
  const prisma = new PrismaClient()
  
  try {
    await prisma.$connect()
    console.log(`✅ SUCESSO! Connection string válida:`)
    console.log(url)
    await prisma.$disconnect()
    return true
  } catch (error) {
    console.log(`❌ Falhou: ${error.message.substring(0, 60)}...`)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

async function main() {
  console.log('🔍 Testando formatos de connection string...\n')
  
  for (const url of formats) {
    const success = await testConnection(url)
    if (success) {
      console.log('\n🎉 Use esta connection string no seu .env!')
      process.exit(0)
    }
  }
  
  console.log('\n❌ Nenhum formato funcionou.')
  console.log('📋 Por favor, pegue a connection string diretamente do dashboard do Supabase:')
  console.log('   Settings → Database → Connection string → URI')
}

main()




