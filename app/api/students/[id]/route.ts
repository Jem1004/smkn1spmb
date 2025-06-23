import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest, requireRole } from '@/lib/auth'
import { CompleteStudentFormData } from '@/types'
import { calculateTotalScore } from '@/lib/utils'

// GET /api/students/[id] - Get student by ID (Admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get student data with ranking
    const student = await prisma.student.findUnique({
      where: {
        id: params.id
      },
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

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ student })
  } catch (error) {
    console.error('Error fetching student:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/students/[id] - Update student by ID (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body: CompleteStudentFormData = await request.json()

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id: params.id }
    })

    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Check if NISN is changed and already exists
    if (body.nisn && body.nisn !== existingStudent.nisn) {
      const studentWithNisn = await prisma.student.findUnique({
        where: { nisn: body.nisn }
      })
      
      if (studentWithNisn) {
        return NextResponse.json(
          { error: 'NISN sudah terdaftar' },
          { status: 400 }
        )
      }
    }

    // Update student with ranking in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update student
      const student = await tx.student.update({
        where: { id: params.id },
        data: {
          // Personal data
          fullName: body.fullName,
          nickname: body.nickname,
          birthPlace: body.birthPlace,
          birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
          gender: body.gender,
          religion: body.religion,
          nationality: body.nationality,
          address: body.address,
          village: body.village,
          district: body.district,
          city: body.city,
          province: body.province,
          postalCode: body.postalCode,
          phone: body.phone,
          email: body.email,
          
          // Parent data
          fatherName: body.fatherName,
          fatherJob: body.fatherJob,
          fatherPhone: body.fatherPhone,
          motherName: body.motherName,
          motherJob: body.motherJob,
          motherPhone: body.motherPhone,
          guardianName: body.guardianName,
          guardianJob: body.guardianJob,
          guardianPhone: body.guardianPhone,
          parentAddress: body.parentAddress,
          
          // Education data
          previousSchool: body.previousSchool,
          nisn: body.nisn,
          graduationYear: body.graduationYear,
          
          // Major choices
          firstMajor: body.firstMajor,
          secondMajor: body.secondMajor,
          thirdMajor: body.thirdMajor,
          
          // Documents
          hasIjazah: body.hasIjazah,
          hasSKHUN: body.hasSKHUN,
          hasKK: body.hasKK,
          hasAktaLahir: body.hasAktaLahir,
          hasFoto: body.hasFoto,
          hasRaport: body.hasRaport,
          hasSertifikat: body.hasSertifikat,
          
          // Status
          registrationStatus: existingStudent.registrationStatus
        }
      })

      // Update or create ranking if provided
      if (body.ranking) {
        const totalScore = calculateTotalScore({
          indonesianScore: body.ranking.indonesianScore,
          englishScore: body.ranking.englishScore,
          mathScore: body.ranking.mathScore,
          scienceScore: body.ranking.scienceScore,
          academicAchievement: body.ranking.academicAchievement,
          nonAcademicAchievement: body.ranking.nonAcademicAchievement,
          certificateScore: body.ranking.certificateScore
        })

        await tx.ranking.upsert({
          where: { studentId: student.id },
          create: {
            studentId: student.id,
            indonesianScore: body.ranking.indonesianScore,
            englishScore: body.ranking.englishScore,
            mathScore: body.ranking.mathScore,
            scienceScore: body.ranking.scienceScore,
            certificateScore: parseInt(body.ranking.certificateScore) || 0,
            achievementScore: 0, // Calculate from achievements
            totalScore,
            rank: 0 // Will be calculated later
          },
          update: {
            indonesianScore: body.ranking.indonesianScore,
            englishScore: body.ranking.englishScore,
            mathScore: body.ranking.mathScore,
            scienceScore: body.ranking.scienceScore,
            certificateScore: parseInt(body.ranking.certificateScore) || 0,
            achievementScore: 0, // Calculate from achievements
            totalScore
          }
        })
      }

      return student
    })

    // Update rankings for all students
    await updateAllRankings()

    // Get updated student with ranking
    const updatedStudent = await prisma.student.findUnique({
      where: { id: params.id },
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
      message: 'Student updated successfully',
      student: updatedStudent
    })
  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/students/[id] - Delete student by ID (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Delete student and related data in transaction
    await prisma.$transaction(async (tx) => {
      // Delete ranking if exists
      await tx.ranking.deleteMany({
        where: { studentId: student.id }
      })

      // Delete student
      await tx.student.delete({
        where: { id: student.id }
      })

      // Delete user account
      await tx.user.delete({
        where: { id: student.userId }
      })
    })

    // Update rankings for remaining students
    await updateAllRankings()

    return NextResponse.json({
      message: 'Student deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting student:', error)
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