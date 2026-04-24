import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()
const FEE_PERCENTAGE = 0.10

async function evaluateExpiredBookings() {
  const now = new Date()
  const expiredThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000) // strict 24 hours

  const expiredBookings = await prisma.booking.findMany({
    where: {
      status: { in: ['PAID', 'ACCEPTED'] },
      date: { lt: expiredThreshold }
    }
  })

  for (const booking of expiredBookings) {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.transaction.create({ 
          data: { bookingId: booking.id, type: 'REFUND', amount: booking.providerAmount } 
        })
        await tx.transaction.create({ 
          data: { bookingId: booking.id, type: 'PLATFORM_FEE', amount: booking.platformFee } 
        })
        await tx.booking.update({
          where: { id: booking.id },
          data: { status: 'REFUNDED' }
        })
      })
    } catch(e) {
      console.error('Failed processing timeout for ID:', booking.id)
    }
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Please log in first' }, { status: 401 })
  }

  try {
    const { providerId, serviceId, date } = await request.json()

    const service = await prisma.service.findUnique({ where: { id: serviceId } })
    if (!service || service.providerId !== providerId) {
      return NextResponse.json({ error: 'Invalid service' }, { status: 400 })
    }

    const provider = await prisma.providerProfile.findUnique({ where: { id: providerId } })
    if (!provider || provider.verificationStatus !== 'APPROVED') {
      return NextResponse.json({ error: 'This provider is still PENDING admin approval. Cannot book yet.' }, { status: 400 })
    }

    const totalAmount = service.price
    const platformFee = totalAmount * FEE_PERCENTAGE
    const providerAmount = totalAmount - platformFee

    const booking = await prisma.booking.create({
      data: {
        clientId: session.user.id,
        providerId,
        serviceId,
        date: new Date(date),
        status: 'PENDING',
        totalAmount,
        platformFee,
        providerAmount
      }
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Creation failed' }, { status: 500 })
  }
}

export async function GET() {
  await evaluateExpiredBookings() 

  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const isClient = session.user.role === 'CLIENT'
    const isProvider = session.user.role === 'PROVIDER'
    const isAdmin = session.user.role === 'ADMIN'

    const whereClause: any = {}
    if (isClient) whereClause.clientId = session.user.id
    if (isProvider) {
      const p = await prisma.providerProfile.findUnique({ where: { userId: session.user.id } })
      if (!p) return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
      whereClause.providerId = p.id
    }

    const bookings = await prisma.booking.findMany({
      where: isAdmin ? {} : whereClause,
      include: {
        client: { select: { fullName: true, email: true, phone: true } },
        service: true,
        provider: { include: { user: { select: { fullName: true } } } },
        review: true,
        dispute: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(bookings)
  } catch (error) {
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 })
  }
}
