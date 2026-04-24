import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { status } = await req.json()
    const withdrawal = await prisma.withdrawal.findUnique({ where: { id } })
    
    if (!withdrawal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (withdrawal.status !== 'PENDING') return NextResponse.json({ error: 'Already processed' }, { status: 400 })

    await prisma.$transaction(async (tx) => {
      // Revert funds logic if Admin denies the Request
      if (status === 'REJECTED') {
        await tx.providerProfile.update({
          where: { id: withdrawal.providerId },
          data: { balance: { increment: withdrawal.amount } }
        })
      }
      
      await tx.withdrawal.update({
        where: { id: withdrawal.id },
        data: { status }
      })
    })

    return NextResponse.json({ success: true, status })
  } catch(error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
