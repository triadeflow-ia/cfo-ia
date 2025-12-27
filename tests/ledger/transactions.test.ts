import { describe, it, expect } from 'vitest'
import { CreateTransactionSchema, TransactionFiltersSchema } from '@/modules/ledger/domain/validators'

describe('Ledger Validators', () => {
  describe('CreateTransactionSchema', () => {
    it('validates a valid transaction', () => {
      const transaction = CreateTransactionSchema.parse({
        type: 'OUT',
        date: '2024-12-01',
        amountCents: 1000,
        description: 'Meta Ads',
        accountId: 'acc_1',
      })

      expect(transaction.amountCents).toBe(1000)
      expect(transaction.type).toBe('OUT')
      expect(transaction.description).toBe('Meta Ads')
    })

    it('rejects invalid type', () => {
      expect(() => {
        CreateTransactionSchema.parse({
          type: 'INVALID',
          date: '2024-12-01',
          amountCents: 1000,
          description: 'Test',
          accountId: 'acc_1',
        })
      }).toThrow()
    })

    it('rejects negative amount', () => {
      expect(() => {
        CreateTransactionSchema.parse({
          type: 'OUT',
          date: '2024-12-01',
          amountCents: -1000,
          description: 'Test',
          accountId: 'acc_1',
        })
      }).toThrow()
    })
  })

  describe('TransactionFiltersSchema', () => {
    it('validates valid filters', () => {
      const filters = TransactionFiltersSchema.parse({
        from: '2024-01-01',
        to: '2024-12-31',
        type: 'OUT',
        page: 1,
        pageSize: 25,
      })

      expect(filters.type).toBe('OUT')
      expect(filters.page).toBe(1)
      expect(filters.pageSize).toBe(25)
    })

    it('uses default values', () => {
      const filters = TransactionFiltersSchema.parse({})

      expect(filters.page).toBe(1)
      expect(filters.pageSize).toBe(25)
      expect(filters.sort).toBe('date_desc')
    })
  })
})





