import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { requireAuth } from '@/shared/auth/context'

export default async function BankReconcilePage() {
  const auth = await requireAuth()
  if (!auth.ok) {
    return <div>Unauthorized</div>
  }

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          <h1 className="text-3xl font-bold">Reconciliação Bancária</h1>
          <p className="text-muted-foreground">
            Conciliar transações bancárias com lançamentos
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
