import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest, requireRole } from '@/lib/auth'
import { Student, CompleteStudentFormData } from '@/types'
import { calculateTotalScore } from '@/lib/utils'
import { completeStudentSchema, studentUpdateSchema } from '@/lib/validations/student'
import { z } from 'zod'

// GET /api/students - Get all students (Admin only)
export async function GET(request: NextRequest) {
  try {
    // Authenticate and check admin role
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (authResult.user!.role !== 'ADMIN') {
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
      where.firstMajor = major
    }
    
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { nisn: { contains: search, mode: 'insensitive' } },
        { previousSchool: { contains: search, mode: 'insensitive' } }
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
    // Authenticate and check admin role
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (authResult.user!.role !== 'ADMIN') {
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
    if (body.education.nisn && body.education.nisn.trim() !== '') {
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
          nickname: body.personal.nickname || '',
          birthPlace: body.personal.birthPlace,
          birthDate: new Date(body.personal.birthDate),
          gender: body.personal.gender,
          religion: body.personal.religion,
          nationality: body.personal.nationality,
          address: body.personal.address,
          village: body.personal.village,
          district: body.personal.district,
          city: body.personal.city,
          province: body.personal.province,
          postalCode: body.personal.postalCode,
          phone: body.personal.phone || '',
          email: body.personal.email || '',
          
          // Parent data
          fatherName: body.parent.fatherName,
          fatherJob: body.parent.fatherJob || '',
          fatherPhone: body.parent.fatherPhone || '',
          motherName: body.parent.motherName,
          motherJob: body.parent.motherJob || '',
          motherPhone: body.parent.motherPhone || '',
          guardianName: body.parent.guardianName || '',
          guardianJob: body.parent.guardianJob || '',
          guardianPhone: body.parent.guardianPhone || '',
          parentAddress: body.parent.parentAddress || '',
          
          // Education data
          previousSchool: body.education.previousSchool,
          nisn: body.education.nisn || '',
          graduationYear: body.education.graduationYear,
          
          // Major choices
          firstMajor: body.major.firstMajor,
          secondMajor: body.major.secondMajor || '',
          thirdMajor: body.major.thirdMajor || '',
          
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
        // Convert achievement levels to scores
        const getAchievementPoints = (level: string): number => {
          const achievementLevels = {
            'none': 0,
            'sekolah': 5,
            'kecamatan': 10,
            'kabupaten': 15,
            'provinsi': 20,
            'nasional': 25,
            'internasional': 30
          }
          return achievementLevels[level as keyof typeof achievementLevels] || 0
        }

        const certificateScore = getAchievementPoints(body.ranking.certificateScore)
        const achievementScore = 
          getAchievementPoints(body.ranking.academicAchievement) +
          getAchievementPoints(body.ranking.nonAcademicAchievement)

        const totalScore = calculateTotalScore({
          indonesianScore: body.ranking.indonesianScore,
          englishScore: body.ranking.englishScore,
          mathScore: body.ranking.mathScore,
          scienceScore: body.ranking.scienceScore,
          academicAchievement: body.ranking.academicAchievement,
          nonAcademicAchievement: body.ranking.nonAcademicAchievement,
          certificateScore: body.ranking.certificateScore
        })

        await tx.ranking.create({
          data: {
            studentId: student.id,
            indonesianScore: body.ranking.indonesianScore,
            englishScore: body.ranking.englishScore,
            mathScore: body.ranking.mathScore,
            scienceScore: body.ranking.scienceScore,
            certificateScore,
            achievementScore,
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

// Helper function to update all rankings
async function updateAllRankings() {
  try {
    // Get all rankings ordered by total score
    const rankings = await prisma.ranking.findMany({
      orderBy: { totalScore: 'desc' }
    })

    // Update rank for each ranking
    const updatePromises = rankings.map((ranking, index) => 
      prisma.ranking.update({
        where: { id: ranking.id },
        data: { rank: index + 1 }
      })
    )

    await Promise.all(updatePromises)
  } catch (error) {
    console.error('Error updating rankings:', error)
  }
}