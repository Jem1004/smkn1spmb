import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Student, CompleteStudentFormData } from '@/types'
import { calculateTotalScore, updateAllRankings } from '@/lib/utils'
import { completeStudentSchema, studentUpdateSchema } from '@/lib/validations/student'
import { z } from 'zod'

// GET /api/students - Get all students (Admin only)
export async function GET(request: NextRequest) {
  try {
    // Get session from NextAuth
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat mengakses.' },
        { status: 403 }
      )
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')
    const major = searchParams.get('major')
    const search = searchParams.get('search')

    // Build where clause
    const where: any = {}
    
    if (status && status !== 'all') {
      where.registrationStatus = status
    }
    
    if (major && major !== 'all') {
      where.selectedMajor = major
    }
    
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { nisn: { contains: search, mode: 'insensitive' } },
        { schoolName: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get students with pagination
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          ranking: true,
          user: {
            select: {
              id: true,
              username: true,
              createdAt: true
            }
          }
        },
        orderBy: [
          { ranking: { totalScore: 'desc' } },
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.student.count({ where })
    ])

    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/students - Create new student (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Get session from NextAuth
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat mengakses.' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validate request body with Zod
    try {
      completeStudentSchema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { 
            error: 'Data tidak valid',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: 'Data tidak valid' },
        { status: 400 }
      )
    }

    // Check if NISN already exists
    if (body.education?.nisn && body.education.nisn.trim() !== '') {
      const existingStudent = await prisma.student.findFirst({
        where: { nisn: body.education.nisn }
      })
      
      if (existingStudent) {
        return NextResponse.json(
          { error: 'NISN sudah terdaftar' },
          { status: 400 }
        )
      }
    }

    // Create user account for student
    const { generateUsername, generatePassword, hashPassword } = await import('@/lib/utils')
    const username = generateUsername(body.personal.fullName)
    const password = generatePassword()
    const hashedPassword = await hashPassword(password)

    // Create student with ranking in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          username,
          password: hashedPassword,
          role: 'STUDENT'
        }
      })

      // Create student
      const student = await tx.student.create({
        data: {
          userId: user.id,
          // Personal data
          fullName: body.personal.fullName,
          birthPlace: body.personal.birthPlace,
          birthDate: new Date(body.personal.birthDate),
          gender: body.personal.gender,
          religion: body.personal.religion,
          nationality: body.personal.nationality,
          address: body.personal.address,
          rt: body.personal.rt || '',
          rw: body.personal.rw || '',
          village: body.personal.village || '',
          district: body.personal.district,
          city: body.personal.city,
          province: body.personal.province,
          postalCode: body.personal.postalCode,
          phoneNumber: body.personal.phoneNumber || '',
          email: body.personal.email || '',
          childOrder: body.personal.childOrder || 1,
          totalSiblings: body.personal.totalSiblings || 1,
          height: body.personal.height || 0,
          weight: body.personal.weight || 0,
          medicalHistory: body.personal.medicalHistory || '',
          
          // Parent data
          fatherName: body.parent.fatherName,
          fatherJob: body.parent.fatherJob || '',
          fatherEducation: body.parent.fatherEducation || '',
          motherName: body.parent.motherName,
          motherJob: body.parent.motherJob || '',
          motherEducation: body.parent.motherEducation || '',
          guardianName: body.parent.guardianName || '',
          guardianJob: body.parent.guardianJob || '',
          parentPhone: body.parent.parentPhone || '',
          parentAddress: body.parent.parentAddress || '',
          
          // Education data
          schoolName: body.education.schoolName,
          npsn: body.education.npsn || '',
          nisn: body.education.nisn || '',
          graduationYear: body.education.graduationYear,
          certificateNumber: body.education.certificateNumber || '',
          
          // Major choices
          selectedMajor: body.major.selectedMajor,
          
          // Documents
          hasIjazah: body.documents?.hasIjazah || false,
          hasSKHUN: body.documents?.hasSKHUN || false,
          hasKK: body.documents?.hasKK || false,
          hasAktaLahir: body.documents?.hasAktaLahir || false,
          hasFoto: body.documents?.hasFoto || false,
          hasRaport: body.documents?.hasRaport || false,
          hasSertifikat: body.documents?.hasSertifikat || false,
          
          registrationStatus: 'PENDING'
        }
      })

      // Create ranking if provided
      if (body.ranking) {
        const totalScore = calculateTotalScore({
          mathScore: body.ranking.mathScore,
          indonesianScore: body.ranking.indonesianScore,
          englishScore: body.ranking.englishScore,
          scienceScore: body.ranking.scienceScore,
          academicAchievement: body.ranking.academicAchievement,
          nonAcademicAchievement: body.ranking.nonAcademicAchievement,
          certificateScore: body.ranking.certificateScore,
          accreditation: body.ranking.accreditation
        })

        await tx.ranking.create({
          data: {
            studentId: student.id,
            mathScore: body.ranking.mathScore,
            indonesianScore: body.ranking.indonesianScore,
            englishScore: body.ranking.englishScore,
            scienceScore: body.ranking.scienceScore,
            academicAchievement: body.ranking.academicAchievement,
            nonAcademicAchievement: body.ranking.nonAcademicAchievement,
            certificateScore: body.ranking.certificateScore,
            accreditation: body.ranking.accreditation,
            totalScore,
            rank: 0 // Will be calculated later
          }
        })
      }

      return { student, user, credentials: { username, password } }
    })

    // Update rankings for all students
    await updateAllRankings()

    return NextResponse.json({
      message: 'Student created successfully',
      student: result.student,
      credentials: result.credentials
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}