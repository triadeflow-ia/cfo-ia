import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { requireAuth } from '@/shared/auth/context'
import { ledgerService } from '@/modules/ledger'

export default async function SpendByCategoryPage({
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
  const toDefault = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10)

  const from = searchParams.from || fromDefault
  const to = searchParams.to || toDefault

  const rows = await ledgerService.spendByCategory(auth.context.orgId, from, to)

  const total = rows.reduce((sum: number, r: any) => sum + r.amountCents, 0)

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-4 p-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold">Gastos por categoria</h1>
          <p className="text-muted-foreground">Saídas (OUT) agrupadas no período.</p>
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
          <Button type="submit">Atualizar</Button>
        </form>

        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="p-3 text-left">Categoria</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3 text-right">%</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any) => {
                const percentage = total > 0 ? ((r.amountCents / total) * 100).toFixed(1) : '0.0'
                return (
                  <tr key={r.categoryId ?? 'none'} className="border-t hover:bg-muted/20">
                    <td className="p-3 font-medium">{r.categoryName}</td>
                    <td className="p-3 text-right font-medium">
                      {(r.amountCents / 100).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>
                    <td className="p-3 text-right text-muted-foreground">{percentage}%</td>
                  </tr>
                )
              })}
              {rows.length === 0 && (
                <tr>
                  <td className="p-8 text-center text-muted-foreground" colSpan={3}>
                    Sem dados no período selecionado.
                  </td>
                </tr>
              )}
            </tbody>
            {rows.length > 0 && (
              <tfoot className="bg-muted/20 font-semibold">
                <tr>
                  <td className="p-3">Total</td>
                  <td className="p-3 text-right">
                    {(total / 100).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>
                  <td className="p-3 text-right">100.0%</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}

