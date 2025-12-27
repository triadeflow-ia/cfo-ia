import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { requireAuth } from '@/shared/auth/context'
import { whatsappService } from '@/modules/whatsapp/application/whatsapp.service'
import { prisma } from '@/shared/db'
import Link from 'next/link'

export default async function WhatsappUsersPage() {
  const auth = await requireAuth()
  if (!auth.ok) {
    return <div>Unauthorized</div>
  }

  const links = await whatsappService.listLinks(auth.context.orgId)
  const users = await prisma.user.findMany({
    where: {
      organizationUsers: {
        some: {
          organizationId: auth.context.orgId,
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  })

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">WhatsApp - Usuários</h1>
            <p className="text-muted-foreground">
              Vincular números de telefone a usuários
            </p>
          </div>
        </div>

        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="p-3 text-left">Usuário</th>
                <th className="p-3 text-left">Telefone</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link: any) => (
                <tr key={link.id} className="border-t">
                  <td className="p-3 font-medium">
                    {link.user.name || link.user.email || 'Usuário sem nome'}
                  </td>
                  <td className="p-3">{link.phoneE164}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        link.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {link.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="p-3">
                    {new Date(link.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
              {links.length === 0 && (
                <tr>
                  <td className="p-8 text-center text-muted-foreground" colSpan={4}>
                    Nenhum vínculo cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border p-4 bg-muted/20">
          <h2 className="text-lg font-semibold mb-2">Como vincular</h2>
          <p className="text-sm text-muted-foreground">
            Use a API <code className="bg-muted px-1 rounded">POST /api/whatsapp/user-links</code> com:
          </p>
          <pre className="mt-2 p-3 bg-background rounded text-xs overflow-x-auto">
{`{
  "userId": "user_id_aqui",
  "phoneE164": "+5511999999999",
  "isActive": true
}`}
          </pre>
        </div>
      </div>
    </DashboardLayout>
  )
}




