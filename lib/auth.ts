import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export interface JWTPayload {
  userId: string
  username: string
  role: 'ADMIN' | 'STUDENT'
  iat: number
  exp: number
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret'
    ) as JWTPayload
    return decoded
  } catch (error) {
    return null
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}

export async function authenticateRequest(request: NextRequest) {
  const token = getTokenFromRequest(request)
  
  if (!token) {
    return { success: false, error: 'Token tidak ditemukan' }
  }

  const payload = verifyToken(token)
  if (!payload) {
    return { success: false, error: 'Token tidak valid' }
  }

  // Verifikasi user masih ada di database
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      username: true,
      role: true
    }
  })

  if (!user) {
    return { success: false, error: 'User tidak ditemukan' }
  }

  return {
    success: true,
    user,
    payload
  }
}

export function requireRole(allowedRoles: ('ADMIN' | 'STUDENT')[]) {
  return (user: { role: 'ADMIN' | 'STUDENT' }) => {
    return allowedRoles.includes(user.role)
  }
}

export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs')
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs')
  return bcrypt.compare(password, hash)
}