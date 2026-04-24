import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    if (session.user.role === 'ADMIN') {
      const allWithdrawals = await prisma.withdrawal.findMany({
        include: { provider: { include: { user: true } } },
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json(allWithdrawals)
    }

    if (session.user.role === 'PROVIDER') {
      const p = await prisma.providerProfile.findUnique({ where: { userId: session.user.id } })
      if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 })

      const providerWithdrawals = await prisma.withdrawal.findMany({
        where: { providerId: p.id },
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json(providerWithdrawals)
    }

    return NextResponse.json([], { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'PROVIDER') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { amount, bankDetails } = await req.json()
    if (!amount || amount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })

    const provider = await prisma.providerProfile.findUnique({ where: { userId: session.user.id } })
    if (!provider) return NextResponse.json({ error: 'Provider not found' }, { status: 404 })

    if (provider.balance < amount) {
      return NextResponse.json({ error: 'Insufficient funds on dashboard' }, { status: 400 })
    }

    const withdrawal = await prisma.$transaction(async (tx) => {
      const w = await tx.withdrawal.create({
        data: {
          providerId: provider.id,
          amount,
          bankDetails
        }
      })
      
      await tx.providerProfile.update({
        where: { id: provider.id },
        data: { balance: { decrement: amount } }
      })
      
      return w
    })

    return NextResponse.json({ success: true, withdrawal })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 })
  }
}
