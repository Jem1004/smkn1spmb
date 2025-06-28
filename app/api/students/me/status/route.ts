import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createMajorRankings, getStudentAcceptanceStatus, calculateStudentScore } from '@/lib/ranking'
import { StudentWithRanking, MajorType } from '@/types'

export const dynamic = 'force-dynamic'

// GET /api/students/me/status - Get current student's real-time acceptance status
export async function GET(request: NextRequest) {
  try {
    // Get user ID from request headers (set by client)
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')
    
    if (!userId || !userRole) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing user information' },
        { status: 401 }
      )
    }

    // Check if user is student
    if (userRole !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya siswa yang dapat mengakses.' },
        { status: 403 }
      )
    }

    // Get current student data
    const currentStudent = await prisma.student.findUnique({
      where: {
        userId: userId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            createdAt: true,
            updatedAt: true
          }
        },
        ranking: true
      }
    })

    if (!currentStudent) {
      return NextResponse.json(
        { error: 'Data siswa tidak ditemukan.' },
        { status: 404 }
      )
    }

    // Get all students with ranking data for real-time calculation
    const allStudents = await prisma.student.findMany({
      where: {
        ranking: {
          isNot: null
        }
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

    // Calculate real-time rankings
    const rankings = createMajorRankings(allStudents as StudentWithRanking[])
    
    // Get current student's real-time status
    const realTimeStatus = getStudentAcceptanceStatus(currentStudent.id, rankings)
    
    if (!realTimeStatus) {
      return NextResponse.json(
        { error: 'Status penerimaan tidak dapat dihitung. Pastikan data ranking sudah lengkap.' },
        { status: 400 }
      )
    }

    // Calculate current student's score
    const currentScore = calculateStudentScore(currentStudent as StudentWithRanking)
    
    // Get major statistics for additional context
    const majorStudents = rankings[realTimeStatus.major] || []
    const acceptedStudents = majorStudents.filter(s => s.status === 'DITERIMA')
    const rejectedStudents = majorStudents.filter(s => s.status === 'TIDAK_DITERIMA')
    
    // Calculate distance from cutoff
    const cutoffScore = acceptedStudents.length > 0 ? 
      acceptedStudents[acceptedStudents.length - 1].totalScore : 0
    const distanceFromCutoff = currentScore - cutoffScore
    
    // Map real-time status to database status for comparison
    const mapRealTimeToDbStatus = (status: string) => {
      switch (status) {
        case 'DITERIMA': return 'ACCEPTED'
        case 'TIDAK_DITERIMA': return 'REJECTED'
        default: return 'PENDING'
      }
    }

    const response = {
      // Real-time calculated status
      realTimeStatus: {
        status: realTimeStatus.status,
        rank: realTimeStatus.rank,
        totalScore: realTimeStatus.totalScore,
        major: realTimeStatus.major,
        distanceFromCutoff,
        isAboveCutoff: distanceFromCutoff >= 0
      },
      
      // Current database status for comparison
      databaseStatus: {
        status: currentStudent.finalStatus,
        mappedRealTimeStatus: mapRealTimeToDbStatus(realTimeStatus.status)
      },
      
      // Status comparison
      statusComparison: {
        isConsistent: currentStudent.finalStatus === mapRealTimeToDbStatus(realTimeStatus.status),
        needsUpdate: currentStudent.finalStatus !== mapRealTimeToDbStatus(realTimeStatus.status)
      },
      
      // Major statistics
      majorStatistics: {
        totalApplicants: majorStudents.length,
        accepted: acceptedStudents.length,
        rejected: rejectedStudents.length,
        cutoffScore,
        highestScore: majorStudents.length > 0 ? majorStudents[0].totalScore : 0
      },
      
      // Student context
      studentInfo: {
        id: currentStudent.id,
        fullName: currentStudent.fullName,
        selectedMajor: currentStudent.selectedMajor,
        hasCompleteRanking: !!currentStudent.ranking
      }
    }

    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Error fetching real-time student status:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('connect') || error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Koneksi ke database bermasalah. Silakan coba lagi dalam beberapa saat.' },
          { status: 503 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat menghitung status real-time.' },
      { status: 500 }
    )
  }
}