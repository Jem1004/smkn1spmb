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
      phoneNumber: '081234567890',
      email: 'ahmad.rizki@email.com',
      childOrder: 1,
      totalSiblings: 2,
      height: 165,
      weight: 55,
      medicalHistory: 'Tidak ada',
      fatherName: 'Budi Pratama',
      fatherJob: 'Pegawai Swasta',
      fatherEducation: 'S1',
      motherName: 'Siti Aminah',
      motherJob: 'Ibu Rumah Tangga',
      motherEducation: 'SMA',
      guardianName: '',
      guardianJob: '',
      parentPhone: '081234567891',
      parentAddress: 'Jl. Merdeka No. 123',
      schoolName: 'SMP Negeri 1 Jakarta',
      npsn: '20104001',
      nisn: '1234567890',
      graduationYear: 2024,
      certificateNumber: 'SMP001/2024',
      selectedMajor: 'Teknik Komputer dan Jaringan',
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
        academicAchievement: 'kabupaten',
        nonAcademicAchievement: 'provinsi',
        certificateScore: 'kabupaten',
        accreditation: 'A',
        totalScore: 359.0,
        rank: 1
      }
    },
    {
      username: 'siswa002',
      fullName: 'Sari Dewi Lestari',
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
      phoneNumber: '081234567893',
      email: 'sari.dewi@email.com',
      childOrder: 2,
      totalSiblings: 3,
      height: 158,
      weight: 48,
      medicalHistory: 'Alergi debu',
      fatherName: 'Joko Lestari',
      fatherJob: 'Guru',
      fatherEducation: 'S1',
      motherName: 'Rina Sari',
      motherJob: 'Perawat',
      motherEducation: 'D3',
      guardianName: '',
      guardianJob: '',
      parentPhone: '081234567894',
      parentAddress: 'Jl. Sudirman No. 456',
      schoolName: 'SMP Negeri 2 Bandung',
      npsn: '20104002',
      nisn: '1234567891',
      graduationYear: 2024,
      certificateNumber: 'SMP002/2024',
      selectedMajor: 'Multimedia',
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
        academicAchievement: 'nasional',
        nonAcademicAchievement: 'kabupaten',
        certificateScore: 'nasional',
        accreditation: 'A',
        totalScore: 357.5,
        rank: 2
      }
    },
    {
      username: 'siswa003',
      fullName: 'Budi Santoso',
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
      phoneNumber: '081234567896',
      email: 'budi.santoso@email.com',
      childOrder: 1,
      totalSiblings: 1,
      height: 170,
      weight: 60,
      medicalHistory: 'Sehat',
      fatherName: 'Agus Santoso',
      fatherJob: 'Wiraswasta',
      fatherEducation: 'SMA',
      motherName: 'Maria Santoso',
      motherJob: 'Pegawai Bank',
      motherEducation: 'S1',
      guardianName: '',
      guardianJob: '',
      parentPhone: '081234567897',
      parentAddress: 'Jl. Pahlawan No. 789',
      schoolName: 'SMP Kristen Petra',
      npsn: '20104003',
      nisn: '1234567892',
      graduationYear: 2024,
      certificateNumber: 'SMP003/2024',
      selectedMajor: 'Teknik Komputer dan Jaringan',
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
        academicAchievement: 'kabupaten',
        nonAcademicAchievement: 'none',
        certificateScore: 'kabupaten',
        accreditation: 'B',
        totalScore: 364.0,
        rank: null // Belum di-rank karena masih pending
      }
    },
    {
      username: 'siswa004',
      fullName: 'Indira Putri Maharani',
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
      phoneNumber: '081234567899',
      email: 'indira.putri@email.com',
      childOrder: 1,
      totalSiblings: 2,
      height: 160,
      weight: 50,
      medicalHistory: 'Sehat',
      fatherName: 'Made Maharani',
      fatherJob: 'Dosen',
      fatherEducation: 'S2',
      motherName: 'Kadek Sari',
      motherJob: 'Dokter',
      motherEducation: 'S1',
      guardianName: '',
      guardianJob: '',
      parentPhone: '081234567800',
      parentAddress: 'Jl. Malioboro No. 321',
      schoolName: 'SMP Negeri 1 Yogyakarta',
      npsn: '20104004',
      nisn: '1234567893',
      graduationYear: 2024,
      certificateNumber: 'SMP004/2024',
      selectedMajor: 'Multimedia',
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
        academicAchievement: 'nasional',
        nonAcademicAchievement: 'provinsi',
        certificateScore: 'nasional',
        accreditation: 'A',
        totalScore: 361.5,
        rank: 3
      }
    },
    {
      username: 'siswa005',
      fullName: 'Reza Firmansyah',
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
      phoneNumber: '081234567802',
      email: 'reza.firmansyah@email.com',
      childOrder: 2,
      totalSiblings: 3,
      height: 170,
      weight: 65,
      medicalHistory: 'Sehat',
      fatherName: 'Hasan Firmansyah',
      fatherJob: 'Pengusaha',
      fatherEducation: 'S1',
      motherName: 'Fatimah Zahra',
      motherJob: 'Guru',
      motherEducation: 'S1',
      guardianName: 'Hasan Firmansyah',
      guardianJob: 'Pengusaha',
      parentPhone: '081234567803',
      parentAddress: 'Jl. Gatot Subroto No. 654',
      schoolName: 'SMP Swasta Al-Azhar',
      npsn: '10234567',
      nisn: '1234567894',
      graduationYear: 2024,
      certificateNumber: 'SMP-2024-005',
      selectedMajor: 'Teknik Komputer dan Jaringan',
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
        academicAchievement: 'kabupaten',
        nonAcademicAchievement: 'none',
        certificateScore: 'none',
        accreditation: 'B',
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
      include: {
        ranking: true
      }
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