import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Hash password untuk semua user
  const hashedPassword = await bcrypt.hash('password123', 10)
  const hashedAdminPassword = await bcrypt.hash('admin123', 10)

  // 1. Buat User Admin
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedAdminPassword,
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin user created:', adminUser.username)

  // 2. Buat User Siswa dan Data Siswa
  const studentsData = [
    {
      username: 'siswa001',
      fullName: 'Ahmad Rizki Pratama',
      nickname: 'Rizki',
      birthPlace: 'Jakarta',
      birthDate: new Date('2007-03-15'),
      gender: 'MALE',
      religion: 'Islam',
      nationality: 'Indonesia',
      address: 'Jl. Merdeka No. 123',
      rt: '001',
      rw: '002',
      village: 'Kemayoran',
      district: 'Kemayoran',
      city: 'Jakarta Pusat',
      province: 'DKI Jakarta',
      postalCode: '10630',
      phone: '081234567890',
      email: 'ahmad.rizki@email.com',
      fatherName: 'Budi Pratama',
      fatherJob: 'Pegawai Swasta',
      fatherPhone: '081234567891',
      motherName: 'Siti Aminah',
      motherJob: 'Ibu Rumah Tangga',
      motherPhone: '081234567892',
      previousSchool: 'SMP Negeri 1 Jakarta',
      nisn: '1234567890',
      graduationYear: 2024,
      firstMajor: 'Teknik Komputer dan Jaringan',
      secondMajor: 'Multimedia',
      thirdMajor: 'Rekayasa Perangkat Lunak',
      hasIjazah: true,
      hasSKHUN: true,
      hasKK: true,
      hasAktaLahir: true,
      hasFoto: true,
      hasRaport: true,
      hasSertifikat: false,
      registrationStatus: 'APPROVED',
      ranking: {
        indonesianScore: 85.5,
        englishScore: 78.0,
        mathScore: 92.0,
        scienceScore: 88.5,
        certificateScore: 5.0,
        achievementScore: 10.0,
        totalScore: 359.0,
        rank: 1
      }
    },
    {
      username: 'siswa002',
      fullName: 'Sari Dewi Lestari',
      nickname: 'Sari',
      birthPlace: 'Bandung',
      birthDate: new Date('2007-07-22'),
      gender: 'FEMALE',
      religion: 'Islam',
      nationality: 'Indonesia',
      address: 'Jl. Sudirman No. 456',
      rt: '003',
      rw: '004',
      village: 'Cicendo',
      district: 'Cicendo',
      city: 'Bandung',
      province: 'Jawa Barat',
      postalCode: '40172',
      phone: '081234567893',
      email: 'sari.dewi@email.com',
      fatherName: 'Joko Lestari',
      fatherJob: 'Guru',
      fatherPhone: '081234567894',
      motherName: 'Rina Sari',
      motherJob: 'Perawat',
      motherPhone: '081234567895',
      previousSchool: 'SMP Negeri 2 Bandung',
      nisn: '1234567891',
      graduationYear: 2024,
      firstMajor: 'Multimedia',
      secondMajor: 'Teknik Komputer dan Jaringan',
      thirdMajor: 'Desain Komunikasi Visual',
      hasIjazah: true,
      hasSKHUN: true,
      hasKK: true,
      hasAktaLahir: true,
      hasFoto: true,
      hasRaport: true,
      hasSertifikat: true,
      registrationStatus: 'APPROVED',
      ranking: {
        indonesianScore: 90.0,
        englishScore: 85.5,
        mathScore: 80.0,
        scienceScore: 87.0,
        certificateScore: 8.0,
        achievementScore: 7.0,
        totalScore: 357.5,
        rank: 2
      }
    },
    {
      username: 'siswa003',
      fullName: 'Budi Santoso',
      nickname: 'Budi',
      birthPlace: 'Surabaya',
      birthDate: new Date('2007-11-10'),
      gender: 'MALE',
      religion: 'Kristen',
      nationality: 'Indonesia',
      address: 'Jl. Pahlawan No. 789',
      rt: '005',
      rw: '006',
      village: 'Gubeng',
      district: 'Gubeng',
      city: 'Surabaya',
      province: 'Jawa Timur',
      postalCode: '60281',
      phone: '081234567896',
      email: 'budi.santoso@email.com',
      fatherName: 'Agus Santoso',
      fatherJob: 'Wiraswasta',
      fatherPhone: '081234567897',
      motherName: 'Maria Santoso',
      motherJob: 'Pegawai Bank',
      motherPhone: '081234567898',
      previousSchool: 'SMP Kristen Petra',
      nisn: '1234567892',
      graduationYear: 2024,
      firstMajor: 'Rekayasa Perangkat Lunak',
      secondMajor: 'Teknik Komputer dan Jaringan',
      thirdMajor: 'Multimedia',
      hasIjazah: true,
      hasSKHUN: true,
      hasKK: true,
      hasAktaLahir: true,
      hasFoto: true,
      hasRaport: false,
      hasSertifikat: true,
      registrationStatus: 'PENDING',
      ranking: {
        indonesianScore: 82.0,
        englishScore: 88.0,
        mathScore: 95.0,
        scienceScore: 85.0,
        certificateScore: 6.0,
        achievementScore: 8.0,
        totalScore: 364.0,
        rank: null // Belum di-rank karena masih pending
      }
    },
    {
      username: 'siswa004',
      fullName: 'Indira Putri Maharani',
      nickname: 'Indira',
      birthPlace: 'Yogyakarta',
      birthDate: new Date('2007-05-18'),
      gender: 'FEMALE',
      religion: 'Hindu',
      nationality: 'Indonesia',
      address: 'Jl. Malioboro No. 321',
      rt: '007',
      rw: '008',
      village: 'Sosromenduran',
      district: 'Gedongtengen',
      city: 'Yogyakarta',
      province: 'DI Yogyakarta',
      postalCode: '55271',
      phone: '081234567899',
      email: 'indira.putri@email.com',
      fatherName: 'Made Maharani',
      fatherJob: 'Dosen',
      fatherPhone: '081234567800',
      motherName: 'Kadek Sari',
      motherJob: 'Dokter',
      motherPhone: '081234567801',
      previousSchool: 'SMP Negeri 1 Yogyakarta',
      nisn: '1234567893',
      graduationYear: 2024,
      firstMajor: 'Desain Komunikasi Visual',
      secondMajor: 'Multimedia',
      thirdMajor: 'Teknik Komputer dan Jaringan',
      hasIjazah: true,
      hasSKHUN: true,
      hasKK: true,
      hasAktaLahir: true,
      hasFoto: true,
      hasRaport: true,
      hasSertifikat: true,
      registrationStatus: 'COMPLETED',
      ranking: {
        indonesianScore: 88.0,
        englishScore: 82.5,
        mathScore: 79.0,
        scienceScore: 91.0,
        certificateScore: 9.0,
        achievementScore: 12.0,
        totalScore: 361.5,
        rank: 3
      }
    },
    {
      username: 'siswa005',
      fullName: 'Reza Firmansyah',
      nickname: 'Reza',
      birthPlace: 'Medan',
      birthDate: new Date('2007-09-03'),
      gender: 'MALE',
      religion: 'Islam',
      nationality: 'Indonesia',
      address: 'Jl. Gatot Subroto No. 654',
      rt: '009',
      rw: '010',
      village: 'Medan Baru',
      district: 'Medan Baru',
      city: 'Medan',
      province: 'Sumatera Utara',
      postalCode: '20154',
      phone: '081234567802',
      email: 'reza.firmansyah@email.com',
      fatherName: 'Hasan Firmansyah',
      fatherJob: 'Pengusaha',
      fatherPhone: '081234567803',
      motherName: 'Fatimah Zahra',
      motherJob: 'Guru',
      motherPhone: '081234567804',
      previousSchool: 'SMP Swasta Al-Azhar',
      nisn: '1234567894',
      graduationYear: 2024,
      firstMajor: 'Teknik Komputer dan Jaringan',
      secondMajor: 'Rekayasa Perangkat Lunak',
      thirdMajor: 'Multimedia',
      hasIjazah: false,
      hasSKHUN: true,
      hasKK: true,
      hasAktaLahir: true,
      hasFoto: true,
      hasRaport: true,
      hasSertifikat: false,
      registrationStatus: 'REJECTED',
      ranking: {
        indonesianScore: 75.0,
        englishScore: 70.0,
        mathScore: 85.0,
        scienceScore: 80.0,
        certificateScore: 0.0,
        achievementScore: 3.0,
        totalScore: 313.0,
        rank: null // Tidak di-rank karena ditolak
      }
    }
  ]

  // Buat user dan siswa untuk setiap data
  for (const studentData of studentsData) {
    const { username, ranking, ...studentInfo } = studentData
    
    // Buat user
    const user = await prisma.user.upsert({
      where: { username },
      update: {},
      create: {
        username,
        password: hashedPassword,
        role: 'STUDENT',
      },
    })

    // Buat data siswa
    const student = await prisma.student.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        ...studentInfo,
        gender: studentInfo.gender as 'MALE' | 'FEMALE', // Cast gender to literal union type
        registrationStatus: studentInfo.registrationStatus as 'PENDING' | 'APPROVED' | 'COMPLETED' | 'REJECTED', // Cast registrationStatus to literal union type
      },
    })

    // Buat data ranking
    await prisma.ranking.upsert({
      where: { studentId: student.id },
      update: {},
      create: {
        studentId: student.id,
        ...ranking,
      },
    })

    console.log(`✅ Student created: ${studentInfo.fullName} (${username})`)
  }

  console.log('🎉 Database seeding completed!')
  console.log('\n📋 Summary:')
  console.log('- 1 Admin user (username: admin, password: admin123)')
  console.log('- 5 Student users (username: siswa001-siswa005, password: password123)')
  console.log('- Complete student data with rankings')
  console.log('- Various registration statuses for testing')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })