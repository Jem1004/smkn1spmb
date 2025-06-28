import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createMajorRankings, getStudentAcceptanceStatus, MAJOR_QUOTAS } from '@/lib/ranking'
import { updateAllRankings } from '@/lib/utils'
import { StudentWithRanking, MajorType } from '@/types'

// Helper function to get all students with rankings
async function getAllStudentsWithRankings() {
  return await prisma.student.findMany({
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
}

// Handle comprehensive data request
async function handleComprehensiveRequest() {
  const allStudents = await prisma.student.findMany({
    include: { ranking: true },
  });

  const rankings = createMajorRankings(allStudents as StudentWithRanking[]);

  // Calculate major data using finalStatus for consistency
  const majorData = Object.keys(rankings).map(majorKey => {
    const majorStudents = rankings[majorKey as keyof typeof rankings];
    const studentsInMajor = allStudents.filter(s => s.selectedMajor === majorKey);
    return {
      major: majorKey,
      total: majorStudents.length,
      accepted: studentsInMajor.filter(s => s.finalStatus === 'APPROVED').length,
      rejected: studentsInMajor.filter(s => s.finalStatus === 'REJECTED').length,
      highestScore: majorStudents.length > 0 ? majorStudents[0].totalScore : 0,
      lowestScore: majorStudents.length > 0 ? majorStudents[majorStudents.length - 1].totalScore : 0,
    };
  });

  // Calculate overall statistics based on finalStatus
  const overallStatistics = {
    totalStudents: allStudents.length,
    totalAccepted: allStudents.filter(s => s.finalStatus === 'APPROVED').length,
    totalRejected: allStudents.filter(s => s.finalStatus === 'REJECTED').length,
  };

  return NextResponse.json({
    rankings,
    majorData,
    overallStatistics,
  });
}

// Handle competition analysis request
async function handleCompetitionRequest() {
  const allStudents = await getAllStudentsWithRankings();
  const rankings = createMajorRankings(allStudents as StudentWithRanking[]);
  const majorQuotas = MAJOR_QUOTAS;

  const competitionData = Object.keys(rankings).map(majorKey => {
    const majorStudents = rankings[majorKey as keyof typeof rankings];
    const acceptedStudents = majorStudents.filter(s => {
      const studentWithDetails = allStudents.find(student => student.id === s.studentId);
      if (!studentWithDetails) return false;
      const acceptance = getStudentAcceptanceStatus(studentWithDetails.id, rankings);
       return acceptance?.status === 'DITERIMA';
    });
    const totalCount = majorStudents.length;
    const quota = majorQuotas[majorKey as MajorType] || 0;
    const competitionRatio = quota > 0 ? totalCount / quota : 0;

    let difficulty = 'LOW';
    if (competitionRatio > 3) {
      difficulty = 'HIGH';
    } else if (competitionRatio > 1.5) {
      difficulty = 'MEDIUM';
    }

    return {
      majorCode: majorKey,
      majorName: majorKey,
      applicants: totalCount,
      quota,
      competitionRatio,
      averageScore: totalCount > 0 ? majorStudents.reduce((sum, s) => sum + s.totalScore, 0) / totalCount : 0,
      cutoffScore: acceptedStudents.length > 0 ? acceptedStudents[acceptedStudents.length - 1].totalScore : 0,
      difficulty,
    };
  });

  return NextResponse.json(competitionData);
}

// Handle export request
async function handleExportRequest(searchParams: URLSearchParams) {
  const format = searchParams.get('format')
  const major = searchParams.get('major')
  
  const allStudents = await getAllStudentsWithRankings()
  const rankings = createMajorRankings(allStudents as StudentWithRanking[])
  
  let exportData: any[] = []
  
  if (major && major !== 'all') {
    exportData = rankings[major as keyof typeof rankings] || []
  } else {
    exportData = Object.values(rankings).flat()
  }
  
  if (format === 'download') {
    // Generate CSV content
    const csvHeader = 'NISN,Nama Lengkap,Jurusan,Total Skor,Ranking,Status\n'
    const csvContent = exportData.map((student, index) => {
      const studentWithDetails = allStudents.find(s => s.id === student.studentId);
      if (!studentWithDetails) return `${student.nisn},${student.fullName},${student.selectedMajor},${student.totalScore},${index + 1},ERROR`;
      const statusInfo = getStudentAcceptanceStatus(studentWithDetails.id, rankings);
      return `${student.nisn},${student.fullName},${student.selectedMajor},${student.totalScore},${index + 1},${statusInfo?.status || 'N/A'}`;
    }).join('\n');
    
    const csvData = csvHeader + csvContent
    
    return new NextResponse(csvData, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="ranking_${major || 'all'}_${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  }
  
  return NextResponse.json(exportData)
}

// Handle simulation request
async function handleSimulationRequest() {
  const allStudents = await getAllStudentsWithRankings();
  const rankings = createMajorRankings(allStudents as StudentWithRanking[]);
  const majorQuotas = MAJOR_QUOTAS;

  let totalAccepted = 0;
  let totalRejected = 0;
  let totalQuota = 0;

  const results = Object.keys(rankings).map(majorKey => {
    const majorStudents = rankings[majorKey as keyof typeof rankings];
    const quota = majorQuotas[majorKey as MajorType] || 0;
    const accepted = majorStudents.slice(0, quota);
    const rejected = majorStudents.slice(quota);

    totalAccepted += accepted.length;
    totalRejected += rejected.length;
    totalQuota += quota;

    return {
      major: majorKey,
      quota,
      totalStudents: majorStudents.length,
      acceptedCount: accepted.length,
      rejectedCount: rejected.length,
      cutoffScore: accepted.length > 0 ? accepted[accepted.length - 1].totalScore : 0,
    };
  });

  const summary = {
    totalStudents: allStudents.length,
    totalAccepted,
    totalRejected,
    totalQuota,
    quotaUtilization: totalQuota > 0 ? (totalAccepted / totalQuota) * 100 : 0,
  };

  return NextResponse.json({ summary, results });
}

// GET /api/ranking - Get ranking data with filters
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
        { error: 'Akses ditolak. Hanya admin yang dapat mengakses data ranking.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const major = searchParams.get('major')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sortBy') || 'totalScore'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Handle different request types
    if (type === 'comprehensive') {
      return await handleComprehensiveRequest()
    }
    
    if (type === 'competition') {
      return await handleCompetitionRequest()
    }
    
    if (type === 'export') {
      return await handleExportRequest(searchParams)
    }
    
    if (type === 'simulation') {
      return await handleSimulationRequest()
    }

    // Get students with ranking data
    const whereClause: any = {
      ranking: {
        isNot: null
      }
    }

    if (major && major !== 'ALL') {
      whereClause.selectedMajor = major
    }

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
      orderBy: {
        ranking: {
          [sortBy]: sortOrder
        }
      },
      skip: offset,
      take: limit
    })

    // Get total count for pagination
    const totalCount = await prisma.student.count({
      where: whereClause
    })

    // Calculate real-time rankings
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

    const rankings = createMajorRankings(allStudents as StudentWithRanking[])

    // Add real-time status to each student
    const studentsWithStatus = students.map(student => {
      const realTimeStatus = getStudentAcceptanceStatus(student.id, rankings)
      return {
        ...student,
        realTimeStatus
      }
    })

    // Get statistics by major
    const majorStats: Record<string, any> = {}
    Object.keys(rankings).forEach(majorKey => {
      const majorStudents = rankings[majorKey as keyof typeof rankings]
      majorStats[majorKey] = {
        total: majorStudents.length,
        accepted: majorStudents.filter(s => s.status === 'DITERIMA').length,
        rejected: majorStudents.filter(s => s.status === 'TIDAK_DITERIMA').length,
        highestScore: majorStudents.length > 0 ? majorStudents[0].totalScore : 0,
        lowestScore: majorStudents.length > 0 ? majorStudents[majorStudents.length - 1].totalScore : 0
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        students: studentsWithStatus,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        },
        statistics: majorStats,
        filters: {
          major,
          sortBy,
          sortOrder
        }
      }
    })
  } catch (error) {
    console.error('Error fetching ranking data:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data ranking' },
      { status: 500 }
    )
  }
}

// POST /api/ranking/recalculate - Recalculate all rankings
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
        { error: 'Akses ditolak. Hanya admin yang dapat merekalkukasi ranking.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action } = body

    if (action === 'recalculate') {
      // Recalculate all rankings
      await updateAllRankings()

      // Get updated statistics
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

      const rankings = createMajorRankings(allStudents as StudentWithRanking[])
      
      // Calculate statistics
      const statistics: Record<string, any> = {}
      Object.keys(rankings).forEach(majorKey => {
        const majorStudents = rankings[majorKey as keyof typeof rankings]
        statistics[majorKey] = {
          total: majorStudents.length,
          accepted: majorStudents.filter(s => s.status === 'DITERIMA').length,
          rejected: majorStudents.filter(s => s.status === 'TIDAK_DITERIMA').length,
          highestScore: majorStudents.length > 0 ? majorStudents[0].totalScore : 0,
          lowestScore: majorStudents.length > 0 ? majorStudents[majorStudents.length - 1].totalScore : 0
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Ranking berhasil direkalkukasi',
        data: {
          totalStudents: allStudents.length,
          statistics
        }
      })
    }

    return NextResponse.json(
      { error: 'Aksi tidak valid' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error recalculating rankings:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat merekalkukasi ranking' },
      { status: 500 }
    )
  }
}