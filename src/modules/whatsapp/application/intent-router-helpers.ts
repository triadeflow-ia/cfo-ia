/**
 * Helpers para intent router - Resolve referências (conta por nome, etc)
 */

import { prisma } from '@/shared/db'

/**
 * Resolve nome de conta para accountId
 */
export async function resolveAccountByName(orgId: string, accountName: string): Promise<string | null> {
  const account = await prisma.financialAccount.findFirst({
    where: {
      orgId,
      name: {
        contains: accountName,
        mode: 'insensitive',
      },
      isActive: true,
    },
  })

  return account?.id || null
}

/**
 * Resolve input completo de createTransaction (preenche accountId se necessário)
 */
export async function resolveCreateTransactionInput(orgId: string, input: any): Promise<any> {
  const resolved = { ...input }

  // Resolver accountId se accountName foi fornecido
  if (input.accountName && !input.accountId) {
    const accountId = await resolveAccountByName(orgId, input.accountName)
    if (accountId) {
      resolved.accountId = accountId
    } else {
      throw new Error(`Conta "${input.accountName}" não encontrada`)
    }
    delete resolved.accountName
  }

  // Se não tem accountId e não tem accountName, buscar primeira conta ativa
  if (!resolved.accountId) {
    const defaultAccount = await prisma.financialAccount.findFirst({
      where: {
        orgId,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    })
    if (defaultAccount) {
      resolved.accountId = defaultAccount.id
    } else {
      throw new Error('Nenhuma conta ativa encontrada')
    }
  }

  return resolved
}



