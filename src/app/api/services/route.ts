import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'PROVIDER') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const provider = await prisma.providerProfile.findUnique({ where: { userId: session.user.id } })
  if (!provider) return NextResponse.json({ error: 'Provider not found' }, { status: 404 })

  const { title, description, price, duration } = await req.json()
  
  try {
    const s = await prisma.service.create({
      data: {
        providerId: provider.id,
        title,
        description,
        price: parseFloat(price),
        duration: parseInt(duration, 10),
      }
    })
    return NextResponse.json(s)
  } catch (e) {
    return NextResponse.json({error: 'Failed to create service'}, {status: 500})
  }
}
