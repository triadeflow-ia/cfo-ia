import { NextResponse } from 'next/server'
import { requireAuth } from '@/shared/auth/context'
import { automationService } from '@/modules/automation'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth()
  if (!auth.ok) {
    return auth.response
  }

  await automationService.markAsRead(auth.context.orgId, params.id)
  return NextResponse.json({ success: true })
}
