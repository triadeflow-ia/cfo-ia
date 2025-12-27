import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { requireAuth } from '@/shared/auth/context'
import { whatsappService } from '@/modules/whatsapp/application/whatsapp.service'
import Link from 'next/link'

export default async function WhatsappConversationsPage({
  searchParams,
}: {
  searchParams: Record<string, string>
}) {
  const auth = await requireAuth()
  if (!auth.ok) {
    return <div>Unauthorized</div>
  }

  const conversations = await whatsappService.listConversations(auth.context.orgId, searchParams)

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          <h1 className="text-3xl font-bold">WhatsApp - Conversas</h1>
          <p className="text-muted-foreground">
            Histórico de conversas do WhatsApp
          </p>
        </div>

        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="p-3 text-left">Usuário</th>
                <th className="p-3 text-left">Última mensagem</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Última atualização</th>
                <th className="p-3 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {conversations.map((conv: any) => {
                const lastMessage = conv.messages[0]
                return (
                  <tr key={conv.id} className="border-t">
                    <td className="p-3 font-medium">
                      {conv.user.name || conv.user.email || 'Usuário sem nome'}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {lastMessage?.text
                        ? lastMessage.text.substring(0, 50) + (lastMessage.text.length > 50 ? '...' : '')
                        : '—'}
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          conv.status === 'OPEN'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {conv.status === 'OPEN' ? 'Aberta' : 'Fechada'}
                      </span>
                    </td>
                    <td className="p-3">
                      {new Date(conv.lastMessageAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="p-3">
                      <Link
                        href={`/whatsapp/conversations/${conv.id}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Ver detalhes
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {conversations.length === 0 && (
                <tr>
                  <td className="p-8 text-center text-muted-foreground" colSpan={5}>
                    Nenhuma conversa encontrada.
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




