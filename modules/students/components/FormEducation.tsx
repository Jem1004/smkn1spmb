'use client'

import { useState, useEffect } from 'react'
import { EducationFormData } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { educationDataSchema, type EducationData } from '@/lib/validations/student'
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
        nisn: formData.nisn || ''
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
        <div className="form-field">
          <Label htmlFor="previousSchool" className="form-label">
            Asal Sekolah (SMP/MTs) *
          </Label>
          <Input
            id="previousSchool"
            value={formData.previousSchool || ''}
            onChange={(e) => handleInputChange('previousSchool', e.target.value)}
            placeholder="Masukkan nama sekolah asal (contoh: SMP Negeri 1 Jakarta)"
          />
          {errors.previousSchool && <p className="form-error">{errors.previousSchool}</p>}
          <p className="text-sm text-muted-foreground mt-1">
            Tuliskan nama lengkap sekolah asal beserta kota/kabupaten
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-field">
            <Label htmlFor="nisn" className="form-label">
              NISN (Nomor Induk Siswa Nasional)
            </Label>
            <Input
              id="nisn"
              value={formData.nisn || ''}
              onChange={(e) => handleInputChange('nisn', e.target.value)}
              placeholder="1234567890"
              maxLength={10}
            />
            {errors.nisn && <p className="form-error">{errors.nisn}</p>}
            <p className="text-sm text-muted-foreground mt-1">
              NISN terdiri dari 10 digit angka (opsional)
            </p>
          </div>

          <div className="form-field">
            <Label htmlFor="graduationYear" className="form-label">
              Tahun Lulus *
            </Label>
            <Select
              value={formData.graduationYear?.toString() || ''}
              onValueChange={(value) => handleInputChange('graduationYear', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih tahun lulus" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.graduationYear && <p className="form-error">{errors.graduationYear}</p>}
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