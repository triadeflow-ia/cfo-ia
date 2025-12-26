import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { requireAuth } from '@/shared/auth/context'
import { automationService } from '@/modules/automation'

export default async function RecurrencesPage() {
  const auth = await requireAuth()
  if (!auth.ok) {
    return <div>Unauthorized</div>
  }

  const recurrences = await automationService.listRecurrences(auth.context.orgId)

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Recorrências</h1>
            <p className="text-muted-foreground">
              Despesas e receitas recorrentes.
            </p>
          </div>
          <Button asChild>
            <Link href="/automation/recurrences/new">Nova recorrência</Link>
          </Button>
        </div>

        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left">
                <th className="p-3">Nome</th>
                <th className="p-3">Frequência</th>
                <th className="p-3">Próxima execução</th>
                <th className="p-3">Valor</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recurrences.map((rec: any) => (
                <tr key={rec.id} className="border-t hover:bg-muted/20">
                  <td className="p-3 font-medium">{rec.name}</td>
                  <td className="p-3">
                    {rec.frequency === 'DAILY' && 'Diária'}
                    {rec.frequency === 'WEEKLY' && 'Semanal'}
                    {rec.frequency === 'MONTHLY' && 'Mensal'}
                  </td>
                  <td className="p-3">
                    {new Date(rec.nextRunAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-3 font-medium">
                    {(rec.amountCents / 100).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>
                  <td className="p-3">
                    {rec.isActive ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                        Ativa
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                        Inativa
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {recurrences.length === 0 && (
                <tr>
                  <td className="p-8 text-center text-muted-foreground" colSpan={5}>
                    Nenhuma recorrência cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}



