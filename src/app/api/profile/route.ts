import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { 
      providerProfile: {
        include: {
          services: { where: { isActive: true } }
        }
      } 
    }
  })
  return NextResponse.json(user)
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { profilePicture, bio, isOnline } = await req.json()

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(profilePicture ? { profilePicture } : {})
      }
    })

    if (session.user.role === 'PROVIDER') {
      const providerData: any = {}
      if (bio !== undefined) providerData.bio = bio
      if (isOnline !== undefined) providerData.isOnline = isOnline
      
      if (Object.keys(providerData).length > 0) {
        await prisma.providerProfile.update({
          where: { userId: session.user.id },
          data: providerData
        })
      }
    }

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
