import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'PROVIDER') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { imageUrl } = await req.json()
  try {
    const s = await prisma.service.update({
      where: { id },
      data: { imageUrl }
    })
    return NextResponse.json(s)
  } catch (e) {
    return NextResponse.json({error: 'Failed'}, {status:500})
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  try {
    const s = await prisma.service.update({
      where: { id },
      data: { isActive: false }
    })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({error: 'Failed to delete service'}, {status:500})
  }
}
