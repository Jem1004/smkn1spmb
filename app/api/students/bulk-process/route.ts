import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createMajorRankings, getStudentAcceptanceStatus } from '@/lib/ranking'
import { StudentWithRanking } from '@/types'

// POST /api/students/bulk-process - Bulk process students
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
        { error: 'Akses ditolak. Hanya admin yang dapat melakukan pemrosesan massal.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action, studentIds, status, reason, filters } = body

    // Validate input
    if (!action) {
      return NextResponse.json(
        { error: 'Action harus diisi' },
        { status: 400 }
      )
    }

    let targetStudents: any[] = []
    let processedCount = 0
    let errors: string[] = []
    let results: any[] = []

    if (action === 'update_status_bulk') {
      // Bulk status update for specific students
      if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        return NextResponse.json(
          { error: 'Student IDs harus diisi dan berupa array' },
          { status: 400 }
        )
      }

      if (!status || !['PENDING', 'APPROVED', 'WAITLIST', 'REJECTED'].includes(status)) {
        return NextResponse.json(
          { error: 'Status tidak valid' },
          { status: 400 }
        )
      }

      // Get target students
      targetStudents = await prisma.student.findMany({
        where: {
          id: {
            in: studentIds
          }
        },
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

      // Process each student
      for (const student of targetStudents) {
        try {
          const previousStatus = student.finalStatus
          
          const updatedStudent = await prisma.student.update({
            where: { id: student.id },
            data: {
              finalStatus: status,
              updatedAt: new Date()
            }
          })

          // Process log would be created here if needed

          results.push({
            studentId: student.id,
            studentName: student.fullName,
            previousStatus,
            newStatus: status,
            success: true
          })

          processedCount++
        } catch (error) {
          console.error(`Error processing student ${student.id}:`, error)
          errors.push(`Gagal memproses siswa ${student.fullName}: ${error}`)
          
          results.push({
            studentId: student.id,
            studentName: student.fullName,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

    } else if (action === 'auto_process_all') {
      // Auto process all students based on ranking
      
      // Get all students with ranking
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
              username: true
            }
          }
        }
      })

      if (allStudents.length === 0) {
        return NextResponse.json(
          { error: 'Tidak ada siswa dengan data ranking untuk diproses' },
          { status: 400 }
        )
      }

      // Calculate real-time rankings
      const rankings = createMajorRankings(allStudents as StudentWithRanking[])
      
      // Process each student
      for (const student of allStudents) {
        try {
          const realTimeStatus = getStudentAcceptanceStatus(student.id, rankings)
          
          if (!realTimeStatus) {
            errors.push(`Tidak dapat menghitung status untuk siswa ${student.fullName}`)
            continue
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

          // Only update if status changed
          if (previousStatus !== newStatus) {
            await prisma.student.update({
              where: { id: student.id },
              data: {
                finalStatus: newStatus,
                updatedAt: new Date()
              }
            })

            // Process log would be created here if needed

            results.push({
              studentId: student.id,
              studentName: student.fullName,
              previousStatus,
              newStatus,
              rank: realTimeStatus.rank,
              totalScore: realTimeStatus.totalScore,
              major: realTimeStatus.major,
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
              success: true,
              note: 'Status tidak berubah'
            })
          }
        } catch (error) {
          console.error(`Error processing student ${student.id}:`, error)
          errors.push(`Gagal memproses siswa ${student.fullName}: ${error}`)
          
          results.push({
            studentId: student.id,
            studentName: student.fullName,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

    } else if (action === 'reset_status_bulk') {
      // Reset status to PENDING for filtered students
      let whereClause: any = {}

      if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
        whereClause.id = { in: studentIds }
      } else if (filters) {
        // Apply filters
        if (filters.major && filters.major !== 'ALL') {
          whereClause.selectedMajor = filters.major
        }
        if (filters.status && filters.status !== 'ALL') {
          whereClause.finalStatus = filters.status
        }
        if (filters.hasRanking === true) {
          whereClause.ranking = { isNot: null }
        } else if (filters.hasRanking === false) {
          whereClause.ranking = null
        }
      }

      // Get target students
      targetStudents = await prisma.student.findMany({
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

      // Process each student
      for (const student of targetStudents) {
        try {
          const previousStatus = student.finalStatus
          
          if (previousStatus !== 'PENDING') {
            await prisma.student.update({
              where: { id: student.id },
              data: {
                finalStatus: 'PENDING',
                updatedAt: new Date()
              }
            })

            // Process log would be created here if needed

            results.push({
              studentId: student.id,
              studentName: student.fullName,
              previousStatus,
              newStatus: 'PENDING',
              success: true
            })

            processedCount++
          } else {
            results.push({
              studentId: student.id,
              studentName: student.fullName,
              status: 'PENDING',
              success: true,
              note: 'Status sudah PENDING'
            })
          }
        } catch (error) {
          console.error(`Error processing student ${student.id}:`, error)
          errors.push(`Gagal memproses siswa ${student.fullName}: ${error}`)
          
          results.push({
            studentId: student.id,
            studentName: student.fullName,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

    } else {
      return NextResponse.json(
        { error: 'Action tidak valid' },
        { status: 400 }
      )
    }

    // Create summary log
    // Process log would be created here if needed

    return NextResponse.json({
      success: true,
      message: `Pemrosesan massal selesai: ${processedCount} siswa berhasil diproses`,
      data: {
        action,
        totalTargeted: targetStudents.length,
        processedCount,
        errorCount: errors.length,
        results,
        errors
      }
    })
  } catch (error) {
    console.error('Error in bulk process:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat melakukan pemrosesan massal' },
      { status: 500 }
    )
  }
}

// PUT /api/students/bulk-process - Update bulk process settings
export async function PUT(request: NextRequest) {
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
        { error: 'Akses ditolak. Hanya admin yang dapat mengubah pengaturan pemrosesan massal.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action, enabled, schedule } = body

    if (action === 'toggle_auto_process') {
      // This would typically update a settings table
      // For now, we'll just return success
      
      // Process log would be created here if needed

      return NextResponse.json({
        success: true,
        message: `Auto process berhasil ${enabled ? 'diaktifkan' : 'dinonaktifkan'}`,
        data: {
          enabled,
          schedule
        }
      })
    }

    return NextResponse.json(
      { error: 'Action tidak valid' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error updating bulk process settings:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengubah pengaturan' },
      { status: 500 }
    )
  }
}