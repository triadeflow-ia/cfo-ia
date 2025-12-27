/**
 * Script para atualizar categorias existentes com dreGroup correto
 * 
 * Uso:
 * npx tsx scripts/seed-dre-group.ts [--dry-run]
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface Rule {
  keywords: string[]
  dreGroup: 'REVENUE' | 'COGS' | 'OPEX' | 'PAYROLL' | 'TAXES' | 'TOOLS' | 'OTHER'
}

const rules: Rule[] = [
  {
    keywords: ['receita', 'mensalidade', 'cliente', 'venda', 'faturamento', 'recorrente', 'assinatura'],
    dreGroup: 'REVENUE',
  },
  {
    keywords: ['meta', 'google', 'tráfego', 'ads', 'facebook', 'instagram', 'linkedin', 'mídia', 'anúncio', 'advertising'],
    dreGroup: 'COGS',
  },
  {
    keywords: ['salário', 'pró-labore', 'inss', 'encargos', 'folha', 'pagamento', 'colaborador', 'funcionário', 'rh'],
    dreGroup: 'PAYROLL',
  },
  {
    keywords: ['das', 'iss', 'imposto', 'irpf', 'irpj', 'csll', 'contribuição', 'tributo'],
    dreGroup: 'TAXES',
  },
  {
    keywords: ['notion', 'ghl', 'kommo', 'chatgpt', 'saas', 'software', 'ferramenta', 'assinatura', 'hubspot', 'zapier', 'slack', 'trello', 'asana'],
    dreGroup: 'TOOLS',
  },
  {
    keywords: ['contador', 'banco', 'internet', 'aluguel', 'telefone', 'energia', 'água', 'combustível', 'transporte', 'material', 'escritório'],
    dreGroup: 'OPEX',
  },
]

async function updateCategories(dryRun: boolean = false) {
  console.log(dryRun ? '🔍 DRY RUN - Nenhuma alteração será feita\n' : '🚀 Executando atualização...\n')

  const categories = await prisma.category.findMany({
    where: {
      dreGroup: 'OTHER', // Só atualizar categorias ainda não classificadas
    },
  })

  console.log(`📊 Encontradas ${categories.length} categorias com dreGroup=OTHER\n`)

  let updated = 0
  const updates: Array<{ id: string; name: string; oldGroup: string; newGroup: string }> = []

  for (const category of categories) {
    const nameLower = category.name.toLowerCase()
    
    // Encontrar regra que corresponde
    const matchingRule = rules.find(rule =>
      rule.keywords.some(keyword => nameLower.includes(keyword.toLowerCase()))
    )

    if (matchingRule) {
      updates.push({
        id: category.id,
        name: category.name,
        oldGroup: category.dreGroup,
        newGroup: matchingRule.dreGroup,
      })

      if (!dryRun) {
        await prisma.category.update({
          where: { id: category.id },
          data: { dreGroup: matchingRule.dreGroup },
        })
      }

      updated++
    }
  }

  if (updates.length > 0) {
    console.log('📝 Categorias que serão atualizadas:\n')
    updates.forEach(u => {
      console.log(`  - "${u.name}": ${u.oldGroup} → ${u.newGroup}`)
    })
    console.log(`\n✅ Total: ${updated} categorias`)
  } else {
    console.log('ℹ️  Nenhuma categoria correspondeu às regras.')
  }

  if (dryRun) {
    console.log('\n💡 Execute sem --dry-run para aplicar as mudanças.')
  } else {
    console.log('\n✅ Atualização concluída!')
  }
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')

  try {
    await updateCategories(dryRun)
  } catch (error) {
    console.error('❌ Erro:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()





