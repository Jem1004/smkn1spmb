'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useStudentStatus,
  getRealTimeStatusColor,
  getRealTimeStatusText,
  getRealTimeStatusDescription,
  getStatusIcon,
  getDistanceFromCutoffText,
  getDistanceFromCutoffColor,
  type StudentStatusData
} from '@/hooks/use-student-status'
import {
  Activity,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Award,
  Info,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'

interface RealTimeStatusCardProps {
  className?: string
}

function StatusComparisonAlert({ statusData }: { statusData: StudentStatusData }) {
  if (statusData.statusComparison.isConsistent) {
    return (
      <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <span className="text-sm text-green-700">
          Status database dan ranking real-time sudah sinkron
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <div className="flex-1">
        <p className="text-sm text-yellow-700 font-medium">
          Status Tidak Sinkron
        </p>
        <p className="text-xs text-yellow-600">
          Database: {statusData.databaseStatus.status} | Real-time: {statusData.realTimeStatus.status}
        </p>
      </div>
    </div>
  )
}

function MajorStatistics({ statusData }: { statusData: StudentStatusData }) {
  const { majorStatistics, realTimeStatus } = statusData
  const acceptanceRate = (majorStatistics.accepted / majorStatistics.totalApplicants) * 100
  
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">Statistik Jurusan {realTimeStatus.major}</h4>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-2 bg-gray-50 rounded">
          <p className="text-lg font-bold text-gray-900">{majorStatistics.totalApplicants}</p>
          <p className="text-xs text-gray-600">Total Pendaftar</p>
        </div>
        <div className="text-center p-2 bg-green-50 rounded">
          <p className="text-lg font-bold text-green-600">{majorStatistics.accepted}</p>
          <p className="text-xs text-gray-600">Diterima</p>
        </div>
        <div className="text-center p-2 bg-yellow-50 rounded">
          <p className="text-lg font-bold text-yellow-600">{majorStatistics.waitlist}</p>
          <p className="text-xs text-gray-600">Daftar Tunggu</p>
        </div>
        <div className="text-center p-2 bg-red-50 rounded">
          <p className="text-lg font-bold text-red-600">{majorStatistics.rejected}</p>
          <p className="text-xs text-gray-600">Tidak Diterima</p>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-600">Tingkat Penerimaan</span>
          <span className="text-xs font-medium">{acceptanceRate.toFixed(1)}%</span>
        </div>
        <Progress value={acceptanceRate} className="h-2" />
      </div>
      
      <div className="text-xs text-gray-600 space-y-1">
        <div className="flex justify-between">
          <span>Skor Tertinggi:</span>
          <span className="font-medium">{majorStatistics.highestScore}</span>
        </div>
        <div className="flex justify-between">
          <span>Batas Penerimaan:</span>
          <span className="font-medium">{majorStatistics.cutoffScore}</span>
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function RealTimeStatusCard({ className }: RealTimeStatusCardProps) {
  const { statusData, loading, error, refetch, isRefetching } = useStudentStatus()

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <XCircle className="h-5 w-5" />
            <span>Error Memuat Status Real-Time</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-red-600">{error}</p>
            <Button onClick={refetch} disabled={isRefetching} variant="outline" size="sm">
              {isRefetching && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Coba Lagi
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!statusData) {
    return null
  }

  const { realTimeStatus, statusComparison, majorStatistics } = statusData

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Status Penerimaan Real-Time</span>
          </div>
          <Button
            onClick={refetch}
            disabled={isRefetching}
            variant="outline"
            size="sm"
          >
            {isRefetching ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Comparison Alert */}
        <StatusComparisonAlert statusData={statusData} />
        
        {/* Real-Time Status */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getStatusIcon(realTimeStatus.status)}</span>
            <div className="flex-1">
              <Badge className={`${getRealTimeStatusColor(realTimeStatus.status)} text-white font-semibold px-3 py-1`}>
                {getRealTimeStatusText(realTimeStatus.status)}
              </Badge>
              <p className="text-sm text-gray-600 mt-1">
                Peringkat #{realTimeStatus.rank} | Skor: {realTimeStatus.totalScore}
              </p>
            </div>
          </div>
          
          {/* Status Description */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700">
              {getRealTimeStatusDescription(
                realTimeStatus.status,
                realTimeStatus.rank,
                realTimeStatus.distanceFromCutoff
              )}
            </p>
          </div>
          
          {/* Distance from Cutoff */}
          <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
            <div className="flex items-center space-x-2">
              {realTimeStatus.isAboveCutoff ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm font-medium">Jarak dari Batas Penerimaan</span>
            </div>
            <span className={`text-sm font-bold ${getDistanceFromCutoffColor(realTimeStatus.isAboveCutoff)}`}>
              {getDistanceFromCutoffText(realTimeStatus.distanceFromCutoff, realTimeStatus.isAboveCutoff)}
            </span>
          </div>
        </div>
        
        {/* Major Statistics */}
        <div className="border-t pt-4">
          <MajorStatistics statusData={statusData} />
        </div>
        
        {/* Info Footer */}
        <div className="flex items-start space-x-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
          <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <p>
            Status ini dihitung berdasarkan ranking real-time dari semua pendaftar. 
            Status dapat berubah seiring dengan perubahan data ranking siswa lain.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}