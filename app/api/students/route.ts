import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CompleteStudentFormData } from '@/types'
import { calculateTotalScore, updateAllRankings } from '@/lib/utils'
import bcrypt from 'bcryptjs'

// GET /api/students - Get all students with filters (Admin only)
export async function GET(request: NextRequest) {
  try {
    // Get user info from request headers (set by client)
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')
    
    if (!userId || !userRole) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing user information' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat mengakses data siswa.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const major = searchParams.get('major')
    const status = searchParams.get('status')
    const hasRanking = searchParams.get('hasRanking')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

    // Build where clause
    const whereClause: any = {}

    if (search) {
      whereClause.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { nisn: { contains: search, mode: 'insensitive' } },
        { schoolName: { contains: search, mode: 'insensitive' } },
        { user: { username: { contains: search, mode: 'insensitive' } } }
      ]
    }

    if (major && major !== 'ALL') {
      whereClause.selectedMajor = major
    }

    if (status && status !== 'ALL') {
      whereClause.finalStatus = status
    }

    if (hasRanking === 'true') {
      whereClause.ranking = { isNot: null }
    } else if (hasRanking === 'false') {
      whereClause.ranking = null
    }

    // Get students with pagination
    const students = await prisma.student.findMany({
      where: whereClause,
      include: {
        ranking: true,
        user: {
          select: {
            id: true,
            username: true,
            createdAt: true,
            updatedAt: true
          }
        }
      },
      orderBy: sortBy === 'totalScore' ? 
        { ranking: { totalScore: sortOrder } } : 
        { [sortBy]: sortOrder },
      skip: offset,
      take: limit
    })

    // Get total count for pagination
        const totalCount = await prisma.student.count({
      where: whereClause
    })

    // Get aggregated stats
    const statusCounts = await prisma.student.groupBy({
      by: ['finalStatus'],
      _count: {
        finalStatus: true,
      },
    });

    const stats = {
      pending: statusCounts.find(s => s.finalStatus === 'PENDING')?._count.finalStatus || 0,
      approved: statusCounts.find(s => s.finalStatus === 'APPROVED')?._count.finalStatus || 0,
      rejected: statusCounts.find(s => s.finalStatus === 'REJECTED')?._count.finalStatus || 0,
      total: totalCount
    };

    

    return NextResponse.json({
      success: true,
      data: {
                students,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        },
        stats,
        filters: {
          search,
          major,
          status,
          hasRanking,
          sortBy,
          sortOrder
        }
      }
    })
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data siswa' },
      { status: 500 }
    )
  }
}

// POST /api/students - Create new student (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Get user info from request headers (set by client)
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')
    
    if (!userId || !userRole) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing user information' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat membuat data siswa.' },
        { status: 403 }
      )
    }

    const body: CompleteStudentFormData & { username: string; password: string } = await request.json()

    // Validate required fields
    if (!body.username || !body.password || !body.fullName || !body.nisn) {
      return NextResponse.json(
        { error: 'Username, password, nama lengkap, dan NISN harus diisi' },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: body.username }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username sudah terdaftar' },
        { status: 400 }
      )
    }

    // Check if NISN already exists
    const existingStudent = await prisma.student.findUnique({
      where: { nisn: body.nisn }
    })

    if (existingStudent) {
      return NextResponse.json(
        { error: 'NISN sudah terdaftar' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 12)

    // Create user and student in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          username: body.username,
          password: hashedPassword,
          role: 'STUDENT'
        }
      })

      // Create student
      const student = await tx.student.create({
        data: {
          userId: user.id,
          // Personal data
          fullName: body.fullName,
          birthPlace: body.birthPlace,
          birthDate: new Date(body.birthDate),
          gender: body.gender,
          religion: body.religion,
          nationality: body.nationality || 'Indonesia',
          address: body.address,
          rt: body.rt,
          rw: body.rw,
          village: body.village,
          district: body.district,
          city: body.city,
          province: body.province,
          postalCode: body.postalCode,
          phoneNumber: body.phoneNumber,
          email: body.email,
          childOrder: body.childOrder,
          totalSiblings: body.totalSiblings,
          height: body.height,
          weight: body.weight,
          medicalHistory: body.medicalHistory,
         
          // Parent data
          fatherName: body.fatherName,
          fatherJob: body.fatherJob,
          fatherEducation: body.fatherEducation,
          motherName: body.motherName,
          motherJob: body.motherJob,
          motherEducation: body.motherEducation,
          guardianName: body.guardianName,
          guardianJob: body.guardianJob,
          parentPhone: body.parentPhone,
          parentAddress: body.parentAddress,
          
          // Education data
          schoolName: body.schoolName,
          npsn: body.npsn,
          nisn: body.nisn,
          graduationYear: body.graduationYear || new Date().getFullYear(),
          certificateNumber: body.certificateNumber,
          
          // Major choice
          selectedMajor: body.selectedMajor,
          
          // Documents
          hasIjazah: body.hasIjazah || false,
          hasSKHUN: body.hasSKHUN || false,
          hasKK: body.hasKK || false,
          hasAktaLahir: body.hasAktaLahir || false,
          hasFoto: body.hasFoto || false,
          hasRaport: body.hasRaport || false,
          hasSertifikat: body.hasSertifikat || false,
          
          // Status
          finalStatus: 'PENDING'
        }
      })

      // Create ranking if provided
      if (body.ranking) {
        const totalScore = calculateTotalScore({
          indonesianScore: body.ranking.indonesianScore,
          englishScore: body.ranking.englishScore,
          mathScore: body.ranking.mathScore,
          scienceScore: body.ranking.scienceScore,
          academicAchievement: body.ranking.academicAchievement,
          nonAcademicAchievement: body.ranking.nonAcademicAchievement,
          certificateScore: body.ranking.certificateScore,
          accreditation: body.ranking.accreditation
        })

        await tx.ranking.create({
          data: {
            studentId: student.id,
            indonesianScore: body.ranking.indonesianScore,
            englishScore: body.ranking.englishScore,
            mathScore: body.ranking.mathScore,
            scienceScore: body.ranking.scienceScore,
            academicAchievement: body.ranking.academicAchievement || 'none',
            nonAcademicAchievement: body.ranking.nonAcademicAchievement || 'none',
            certificateScore: body.ranking.certificateScore || 'none',
            accreditation: body.ranking.accreditation || 'Belum Terakreditasi',
            totalScore,
            rank: 0 // Will be calculated later
          }
        })
      }

      return student
    })

    // Update rankings for all students
    await updateAllRankings()

    // Get created student with ranking
    const createdStudent = await prisma.student.findUnique({
      where: { id: result.id },
      include: {
        ranking: true,
        user: {
          select: {
            id: true,
            username: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Siswa berhasil dibuat',
      data: { student: createdStudent }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat data siswa' },
      { status: 500 }
    )
  }
}