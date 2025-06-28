import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createMajorRankings, getStudentAcceptanceStatus, MAJOR_QUOTAS } from '@/lib/ranking'
import { StudentWithRanking } from '@/types'

// POST /api/students/bulk-process/by-ranking - Process students by ranking
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
        { error: 'Akses ditolak. Hanya admin yang dapat melakukan pemrosesan berdasarkan ranking.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { 
      action = 'auto_process_by_ranking',
      major = 'ALL',
      rankRange,
      forceUpdate = false,
      dryRun = false
    } = body

    let whereClause: any = {
      ranking: {
        isNot: null
      }
    }

    // Filter by major if specified
    if (major && major !== 'ALL') {
      whereClause.selectedMajor = major
    }

    // Get students with ranking
    const studentsWithRanking = await prisma.student.findMany({
      where: whereClause,
      include: {
        ranking: true,
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    })

    if (studentsWithRanking.length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada siswa dengan data ranking yang ditemukan' },
        { status: 400 }
      )
    }

    // Calculate real-time rankings
    const rankings = createMajorRankings(studentsWithRanking as StudentWithRanking[])
    
    let processedCount = 0
    let skippedCount = 0
    let errorCount = 0
    let results: any[] = []
    let errors: string[] = []

    // Process each student
    for (const student of studentsWithRanking) {
      try {
        const realTimeStatus = getStudentAcceptanceStatus(student.id, rankings)
        
        if (!realTimeStatus) {
          errors.push(`Tidak dapat menghitung status untuk siswa ${student.fullName}`)
          errorCount++
          continue
        }

        // Check rank range filter if specified
        if (rankRange) {
          const { min, max } = rankRange
          if (realTimeStatus.rank < min || realTimeStatus.rank > max) {
            results.push({
              studentId: student.id,
              studentName: student.fullName,
              rank: realTimeStatus.rank,
              totalScore: realTimeStatus.totalScore,
              major: realTimeStatus.major,
              skipped: true,
              reason: `Rank ${realTimeStatus.rank} di luar range ${min}-${max}`
            })
            skippedCount++
            continue
          }
        }

        // Map real-time status to database status
        const mapRealTimeToDbStatus = (status: string) => {
          switch (status) {
            case 'DITERIMA': return 'APPROVED'
            case 'CADANGAN': return 'WAITLIST'
            case 'TIDAK_DITERIMA': return 'REJECTED'
            default: return 'PENDING'
          }
        }

        const newStatus = mapRealTimeToDbStatus(realTimeStatus.status)
        const previousStatus = student.finalStatus

        // Check if update is needed
        const needsUpdate = forceUpdate || (previousStatus !== newStatus)

        if (needsUpdate) {
          if (!dryRun) {
            // Update student status
            await prisma.student.update({
              where: { id: student.id },
              data: {
                finalStatus: newStatus,
                updatedAt: new Date()
              }
            })

            // Process log would be created here if needed
          }

          results.push({
            studentId: student.id,
            studentName: student.fullName,
            previousStatus,
            newStatus,
            rank: realTimeStatus.rank,
            totalScore: realTimeStatus.totalScore,
            major: realTimeStatus.major,
            updated: !dryRun,
            dryRun,
            success: true
          })

          processedCount++
        } else {
          results.push({
            studentId: student.id,
            studentName: student.fullName,
            status: newStatus,
            rank: realTimeStatus.rank,
            totalScore: realTimeStatus.totalScore,
            major: realTimeStatus.major,
            skipped: true,
            reason: 'Status sudah sesuai',
            success: true
          })
          skippedCount++
        }
      } catch (error) {
        console.error(`Error processing student ${student.id}:`, error)
        const errorMessage = `Gagal memproses siswa ${student.fullName}: ${error}`
        errors.push(errorMessage)
        
        results.push({
          studentId: student.id,
          studentName: student.fullName,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        errorCount++
      }
    }

    // Create summary log (only if not dry run)
    if (!dryRun) {
      // Process log would be created here if needed
    }

    return NextResponse.json({
      success: true,
      message: dryRun 
        ? `Simulasi selesai: ${processedCount} akan diproses, ${skippedCount} dilewati, ${errorCount} error`
        : `Pemrosesan berdasarkan ranking selesai: ${processedCount} siswa diproses, ${skippedCount} dilewati`,
      data: {
        dryRun,
        major,
        rankRange,
        forceUpdate,
        totalStudents: studentsWithRanking.length,
        processedCount,
        skippedCount,
        errorCount,
        results,
        errors,
        summary: {
          byMajor: Object.entries(rankings).reduce((acc: any, [majorKey, majorRankings]) => {
            acc[majorKey] = {
              total: majorRankings.length,
              approved: 0,
              waitlist: 0,
              rejected: 0
            }
            
            majorRankings.forEach(ranking => {
              const student = results.find(r => r.studentId === ranking.studentId)
              if (student && student.success && !student.skipped) {
                switch (student.newStatus) {
                  case 'ACCEPTED': acc[majorKey].approved++; break
                  case 'WAITLIST': acc[majorKey].waitlist++; break
                  case 'REJECTED': acc[majorKey].rejected++; break
                }
              }
            })
            
            return acc
          }, {})
        }
      }
    })
  } catch (error) {
    console.error('Error in bulk process by ranking:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat melakukan pemrosesan berdasarkan ranking' },
      { status: 500 }
    )
  }
}

// GET /api/students/bulk-process/by-ranking - Get ranking preview
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
        { error: 'Akses ditolak. Hanya admin yang dapat melihat preview ranking.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const major = searchParams.get('major') || 'ALL'
    const rankMin = searchParams.get('rankMin')
    const rankMax = searchParams.get('rankMax')

    let whereClause: any = {
      ranking: {
        isNot: null
      }
    }

    // Filter by major if specified
    if (major && major !== 'ALL') {
      whereClause.selectedMajor = major
    }

    // Get students with ranking
    const studentsWithRanking = await prisma.student.findMany({
      where: whereClause,
      include: {
        ranking: true,
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    })

    if (studentsWithRanking.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Tidak ada siswa dengan data ranking yang ditemukan',
        data: {
          students: [],
          summary: {},
          filters: { major, rankMin, rankMax }
        }
      })
    }

    // Calculate real-time rankings
    const rankings = createMajorRankings(studentsWithRanking as StudentWithRanking[])
    
    // Filter by rank range if specified
    const allRankings = Object.values(rankings).flat()
    let filteredRankings = allRankings
    if (rankMin || rankMax) {
      const min = rankMin ? parseInt(rankMin) : 1
      const max = rankMax ? parseInt(rankMax) : Infinity
      filteredRankings = allRankings.filter(r => r.rank >= min && r.rank <= max)
    }

    // Get detailed student info with status prediction
    const studentsPreview = filteredRankings.map(ranking => {
      const student = studentsWithRanking.find((s: { id: string }) => s.id === ranking.studentId)
      const realTimeStatus = getStudentAcceptanceStatus(ranking.studentId, rankings)
      
      if (!student || !realTimeStatus) return null

      const mapRealTimeToDbStatus = (status: string) => {
        switch (status) {
          case 'DITERIMA': return 'APPROVED'
          case 'CADANGAN': return 'WAITLIST'
          case 'TIDAK_DITERIMA': return 'REJECTED'
          default: return 'PENDING'
        }
      }

      const predictedStatus = mapRealTimeToDbStatus(realTimeStatus.status)
      const currentStatus = student.finalStatus
      const statusWillChange = currentStatus !== predictedStatus

      return {
        studentId: student.id,
        studentName: student.fullName,
        nisn: student.nisn,
        currentStatus,
        predictedStatus,
        statusWillChange,
        rank: ranking.rank,
        totalScore: ranking.totalScore,
        major: realTimeStatus.major,
        scores: {
          mathScore: student.ranking?.mathScore || 0,
          indonesianScore: student.ranking?.indonesianScore || 0,
          englishScore: student.ranking?.englishScore || 0,
          scienceScore: student.ranking?.scienceScore || 0,
          academicAchievement: student.ranking?.academicAchievement || "none",
          nonAcademicAchievement: student.ranking?.nonAcademicAchievement || "none",
          certificateScore: student.ranking?.certificateScore || "none"
        }
      }
    }).filter(Boolean)

    // Create summary
    const summary = {
      total: studentsPreview.length,
      willChange: studentsPreview.filter(s => s?.statusWillChange).length,
      noChange: studentsPreview.filter(s => !s?.statusWillChange).length,
      byStatus: {
        current: studentsPreview.reduce((acc: any, s: any) => {
          acc[s.currentStatus] = (acc[s.currentStatus] || 0) + 1
          return acc
        }, {}),
        predicted: studentsPreview.reduce((acc: any, s: any) => {
          acc[s.predictedStatus] = (acc[s.predictedStatus] || 0) + 1
          return acc
        }, {})
      },
      byMajor: allRankings.reduce((acc: any, ranking: any) => {
        const major = ranking.selectedMajor
        if (!acc[major]) {
          acc[major] = {
            total: 0,
            quota: MAJOR_QUOTAS[major as keyof typeof MAJOR_QUOTAS] || 0,
            approved: 0,
            waitlist: 0,
            rejected: 0
          }
        }
        acc[major].total++
        
        const student = studentsPreview.find(s => s?.studentId === ranking.studentId)
        if (student) {
          switch (student.predictedStatus) {
            case 'APPROVED': acc[major].approved++; break
            case 'WAITLIST': acc[major].waitlist++; break
            case 'REJECTED': acc[major].rejected++; break
          }
        }
        
        return acc
      }, {})
    }

    return NextResponse.json({
      success: true,
      message: 'Preview ranking berhasil dimuat',
      data: {
        students: studentsPreview,
        summary,
        filters: { major, rankMin, rankMax }
      }
    })
  } catch (error) {
    console.error('Error getting ranking preview:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memuat preview ranking' },
      { status: 500 }
    )
  }
}