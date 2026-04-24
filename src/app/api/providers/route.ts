export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get('city')
  const category = searchParams.get('category')

  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.role === 'ADMIN'

  try {
    const providers = await prisma.providerProfile.findMany({
      where: {
        ...(isAdmin ? {} : {
          verificationStatus: 'APPROVED',
          isOnline: true,
        }),
        ...(city ? { city } : {}),
        ...(category ? { category } : {}),
        ...(isAdmin ? {} : {
          services: { some: { isActive: true } },
          user: { isBanned: false }
        })
      },
      include: {
        user: {
          select: { fullName: true, email: true, profilePicture: true }
        },
        services: { where: { isActive: true } },
        bookings: {
          include: { review: true, client: { select: { fullName: true } } },
          where: { review: { isNot: null } }
        }
      }
    })

    return NextResponse.json(providers)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
