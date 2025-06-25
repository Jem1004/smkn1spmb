import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/students/me - Get current student's data
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

    // Check if user is student
    if (session.user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya siswa yang dapat mengakses.' },
        { status: 403 }
      )
    }

    // Get student data with ranking
    const student = await prisma.student.findUnique({
      where: {
        userId: session.user.id
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
        { error: 'Student data not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      student
    })
  } catch (error) {
    console.error('Error fetching student data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/students/me - Update current student's data (limited fields)
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

    // Check if user is student
    if (session.user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya siswa yang dapat mengakses.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Only allow updating specific fields
    const allowedFields = [
      'address',
      'postalCode', 
      'phone',
      'email',
      'fatherPhone',
      'motherPhone',
      'parentAddress'
    ]
    
    const updateData: any = {}
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Update student data
    const updatedStudent = await prisma.student.update({
      where: {
        userId: session.user.id
      },
      data: updateData,
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
      message: 'Student data updated successfully',
      student: updatedStudent
    })
  } catch (error) {
    console.error('Error updating student data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}