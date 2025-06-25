import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { 
  getComprehensiveRankingData,
  getMajorRankingData,
  getStudentRanking,
  getMajorCompetitionAnalysis,
  exportRankingDataToCSV,
  simulateAcceptanceProcess
} from '@/lib/ranking-manager'
import { Student } from '@/types'

// GET /api/ranking - Get ranking data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'comprehensive'
    const majorCode = searchParams.get('major')
    const studentId = searchParams.get('studentId')
    const format = searchParams.get('format')

    // Fetch students data
    const studentsData = await prisma.student.findMany({
      include: {
        ranking: true,
        user: true
      }
    })

    // Transform to Student type
    const students: Student[] = studentsData.map(student => ({
      id: student.id,
      userId: student.userId,
      fullName: student.fullName,
      birthPlace: student.birthPlace,
      birthDate: student.birthDate,
      gender: student.gender,
      religion: student.religion,
      nationality: student.nationality,
      address: student.address,
      rt: student.rt || undefined,
      rw: student.rw || undefined,
      village: student.village || undefined,
      district: student.district,
      city: student.city,
      province: student.province,
      postalCode: student.postalCode,
      phoneNumber: student.phoneNumber || undefined,
      email: student.email || undefined,
      childOrder: student.childOrder,
      totalSiblings: student.totalSiblings,
      height: student.height || undefined,
      weight: student.weight || undefined,
      medicalHistory: student.medicalHistory || undefined,
      fatherName: student.fatherName,
      fatherJob: student.fatherJob || undefined,
      fatherEducation: student.fatherEducation || undefined,
      motherName: student.motherName,
      motherJob: student.motherJob || undefined,
      motherEducation: student.motherEducation || undefined,
      guardianName: student.guardianName || undefined,
      guardianJob: student.guardianJob || undefined,
      parentPhone: student.parentPhone || undefined,
      parentAddress: student.parentAddress || undefined,
      schoolName: student.schoolName,
      npsn: student.npsn || undefined,
      nisn: student.nisn || undefined,
      graduationYear: student.graduationYear,
      certificateNumber: student.certificateNumber || undefined,
      selectedMajor: student.selectedMajor,
      hasIjazah: student.hasIjazah,
      hasSKHUN: student.hasSKHUN,
      hasKK: student.hasKK,
      hasAktaLahir: student.hasAktaLahir,
      hasFoto: student.hasFoto,
      hasRaport: student.hasRaport,
      hasSertifikat: student.hasSertifikat,
      registrationStatus: student.registrationStatus,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt
    }))

    // Handle different request types
    switch (type) {
      case 'comprehensive':
        const comprehensiveData = getComprehensiveRankingData(students)
        return NextResponse.json(comprehensiveData)

      case 'major':
        if (!majorCode) {
          return NextResponse.json(
            { error: 'Major code is required for major ranking' },
            { status: 400 }
          )
        }
        const majorData = getMajorRankingData(majorCode, students)
        if (!majorData) {
          return NextResponse.json(
            { error: 'No data found for the specified major' },
            { status: 404 }
          )
        }
        return NextResponse.json(majorData)

      case 'student':
        if (!studentId) {
          return NextResponse.json(
            { error: 'Student ID is required for student ranking' },
            { status: 400 }
          )
        }
        const studentRanking = getStudentRanking(studentId, students)
        return NextResponse.json(studentRanking)

      case 'competition':
        const competitionAnalysis = getMajorCompetitionAnalysis(students)
        return NextResponse.json(competitionAnalysis)

      case 'export':
        const csvData = exportRankingDataToCSV(students, majorCode || undefined)
        
        if (format === 'download') {
          const filename = majorCode 
            ? `ranking_${majorCode}_${new Date().toISOString().split('T')[0]}.csv`
            : `ranking_all_${new Date().toISOString().split('T')[0]}.csv`
          
          return new NextResponse(csvData, {
            headers: {
              'Content-Type': 'text/csv',
              'Content-Disposition': `attachment; filename="${filename}"`
            }
          })
        }
        
        return NextResponse.json({ csvData })

      case 'simulation':
        const simulation = simulateAcceptanceProcess(students)
        return NextResponse.json(simulation)

      default:
        return NextResponse.json(
          { error: 'Invalid request type' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error fetching ranking data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/ranking - Simulate acceptance with custom quotas
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { customQuotas, action } = body

    // Fetch students data
    const studentsData = await prisma.student.findMany({
      include: {
        ranking: true,
        user: true
      }
    })

    // Transform to Student type
      const students: Student[] = studentsData.map(student => ({
        id: student.id,
        userId: student.userId,
        fullName: student.fullName,
        birthPlace: student.birthPlace,
        birthDate: student.birthDate,
        gender: student.gender,
        religion: student.religion,
        nationality: student.nationality,
        address: student.address,
        rt: student.rt || undefined,
        rw: student.rw || undefined,
        village: student.village || undefined,
        district: student.district,
        city: student.city,
        province: student.province,
        postalCode: student.postalCode,
        phoneNumber: student.phoneNumber || undefined,
        email: student.email || undefined,
        childOrder: student.childOrder,
        totalSiblings: student.totalSiblings,
        height: student.height || undefined,
        weight: student.weight || undefined,
        medicalHistory: student.medicalHistory || undefined,
        fatherName: student.fatherName,
        fatherJob: student.fatherJob || undefined,
        fatherEducation: student.fatherEducation || undefined,
        motherName: student.motherName,
        motherJob: student.motherJob || undefined,
        motherEducation: student.motherEducation || undefined,
        guardianName: student.guardianName || undefined,
        guardianJob: student.guardianJob || undefined,
        parentPhone: student.parentPhone || undefined,
        parentAddress: student.parentAddress || undefined,
        schoolName: student.schoolName,
        npsn: student.npsn || undefined,
        nisn: student.nisn || undefined,
        graduationYear: student.graduationYear,
        certificateNumber: student.certificateNumber || undefined,
        selectedMajor: student.selectedMajor,
        hasIjazah: student.hasIjazah,
        hasSKHUN: student.hasSKHUN,
        hasKK: student.hasKK,
        hasAktaLahir: student.hasAktaLahir,
        hasFoto: student.hasFoto,
        hasRaport: student.hasRaport,
        hasSertifikat: student.hasSertifikat,
        registrationStatus: student.registrationStatus,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt
      }))

    if (action === 'simulate') {
      const simulation = simulateAcceptanceProcess(students, customQuotas)
      return NextResponse.json(simulation)
    }

    if (action === 'apply') {
      // Apply the simulation results to actual student status
      const simulation = simulateAcceptanceProcess(students, customQuotas)
      
      // Update student statuses in database
      const updatePromises: Promise<any>[] = []
      
      Object.entries(simulation.results).forEach(([majorCode, results]) => {
        // Update accepted students
        results.accepted.forEach(student => {
          updatePromises.push(
            prisma.student.update({
              where: { id: student.studentId },
              data: { registrationStatus: 'APPROVED' }
            })
          )
        })
        
        // Update waitlist students
        results.waitlist.forEach(student => {
          updatePromises.push(
            prisma.student.update({
              where: { id: student.studentId },
              data: { registrationStatus: 'PENDING' }
            })
          )
        })
        
        // Update rejected students
        results.rejected.forEach(student => {
          updatePromises.push(
            prisma.student.update({
              where: { id: student.studentId },
              data: { registrationStatus: 'REJECTED' }
            })
          )
        })
      })
      
      await Promise.all(updatePromises)
      
      return NextResponse.json({
        message: 'Acceptance process applied successfully',
        summary: simulation.summary
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error processing ranking request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}