const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN'
    }
  })

  console.log('✅ Admin user created:', admin.username)

  // Create sample students with users
  const studentsData = [
    {
      username: 'ahmad.rizki',
      fullName: 'Ahmad Rizki',
      email: 'ahmad.rizki@student.com',
      phoneNumber: '081234567890',
      address: 'Jl. Merdeka No. 123, Jakarta',
      schoolName: 'SMP Negeri 1 Jakarta',
      selectedMajor: 'TKJ',
      registrationStatus: 'PENDING'
    },
    {
      username: 'siti.nurhaliza',
      fullName: 'Siti Nurhaliza',
      email: 'siti.nurhaliza@student.com', 
      phoneNumber: '081234567891',
      address: 'Jl. Sudirman No. 456, Jakarta',
      schoolName: 'SMP Negeri 2 Jakarta',
      selectedMajor: 'RPL',
      registrationStatus: 'ACCEPTED'
    },
    {
      username: 'budi.santoso',
      fullName: 'Budi Santoso',
      email: 'budi.santoso@student.com',
      phoneNumber: '081234567892', 
      address: 'Jl. Thamrin No. 789, Jakarta',
      schoolName: 'SMP Negeri 3 Jakarta',
      selectedMajor: 'MM',
      registrationStatus: 'REJECTED'
    },
    {
      username: 'dewi.sartika',
      fullName: 'Dewi Sartika',
      email: 'dewi.sartika@student.com',
      phoneNumber: '081234567893',
      address: 'Jl. Gatot Subroto No. 321, Jakarta',
      schoolName: 'SMP Negeri 4 Jakarta', 
      selectedMajor: 'TKJ',
      registrationStatus: 'PENDING'
    },
    {
      username: 'eko.prasetyo',
      fullName: 'Eko Prasetyo',
      email: 'eko.prasetyo@student.com',
      phoneNumber: '081234567894',
      address: 'Jl. Kuningan No. 654, Jakarta',
      schoolName: 'SMP Negeri 5 Jakarta',
      selectedMajor: 'RPL', 
      registrationStatus: 'ACCEPTED'
    }
  ]

  for (const data of studentsData) {
    // Create user first
    const userPassword = await bcrypt.hash('student123', 12)
    const user = await prisma.user.upsert({
      where: { username: data.username },
      update: {},
      create: {
        username: data.username,
        password: userPassword,
        role: 'STUDENT'
      }
    })

    // Create student with required fields
    const student = await prisma.student.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        fullName: data.fullName,
        birthPlace: 'Jakarta',
        birthDate: new Date('2005-01-01'),
        gender: 'L',
        religion: 'Islam',
        address: data.address,
        district: 'Jakarta Pusat',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '10110',
        phoneNumber: data.phoneNumber,
        email: data.email,
        fatherName: 'Bapak ' + data.fullName.split(' ')[0],
        motherName: 'Ibu ' + data.fullName.split(' ')[0],
        schoolName: data.schoolName,
        graduationYear: 2023,
        selectedMajor: data.selectedMajor,
        registrationStatus: data.registrationStatus
      }
    })
    console.log(`✅ Student created: ${student.fullName} (${student.selectedMajor})`)
  }

  console.log('🎉 Database seeded successfully!')
  console.log('📊 Summary:')
  
  const userCount = await prisma.user.count()
  const studentCount = await prisma.student.count()
  
  console.log(`   - Users: ${userCount}`)
  console.log(`   - Students: ${studentCount}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })