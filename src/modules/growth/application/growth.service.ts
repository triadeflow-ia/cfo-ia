/**
 * Growth service - Business metrics and growth analytics
 */

import { growthRepo } from '../infra/growth.repo'

export const growthService = {
  async getOverview(orgId: string, filters: any) {
    return growthRepo.getOverview(orgId, filters)
  },
  async listContracts(orgId: string, filters: any) {
    return growthRepo.listContracts(orgId, filters)
  },
  async createContract(orgId: string, data: any) {
    return growthRepo.createContract(orgId, data)
  },
  async updateContract(orgId: string, id: string, data: any) {
    return growthRepo.updateContract(orgId, id, data)
  },
  async deleteContract(orgId: string, id: string) {
    return growthRepo.deleteContract(orgId, id)
  },
  async listGoals(orgId: string, filters: any) {
    return growthRepo.listGoals(orgId, filters)
  },
  async createGoal(orgId: string, data: any) {
    return growthRepo.createGoal(orgId, data)
  },
  async updateGoal(orgId: string, id: string, data: any) {
    return growthRepo.updateGoal(orgId, id, data)
  },
  async deleteGoal(orgId: string, id: string) {
    return growthRepo.deleteGoal(orgId, id)
  },
}
