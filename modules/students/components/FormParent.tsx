'use client'

import { useState, useEffect } from 'react'
import { ParentFormData } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { parentDataSchema, type ParentData } from '@/lib/validations/student'
import { useToast } from '@/hooks/use-toast'
import { z } from 'zod'

interface FormParentProps {
  data?: Partial<ParentFormData>
  onDataChange?: (data: Partial<ParentFormData>) => void
  onNext?: () => void
  onPrevious?: () => void
}

export default function FormParent({ data = {}, onDataChange, onNext, onPrevious }: FormParentProps) {
  const [formData, setFormData] = useState<Partial<ParentFormData>>(data || {})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  useEffect(() => {
    setFormData(data || {})
  }, [data])

  const handleInputChange = (field: keyof ParentFormData, value: string) => {
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
        fatherJob: formData.fatherJob || '',
        fatherPhone: formData.fatherPhone || '',
        motherJob: formData.motherJob || '',
        motherPhone: formData.motherPhone || '',
        guardianName: formData.guardianName || '',
        guardianJob: formData.guardianJob || '',
        guardianPhone: formData.guardianPhone || '',
        parentAddress: formData.parentAddress || ''
      }
      
      parentDataSchema.parse(dataToValidate)
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
          description: "Mohon periksa kembali data orang tua yang Anda masukkan."
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
        <CardTitle>Data Orang Tua/Wali</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data Ayah */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Data Ayah</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-field">
              <Label htmlFor="fatherName" className="form-label">
                Nama Ayah *
              </Label>
              <Input
                id="fatherName"
                value={formData.fatherName || ''}
                onChange={(e) => handleInputChange('fatherName', e.target.value)}
                placeholder="Masukkan nama ayah"
              />
              {errors.fatherName && <p className="form-error">{errors.fatherName}</p>}
            </div>

            <div className="form-field">
              <Label htmlFor="fatherJob" className="form-label">
                Pekerjaan Ayah
              </Label>
              <Input
                id="fatherJob"
                value={formData.fatherJob || ''}
                onChange={(e) => handleInputChange('fatherJob', e.target.value)}
                placeholder="Masukkan pekerjaan ayah"
              />
            </div>
          </div>

          <div className="form-field">
            <Label htmlFor="fatherPhone" className="form-label">
              Nomor Telepon Ayah
            </Label>
            <Input
              id="fatherPhone"
              value={formData.fatherPhone || ''}
              onChange={(e) => handleInputChange('fatherPhone', e.target.value)}
              placeholder="08123456789"
            />
            {errors.fatherPhone && <p className="form-error">{errors.fatherPhone}</p>}
          </div>
        </div>

        {/* Data Ibu */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Data Ibu</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-field">
              <Label htmlFor="motherName" className="form-label">
                Nama Ibu *
              </Label>
              <Input
                id="motherName"
                value={formData.motherName || ''}
                onChange={(e) => handleInputChange('motherName', e.target.value)}
                placeholder="Masukkan nama ibu"
              />
              {errors.motherName && <p className="form-error">{errors.motherName}</p>}
            </div>

            <div className="form-field">
              <Label htmlFor="motherJob" className="form-label">
                Pekerjaan Ibu
              </Label>
              <Input
                id="motherJob"
                value={formData.motherJob || ''}
                onChange={(e) => handleInputChange('motherJob', e.target.value)}
                placeholder="Masukkan pekerjaan ibu"
              />
            </div>
          </div>

          <div className="form-field">
            <Label htmlFor="motherPhone" className="form-label">
              Nomor Telepon Ibu
            </Label>
            <Input
              id="motherPhone"
              value={formData.motherPhone || ''}
              onChange={(e) => handleInputChange('motherPhone', e.target.value)}
              placeholder="08123456789"
            />
            {errors.motherPhone && <p className="form-error">{errors.motherPhone}</p>}
          </div>
        </div>

        {/* Data Wali (Opsional) */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Data Wali (Opsional)</h3>
          <p className="text-sm text-muted-foreground">
            Isi bagian ini jika ada wali selain orang tua
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-field">
              <Label htmlFor="guardianName" className="form-label">
                Nama Wali
              </Label>
              <Input
                id="guardianName"
                value={formData.guardianName || ''}
                onChange={(e) => handleInputChange('guardianName', e.target.value)}
                placeholder="Masukkan nama wali"
              />
            </div>

            <div className="form-field">
              <Label htmlFor="guardianJob" className="form-label">
                Pekerjaan Wali
              </Label>
              <Input
                id="guardianJob"
                value={formData.guardianJob || ''}
                onChange={(e) => handleInputChange('guardianJob', e.target.value)}
                placeholder="Masukkan pekerjaan wali"
              />
            </div>
          </div>

          <div className="form-field">
            <Label htmlFor="guardianPhone" className="form-label">
              Nomor Telepon Wali
            </Label>
            <Input
              id="guardianPhone"
              value={formData.guardianPhone || ''}
              onChange={(e) => handleInputChange('guardianPhone', e.target.value)}
              placeholder="08123456789"
            />
            {errors.guardianPhone && <p className="form-error">{errors.guardianPhone}</p>}
          </div>
        </div>

        {/* Alamat Orang Tua */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Alamat Orang Tua/Wali</h3>
          <p className="text-sm text-muted-foreground">
            Kosongkan jika sama dengan alamat siswa
          </p>
          
          <div className="form-field">
            <Label htmlFor="parentAddress" className="form-label">
              Alamat Lengkap Orang Tua/Wali
            </Label>
            <Input
              id="parentAddress"
              value={formData.parentAddress || ''}
              onChange={(e) => handleInputChange('parentAddress', e.target.value)}
              placeholder="Masukkan alamat lengkap orang tua/wali (jika berbeda dengan alamat siswa)"
            />
          </div>
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