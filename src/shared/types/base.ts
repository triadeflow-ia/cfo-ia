/**
 * Base types and interfaces shared across the application
 */

export interface BaseEntity {
  id: string
  orgId: string
  createdAt: Date
  updatedAt: Date
  createdBy?: string
  updatedBy?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface AuditMetadata {
  source?: 'web' | 'whatsapp' | 'api' | 'import'
  ip?: string
  userAgent?: string
  [key: string]: unknown
}



