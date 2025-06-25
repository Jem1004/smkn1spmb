import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import bcrypt from 'bcryptjs'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date utility
export function formatDate(date: string | Date): string {
  if (!date) return '-'
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) return '-'
  
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj)
}

// Calculate age utility
export function calculateAge(birthDate: string | Date): number {
  if (!birthDate) return 0
  
  const dateObj = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
  
  if (isNaN(dateObj.getTime())) return 0
  
  const today = new Date()
  let age = today.getFullYear() - dateObj.getFullYear()
  const monthDiff = today.getMonth() - dateObj.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateObj.getDate())) {
    age--
  }
  
  return age
}

// Registration status utilities
export function getRegistrationStatusText(status: string): string {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'Menunggu'
    case 'approved':
      return 'Diterima'
    case 'rejected':
      return 'Ditolak'
    case 'completed':
      return 'Selesai'
    default:
      return 'Tidak Diketahui'
  }
}

export function getRegistrationStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    case 'completed':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Calculate total score for ranking
export function calculateTotalScore(data: {
  mathScore?: number
  indonesianScore?: number
  englishScore?: number
  scienceScore?: number
  academicAchievement?: string
  nonAcademicAchievement?: string
  certificateScore?: string
  accreditation?: string
}): number {
  const academicAverage = (
    (data.mathScore || 0) * 0.25 +
    (data.indonesianScore || 0) * 0.25 +
    (data.englishScore || 0) * 0.25 +
    (data.scienceScore || 0) * 0.25
  )
  
  const getAchievementPoints = (level: string): number => {
    switch (level) {
      case 'sekolah': return 5
      case 'kecamatan': return 10
      case 'kabupaten': return 15
      case 'provinsi': return 20
      case 'nasional': return 25
      case 'internasional': return 30
      default: return 0
    }
  }
  
  const getAccreditationPoints = (accreditation: string): number => {
    switch (accreditation) {
      case 'A': return 10
      case 'B': return 5
      case 'C':
      case 'Belum Terakreditasi':
      default: return 0
    }
  }
  
  const achievementPoints = (
    getAchievementPoints(data.academicAchievement || 'none') +
    getAchievementPoints(data.nonAcademicAchievement || 'none') +
    getAchievementPoints(data.certificateScore || 'none')
  )
  
  const accreditationPoints = getAccreditationPoints(data.accreditation || 'Belum Terakreditasi')
  
  return Math.round((academicAverage + achievementPoints + accreditationPoints) * 100) / 100
}

// Generate username from full name
export function generateUsername(fullName: string): string {
  if (!fullName) return 'user' + Date.now()
  
  // Remove special characters and spaces, convert to lowercase
  const cleanName = fullName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 10)
  
  // Add random numbers to ensure uniqueness
  const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  
  return cleanName + randomSuffix
}

// Generate random password
export function generatePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let password = ''
  
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return password
}

// Hash password using bcrypt
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

// Update all rankings helper function
export async function updateAllRankings() {
  const { prisma } = await import('@/lib/prisma')
  
  try {
    // Get all rankings ordered by total score
    const rankings = await prisma.ranking.findMany({
      orderBy: { totalScore: 'desc' }
    })

    // Update rank for each ranking
    const updatePromises = rankings.map((ranking, index) => 
      prisma.ranking.update({
        where: { id: ranking.id },
        data: { rank: index + 1 }
      })
    )

    await Promise.all(updatePromises)
  } catch (error) {
    console.error('Error updating rankings:', error)
  }
}
