import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { email, password, fullName, phone, role, businessName, city, category } = await req.json()

    if (!email || !password || !fullName || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        fullName,
        phone,
        passwordHash,
        role,
        ...(role === 'PROVIDER' ? {
          providerProfile: {
            create: {
              businessName,
              city,
              category
            }
          }
        } : {})
      }
    })

    return NextResponse.json({ message: 'User created' }, { status: 201 })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}
