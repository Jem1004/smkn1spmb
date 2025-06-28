import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

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

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Username dan password harus diisi')
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              username: credentials.username
            }
          })

          if (!user) {
            throw new Error('Username atau password salah')
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            throw new Error('Username atau password salah')
          }

          // Return user object to be stored in session
          return {
            id: user.id,
            username: user.username,
            role: user.role,
            email: `${user.username}@smk.edu`,
            name: user.username
          }
        } catch (error) {
          console.error('Login error:', error)
          throw error
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.role = token.role as 'ADMIN' | 'STUDENT'
      }
      return session
    }
  },
  pages: {
    signIn: '/login'
  },
  session: {
    strategy: 'jwt'
  }
}