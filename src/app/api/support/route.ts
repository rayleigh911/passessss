import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const conversationId = new URL(request.url).searchParams.get('conversationId')
  const isAdmin = session.user.role === 'ADMIN'

  try {
    if (isAdmin && !conversationId) {
      // Admin sees list of all conversations
      const convs = await prisma.supportConversation.findMany({
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { sender: { select: { fullName: true, role: true } } }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json({ type: 'inbox', conversations: convs })
    }

    if (!isAdmin) {
      // Find the user's ONLY conversation or return empty so UI creates it on first POST
      const existingConv = await prisma.supportConversation.findFirst({
        where: { messages: { some: { senderId: session.user.id } } },
        include: {
          messages: {
            include: { sender: { select: { fullName: true, role: true } } },
            orderBy: { createdAt: 'asc' }
          }
        }
      })
      return NextResponse.json({ type: 'chat', messages: existingConv?.messages || [], conversationId: existingConv?.id })
    }

    // Admin views specific conversation
    const messages = await prisma.supportMessage.findMany({
      where: { conversationId: conversationId! },
      include: { sender: { select: { fullName: true, role: true } } },
      orderBy: { createdAt: 'asc' }
    })
    return NextResponse.json({ type: 'chat', messages, conversationId })

  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    let { content, conversationId } = await request.json()
    
    // Auto-create conversation if user is sending very first message
    if (!conversationId && session.user.role !== 'ADMIN') {
      const activeConv = await prisma.supportConversation.findFirst({
         where: { messages: { some: { senderId: session.user.id } } }
      })
      if (activeConv) {
         conversationId = activeConv.id
      } else {
         const newConv = await prisma.supportConversation.create({ data: {} })
         conversationId = newConv.id
      }
    }

    if (!conversationId) return NextResponse.json({error: 'Invalid'}, {status: 400})

    const message = await prisma.supportMessage.create({
      data: {
        content,
        senderId: session.user.id,
        conversationId
      }
    })

    return NextResponse.json({ ...message, conversationId })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
