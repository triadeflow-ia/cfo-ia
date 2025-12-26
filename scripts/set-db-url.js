/**
 * Script para configurar DATABASE_URL no arquivo .env
 * 
 * Uso: node scripts/set-db-url.js "sua-connection-string-aqui"
 */

const fs = require('fs')
const path = require('path')

const connectionString = process.argv[2]

if (!connectionString) {
  console.log('❌ Erro: Connection string não fornecida')
  console.log('\n📋 Uso:')
  console.log('   node scripts/set-db-url.js "postgresql://..."')
  console.log('\n💡 Ou cole a string diretamente no arquivo .env na linha DATABASE_URL=')
  process.exit(1)
}

const envPath = path.join(process.cwd(), '.env')
let envContent = ''

// Ler .env existente ou criar novo
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8')
  
  // Substituir DATABASE_URL existente ou adicionar
  if (envContent.includes('DATABASE_URL=')) {
    envContent = envContent.replace(/DATABASE_URL=.*/g, `DATABASE_URL="${connectionString}"`)
  } else {
    envContent = `DATABASE_URL="${connectionString}"\n${envContent}`
  }
} else {
  envContent = `DATABASE_URL="${connectionString}"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="cfo-ia-secret-key-2024"
NODE_ENV="development"
`
}

// Garantir que temos as outras variáveis essenciais
if (!envContent.includes('NEXTAUTH_URL=')) {
  envContent += 'NEXTAUTH_URL="http://localhost:3000"\n'
}
if (!envContent.includes('NEXTAUTH_SECRET=')) {
  envContent += 'NEXTAUTH_SECRET="cfo-ia-secret-key-2024"\n'
}
if (!envContent.includes('NODE_ENV=')) {
  envContent += 'NODE_ENV="development"\n'
}

fs.writeFileSync(envPath, envContent)

console.log('✅ Arquivo .env atualizado com sucesso!')
console.log('\n🚀 Agora rode: npm run db:migrate\n')


