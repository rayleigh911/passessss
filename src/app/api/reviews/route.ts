import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'CLIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { bookingId, rating, comment } = await req.json()
    if (!bookingId || !rating || rating < 1 || rating > 5) {
       return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    const booking = await prisma.booking.findUnique({
       where: { id: bookingId },
       include: { dispute: true, review: true }
    })

    if (!booking || booking.clientId !== session.user.id) {
       return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    
    if (booking.status !== 'COMPLETED') {
       return NextResponse.json({ error: 'Booking must be fully completed to leave a review.' }, { status: 400 })
    }

    if (booking.dispute && booking.dispute.status === 'OPEN') {
       return NextResponse.json({ error: 'Cannot leave a review while a dispute is actively open.' }, { status: 400 })
    }

    if (booking.review) {
       return NextResponse.json({ error: 'Review already exists for this booking.' }, { status: 400 })
    }

    // Execute Immutable Review Write
    await prisma.$transaction(async (tx) => {
       await tx.review.create({
          data: {
             bookingId,
             rating,
             comment
          }
       })

       // Recalculate Average
       const stats = await tx.review.aggregate({
         where: { booking: { providerId: booking.providerId } },
         _avg: { rating: true }
       })

       if (stats._avg.rating) {
         // Round to 1 decimal point
         const floatRating = Math.round(stats._avg.rating * 10) / 10
         await tx.providerProfile.update({
            where: { id: booking.providerId },
            data: { rating: floatRating }
         })
       }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
