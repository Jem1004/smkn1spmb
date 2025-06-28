import { Student, MajorType } from '@/types'
import { 
  createMajorRankings, 
  getMajorStatistics, 
  StudentRanking,
  AcceptanceStatus 
} from './ranking'
import { getCurrentQuotas, getMajorQuotaInfo } from './quota-manager'

export interface RankingStatistics {
  totalStudents: number
  totalAccepted: number
  totalRejected: number
  averageScore: number
  highestScore: number
  lowestScore: number
  competitionRatio: number
}

export interface MajorRankingData {
  majorCode: string
  majorName: string
  rankings: StudentRanking[]
  statistics: {
    totalApplicants: number
    accepted: number
    rejected: number
    quota: number
    highestScore: number
    lowestAcceptedScore: number
    competitionRatio: number
  }
  quotaInfo: {
    quota: number
    reserve: number
    capacity: number
    utilizationRate: number
    isOversubscribed: boolean
  }
}

/**
 * Get comprehensive ranking data for all majors
 */
export async function getComprehensiveRankingData(students: Student[]): Promise<{
  rankings: Record<MajorType, StudentRanking[]>
  majorData: MajorRankingData[]
  overallStatistics: RankingStatistics
}> {
  const rankings = createMajorRankings(students)
  const quotas = await getCurrentQuotas()
  const majorData: MajorRankingData[] = []
  
  let totalAccepted = 0
  let totalRejected = 0
  let allScores: number[] = []
  
  const allMajorStats = getMajorStatistics(rankings)
  
  Object.entries(rankings).forEach(([majorCode, majorRankings]) => {
    const majorStats = allMajorStats[majorCode as MajorType]
    const quotaInfo = getMajorQuotaInfo(majorCode, majorRankings.length, quotas)
    
    totalAccepted += majorStats.accepted
    totalRejected += majorStats.rejected
    
    majorRankings.forEach(student => allScores.push(student.totalScore))
    
    majorData.push({
      majorCode,
      majorName: getMajorName(majorCode),
      rankings: majorRankings,
      statistics: {
        ...majorStats,
        competitionRatio: majorRankings.length / (quotas[majorCode] || 1)
      },
      quotaInfo: {
        quota: quotaInfo.quota,
        reserve: quotaInfo.reserve,
        capacity: quotaInfo.capacity,
        utilizationRate: (majorRankings.length / quotaInfo.capacity) * 100,
        isOversubscribed: quotaInfo.isOversubscribed
      }
    })
  })
  
  const overallStatistics: RankingStatistics = {
    totalStudents: students.length,
    totalAccepted,
    totalRejected,
    averageScore: allScores.length > 0 ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length : 0,
    highestScore: allScores.length > 0 ? Math.max(...allScores) : 0,
    lowestScore: allScores.length > 0 ? Math.min(...allScores) : 0,
    competitionRatio: students.length / Object.values(quotas).reduce((sum, quota) => sum + quota, 0)
  }
  
  return {
    rankings,
    majorData,
    overallStatistics
  }
}

/**
 * Get ranking data for a specific major
 */
export async function getMajorRankingData(majorCode: string, students: Student[]): Promise<MajorRankingData | null> {
  const majorStudents = students.filter(student => student.selectedMajor === majorCode)
  if (majorStudents.length === 0) return null
  
  const rankings = createMajorRankings(students)
  const majorRankings = rankings[majorCode as MajorType] || []
  const quotas = await getCurrentQuotas()
  const allMajorStats = getMajorStatistics(rankings)
  const majorStats = allMajorStats[majorCode as MajorType]
  const quotaInfo = getMajorQuotaInfo(majorCode, majorRankings.length, quotas)
  
  return {
    majorCode,
    majorName: getMajorName(majorCode),
    rankings: majorRankings,
    statistics: {
      ...majorStats,
      competitionRatio: majorRankings.length / (quotas[majorCode] || 1)
    },
    quotaInfo: {
      quota: quotaInfo.quota,
      reserve: quotaInfo.reserve,
      capacity: quotaInfo.capacity,
      utilizationRate: (majorRankings.length / quotaInfo.capacity) * 100,
      isOversubscribed: quotaInfo.isOversubscribed
    }
  }
}

/**
 * Get student ranking across all majors
 */
export async function getStudentRanking(studentId: string, students: Student[]): Promise<{
  student: StudentRanking | null
  majorRanking: number
  overallRanking: number
  status: AcceptanceStatus
  majorData: MajorRankingData | null
}> {
  const rankings = createMajorRankings(students)
  let studentRanking: StudentRanking | null = null
  let majorCode = ''
  
  // Find student in rankings
  Object.entries(rankings).forEach(([major, majorRankings]) => {
    const found = majorRankings.find(s => s.studentId === studentId)
    if (found) {
      studentRanking = found
      majorCode = major
    }
  })
  
  if (!studentRanking) {
    return {
      student: null,
      majorRanking: 0,
      overallRanking: 0,
      status: 'TIDAK_DITERIMA',
      majorData: null
    }
  }
  
  // Calculate overall ranking
  const allStudents = Object.values(rankings).flat()
    .sort((a, b) => b.totalScore - a.totalScore)
  const overallRanking = allStudents.findIndex(s => s.studentId === studentId) + 1
  
  const majorData = await getMajorRankingData(majorCode, students)
  
  return {
    student: studentRanking,
    majorRanking: (studentRanking as StudentRanking).rank,
    overallRanking,
    status: (studentRanking as StudentRanking).status,
    majorData
  }
}

/**
 * Get top performers across all majors
 */
export function getTopPerformers(students: Student[], limit: number = 10): StudentRanking[] {
  const rankings = createMajorRankings(students)
  const allStudents = Object.values(rankings).flat()
    .sort((a, b) => b.totalScore - a.totalScore)
  
  return allStudents.slice(0, limit)
}

/**
 * Get students by status
 */
export function getStudentsByStatus(students: Student[], status: AcceptanceStatus): StudentRanking[] {
  const rankings = createMajorRankings(students)
  const allStudents = Object.values(rankings).flat()
  
  return allStudents.filter(student => student.status === status)
}

/**
 * Get major competition analysis
 */
export async function getMajorCompetitionAnalysis(students: Student[]): Promise<{
  majorCode: string
  majorName: string
  applicants: number
  quota: number
  competitionRatio: number
  averageScore: number
  cutoffScore: number
  difficulty: 'Sangat Mudah' | 'Mudah' | 'Sedang' | 'Sulit' | 'Sangat Sulit'
}[]> {
  const { majorData } = await getComprehensiveRankingData(students)
  
  return majorData.map(data => {
    const averageScore = data.rankings.length > 0 
      ? data.rankings.reduce((sum, s) => sum + s.totalScore, 0) / data.rankings.length 
      : 0
    
    const acceptedStudents = data.rankings.filter(s => s.status === 'DITERIMA')
    const cutoffScore = acceptedStudents.length > 0 
      ? Math.min(...acceptedStudents.map(s => s.totalScore))
      : 0
    
    let difficulty: 'Sangat Mudah' | 'Mudah' | 'Sedang' | 'Sulit' | 'Sangat Sulit'
    if (data.statistics.competitionRatio <= 1.2) difficulty = 'Sangat Mudah'
    else if (data.statistics.competitionRatio <= 2) difficulty = 'Mudah'
    else if (data.statistics.competitionRatio <= 3) difficulty = 'Sedang'
    else if (data.statistics.competitionRatio <= 5) difficulty = 'Sulit'
    else difficulty = 'Sangat Sulit'
    
    return {
      majorCode: data.majorCode,
      majorName: data.majorName,
      applicants: data.rankings.length,
      quota: data.quotaInfo.quota,
      competitionRatio: data.statistics.competitionRatio,
      averageScore,
      cutoffScore,
      difficulty
    }
  }).sort((a, b) => b.competitionRatio - a.competitionRatio)
}

/**
 * Export ranking data to CSV
 */
export async function exportRankingDataToCSV(students: Student[], majorCode?: string): Promise<string> {
  const { rankings } = await getComprehensiveRankingData(students)
  
  let dataToExport: StudentRanking[]
  if (majorCode && rankings[majorCode as MajorType]) {
    dataToExport = rankings[majorCode as MajorType]
  } else {
    dataToExport = Object.values(rankings).flat()
      .sort((a, b) => b.totalScore - a.totalScore)
  }
  
  const headers = [
    'Ranking',
    'NISN',
    'Nama Lengkap',
    'Jurusan Pilihan',
    'Total Skor',
    'Nilai Akademik',
    'Prestasi Akademik',
    'Prestasi Non-Akademik',
    'Sertifikat',
    'Akreditasi',
    'Status Penerimaan'
  ]
  
  const rows = dataToExport.map(student => [
    student.rank.toString(),
    student.nisn,
    student.fullName,
    getMajorName(student.selectedMajor),
    student.totalScore.toFixed(2),
    student.academicScore.toFixed(2),
    student.academicAchievementPoints.toString(),
    student.nonAcademicAchievementPoints.toString(),
    student.certificatePoints.toString(),
    student.accreditationPoints.toString(),
    student.status
  ])
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')
  
  return csvContent
}

/**
 * Helper function to get major name
 */
function getMajorName(majorCode: string): string {
  // Return the major code as is since AVAILABLE_MAJORS contains full names
  return majorCode
}

/**
 * Simulate acceptance process based on current quotas
 */
export async function simulateAcceptanceProcess(students: Student[], customQuotas?: Record<string, number>): Promise<{
  results: Record<string, {
    accepted: StudentRanking[]
    waitlist: StudentRanking[]
    rejected: StudentRanking[]
  }>
  summary: {
    totalAccepted: number
    totalRejected: number
    quotaUtilization: number
  }
}> {
  const quotas = customQuotas || await getCurrentQuotas()
  const rankings = createMajorRankings(students)
  const results: Record<string, {
    accepted: StudentRanking[]
    waitlist: StudentRanking[]
    rejected: StudentRanking[]
  }> = {}
  
  let totalAccepted = 0
  let totalRejected = 0
  let totalQuota = 0
  
  Object.entries(rankings).forEach(([majorCode, majorRankings]) => {
    const quota = quotas[majorCode] || 0
    const reserveQuota = Math.ceil(quota * 0.1)
    
    totalQuota += quota
    
    const accepted = majorRankings.slice(0, quota)
    const waitlist = majorRankings.slice(quota, quota + reserveQuota)
    const rejected = majorRankings.slice(quota + reserveQuota)
    
    totalAccepted += accepted.length
    totalRejected += rejected.length
    
    results[majorCode] = { accepted, waitlist, rejected }
  })
  
  return {
    results,
    summary: {
      totalAccepted,
      totalRejected,
      quotaUtilization: (totalAccepted / totalQuota) * 100
    }
  }
}