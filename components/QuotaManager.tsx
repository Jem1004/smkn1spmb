'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Save, 
  RotateCcw, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { MAJOR_QUOTAS } from '@/lib/ranking'
import { AVAILABLE_MAJORS, MajorType } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { authFetch } from '@/hooks/use-auth'

interface QuotaData {
  [key: string]: number
}

interface QuotaManagerProps {
  onQuotaUpdate?: (quotas: QuotaData) => void
}

const QuotaManager: React.FC<QuotaManagerProps> = ({ onQuotaUpdate }) => {
  const [quotas, setQuotas] = useState<QuotaData>(MAJOR_QUOTAS)
  const [originalQuotas, setOriginalQuotas] = useState<QuotaData>(MAJOR_QUOTAS)
  const [isModified, setIsModified] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Load quotas from API on component mount
  useEffect(() => {
    const loadQuotas = async () => {
      try {
        const response = await authFetch('/api/quota')
        const result = await response.json()
        
        if (response.ok && result.data?.quotas) {
          setQuotas(result.data.quotas)
          setOriginalQuotas(result.data.quotas)
        }
      } catch (error) {
        console.error('Error loading quotas:', error)
        toast({
          title: "Error",
          description: "Gagal memuat data kuota",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadQuotas()
  }, [toast])

  useEffect(() => {
    const hasChanges = Object.keys(quotas).some(
      key => quotas[key] !== originalQuotas[key]
    )
    setIsModified(hasChanges)
  }, [quotas, originalQuotas])

  const handleQuotaChange = (major: string, value: string) => {
    const numValue = parseInt(value) || 0
    if (numValue >= 0 && numValue <= 200) {
      setQuotas(prev => ({
        ...prev,
        [major]: numValue
      }))
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await authFetch('/api/quota', {
        method: 'PUT',
        body: JSON.stringify({ quotas })
      })

      const result = await response.json()

      if (response.ok) {
        // Update with the actual data returned from API
        const updatedQuotas = result.data?.quotas || quotas
        setQuotas(updatedQuotas)
        setOriginalQuotas(updatedQuotas)
        setIsModified(false)
        
        if (onQuotaUpdate) {
          onQuotaUpdate(updatedQuotas)
        }
        
        toast({
          title: "Berhasil",
          description: result.message || "Kuota per jurusan berhasil diperbarui",
        })

        // Show warnings if any
        if (result.warnings && result.warnings.length > 0) {
          setTimeout(() => {
            toast({
              title: "Peringatan",
              description: result.warnings.join(', '),
              variant: "default"
            })
          }, 1000)
        }
      } else {
        throw new Error(result.error || 'Gagal memperbarui kuota')
      }
    } catch (error) {
      console.error('Error saving quotas:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal memperbarui kuota",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setQuotas(originalQuotas)
    setIsModified(false)
  }

  const getTotalQuota = () => {
    return Object.values(quotas).reduce((sum, quota) => sum + quota, 0)
  }

  const getMajorName = (majorCode: string) => {
    const major = AVAILABLE_MAJORS.find(m => m === majorCode)
    return major || majorCode
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manajemen Kuota Jurusan</h2>
          <p className="text-muted-foreground">
            Kelola kuota penerimaan untuk setiap program keahlian
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            <Users className="w-4 h-4 mr-1" />
            Total: {getTotalQuota()} siswa
          </Badge>
        </div>
      </div>

      {/* Alert for unsaved changes */}
      {isModified && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Anda memiliki perubahan yang belum disimpan. Jangan lupa untuk menyimpan perubahan.
          </AlertDescription>
        </Alert>
      )}

      {/* Quota Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(quotas).map(([majorCode, quota]) => (
          <Card key={majorCode} className="relative">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{getMajorName(majorCode)}</CardTitle>
              <p className="text-sm text-muted-foreground">{majorCode}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`quota-${majorCode}`}>Kuota Penerimaan</Label>
                <Input
                  id={`quota-${majorCode}`}
                  type="number"
                  min="0"
                  max="200"
                  value={quota}
                  onChange={(e) => handleQuotaChange(majorCode, e.target.value)}
                  className="text-center text-lg font-semibold"
                />
              </div>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Cadangan (10%)</span>
                <span className="font-medium">{Math.ceil(quota * 0.1)} siswa</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span>Total Kapasitas</span>
                <span className="font-semibold">{quota + Math.ceil(quota * 0.1)} siswa</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={!isModified || isSaving}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button
          onClick={handleSave}
          disabled={!isModified || isSaving}
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Simpan Perubahan
            </>
          )}
        </Button>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Ringkasan Kuota
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{getTotalQuota()}</div>
              <div className="text-sm text-muted-foreground">Total Kuota</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.ceil(getTotalQuota() * 0.1)}
              </div>
              <div className="text-sm text-muted-foreground">Total Cadangan</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {getTotalQuota() + Math.ceil(getTotalQuota() * 0.1)}
              </div>
              <div className="text-sm text-muted-foreground">Total Kapasitas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Object.keys(quotas).length}
              </div>
              <div className="text-sm text-muted-foreground">Jumlah Jurusan</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default QuotaManager