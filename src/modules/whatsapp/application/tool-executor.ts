/**
 * Tool Executor - Executa tools com validação, RBAC e audit
 */

import { tools } from '@/modules/whatsapp-tools'
import { extendedTools } from '@/modules/whatsapp-tools/tools-extended'
import { logger } from '@/shared/logger'
import { audit } from '@/shared/utils/audit'
import { prisma } from '@/shared/db'
import { logger } from '@/shared/logger'
import { audit } from '@/shared/utils/audit'

interface ExecuteToolOptions {
  orgId: string
  userId: string
  conversationId: string
  toolName: string
  toolInput: any
}

/**
 * Mapa de permissões por tool (simplificado - pode usar RBAC completo depois)
 */
const TOOL_PERMISSIONS: Record<string, string[]> = {
  // Read tools
  'growthOverview': ['VIEW_FINANCE', 'ADMIN'],
  'dreSummary': ['VIEW_FINANCE', 'ADMIN'],
  'spendByCategory': ['VIEW_FINANCE', 'ADMIN'],
  'cashflowSummary': ['VIEW_FINANCE', 'ADMIN'],
  'listNotifications': ['VIEW_FINANCE', 'ADMIN'],
  'listTransactions': ['VIEW_FINANCE', 'ADMIN'],

  // Write tools
  'createTransaction': ['EDIT_FINANCE', 'ADMIN'],
  'updateTransaction': ['EDIT_FINANCE', 'ADMIN'],
  'deleteTransaction': ['EDIT_FINANCE', 'ADMIN'],
  'createRule': ['EDIT_FINANCE', 'ADMIN'],
  'createRecurrence': ['EDIT_FINANCE', 'ADMIN'],
  'createGoal': ['EDIT_FINANCE', 'ADMIN'],
}

/**
 * Verifica permissão do usuário
 */
async function checkPermission(orgId: string, userId: string, toolName: string): Promise<boolean> {
  const requiredPerms = TOOL_PERMISSIONS[toolName] || ['ADMIN']
  
  // Buscar role do usuário na organização
  const orgUser = await prisma.organizationUser.findFirst({
    where: {
      organizationId: orgId,
      userId,
    },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  })

  if (!orgUser) return false

  // Se tem role ADMIN, permite tudo
  if (orgUser.role?.slug === 'admin') return true

  // Verificar permissões do role
  const userPerms = orgUser.role?.permissions.map(p => p.permission.slug) || []
  
  // Se tem alguma das permissões requeridas
  return requiredPerms.some(perm => userPerms.includes(perm))
}

/**
 * Executa tool com validação e RBAC
 */
export async function executeTool(options: ExecuteToolOptions): Promise<any> {
  const { orgId, userId, conversationId, toolName, toolInput } = options

  // Verificar permissão
  const hasPermission = await checkPermission(orgId, userId, toolName)
  if (!hasPermission) {
    throw new Error(`Sem permissão para executar: ${toolName}`)
  }

  // Buscar tool
  let tool: any = null
  let isExtended = false

  if (tools[toolName as keyof typeof tools]) {
    tool = tools[toolName as keyof typeof tools]
  } else if (extendedTools[toolName as keyof typeof extendedTools]) {
    tool = { run: extendedTools[toolName as keyof typeof extendedTools] }
    isExtended = true
  } else {
    throw new Error(`Tool não encontrada: ${toolName}`)
  }

  // Validar input com Zod (se o tool tiver schema)
  let validatedInput = toolInput
  if (tool.schema && typeof tool.schema.parse === 'function') {
    try {
      validatedInput = tool.schema.parse(toolInput)
    } catch (error: any) {
      throw new Error(`Input inválido: ${error.message}`)
    }
  }

  // Executar tool
  let result: any
  try {
    if (isExtended) {
      result = await tool.run(orgId, validatedInput)
    } else {
      result = await tool.run(orgId, validatedInput)
    }

    // Audit log
    await audit.log({
      orgId,
      userId,
      action: `WHATSAPP_TOOL_${toolName.toUpperCase()}`,
      entity: 'ToolExecution',
      entityId: conversationId,
      metadata: {
        toolName,
        input: validatedInput,
        success: true,
        source: 'whatsapp',
      },
    })

    logger.info('Tool executed', {
      toolName,
      userId,
      conversationId,
      success: true,
    })

    return result
  } catch (error: any) {
    // Audit log de erro
    await audit.log({
      orgId,
      userId,
      action: `WHATSAPP_TOOL_${toolName.toUpperCase()}_ERROR`,
      entity: 'ToolExecution',
      entityId: conversationId,
      metadata: {
        toolName,
        input: validatedInput,
        error: error.message,
        source: 'whatsapp',
      },
    })

    logger.error('Tool execution failed', {
      toolName,
      userId,
      conversationId,
      error: error.message,
    })

    throw error
  }
}

