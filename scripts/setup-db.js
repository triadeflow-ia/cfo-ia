/**
 * Script de Setup do Banco de Dados
 * Ajuda a configurar o .env e rodar migrations
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🚀 Setup do Banco de Dados\n')

// Verificar se .env existe
const envPath = path.join(process.cwd(), '.env')
const envExamplePath = path.join(process.cwd(), '.env.example')

if (!fs.existsSync(envPath)) {
  console.log('📝 Criando arquivo .env...')
  
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath)
    console.log('✅ Arquivo .env criado a partir de .env.example')
  } else {
    // Criar .env básico
    const envContent = `# Database
# Configure sua DATABASE_URL aqui
# Exemplo Supabase: postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
DATABASE_URL=""

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}"

# Redis (opcional)
REDIS_URL="redis://localhost:6379"

# App
NODE_ENV="development"
`
    fs.writeFileSync(envPath, envContent)
    console.log('✅ Arquivo .env criado com valores padrão')
  }
  
  console.log('\n⚠️  IMPORTANTE: Edite o arquivo .env e configure DATABASE_URL!')
  console.log('   Veja SETUP-BANCO.md para opções de banco.\n')
} else {
  console.log('✅ Arquivo .env já existe')
}

// Verificar se DATABASE_URL está configurado
const envContent = fs.readFileSync(envPath, 'utf-8')
const hasDatabaseUrl = envContent.includes('DATABASE_URL=') && 
                       !envContent.match(/DATABASE_URL=""/) &&
                       !envContent.match(/DATABASE_URL=$/)

if (!hasDatabaseUrl) {
  console.log('\n❌ DATABASE_URL não está configurado no .env')
  console.log('   Configure antes de continuar!')
  console.log('   Veja: SETUP-BANCO.md ou LEIA-ME-PRIMEIRO.md\n')
  process.exit(1)
}

console.log('\n📦 Gerando Prisma Client...')
try {
  execSync('npx prisma generate', { stdio: 'inherit' })
  console.log('✅ Prisma Client gerado\n')
} catch (error) {
  console.error('❌ Erro ao gerar Prisma Client')
  process.exit(1)
}

console.log('🗄️  Rodando migrations...')
try {
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit' })
  console.log('\n✅ Migrations aplicadas com sucesso!')
  console.log('\n🎉 Setup completo! Agora você pode rodar: npm run dev\n')
} catch (error) {
  console.error('\n❌ Erro ao rodar migrations')
  console.error('   Verifique se o banco está acessível e DATABASE_URL está correto\n')
  process.exit(1)
}


