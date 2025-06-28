import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createMajorRankings, getStudentAcceptanceStatus } from '@/lib/ranking'
import { StudentWithRanking } from '@/types'

// POST /api/students/[id]/process - Process individual student status
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { error: 'Akses ditolak. Hanya admin yang dapat memproses status siswa.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action, status, reason } = body

    // Validate input
    if (!action) {
      return NextResponse.json(
        { error: 'Action harus diisi' },
        { status: 400 }
      )
    }

    // Check if student exists
    const student = await prisma.student.findUnique({
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

    if (!student) {
      return NextResponse.json(
        { error: 'Siswa tidak ditemukan' },
        { status: 404 }
      )
    }

    let updatedStudent
    let logMessage = ''

    if (action === 'update_status') {
      // Manual status update
      if (!status || !['PENDING', 'APPROVED', 'WAITLIST', 'REJECTED'].includes(status)) {
        return NextResponse.json(
          { error: 'Status tidak valid' },
          { status: 400 }
        )
      }

      updatedStudent = await prisma.student.update({
        where: { id: params.id },
        data: {
          finalStatus: status,
          updatedAt: new Date()
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

      logMessage = `Status siswa ${student.fullName} diubah menjadi ${status} secara manual`
      if (reason) {
        logMessage += ` dengan alasan: ${reason}`
      }

    } else if (action === 'auto_process') {
      // Auto process based on ranking
      if (!student.ranking) {
        return NextResponse.json(
          { error: 'Siswa belum memiliki data ranking' },
          { status: 400 }
        )
      }

      // Get all students for real-time calculation
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
      
      // Get student's real-time status
      const realTimeStatus = getStudentAcceptanceStatus(student.id, rankings)
      
      if (!realTimeStatus) {
        return NextResponse.json(
          { error: 'Tidak dapat menghitung status real-time siswa' },
          { status: 400 }
        )
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

      updatedStudent = await prisma.student.update({
        where: { id: params.id },
        data: {
          finalStatus: newStatus,
          updatedAt: new Date()
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

      logMessage = `Status siswa ${student.fullName} diproses otomatis menjadi ${newStatus} berdasarkan ranking (Peringkat: ${realTimeStatus.rank}, Skor: ${realTimeStatus.totalScore})`

    } else if (action === 'reset_status') {
      // Reset status to PENDING
      updatedStudent = await prisma.student.update({
        where: { id: params.id },
        data: {
          finalStatus: 'PENDING',
          updatedAt: new Date()
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

      logMessage = `Status siswa ${student.fullName} direset ke PENDING`
      if (reason) {
        logMessage += ` dengan alasan: ${reason}`
      }

    } else {
      return NextResponse.json(
        { error: 'Action tidak valid' },
        { status: 400 }
      )
    }

    // Create process log
    await prisma.studentProcessLog.create({
      data: {
        studentId: student.id,
        action: action,
        reason: reason || null,
        processedBy: session.user.id
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Pemrosesan siswa berhasil',
      data: {
        student: updatedStudent,
        action,
        previousStatus: student.finalStatus,
        newStatus: updatedStudent.finalStatus,
        processLog: logMessage
      }
    })
  } catch (error) {
    console.error('Error processing student:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memproses siswa' },
      { status: 500 }
    )
  }
}

// GET /api/students/[id]/process - Get processing history for student
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { error: 'Akses ditolak. Hanya admin yang dapat melihat riwayat pemrosesan.' },
        { status: 403 }
      )
    }

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        fullName: true,
        finalStatus: true
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Siswa tidak ditemukan' },
        { status: 404 }
      )
    }

    // Get process logs for this student
    const processLogs = await prisma.studentProcessLog.findMany({
      where: {
        studentId: params.id
      },
      include: {
        processor: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        student: {
          id: student.id,
          fullName: student.fullName,
          currentStatus: student.finalStatus
        },
        processHistory: processLogs
      }
    })
  } catch (error) {
    console.error('Error fetching process history:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil riwayat pemrosesan' },
      { status: 500 }
    )
  }
}