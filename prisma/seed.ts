import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10)

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@1pass.us' },
    update: {},
    create: {
      email: 'admin@1pass.us',
      fullName: 'System Admin',
      passwordHash,
      role: 'ADMIN',
    },
  })

  // Create Client
  const client = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      fullName: 'Test Client',
      phone: '0612345678',
      passwordHash,
      role: 'CLIENT',
    },
  })

  // Create Provider
  const providerUser = await prisma.user.upsert({
    where: { email: 'provider@example.com' },
    update: {},
    create: {
      email: 'provider@example.com',
      fullName: 'Test Provider',
      phone: '0687654321',
      passwordHash,
      role: 'PROVIDER',
      providerProfile: {
        create: {
          businessName: 'Spa Relax',
          bio: 'Premium massage services',
          city: 'New York',
          category: 'Massage',
          verificationStatus: 'APPROVED',
          isOnline: true,
          rating: 4.8,
          services: {
            create: [
              {
                title: 'Swedish Massage',
                description: 'A relaxing traditional massage',
                price: 450,
                duration: 60,
              },
              {
                title: 'Deep Tissue',
                description: 'Intense muscle relaxation',
                price: 600,
                duration: 90,
              }
            ]
          }
        }
      }
    },
  })

  console.log('Seeding completed')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
