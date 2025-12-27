import { DashboardLayout } from '@/components/layout/dashboard-layout'
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
        <div>
          <h1 className="text-3xl font-bold">Recorrências</h1>
          <p className="text-muted-foreground">
            Despesas e receitas recorrentes
          </p>
        </div>

        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="p-3 text-left">Nome</th>
                <th className="p-3 text-left">Tipo</th>
                <th className="p-3 text-left">Valor</th>
                <th className="p-3 text-left">Próxima execução</th>
                <th className="p-3 text-left">Frequência</th>
              </tr>
            </thead>
            <tbody>
              {recurrences.map((rec) => (
                <tr key={rec.id} className="border-t">
                  <td className="p-3 font-medium">{rec.name}</td>
                  <td className="p-3">{rec.type}</td>
                  <td className="p-3">
                    {((rec.amountCents || 0) / 100).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>
                  <td className="p-3">
                    {rec.nextRunAt
                      ? new Date(rec.nextRunAt).toLocaleDateString('pt-BR')
                      : '-'}
                  </td>
                  <td className="p-3">{rec.frequency}</td>
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
