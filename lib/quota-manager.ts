import { MajorType } from '@/types'
import { MAJOR_QUOTAS } from './ranking'

export interface QuotaData {
  [key: string]: number
}

export interface QuotaStatistics {
  totalQuota: number
  totalReserve: number
  totalCapacity: number
  majorCount: number
  averageQuota: number
}

export interface MajorQuotaInfo {
  majorCode: string
  majorName: string
  quota: number
  reserve: number
  capacity: number
  currentApplicants: number
  acceptanceRate: number
  isOversubscribed: boolean
}

/**
 * Get current quota configuration
 */
export function getCurrentQuotas(): QuotaData {
  return { ...MAJOR_QUOTAS }
}

/**
 * Update quota for a specific major
 */
export function updateMajorQuota(majorCode: string, newQuota: number): QuotaData {
  if (newQuota < 0 || newQuota > 200) {
    throw new Error('Kuota harus antara 0 dan 200')
  }
  
  return {
    ...MAJOR_QUOTAS,
    [majorCode]: newQuota
  }
}

/**
 * Update multiple quotas at once
 */
export function updateMultipleQuotas(quotaUpdates: Partial<QuotaData>): QuotaData {
  const updatedQuotas = { ...MAJOR_QUOTAS }
  
  Object.entries(quotaUpdates).forEach(([majorCode, quota]) => {
    if (quota !== undefined) {
      if (quota < 0 || quota > 200) {
        throw new Error(`Kuota untuk ${majorCode} harus antara 0 dan 200`)
      }
      (updatedQuotas as any)[majorCode] = quota
    }
  })
  
  return updatedQuotas
}

/**
 * Calculate reserve quota (10% of main quota)
 */
export function calculateReserveQuota(mainQuota: number): number {
  return Math.ceil(mainQuota * 0.1)
}

/**
 * Calculate total capacity (main + reserve)
 */
export function calculateTotalCapacity(mainQuota: number): number {
  return mainQuota + calculateReserveQuota(mainQuota)
}

/**
 * Get quota statistics
 */
export function getQuotaStatistics(quotas: QuotaData = MAJOR_QUOTAS): QuotaStatistics {
  const quotaValues = Object.values(quotas)
  const totalQuota = quotaValues.reduce((sum, quota) => sum + quota, 0)
  const totalReserve = quotaValues.reduce((sum, quota) => sum + calculateReserveQuota(quota), 0)
  
  return {
    totalQuota,
    totalReserve,
    totalCapacity: totalQuota + totalReserve,
    majorCount: quotaValues.length,
    averageQuota: totalQuota / quotaValues.length
  }
}

/**
 * Get detailed quota information for a specific major
 */
export function getMajorQuotaInfo(
  majorCode: string, 
  currentApplicants: number = 0,
  quotas: QuotaData = MAJOR_QUOTAS
): MajorQuotaInfo {
  const quota = quotas[majorCode] || 0
  const reserve = calculateReserveQuota(quota)
  const capacity = calculateTotalCapacity(quota)
  const acceptanceRate = currentApplicants > 0 ? (quota / currentApplicants) * 100 : 0
  
  return {
    majorCode,
    majorName: getMajorName(majorCode),
    quota,
    reserve,
    capacity,
    currentApplicants,
    acceptanceRate: Math.min(acceptanceRate, 100),
    isOversubscribed: currentApplicants > capacity
  }
}

/**
 * Get quota information for all majors
 */
export function getAllMajorQuotaInfo(
  applicantCounts: Record<string, number> = {},
  quotas: QuotaData = MAJOR_QUOTAS
): MajorQuotaInfo[] {
  return Object.keys(quotas).map(majorCode => 
    getMajorQuotaInfo(majorCode, applicantCounts[majorCode] || 0, quotas)
  )
}

/**
 * Validate quota configuration
 */
export function validateQuotaConfiguration(quotas: QuotaData): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  
  Object.entries(quotas).forEach(([majorCode, quota]) => {
    if (quota < 0) {
      errors.push(`Kuota ${majorCode} tidak boleh negatif`)
    }
    if (quota > 200) {
      errors.push(`Kuota ${majorCode} terlalu besar (maksimal 200)`)
    }
    if (quota < 10) {
      warnings.push(`Kuota ${majorCode} sangat kecil (${quota} siswa)`)
    }
    if (quota > 100) {
      warnings.push(`Kuota ${majorCode} sangat besar (${quota} siswa)`)
    }
  })
  
  const totalQuota = Object.values(quotas).reduce((sum, quota) => sum + quota, 0)
  if (totalQuota > 1000) {
    warnings.push(`Total kuota sangat besar (${totalQuota} siswa)`)
  }
  if (totalQuota < 100) {
    warnings.push(`Total kuota sangat kecil (${totalQuota} siswa)`)
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Calculate optimal quota distribution based on historical data
 */
export function calculateOptimalQuotas(
  historicalData: Record<string, { applicants: number; capacity: number }>,
  totalTargetQuota: number
): QuotaData {
  const majors = Object.keys(historicalData)
  const totalHistoricalApplicants = Object.values(historicalData)
    .reduce((sum, data) => sum + data.applicants, 0)
  
  const optimalQuotas: QuotaData = {}
  
  majors.forEach(majorCode => {
    const data = historicalData[majorCode]
    const demandRatio = data.applicants / totalHistoricalApplicants
    const baseQuota = Math.round(totalTargetQuota * demandRatio)
    
    // Ensure minimum quota of 10 and maximum of 100
    optimalQuotas[majorCode] = Math.max(10, Math.min(100, baseQuota))
  })
  
  // Adjust to match exact total if needed
  const currentTotal = Object.values(optimalQuotas).reduce((sum, quota) => sum + quota, 0)
  const difference = totalTargetQuota - currentTotal
  
  if (difference !== 0) {
    // Distribute difference proportionally
    const adjustmentFactor = totalTargetQuota / currentTotal
    Object.keys(optimalQuotas).forEach(majorCode => {
      optimalQuotas[majorCode] = Math.round(optimalQuotas[majorCode] * adjustmentFactor)
    })
  }
  
  return optimalQuotas
}

/**
 * Export quota data to CSV format
 */
export function exportQuotaToCSV(quotas: QuotaData = MAJOR_QUOTAS): string {
  const headers = ['Kode Jurusan', 'Nama Jurusan', 'Kuota Utama', 'Kuota Cadangan', 'Total Kapasitas']
  const rows = Object.entries(quotas).map(([majorCode, quota]) => [
    majorCode,
    getMajorName(majorCode),
    quota.toString(),
    calculateReserveQuota(quota).toString(),
    calculateTotalCapacity(quota).toString()
  ])
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')
  
  return csvContent
}

/**
 * Import quota data from CSV format
 */
export function importQuotaFromCSV(csvContent: string): QuotaData {
  const lines = csvContent.trim().split('\n')
  const quotas: QuotaData = {}
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const columns = lines[i].split(',').map(col => col.replace(/"/g, '').trim())
    if (columns.length >= 3) {
      const majorCode = columns[0]
      const quota = parseInt(columns[2]) || 0
      quotas[majorCode] = quota
    }
  }
  
  return quotas
}

/**
 * Helper function to get major name from code
 */
function getMajorName(majorCode: string): string {
  // Return the major code as is since AVAILABLE_MAJORS contains full names
  return majorCode
}

/**
 * Save quota configuration to localStorage
 */
export function saveQuotaToLocalStorage(quotas: QuotaData): void {
  try {
    localStorage.setItem('ppdb_quotas', JSON.stringify(quotas))
  } catch (error) {
    console.error('Failed to save quotas to localStorage:', error)
  }
}

/**
 * Load quota configuration from localStorage
 */
export function loadQuotaFromLocalStorage(): QuotaData | null {
  try {
    const saved = localStorage.getItem('ppdb_quotas')
    return saved ? JSON.parse(saved) : null
  } catch (error) {
    console.error('Failed to load quotas from localStorage:', error)
    return null
  }
}

/**
 * Reset quotas to default values
 */
export function resetQuotasToDefault(): QuotaData {
  const defaultQuotas: QuotaData = {
    'TKJ': 72,
    'RPL': 72,
    'MM': 36,
    'TKR': 72,
    'TSM': 36,
    'AKL': 36,
    'OTKP': 36,
    'BDP': 36
  }
  
  return defaultQuotas
}