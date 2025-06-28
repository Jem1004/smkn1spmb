import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { ApiResponse, AuthSession, Role } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { username, password, role } = await request.json()

    // Validasi input
    if (!username || !password || !role) {
      return NextResponse.json({
        success: false,
        message: 'Username, password, dan role harus diisi'
      } as ApiResponse, { status: 400 })
    }

    // Cari user berdasarkan username dan role 
    const user = await prisma.user.findFirst({
      where: {
        username,
        role: role as 'ADMIN' | 'STUDENT'
      },
      include: {
        student: true
      }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Username atau password salah'
      } as ApiResponse, { status: 401 })
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        message: 'Username atau password salah'
      } as ApiResponse, { status: 401 })
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    )

    const authSession: AuthSession = {
      user: {
        id: user.id,
        username: user.username,
        role: user.role as Role
      },
      token
    }

    return NextResponse.json({
      success: true,
      data: authSession,
      message: 'Login berhasil'
    } as ApiResponse<AuthSession>)

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan server'
    } as ApiResponse, { status: 500 })
  }
}