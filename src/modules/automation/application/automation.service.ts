/**
 * Automation service - Main service layer
 */

import { automationRepo } from '../infra/automation.repo'
import {
  CreateCategorizationRuleSchema,
  CreateRecurrenceSchema,
} from '../domain/schemas'
import { categorizationService } from './categorization.service'
import { recurrenceService } from './recurrence.service'
import { alertsService } from './alerts.service'

export const automationService = {
  // ---------- Rules ----------
  async listRules(orgId: string, includeInactive = false) {
    return automationRepo.listRules(orgId, includeInactive)
  },

  async createRule(orgId: string, input: unknown) {
    const data = CreateCategorizationRuleSchema.parse(input)
    return automationRepo.createRule(orgId, {
      ...data,
      isActive: data.isActive ?? true,
      priority: data.priority ?? 100,
    })
  },

  async updateRule(orgId: string, id: string, input: unknown) {
    const data = CreateCategorizationRuleSchema.partial().parse(input)
    return automationRepo.updateRule(orgId, id, data)
  },

  async deleteRule(orgId: string, id: string) {
    return automationRepo.deleteRule(orgId, id)
  },

  // ---------- Recurrences ----------
  async listRecurrences(orgId: string, includeInactive = false) {
    return automationRepo.listRecurrences(orgId, includeInactive)
  },

  async createRecurrence(orgId: string, input: unknown) {
    const data = CreateRecurrenceSchema.parse(input)
    return automationRepo.createRecurrence(orgId, {
      ...data,
      isActive: data.isActive ?? true,
    })
  },

  async updateRecurrence(orgId: string, id: string, input: unknown) {
    const data = CreateRecurrenceSchema.partial().parse(input)
    return automationRepo.updateRecurrence(orgId, id, data)
  },

  async deleteRecurrence(orgId: string, id: string) {
    return automationRepo.deleteRecurrence(orgId, id)
  },

  // ---------- Notifications ----------
  async listNotifications(orgId: string, unreadOnly = false, limit = 50) {
    return automationRepo.listNotifications(orgId, unreadOnly, limit)
  },

  async markAsRead(orgId: string, id: string) {
    return automationRepo.markAsRead(orgId, id)
  },

  async markAllAsRead(orgId: string) {
    return automationRepo.markAllAsRead(orgId)
  },

  // ---------- Jobs ----------
  async runRecurrences(orgId: string) {
    return recurrenceService.runDue(orgId)
  },

  async runAlerts(orgId: string) {
    return alertsService.runDaily(orgId)
  },

  async batchCategorize(orgId: string, limit = 500) {
    return categorizationService.batchAutoCategorizeMissing(orgId, limit)
  },
}





