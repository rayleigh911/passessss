import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")

  if (!email) {
    return NextResponse.json({ error: "Please provide an email parameter, e.g., ?email=your@email.com" }, { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found. Please sign up first." }, { status: 404 })
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" }
    })

    return NextResponse.json({ message: `Success! ${email} is now an ADMIN. You can log in using this email.` })
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
