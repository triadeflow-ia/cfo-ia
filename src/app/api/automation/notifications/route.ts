import { NextResponse } from 'next/server'
import { requireAuth } from '@/shared/auth/context'
import { automationService } from '@/modules/automation'

export async function GET() {
  const auth = await requireAuth()
  if (!auth.ok) {
    return auth.response
  }

  const notifications = await automationService.listNotifications(auth.context.orgId, false, 50)
  return NextResponse.json(notifications)
}
