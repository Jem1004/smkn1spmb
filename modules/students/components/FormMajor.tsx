'use client'

import { useState, useEffect } from 'react'
import { MajorFormData, AVAILABLE_MAJORS } from '@/types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Info } from 'lucide-react'
import { majorDataSchema } from '@/lib/validations/student'
import { useToast } from '@/hooks/use-toast'
import { z } from 'zod'

interface FormMajorProps {
  data?: MajorFormData
  onDataChange?: (data: MajorFormData) => void
  onNext?: () => void
  onPrevious?: () => void
}

export default function FormMajor({ data, onDataChange, onNext, onPrevious }: FormMajorProps) {
  const [formData, setFormData] = useState<MajorFormData>(data ?? {} as MajorFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  useEffect(() => {
    setFormData(data ?? {} as MajorFormData)
  }, [data])

  const handleInputChange = (field: keyof MajorFormData, value: string) => {
    const newData = { ...formData, [field]: value }
    
    setFormData(newData)
    if (onDataChange) {
      onDataChange(newData)
    }
    
    // Clear error when user makes selection
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    try {
      majorDataSchema.parse(formData)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            newErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(newErrors)
        
        // Show toast for validation errors
        toast({
          variant: "destructive",
          title: "Validasi Gagal",
          description: "Mohon periksa kembali pilihan jurusan yang Anda masukkan."
        })
      }
      return false
    }
  }

  const handleNext = () => {
    if (validateForm() && onNext) {
      onNext()
    }
  }



  return (
    <Card>
      <CardHeader>
        <CardTitle>Pilihan Jurusan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informasi Jurusan */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start space-x-2">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Informasi Pilihan Jurusan</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Pilihan pertama adalah prioritas utama Anda</li>
                <li>• Pilihan kedua dan ketiga sebagai alternatif jika pilihan pertama penuh</li>
                <li>• Anda wajib memilih minimal 1 jurusan</li>
                <li>• Tidak boleh memilih jurusan yang sama</li>
                <li>• Pertimbangkan minat dan bakat Anda dalam memilih</li>
              </ul>
            </div>
          </div>
        </div>

        {errors.general && (
          <div className="form-error">
            {errors.general}
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Pilihan Jurusan</h3>
          <p className="text-sm text-muted-foreground">
            Pilih satu jurusan yang diinginkan dari daftar jurusan yang tersedia.
          </p>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Jurusan yang Dipilih <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.selectedMajor || ''}
              onValueChange={(value) => handleInputChange('selectedMajor', value)}
            >
              <SelectTrigger className={errors.selectedMajor ? 'border-red-500' : ''}>
                <SelectValue placeholder="Pilih jurusan yang diinginkan" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_MAJORS.map((major) => (
                  <SelectItem key={major} value={major}>
                    {major}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.selectedMajor && (
              <p className="form-error text-xs">{errors.selectedMajor}</p>
            )}
          </div>
        </div>

        {/* Deskripsi Jurusan */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Deskripsi Jurusan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">Teknik:</h4>
              <ul className="text-muted-foreground space-y-1">
                <li>• <strong>Teknik Kendaraan Ringan Otomotif:</strong> Perawatan dan perbaikan mobil</li>
                <li>• <strong>Teknik Alat Berat:</strong> Operasi dan maintenance alat berat</li>
                <li>• <strong>Teknik Komputer dan Jaringan:</strong> Jaringan komputer dan IT</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Kesehatan & Bisnis:</h4>
              <ul className="text-muted-foreground space-y-1">
                <li>• <strong>Akuntansi dan Keuangan Lembaga:</strong> Pembukuan dan keuangan</li>
                <li>• <strong>Asisten Keperawatan:</strong> Pelayanan kesehatan dasar</li>
                <li>• <strong>Agribisnis Ternak Ruminansia:</strong> Peternakan sapi dan kambing</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onPrevious} disabled={!onPrevious}>
            Sebelumnya
          </Button>
          <Button type="button" onClick={handleNext} disabled={!onNext}>
            Selanjutnya
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}