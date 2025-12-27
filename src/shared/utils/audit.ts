/**
 * Audit log utilities
 */

import { prisma } from '@/shared/db'
import { logger } from '../logger'
import type { AuditMetadata } from '../types/base'

interface CreateAuditLogParams {
  organizationId: string
  action: 'create' | 'update' | 'delete' | 'read'
  entityType: string
  entityId: string
  changes?: {
    old?: Record<string, unknown>
    new?: Record<string, unknown>
  }
  metadata?: AuditMetadata
  userId?: string
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(params: CreateAuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        organizationId: params.organizationId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        changes: params.changes ? (params.changes as any) : null,
        metadata: params.metadata ? (params.metadata as any) : null,
        createdByUserId: params.userId,
        updatedByUserId: params.userId,
      },
    })
  } catch (error) {
    // Don't fail the main operation if audit logging fails
    logger.error('Failed to create audit log', error as Error, {
      organizationId: params.organizationId,
      entityType: params.entityType,
      entityId: params.entityId,
    })
  }
}





