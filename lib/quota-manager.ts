import { prisma } from '@/lib/prisma'
import { MAJOR_QUOTAS } from './ranking'
import { MajorType, AVAILABLE_MAJORS } from '@/types'

// Types for quota manager
export interface QuotaData {
  [majorCode: string]: number
}

export interface QuotaStatistics {
  totalQuota: number
  totalMajors: number
  averageQuotaPerMajor: number
  highestQuota: number
  lowestQuota: number
  quotaDistribution: {
    majorCode: string
    majorName: string
    quota: number
    percentage: number
  }[]
}

export interface QuotaValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface QuotaUpdateResult {
  success: boolean
  updated: number
  failed: number
  errors: string[]
}

/**
 * Get current quotas from database
 */
export async function getCurrentQuotas(): Promise<QuotaData> {
  try {
    const quotas = await prisma.quota.findMany({
      select: {
        majorCode: true,
        quota: true
      }
    })

    const quotaData: QuotaData = {}
    quotas.forEach(q => {
      quotaData[q.majorCode] = q.quota
    })

    // Fill with default values if not found in database
    AVAILABLE_MAJORS.forEach(major => {
      if (!quotaData[major]) {
        quotaData[major] = MAJOR_QUOTAS[major as MajorType] || 36
      }
    })

    return quotaData
  } catch (error) {
    console.error('Error fetching quotas:', error)
    // Return default quotas if database error
    const defaultQuotas: QuotaData = {}
    AVAILABLE_MAJORS.forEach(major => {
      defaultQuotas[major] = MAJOR_QUOTAS[major as MajorType] || 36
    })
    return defaultQuotas
  }
}

/**
 * Get quota for a specific major
 */
export async function getMajorQuota(majorCode: string): Promise<number> {
  try {
    const quota = await prisma.quota.findUnique({
      where: { majorCode },
      select: { quota: true }
    })

    if (quota) {
      return quota.quota
    }

    // Return default quota if not found
    return MAJOR_QUOTAS[majorCode as MajorType] || 36
  } catch (error) {
    console.error('Error fetching major quota:', error)
    return MAJOR_QUOTAS[majorCode as MajorType] || 36
  }
}

/**
 * Update quota for a single major
 */
export async function updateMajorQuota(
  majorCode: string, 
  quota: number
): Promise<boolean> {
  try {
    // Validate quota value
    if (quota < 0 || quota > 200) {
      throw new Error('Quota must be between 0 and 200')
    }

    await prisma.quota.upsert({
      where: { majorCode },
      update: {
        quota,
        updatedAt: new Date()
      },
      create: {
        majorCode,
        majorName: getMajorName(majorCode),
        quota,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    return true
  } catch (error) {
    console.error('Error updating major quota:', error)
    return false
  }
}

/**
 * Update multiple quotas at once
 */
export async function updateMultipleQuotas(
  quotas: QuotaData
): Promise<QuotaData> {
  const results: QuotaData = {}
  const errors: string[] = []

  for (const [majorCode, quota] of Object.entries(quotas)) {
    try {
      const success = await updateMajorQuota(majorCode, quota)
      if (success) {
        results[majorCode] = quota
      } else {
        errors.push(`Failed to update quota for ${majorCode}`)
        // Keep existing quota if update fails
        const existingQuota = await getMajorQuota(majorCode)
        results[majorCode] = existingQuota
      }
    } catch (error) {
      console.error(`Error updating quota for ${majorCode}:`, error)
      errors.push(`Error updating ${majorCode}: ${error}`)
      // Keep existing quota if update fails
      const existingQuota = await getMajorQuota(majorCode)
      results[majorCode] = existingQuota
    }
  }

  if (errors.length > 0) {
    console.warn('Some quota updates failed:', errors)
  }

  return results
}

/**
 * Validate quota configuration
 */
export function validateQuotaConfiguration(quotas: QuotaData): QuotaValidation {
  const errors: string[] = []
  const warnings: string[] = []

  // Check if quotas object is valid
  if (!quotas || typeof quotas !== 'object') {
    errors.push('Invalid quota data format')
    return { isValid: false, errors, warnings }
  }

  // Validate each quota
  Object.entries(quotas).forEach(([majorCode, quota]) => {
    // Check if major code is valid
    if (!AVAILABLE_MAJORS.includes(majorCode as MajorType)) {
      warnings.push(`Unknown major code: ${majorCode}`)
    }

    // Check quota value
    if (typeof quota !== 'number') {
      errors.push(`Invalid quota value for ${majorCode}: must be a number`)
    } else {
      if (quota < 0) {
        errors.push(`Invalid quota for ${majorCode}: cannot be negative`)
      }
      if (quota > 200) {
        warnings.push(`High quota for ${majorCode}: ${quota} (consider if this is intentional)`)
      }
      if (quota === 0) {
        warnings.push(`Zero quota for ${majorCode}: this major will not accept any students`)
      }
    }
  })

  // Check for missing majors
  AVAILABLE_MAJORS.forEach(major => {
    if (!(major in quotas)) {
      warnings.push(`Missing quota for major: ${major}`)
    }
  })

  // Calculate total quota
  const totalQuota = Object.values(quotas)
    .filter(q => typeof q === 'number')
    .reduce((sum, quota) => sum + quota, 0)

  if (totalQuota === 0) {
    errors.push('Total quota cannot be zero')
  }

  if (totalQuota > 1000) {
    warnings.push(`Very high total quota: ${totalQuota} (consider if this is realistic)`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Get quota statistics
 */
export function getQuotaStatistics(quotas: QuotaData): QuotaStatistics {
  const quotaValues = Object.values(quotas).filter(q => typeof q === 'number')
  const totalQuota = quotaValues.reduce((sum, quota) => sum + quota, 0)
  const totalMajors = Object.keys(quotas).length

  const quotaDistribution = Object.entries(quotas).map(([majorCode, quota]) => ({
    majorCode,
    majorName: getMajorName(majorCode),
    quota,
    percentage: totalQuota > 0 ? (quota / totalQuota) * 100 : 0
  })).sort((a, b) => b.quota - a.quota)

  return {
    totalQuota,
    totalMajors,
    averageQuotaPerMajor: totalMajors > 0 ? totalQuota / totalMajors : 0,
    highestQuota: quotaValues.length > 0 ? Math.max(...quotaValues) : 0,
    lowestQuota: quotaValues.length > 0 ? Math.min(...quotaValues) : 0,
    quotaDistribution
  }
}

/**
 * Reset quotas to default values
 */
export async function resetQuotasToDefault(): Promise<QuotaUpdateResult> {
  try {
    const defaultQuotas: QuotaData = {}
    AVAILABLE_MAJORS.forEach(major => {
      defaultQuotas[major] = MAJOR_QUOTAS[major as MajorType] || 36
    })

    const updatedQuotas = await updateMultipleQuotas(defaultQuotas)
    const successCount = Object.keys(updatedQuotas).length
    const totalCount = Object.keys(defaultQuotas).length

    return {
      success: successCount === totalCount,
      updated: successCount,
      failed: totalCount - successCount,
      errors: []
    }
  } catch (error) {
    console.error('Error resetting quotas to default:', error)
    return {
      success: false,
      updated: 0,
      failed: AVAILABLE_MAJORS.length,
      errors: [`Failed to reset quotas: ${error}`]
    }
  }
}

/**
 * Get quota utilization data
 */
export async function getQuotaUtilization(): Promise<{
  majorCode: string
  majorName: string
  quota: number
  applicants: number
  utilized: number
  utilizationRate: number
  isOversubscribed: boolean
  availableSlots: number
}[]> {
  try {
    const quotas = await getCurrentQuotas()
    
    // Get applicant counts per major
    const applicantCounts = await prisma.student.groupBy({
      by: ['selectedMajor'],
      where: {
        finalStatus: {
          in: ['PENDING', 'APPROVED', 'WAITLIST']
        }
      },
      _count: {
        id: true
      }
    })

    const applicantMap: Record<string, number> = {}
    applicantCounts.forEach(item => {
      if (item.selectedMajor) {
        applicantMap[item.selectedMajor] = item._count.id
      }
    })

    return Object.entries(quotas).map(([majorCode, quota]) => {
      const applicants = applicantMap[majorCode] || 0
      const utilized = Math.min(applicants, quota)
      const utilizationRate = quota > 0 ? (utilized / quota) * 100 : 0
      const isOversubscribed = applicants > quota
      const availableSlots = Math.max(0, quota - applicants)

      return {
        majorCode,
        majorName: getMajorName(majorCode),
        quota,
        applicants,
        utilized,
        utilizationRate,
        isOversubscribed,
        availableSlots
      }
    }).sort((a, b) => b.utilizationRate - a.utilizationRate)
  } catch (error) {
    console.error('Error getting quota utilization:', error)
    return []
  }
}

/**
 * Get quota recommendations based on historical data
 */
export async function getQuotaRecommendations(): Promise<{
  majorCode: string
  majorName: string
  currentQuota: number
  recommendedQuota: number
  reason: string
  priority: 'High' | 'Medium' | 'Low'
}[]> {
  try {
    const utilization = await getQuotaUtilization()
    
    return utilization.map(data => {
      let recommendedQuota = data.quota
      let reason = 'Current quota is appropriate'
      let priority: 'High' | 'Medium' | 'Low' = 'Low'

      if (data.isOversubscribed) {
        // Increase quota for oversubscribed majors
        const oversubscriptionRate = (data.applicants - data.quota) / data.quota
        if (oversubscriptionRate > 0.5) {
          recommendedQuota = Math.ceil(data.quota * 1.5)
          reason = `High demand: ${data.applicants} applicants for ${data.quota} slots`
          priority = 'High'
        } else {
          recommendedQuota = Math.ceil(data.quota * 1.2)
          reason = `Moderate oversubscription: consider increasing quota`
          priority = 'Medium'
        }
      } else if (data.utilizationRate < 50) {
        // Decrease quota for underutilized majors
        if (data.utilizationRate < 25) {
          recommendedQuota = Math.max(18, Math.ceil(data.applicants * 1.2))
          reason = `Low demand: only ${data.applicants} applicants for ${data.quota} slots`
          priority = 'Medium'
        } else {
          recommendedQuota = Math.max(24, Math.ceil(data.quota * 0.8))
          reason = `Underutilized: consider reducing quota`
          priority = 'Low'
        }
      }

      return {
        majorCode: data.majorCode,
        majorName: data.majorName,
        currentQuota: data.quota,
        recommendedQuota,
        reason,
        priority
      }
    }).sort((a, b) => {
      const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  } catch (error) {
    console.error('Error getting quota recommendations:', error)
    return []
  }
}

/**
 * Export quota data to CSV
 */
export async function exportQuotaDataToCSV(): Promise<string> {
  try {
    const quotas = await getCurrentQuotas()
    const utilization = await getQuotaUtilization()
    
    const headers = [
      'Kode Jurusan',
      'Nama Jurusan',
      'Kuota',
      'Pendaftar',
      'Terisi',
      'Tingkat Utilisasi (%)',
      'Slot Tersedia',
      'Status'
    ]
    
    const rows = utilization.map(data => [
      data.majorCode,
      data.majorName,
      data.quota.toString(),
      data.applicants.toString(),
      data.utilized.toString(),
      data.utilizationRate.toFixed(2),
      data.availableSlots.toString(),
      data.isOversubscribed ? 'Oversubscribed' : 'Available'
    ])
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    
    return csvContent
  } catch (error) {
    console.error('Error exporting quota data to CSV:', error)
    throw new Error('Failed to export quota data')
  }
}

/**
 * Get major quota information with additional details
 */
export function getMajorQuotaInfo(
  majorCode: string, 
  applicantCount: number, 
  quotas: QuotaData
) {
  const quota = quotas[majorCode] || 36
  const reserve = Math.ceil(quota * 0.1) // 10% reserve
  const capacity = quota + reserve
  const isOversubscribed = applicantCount > quota
  const utilizationRate = quota > 0 ? (Math.min(applicantCount, quota) / quota) * 100 : 0

  return {
    quota,
    reserve,
    capacity,
    utilizationRate,
    isOversubscribed,
    availableSlots: Math.max(0, quota - applicantCount),
    waitlistCapacity: reserve
  }
}

/**
 * Helper function to get major name
 */
function getMajorName(majorCode: string): string {
  // Return the major code as is since AVAILABLE_MAJORS contains full names
  return majorCode
}

/**
 * Batch operations for quota management
 */
export async function batchQuotaOperations(operations: {
  type: 'update' | 'reset' | 'increase' | 'decrease'
  majorCode?: string
  value?: number
  percentage?: number
}[]): Promise<QuotaUpdateResult> {
  let updated = 0
  let failed = 0
  const errors: string[] = []

  for (const operation of operations) {
    try {
      switch (operation.type) {
        case 'update':
          if (operation.majorCode && operation.value !== undefined) {
            const success = await updateMajorQuota(operation.majorCode, operation.value)
            if (success) updated++
            else failed++
          }
          break

        case 'reset':
          const resetResult = await resetQuotasToDefault()
          updated += resetResult.updated
          failed += resetResult.failed
          errors.push(...resetResult.errors)
          break

        case 'increase':
        case 'decrease':
          if (operation.majorCode && operation.percentage) {
            const currentQuota = await getMajorQuota(operation.majorCode)
            const multiplier = operation.type === 'increase' 
              ? (1 + operation.percentage / 100)
              : (1 - operation.percentage / 100)
            const newQuota = Math.max(0, Math.round(currentQuota * multiplier))
            const success = await updateMajorQuota(operation.majorCode, newQuota)
            if (success) updated++
            else failed++
          }
          break
      }
    } catch (error) {
      failed++
      errors.push(`Operation failed: ${error}`)
    }
  }

  return {
    success: failed === 0,
    updated,
    failed,
    errors
  }
}

/**
 * Get quota dashboard data
 */
export async function getQuotaDashboardData(): Promise<{
  totalQuota: number
  totalApplicants: number
  overallUtilization: number
  oversubscribedMajors: number
  underutilizedMajors: number
  recommendations: number
  recentChanges: {
    majorCode: string
    majorName: string
    oldQuota: number
    newQuota: number
    changedAt: Date
  }[]
}> {
  try {
    const quotas = await getCurrentQuotas()
    const utilization = await getQuotaUtilization()
    const recommendations = await getQuotaRecommendations()
    
    const totalQuota = Object.values(quotas).reduce((sum, quota) => sum + quota, 0)
    const totalApplicants = utilization.reduce((sum, data) => sum + data.applicants, 0)
    const overallUtilization = totalQuota > 0 ? (totalApplicants / totalQuota) * 100 : 0
    
    const oversubscribedMajors = utilization.filter(data => data.isOversubscribed).length
    const underutilizedMajors = utilization.filter(data => data.utilizationRate < 50).length
    const highPriorityRecommendations = recommendations.filter(rec => rec.priority === 'High').length
    
    // Get recent quota changes (mock data - in real app, you'd track changes)
    const recentChanges: any[] = []
    
    return {
      totalQuota,
      totalApplicants,
      overallUtilization,
      oversubscribedMajors,
      underutilizedMajors,
      recommendations: highPriorityRecommendations,
      recentChanges
    }
  } catch (error) {
    console.error('Error getting quota dashboard data:', error)
    return {
      totalQuota: 0,
      totalApplicants: 0,
      overallUtilization: 0,
      oversubscribedMajors: 0,
      underutilizedMajors: 0,
      recommendations: 0,
      recentChanges: []
    }
  }
}