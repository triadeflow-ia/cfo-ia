import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { requireAuth } from '@/shared/auth/context'
import { automationService } from '@/modules/automation'

export default async function RulesPage() {
  const auth = await requireAuth()
  if (!auth.ok) {
    return <div>Unauthorized</div>
  }

  const rules = await automationService.listRules(auth.context.orgId)

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Regras de Categorização</h1>
            <p className="text-muted-foreground">
              Regras automáticas para categorizar transações.
            </p>
          </div>
          <Button asChild>
            <Link href="/automation/rules/new">Nova regra</Link>
          </Button>
        </div>

        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left">
                <th className="p-3">Nome</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Padrão</th>
                <th className="p-3">Prioridade</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule: any) => (
                <tr key={rule.id} className="border-t hover:bg-muted/20">
                  <td className="p-3 font-medium">{rule.name}</td>
                  <td className="p-3">{rule.matchType}</td>
                  <td className="p-3">
                    <code className="text-xs bg-muted px-2 py-1 rounded">{rule.pattern}</code>
                  </td>
                  <td className="p-3">{rule.priority}</td>
                  <td className="p-3">
                    {rule.isActive ? (
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
              {rules.length === 0 && (
                <tr>
                  <td className="p-8 text-center text-muted-foreground" colSpan={5}>
                    Nenhuma regra cadastrada.
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



