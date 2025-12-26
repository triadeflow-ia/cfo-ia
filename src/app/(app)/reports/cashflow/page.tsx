import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { requireAuth } from '@/shared/auth/context'
import { reportsService } from '@/modules/reports'
import Link from 'next/link'

export default async function CashflowPage({
  searchParams,
}: {
  searchParams: Record<string, string>
}) {
  const auth = await requireAuth()
  if (!auth.ok) {
    return <div>Unauthorized</div>
  }

  const now = new Date()
  const fromDefault = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10)
  const toDefault = new Date(now.getFullYear(), now.getMonth() + 3, 0)
    .toISOString()
    .slice(0, 10)

  const from = searchParams.from || fromDefault
  const to = searchParams.to || toDefault
  const projection = Number(searchParams.projection || '90')

  const data = await reportsService.getCashflow(auth.context.orgId, {
    from,
    to,
    projection,
  })

  const queryString = new URLSearchParams({ from, to, projection: String(projection) }).toString()

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Fluxo de Caixa</h1>
            <p className="text-muted-foreground">
              Real e projetado (inclui recorrências futuras)
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={`/api/reports/cashflow/export/csv?${queryString}`} target="_blank">
              Exportar CSV
            </Link>
          </Button>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Saldo Atual</h3>
            <p
              className={`text-2xl font-bold ${
                data.currentBalanceCents >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {(data.currentBalanceCents / 100).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Mínimo Projetado</h3>
            <p
              className={`text-2xl font-bold ${
                data.minBalanceCents >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {(data.minBalanceCents / 100).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Máximo Projetado</h3>
            <p className="text-2xl font-bold text-green-600">
              {(data.maxBalanceCents / 100).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Dias no Período</h3>
            <p className="text-2xl font-bold">
              {data.days.length}
            </p>
          </div>
        </div>

        <form method="get" className="flex gap-3 items-end rounded-lg border p-4">
          <div className="flex-1">
            <label className="block text-xs text-muted-foreground mb-1">De</label>
            <input
              name="from"
              type="date"
              defaultValue={from}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-muted-foreground mb-1">Até</label>
            <input
              name="to"
              type="date"
              defaultValue={to}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Projeção (dias)</label>
            <input
              name="projection"
              type="number"
              defaultValue={projection}
              min="0"
              max="365"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <Button type="submit">Atualizar</Button>
        </form>

        {/* Tabela */}
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="p-3 text-left">Data</th>
                <th className="p-3 text-right">Entradas</th>
                <th className="p-3 text-right">Saídas</th>
                <th className="p-3 text-right">Saldo Acumulado</th>
              </tr>
            </thead>
            <tbody>
              {data.days.map((day, idx) => {
                const isToday = day.date.toDateString() === new Date().toDateString()
                const isFuture = day.date > new Date()
                return (
                  <tr
                    key={idx}
                    className={`border-t ${
                      isToday ? 'bg-blue-50' : isFuture ? 'bg-muted/10' : ''
                    }`}
                  >
                    <td className="p-3">
                      {day.date.toLocaleDateString('pt-BR')}
                      {isToday && (
                        <span className="ml-2 text-xs text-blue-600 font-medium">(Hoje)</span>
                      )}
                      {isFuture && (
                        <span className="ml-2 text-xs text-muted-foreground">(Projetado)</span>
                      )}
                    </td>
                    <td className="p-3 text-right text-green-600">
                      {(day.inCents / 100).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>
                    <td className="p-3 text-right text-red-600">
                      {(day.outCents / 100).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>
                    <td
                      className={`p-3 text-right font-medium ${
                        day.balanceCents >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {(day.balanceCents / 100).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>
                  </tr>
                )
              })}
              {data.days.length === 0 && (
                <tr>
                  <td className="p-8 text-center text-muted-foreground" colSpan={4}>
                    Sem dados no período selecionado.
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



