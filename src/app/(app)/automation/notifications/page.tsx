import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { requireAuth } from '@/shared/auth/context'
import { automationService } from '@/modules/automation'

export default async function NotificationsPage() {
  const auth = await requireAuth()
  if (!auth.ok) {
    return <div>Unauthorized</div>
  }

  const notifications = await automationService.listNotifications(auth.context.orgId, false, 50)

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          <h1 className="text-3xl font-bold">Notificações</h1>
          <p className="text-muted-foreground">
            Alertas e notificações do sistema
          </p>
        </div>

        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="p-3 text-left">Tipo</th>
                <th className="p-3 text-left">Título</th>
                <th className="p-3 text-left">Mensagem</th>
                <th className="p-3 text-left">Data</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notif) => (
                <tr key={notif.id} className="border-t">
                  <td className="p-3">
                    <span className="rounded-full px-2 py-1 text-xs bg-muted">
                      {notif.type}
                    </span>
                  </td>
                  <td className="p-3 font-medium">{notif.title}</td>
                  <td className="p-3 text-muted-foreground">{notif.body}</td>
                  <td className="p-3">
                    {new Date(notif.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        notif.readAt
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {notif.readAt ? 'Lida' : 'Não lida'}
                    </span>
                  </td>
                </tr>
              ))}
              {notifications.length === 0 && (
                <tr>
                  <td className="p-8 text-center text-muted-foreground" colSpan={5}>
                    Nenhuma notificação encontrada.
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
