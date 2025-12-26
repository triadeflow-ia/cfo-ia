/**
 * Auth context helper for API routes
 * Gets user session and organization ID
 */

import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from './config'
import { prisma } from '@/shared/db'

export interface AuthContext {
  userId: string
  orgId: string
  email: string
}

/**
 * Require authentication and return user context with orgId
 * For MVP, gets the first organization the user belongs to
 */
export async function requireAuth(): Promise<
  | { ok: true; context: AuthContext }
  | { ok: false; response: NextResponse }
> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  // Get user's first organization (MVP - can be enhanced later)
  const orgUser = await prisma.organizationUser.findFirst({
    where: { userId: session.user.id },
    include: { organization: true },
  })

  if (!orgUser) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'User not associated with any organization' },
        { status: 403 }
      ),
    }
  }

  return {
    ok: true,
    context: {
      userId: session.user.id,
      orgId: orgUser.organizationId,
      email: session.user.email || '',
    },
  }
}



