'use client'

import { useState, useEffect } from 'react'
import { ParentFormData } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { parentDataSchema } from '@/lib/validations/student'
import { useToast } from '@/hooks/use-toast'
import { z } from 'zod'
import { Phone, User, Users, Home } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
        fatherEducation: formData.fatherEducation || '',
        motherJob: formData.motherJob || '',
        motherEducation: formData.motherEducation || '',
        guardianName: formData.guardianName || '',
        guardianJob: formData.guardianJob || '',
        parentPhone: formData.parentPhone || '',
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
          <h3 className="font-semibold text-lg flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Data Ayah</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fatherName" className="text-sm font-medium">
                Nama Ayah <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fatherName"
                value={formData.fatherName || ''}
                onChange={(e) => handleInputChange('fatherName', e.target.value)}
                placeholder="Masukkan nama ayah"
                className={errors.fatherName ? 'border-red-500' : ''}
              />
              {errors.fatherName && (
                <p className="form-error text-xs">{errors.fatherName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="fatherJob" className="text-sm font-medium">
                Pekerjaan Ayah <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fatherJob"
                value={formData.fatherJob || ''}
                onChange={(e) => handleInputChange('fatherJob', e.target.value)}
                placeholder="Masukkan pekerjaan ayah"
                className={errors.fatherJob ? 'border-red-500' : ''}
              />
              {errors.fatherJob && (
                <p className="form-error text-xs">{errors.fatherJob}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fatherEducation" className="text-sm font-medium">
              Pendidikan Terakhir Ayah <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.fatherEducation || ''}
              onValueChange={(value) => handleInputChange('fatherEducation', value)}
            >
              <SelectTrigger className={errors.fatherEducation ? 'border-red-500' : ''}>
                <SelectValue placeholder="Pilih pendidikan terakhir ayah" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SD">SD/Sederajat</SelectItem>
                <SelectItem value="SMP">SMP/Sederajat</SelectItem>
                <SelectItem value="SMA">SMA/SMK/Sederajat</SelectItem>
                <SelectItem value="D3">Diploma 3</SelectItem>
                <SelectItem value="S1">Sarjana (S1)</SelectItem>
                <SelectItem value="S2">Magister (S2)</SelectItem>
                <SelectItem value="S3">Doktor (S3)</SelectItem>
                <SelectItem value="Lainnya">Lainnya</SelectItem>
              </SelectContent>
            </Select>
            {errors.fatherEducation && (
              <p className="form-error text-xs">{errors.fatherEducation}</p>
            )}
          </div>
        </div>

        {/* Data Ibu */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Data Ibu</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="motherName" className="text-sm font-medium">
                Nama Ibu <span className="text-red-500">*</span>
              </Label>
              <Input
                id="motherName"
                value={formData.motherName || ''}
                onChange={(e) => handleInputChange('motherName', e.target.value)}
                placeholder="Masukkan nama ibu"
                className={errors.motherName ? 'border-red-500' : ''}
              />
              {errors.motherName && (
                <p className="form-error text-xs">{errors.motherName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="motherJob" className="text-sm font-medium">
                Pekerjaan Ibu <span className="text-red-500">*</span>
              </Label>
              <Input
                id="motherJob"
                value={formData.motherJob || ''}
                onChange={(e) => handleInputChange('motherJob', e.target.value)}
                placeholder="Masukkan pekerjaan ibu"
                className={errors.motherJob ? 'border-red-500' : ''}
              />
              {errors.motherJob && (
                <p className="form-error text-xs">{errors.motherJob}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="motherEducation" className="text-sm font-medium">
              Pendidikan Terakhir Ibu <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.motherEducation || ''}
              onValueChange={(value) => handleInputChange('motherEducation', value)}
            >
              <SelectTrigger className={errors.motherEducation ? 'border-red-500' : ''}>
                <SelectValue placeholder="Pilih pendidikan terakhir ibu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SD">SD/Sederajat</SelectItem>
                <SelectItem value="SMP">SMP/Sederajat</SelectItem>
                <SelectItem value="SMA">SMA/SMK/Sederajat</SelectItem>
                <SelectItem value="D3">Diploma 3</SelectItem>
                <SelectItem value="S1">Sarjana (S1)</SelectItem>
                <SelectItem value="S2">Magister (S2)</SelectItem>
                <SelectItem value="S3">Doktor (S3)</SelectItem>
                <SelectItem value="Lainnya">Lainnya</SelectItem>
              </SelectContent>
            </Select>
            {errors.motherEducation && (
              <p className="form-error text-xs">{errors.motherEducation}</p>
            )}
          </div>
        </div>

        {/* Nomor Telepon Orang Tua/Wali */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center space-x-2">
            <Phone className="h-5 w-5" />
            <span>Kontak Orang Tua/Wali</span>
          </h3>
          <div className="space-y-2">
            <Label htmlFor="parentPhone" className="text-sm font-medium">
              Nomor Telepon Orang Tua/Wali <span className="text-red-500">*</span>
            </Label>
            <Input
              id="parentPhone"
              type="tel"
              value={formData.parentPhone || ''}
              onChange={(e) => handleInputChange('parentPhone', e.target.value)}
              placeholder="Contoh: 08123456789"
              className={errors.parentPhone ? 'border-red-500' : ''}
            />
            <p className="text-xs text-muted-foreground">
              Nomor telepon yang dapat dihubungi (ayah, ibu, atau wali)
            </p>
            {errors.parentPhone && (
              <p className="form-error text-xs">{errors.parentPhone}</p>
            )}
          </div>
        </div>

        {/* Data Wali (Opsional) */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Data Wali (Opsional)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guardianName" className="text-sm font-medium">
                Nama Wali
              </Label>
              <Input
                id="guardianName"
                value={formData.guardianName || ''}
                onChange={(e) => handleInputChange('guardianName', e.target.value)}
                placeholder="Masukkan nama wali (jika ada)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardianJob" className="text-sm font-medium">
                Pekerjaan Wali
              </Label>
              <Input
                id="guardianJob"
                value={formData.guardianJob || ''}
                onChange={(e) => handleInputChange('guardianJob', e.target.value)}
                placeholder="Masukkan pekerjaan wali (jika ada)"
              />
            </div>
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