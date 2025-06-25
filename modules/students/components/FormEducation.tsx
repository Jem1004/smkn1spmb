'use client'

import { useState, useEffect } from 'react'
import { EducationFormData } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { educationDataSchema } from '@/lib/validations/student'
import { useToast } from '@/hooks/use-toast'
import { z } from 'zod'

interface FormEducationProps {
  data?: Partial<EducationFormData>
  onDataChange?: (data: Partial<EducationFormData>) => void
  onNext?: () => void
  onPrevious?: () => void
}

export default function FormEducation({ data = {}, onDataChange, onNext, onPrevious }: FormEducationProps) {
  const [formData, setFormData] = useState<Partial<EducationFormData>>(data || {})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  useEffect(() => {
    setFormData(data || {})
  }, [data])

  const handleInputChange = (field: keyof EducationFormData, value: string | number) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    if (onDataChange) {
      onDataChange(newData)
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    try {
      // Convert formData to match schema expectations
      const dataToValidate = {
        ...formData,
        nisn: formData.nisn || '',
        npsn: formData.npsn || '',
        certificateNumber: formData.certificateNumber || ''
      }
      
      educationDataSchema.parse(dataToValidate)
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
          description: "Mohon periksa kembali data pendidikan yang Anda masukkan."
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

  // Generate year options
  const currentYear = new Date().getFullYear()
  const yearOptions = []
  for (let year = currentYear + 1; year >= 2000; year--) {
    yearOptions.push(year)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Pendidikan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Informasi Sekolah Asal */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            <span>Informasi Sekolah Asal</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="schoolName" className="text-sm font-medium">
                Nama Sekolah Asal <span className="text-red-500">*</span>
              </Label>
              <Input
                id="schoolName"
                value={formData.schoolName || ''}
                onChange={(e) => handleInputChange('schoolName', e.target.value)}
                placeholder="Masukkan nama sekolah asal"
                className={errors.schoolName ? 'border-red-500' : ''}
              />
              {errors.schoolName && (
                <p className="form-error text-xs">{errors.schoolName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="npsn" className="text-sm font-medium">
                NPSN Sekolah Asal <span className="text-red-500">*</span>
              </Label>
              <Input
                id="npsn"
                value={formData.npsn || ''}
                onChange={(e) => handleInputChange('npsn', e.target.value)}
                placeholder="Masukkan NPSN (8 digit)"
                maxLength={8}
                className={errors.npsn ? 'border-red-500' : ''}
              />
              {errors.npsn && (
                <p className="form-error text-xs">{errors.npsn}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nisn" className="text-sm font-medium">
                NISN <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nisn"
                value={formData.nisn || ''}
                onChange={(e) => handleInputChange('nisn', e.target.value)}
                placeholder="Masukkan NISN (10 digit)"
                maxLength={10}
                className={errors.nisn ? 'border-red-500' : ''}
              />
              {errors.nisn && (
                <p className="form-error text-xs">{errors.nisn}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="graduationYear" className="text-sm font-medium">
                Tahun Kelulusan <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.graduationYear?.toString() || ''}
                onValueChange={(value) => handleInputChange('graduationYear', parseInt(value))}
              >
                <SelectTrigger className={errors.graduationYear ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Pilih tahun kelulusan" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 2030 - 2000 + 1 }, (_, i) => {
                    const year = 2000 + i
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              {errors.graduationYear && (
                <p className="form-error text-xs">{errors.graduationYear}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="certificateNumber" className="text-sm font-medium">
              Nomor Ijazah/SKL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="certificateNumber"
              value={formData.certificateNumber || ''}
              onChange={(e) => handleInputChange('certificateNumber', e.target.value)}
              placeholder="Masukkan nomor ijazah atau SKL"
              className={errors.certificateNumber ? 'border-red-500' : ''}
            />
            <p className="text-xs text-muted-foreground">
              Nomor yang tertera pada ijazah atau Surat Keterangan Lulus (SKL)
            </p>
            {errors.certificateNumber && (
              <p className="form-error text-xs">{errors.certificateNumber}</p>
            )}
          </div>
        </div>

        {/* Informasi Tambahan */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Informasi Penting</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Pastikan nama sekolah asal ditulis dengan lengkap dan benar</li>
            <li>• NISN dapat ditemukan di ijazah atau SKHUN</li>
            <li>• Tahun lulus harus sesuai dengan dokumen resmi</li>
            <li>• Data ini akan diverifikasi dengan dokumen yang diserahkan</li>
          </ul>
        </div>

        <div className="flex justify-between pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onPrevious}
            disabled={!onPrevious}
          >
            Sebelumnya
          </Button>
          <Button 
            type="button" 
            onClick={handleNext}
            disabled={!onNext}
          >
            Selanjutnya
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}