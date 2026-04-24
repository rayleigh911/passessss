import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

const generatePin = () => Math.floor(100000 + Math.random() * 900000).toString()

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { status, reason, pin } = await request.json()
    const validStatuses = ['PAID', 'ACCEPTED', 'SCHEDULED', 'COMPLETED', 'DISPUTED', 'CANCELLED', 'REFUNDED', 'REJECTED']
    if (!validStatuses.includes(status)) return NextResponse.json({ error: 'Invalid state transition' }, { status: 400 })

    const booking = await prisma.booking.findUnique({ where: { id }, include: { provider: true } })
    if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const isClient = booking.clientId === session.user.id
    const isProvider = booking.provider.userId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    if (!isClient && !isProvider && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    let newCompletionPin = undefined

    await prisma.$transaction(async (tx) => {
      // 1. PAYMENT logic
      if (status === 'PAID' && isClient && booking.status === 'PENDING') {
        await tx.transaction.create({ data: { bookingId: id, type: 'PAYMENT', amount: booking.totalAmount } })
        
        newCompletionPin = generatePin()
        await tx.booking.update({ where: { id }, data: { completionPin: newCompletionPin } })
      }

      // 2. COMPLETION logic requiring PIN
      if (status === 'COMPLETED' && booking.status !== 'COMPLETED') {
        if (!isProvider) throw new Error('Only providers can submit the completion request.')
        if (!booking.completionPin || booking.completionPin !== pin) {
          throw new Error('Invalid PIN. Please ask the client for the 6-digit confirmation PIN.')
        }

        await tx.transaction.create({ data: { bookingId: id, type: 'PAYOUT', amount: booking.providerAmount } })
        await tx.providerProfile.update({
          where: { id: booking.providerId },
          data: { balance: { increment: booking.providerAmount } }
        })
      }

      // 3. DISPUTE / REFUND logic
      if (status === 'DISPUTED' && isClient) {
        await tx.dispute.create({ data: { bookingId: id, reason: reason || 'Client disputed' } })
      }
      if (status === 'REFUNDED' && isAdmin && booking.status !== 'REFUNDED') {
        await tx.transaction.create({ data: { bookingId: id, type: 'REFUND', amount: booking.totalAmount } })
      }

      await tx.booking.update({ where: { id }, data: { status } })
    })

    return NextResponse.json({ success: true, status, completionPin: newCompletionPin })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Update failed' }, { status: 500 })
  }
}
