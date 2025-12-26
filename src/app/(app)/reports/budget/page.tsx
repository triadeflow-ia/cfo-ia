import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { requireAuth } from '@/shared/auth/context'
import { reportsService } from '@/modules/reports'
import Link from 'next/link'

export default async function BudgetPage({
  searchParams,
}: {
  searchParams: Record<string, string>
}) {
  const auth = await requireAuth()
  if (!auth.ok) {
    return <div>Unauthorized</div>
  }

  const now = new Date()
  const yearDefault = now.getFullYear()
  const monthDefault = now.getMonth() + 1

  const year = Number(searchParams.year || yearDefault)
  const month = Number(searchParams.month || monthDefault)

  const data = await reportsService.getBudgetVsActual(auth.context.orgId, { year, month })

  const queryString = new URLSearchParams({ year: String(year), month: String(month) }).toString()

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Orçado vs Realizado</h1>
            <p className="text-muted-foreground">
              Comparação entre orçamento e despesas realizadas
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={`/api/reports/budget-vs-actual/export/csv?${queryString}`} target="_blank">
              Exportar CSV
            </Link>
          </Button>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Orçado</h3>
            <p className="text-2xl font-bold">
              {(data.totalBudgetCents / 100).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Realizado</h3>
            <p className="text-2xl font-bold text-red-600">
              {(data.totalActualCents / 100).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Variação</h3>
            <p
              className={`text-2xl font-bold ${
                data.totalVarianceCents >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {(data.totalVarianceCents / 100).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-medium text-muted-foreground">% Variação</h3>
            <p
              className={`text-2xl font-bold ${
                data.totalBudgetCents > 0
                  ? ((data.totalVarianceCents / data.totalBudgetCents) * 100 >= 0
                      ? 'text-green-600'
                      : 'text-red-600')
                  : 'text-muted-foreground'
              }`}
            >
              {data.totalBudgetCents > 0
                ? `${((data.totalVarianceCents / data.totalBudgetCents) * 100).toFixed(1)}%`
                : '-'}
            </p>
          </div>
        </div>

        <form method="get" className="flex gap-3 items-end rounded-lg border p-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Ano</label>
            <input
              name="year"
              type="number"
              defaultValue={year}
              min="2000"
              max="2100"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Mês</label>
            <select
              name="month"
              defaultValue={month}
              className="w-full rounded-md border px-3 py-2 text-sm"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit">Atualizar</Button>
        </form>

        {/* Tabela */}
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="p-3 text-left">Categoria</th>
                <th className="p-3 text-left">Centro de Custo</th>
                <th className="p-3 text-right">Orçado</th>
                <th className="p-3 text-right">Realizado</th>
                <th className="p-3 text-right">Variação</th>
                <th className="p-3 text-right">Variação %</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item.id} className="border-t hover:bg-muted/20">
                  <td className="p-3 font-medium">{item.categoryName}</td>
                  <td className="p-3 text-muted-foreground">
                    {item.costCenterName || '—'}
                  </td>
                  <td className="p-3 text-right">
                    {(item.budgetCents / 100).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>
                  <td className="p-3 text-right">
                    {(item.actualCents / 100).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>
                  <td
                    className={`p-3 text-right font-medium ${
                      item.varianceCents >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {(item.varianceCents / 100).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>
                  <td
                    className={`p-3 text-right ${
                      item.variancePercent >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {item.variancePercent.toFixed(1)}%
                  </td>
                </tr>
              ))}
              {data.items.length === 0 && (
                <tr>
                  <td className="p-8 text-center text-muted-foreground" colSpan={6}>
                    Nenhum orçamento cadastrado para este período.
                  </td>
                </tr>
              )}
            </tbody>
            {data.items.length > 0 && (
              <tfoot className="bg-muted/20 font-semibold">
                <tr>
                  <td className="p-3" colSpan={2}>Total</td>
                  <td className="p-3 text-right">
                    {(data.totalBudgetCents / 100).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>
                  <td className="p-3 text-right">
                    {(data.totalActualCents / 100).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>
                  <td
                    className={`p-3 text-right ${
                      data.totalVarianceCents >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {(data.totalVarianceCents / 100).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>
                  <td
                    className={`p-3 text-right ${
                      data.totalBudgetCents > 0
                        ? ((data.totalVarianceCents / data.totalBudgetCents) * 100 >= 0
                            ? 'text-green-600'
                            : 'text-red-600')
                        : ''
                    }`}
                  >
                    {data.totalBudgetCents > 0
                      ? `${((data.totalVarianceCents / data.totalBudgetCents) * 100).toFixed(1)}%`
                      : '-'}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}



