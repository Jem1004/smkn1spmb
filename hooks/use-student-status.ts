import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

export interface RealTimeStatus {
  status: 'DITERIMA' | 'CADANGAN' | 'TIDAK_DITERIMA'
  rank: number
  totalScore: number
  major: string
  distanceFromCutoff: number
  isAboveCutoff: boolean
}

export interface DatabaseStatus {
  status: string
  mappedRealTimeStatus: string
}

export interface StatusComparison {
  isConsistent: boolean
  needsUpdate: boolean
}

export interface MajorStatistics {
  totalApplicants: number
  accepted: number
  waitlist: number
  rejected: number
  cutoffScore: number
  highestScore: number
}

export interface StudentInfo {
  id: string
  fullName: string
  selectedMajor: string
  hasCompleteRanking: boolean
}

export interface StudentStatusData {
  realTimeStatus: RealTimeStatus
  databaseStatus: DatabaseStatus
  statusComparison: StatusComparison
  majorStatistics: MajorStatistics
  studentInfo: StudentInfo
}

export interface UseStudentStatusReturn {
  statusData: StudentStatusData | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  isRefetching: boolean
}

export function useStudentStatus(): UseStudentStatusReturn {
  const [statusData, setStatusData] = useState<StudentStatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRefetching, setIsRefetching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchStatus = useCallback(async (isRefetch = false) => {
    try {
      if (isRefetch) {
        setIsRefetching(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const response = await fetch('/api/students/me/status')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch student status')
      }

      const data = await response.json()
      setStatusData(data)
      
      // Show toast notification if status is inconsistent
      if (data.statusComparison.needsUpdate && isRefetch) {
        toast({
          title: 'Status Tidak Sinkron',
          description: 'Status database berbeda dengan perhitungan ranking real-time.',
          variant: 'default'
        })
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat status siswa'
      setError(errorMessage)
      
      if (isRefetch) {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        })
      }
    } finally {
      setLoading(false)
      setIsRefetching(false)
    }
  }, [toast])

  const refetch = useCallback(() => fetchStatus(true), [fetchStatus])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  return {
    statusData,
    loading,
    error,
    refetch,
    isRefetching
  }
}

// Helper functions for status display
export function getRealTimeStatusColor(status: string): string {
  switch (status) {
    case 'DITERIMA':
      return 'bg-green-500'
    case 'CADANGAN':
      return 'bg-yellow-500'
    case 'TIDAK_DITERIMA':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

export function getRealTimeStatusText(status: string): string {
  switch (status) {
    case 'DITERIMA':
      return 'DITERIMA'
    case 'CADANGAN':
      return 'DAFTAR TUNGGU'
    case 'TIDAK_DITERIMA':
      return 'TIDAK DITERIMA'
    default:
      return 'STATUS BELUM DIKETAHUI'
  }
}

export function getRealTimeStatusDescription(status: string, rank: number, distanceFromCutoff: number): string {
  switch (status) {
    case 'DITERIMA':
      return `Selamat! Anda diterima dengan peringkat ${rank}. Status ini berdasarkan perhitungan ranking real-time.`
    case 'CADANGAN':
      return `Anda berada di daftar tunggu dengan peringkat ${rank}. Masih ada kemungkinan diterima jika ada yang mengundurkan diri.`
    case 'TIDAK_DITERIMA':
      const scoreDiff = Math.abs(distanceFromCutoff)
      return `Maaf, Anda belum diterima dengan peringkat ${rank}. Anda memerlukan ${scoreDiff.toFixed(2)} poin tambahan untuk mencapai batas penerimaan.`
    default:
      return 'Status penerimaan belum dapat ditentukan. Pastikan data ranking sudah lengkap.'
  }
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case 'DITERIMA':
      return '✅'
    case 'CADANGAN':
      return '⏳'
    case 'TIDAK_DITERIMA':
      return '❌'
    default:
      return '❓'
  }
}

export function getDistanceFromCutoffText(distanceFromCutoff: number, isAboveCutoff: boolean): string {
  if (isAboveCutoff) {
    return `+${distanceFromCutoff.toFixed(2)} poin dari batas penerimaan`
  } else {
    return `${distanceFromCutoff.toFixed(2)} poin dari batas penerimaan`
  }
}

export function getDistanceFromCutoffColor(isAboveCutoff: boolean): string {
  return isAboveCutoff ? 'text-green-600' : 'text-red-600'
}