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
    <div className="space-y-8">
       {/* Page Header */}
       <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-2xl p-8 border border-gray-200/50 dark:border-gray-800/50 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent dark:from-gray-200 dark:to-gray-400 mb-3">Manajemen Kuota</h1>
            <p className="text-muted-foreground text-lg font-medium">Atur kuota penerimaan untuk setiap program keahlian.</p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <Users className="h-12 w-12 text-blue-500" />
            </div>
            <Badge variant="outline" className="text-lg py-2 px-4 rounded-full shadow-md">
              Total Kuota: <span className="font-bold ml-2">{getTotalQuota()}</span>
            </Badge>
          </div>
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
        {AVAILABLE_MAJORS.map((major) => (
          <Card key={major} className="shadow-md hover:shadow-lg transition-shadow rounded-xl border-l-4 border-blue-500">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">{major}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`quota-${major}`} className="text-muted-foreground">Kuota Penerimaan</Label>
                <Input
                  id={`quota-${major}`}
                  type="number"
                  min="0"
                  max="200"
                  value={quotas[major] || 0}
                  onChange={(e) => handleQuotaChange(major, e.target.value)}
                  className="text-center text-2xl font-bold h-12 rounded-lg"
                />
              </div>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                <span>Cadangan (10%)</span>
                <span className="font-medium">{Math.ceil((quotas[major] || 0) * 0.1)} siswa</span>
              </div>
              
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Total Kapasitas</span>
                <span>{(quotas[major] || 0) + Math.ceil((quotas[major] || 0) * 0.1)} siswa</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t sticky bottom-0 bg-background/80 backdrop-blur-sm py-4 z-10">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={!isModified || isSaving}
          className="rounded-full shadow-md"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button
          onClick={handleSave}
          disabled={!isModified || isSaving}
          className="rounded-full shadow-md bg-primary hover:bg-primary/90 text-primary-foreground"
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


    </div>
  )
}

export default QuotaManager