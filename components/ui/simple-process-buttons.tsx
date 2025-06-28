'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProcessAction } from '@/types'
import { CheckCircle, XCircle, MessageSquare } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SimpleProcessButtonsProps {
  studentId: string
  currentStatus?: string
  onProcessComplete?: () => void
  disabled?: boolean
  size?: 'sm' | 'default' | 'lg'
  variant?: 'inline' | 'card'
}

export function SimpleProcessButtons({
  studentId,
  currentStatus,
  onProcessComplete,
  disabled = false,
  size = 'default',
  variant = 'inline'
}: SimpleProcessButtonsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showReasonInput, setShowReasonInput] = useState(false)
  const [reason, setReason] = useState('')
  const [selectedAction, setSelectedAction] = useState<'APPROVED' | 'REJECTED' | null>(null)
  const { toast } = useToast()

    const handleProcess = async (status: 'APPROVED' | 'REJECTED') => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/students/${studentId}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-id': 'admin-user-id' // In real app, get from auth
        },
        body: JSON.stringify({
          action: 'update_status',
          status,
          reason: reason || undefined
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: `Status siswa berhasil diubah menjadi ${status === 'APPROVED' ? 'DITERIMA' : 'DITOLAK'}`,
        })
        
        // Reset form
        setReason('')
        setShowReasonInput(false)
        setSelectedAction(null)
        
        // Call callback
        onProcessComplete?.()
      } else {
        throw new Error(result.message || 'Gagal memproses siswa')
      }
    } catch (error) {
      console.error('Error processing student:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal memproses siswa',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleActionClick = (status: 'APPROVED' | 'REJECTED') => {
    setSelectedAction(status)
    setShowReasonInput(true)
  }

  const handleSubmit = () => {
    if (selectedAction) {
      handleProcess(selectedAction)
    }
  }

  const handleCancel = () => {
    setSelectedAction(null)
    setShowReasonInput(false)
    setReason('')
  }

  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'h-8 px-3 text-xs'
      case 'lg': return 'h-12 px-6 text-base'
      default: return 'h-10 px-4 text-sm'
    }
  }

  const isProcessed = currentStatus === 'APPROVED' || currentStatus === 'REJECTED'

  if (variant === 'card') {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Proses Siswa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showReasonInput ? (
            <div className="flex gap-2">
              <Button
                onClick={() => handleActionClick('APPROVED')}
                disabled={disabled || isLoading || isProcessed}
                className={`${getButtonSize()} bg-green-600 hover:bg-green-700`}
              >

                <CheckCircle className="w-4 h-4 mr-2" />
                Terima
              </Button>
              <Button
                onClick={() => handleActionClick('REJECTED')}
                disabled={disabled || isLoading || isProcessed}
                variant="destructive"
                className={getButtonSize()}
              >

                <XCircle className="w-4 h-4 mr-2" />
                Tolak
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label htmlFor="reason">Alasan (Opsional)</Label>
                <Input
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Masukkan alasan..."
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className={`${getButtonSize()} ${
                    selectedAction === 'APPROVED' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isLoading ? 'Memproses...' : `Konfirmasi ${selectedAction === 'APPROVED' ? 'Terima' : 'Tolak'}`}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  disabled={isLoading}
                  className={getButtonSize()}
                >
                  Batal
                </Button>
              </div>
            </div>
          )}
          
          {isProcessed && (
            <p className="text-sm text-muted-foreground">
              Status siswa sudah diproses: {currentStatus === 'APPROVED' ? 'DITERIMA' : 'DITOLAK'}
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  // Inline variant
  return (
    <div className="flex items-center gap-2">
      {!showReasonInput ? (
        <>
          <Button
            onClick={() => handleActionClick('APPROVED')}
            disabled={disabled || isLoading || isProcessed}
            size={size}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Terima
          </Button>
          <Button
            onClick={() => handleActionClick('REJECTED')}
            disabled={disabled || isLoading || isProcessed}
            size={size}
            variant="destructive"
          >
            <XCircle className="w-4 h-4 mr-1" />
            Tolak
          </Button>
        </>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Alasan (opsional)"
            className="w-40"
          />
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            size={size}
            className={selectedAction === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
          >
            {isLoading ? 'Proses...' : 'Konfirmasi'}
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            size={size}
            disabled={isLoading}
          >
            Batal
          </Button>
        </div>
      )}
      
      {isProcessed && (
        <span className="text-sm text-muted-foreground ml-2">
          Status: {currentStatus === 'APPROVED' ? 'DITERIMA' : 'DITOLAK'}
        </span>
      )}
    </div>
  )
}