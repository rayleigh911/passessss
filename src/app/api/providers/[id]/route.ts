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
    const { verificationStatus } = await req.json()
    
    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(verificationStatus)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const provider = await prisma.providerProfile.update({
      where: { id },
      data: { verificationStatus }
    })

    return NextResponse.json({ success: true, provider })
  } catch(error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
