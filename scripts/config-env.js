/**
 * Script para configurar .env com connection string do Supabase
 * Uso: node scripts/config-env.js "postgresql://..."
 */

const fs = require('fs')
const path = require('path')

const connectionString = process.argv[2]

if (!connectionString) {
  console.log('❌ Erro: Forneça a connection string como argumento')
  console.log('\nUso:')
  console.log('  node scripts/config-env.js "postgresql://postgres:...@..."')
  console.log('\nOu simplesmente cole a string diretamente no arquivo .env:')
  console.log('  DATABASE_URL="sua-connection-string-aqui"')
  process.exit(1)
}

const envPath = path.join(process.cwd(), '.env')
const envContent = `DATABASE_URL="${connectionString}"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="cfo-ia-secret-key-2024"
NODE_ENV="development"
`

fs.writeFileSync(envPath, envContent)

console.log('✅ Arquivo .env configurado com sucesso!')
console.log('\nAgora rode:')
console.log('  npm run db:migrate')


