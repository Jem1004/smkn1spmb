'use client'

import { useState, useEffect, useCallback } from 'react'
import { PersonalFormData, Gender } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { personalDataSchema } from '@/lib/validations/student'
import { useToast } from '@/hooks/use-toast'
import { z } from 'zod'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface FormPersonalProps {
  data?: Partial<PersonalFormData>
  onDataChange?: (data: Partial<PersonalFormData>) => void
  onNext?: () => void
  onPrevious?: () => void
}

const RELIGIONS = [
  'Islam',
  'Kristen Protestan',
  'Kristen Katolik',
  'Hindu',
  'Buddha',
  'Konghucu'
]

const PROVINCES = [
  'DKI Jakarta',
  'Jawa Barat',
  'Jawa Tengah',
  'Jawa Timur',
  'Banten',
  'Yogyakarta',
  'Sumatera Utara',
  'Sumatera Barat',
  'Sumatera Selatan',
  'Kalimantan Barat',
  'Kalimantan Timur',
  'Sulawesi Selatan',
  'Bali'
]

export default function FormPersonal({ data = {}, onDataChange, onNext, onPrevious }: FormPersonalProps) {
  const [formData, setFormData] = useState<Partial<PersonalFormData>>(data || {})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isValidating, setIsValidating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setFormData(data || {})
  }, [data])

  const handleInputChange = (field: keyof PersonalFormData, value: string | number) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    if (onDataChange) {
      onDataChange(newData)
    }
    
    // Clear immediate error
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleNumberChange = (field: keyof PersonalFormData, value: string) => {
    const numValue = parseInt(value) || 0
    handleInputChange(field, numValue)
  }

  const validateForm = (): boolean => {
    try {
      // Convert formData to match schema expectations
      const dataToValidate = {
        ...formData,
        nationality: formData.nationality || 'Indonesia',
        phoneNumber: formData.phoneNumber || '',
        email: formData.email || '',
        rt: formData.rt || '',
        rw: formData.rw || '',
        medicalHistory: formData.medicalHistory || '',
        childOrder: formData.childOrder || 1,
        totalSiblings: formData.totalSiblings || 0,
        height: formData.height || 0,
        weight: formData.weight || 0
      }
      
      personalDataSchema.parse(dataToValidate)
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
          description: "Mohon periksa kembali data yang Anda masukkan."
        })
      }
      return false
    }
  }

  const handleNext = async () => {
    setIsValidating(true)
    try {
      if (validateForm() && onNext) {
        onNext()
      }
    } finally {
      setIsValidating(false)
    }
  }

  const calculateProgress = () => {
    const requiredFields = ['fullName', 'birthPlace', 'birthDate', 'gender', 'religion', 'nationality', 'address', 'village', 'district', 'city', 'province', 'postalCode', 'phoneNumber', 'email', 'childOrder', 'totalSiblings', 'height', 'weight']
    const filledFields = requiredFields.filter(field => formData[field as keyof PersonalFormData])
    return (filledFields.length / requiredFields.length) * 100
  }

  const getFieldStatus = (field: keyof PersonalFormData) => {
    if (errors[field]) return 'error'
    if (formData[field] && !errors[field]) return 'success'
    return 'default'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Personal</CardTitle>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress Pengisian</span>
            <span>{Math.round(calculateProgress())}%</span>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-medium">
            Nama Lengkap <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fullName"
            value={formData.fullName || ''}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            placeholder="Masukkan nama lengkap"
            className={errors.fullName ? 'border-red-500' : ''}
          />
          {errors.fullName && (
            <p className="form-error text-xs">{errors.fullName}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-field">
            <Label htmlFor="birthPlace" className="form-label">
              Tempat Lahir *
            </Label>
            <Input
              id="birthPlace"
              value={formData.birthPlace || ''}
              onChange={(e) => handleInputChange('birthPlace', e.target.value)}
              placeholder="Masukkan tempat lahir"
            />
            {errors.birthPlace && <p className="form-error">{errors.birthPlace}</p>}
          </div>

          <div className="form-field">
            <Label htmlFor="birthDate" className="form-label">
              Tanggal Lahir *
            </Label>
            <Input
              id="birthDate"
              type="date"
              value={formData.birthDate || ''}
              onChange={(e) => handleInputChange('birthDate', e.target.value)}
            />
            {errors.birthDate && <p className="form-error">{errors.birthDate}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-field">
            <Label htmlFor="gender" className="form-label">
              Jenis Kelamin *
            </Label>
            <Select
              value={formData.gender || ''}
              onValueChange={(value) => handleInputChange('gender', value as Gender)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis kelamin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Laki-laki</SelectItem>
                <SelectItem value="FEMALE">Perempuan</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && <p className="form-error">{errors.gender}</p>}
          </div>

          <div className="form-field">
            <Label htmlFor="religion" className="form-label">
              Agama *
            </Label>
            <Select
              value={formData.religion || ''}
              onValueChange={(value) => handleInputChange('religion', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih agama" />
              </SelectTrigger>
              <SelectContent>
                {RELIGIONS.map((religion) => (
                  <SelectItem key={religion} value={religion}>
                    {religion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.religion && <p className="form-error">{errors.religion}</p>}
          </div>
        </div>

        <div className="form-field">
          <Label htmlFor="nationality" className="form-label">
            Kewarganegaraan *
          </Label>
          <Input
            id="nationality"
            value={formData.nationality || 'Indonesia'}
            onChange={(e) => handleInputChange('nationality', e.target.value)}
            placeholder="Masukkan kewarganegaraan"
          />
          {errors.nationality && <p className="form-error">{errors.nationality}</p>}
        </div>

        <div className="form-field">
          <Label htmlFor="address" className="form-label">
            Alamat Lengkap *
          </Label>
          <Input
            id="address"
            value={formData.address || ''}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Masukkan alamat lengkap"
          />
          {errors.address && <p className="form-error">{errors.address}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="form-field">
            <Label htmlFor="rt" className="form-label">
              RT
            </Label>
            <Input
              id="rt"
              value={formData.rt || ''}
              onChange={(e) => handleInputChange('rt', e.target.value)}
              placeholder="001"
            />
          </div>

          <div className="form-field">
            <Label htmlFor="rw" className="form-label">
              RW
            </Label>
            <Input
              id="rw"
              value={formData.rw || ''}
              onChange={(e) => handleInputChange('rw', e.target.value)}
              placeholder="001"
            />
          </div>

          <div className="form-field">
            <Label htmlFor="village" className="form-label">
              Kelurahan/Desa *
            </Label>
            <Input
              id="village"
              value={formData.village || ''}
              onChange={(e) => handleInputChange('village', e.target.value)}
              placeholder="Masukkan kelurahan/desa"
            />
            {errors.village && <p className="form-error">{errors.village}</p>}
          </div>

          <div className="form-field">
            <Label htmlFor="district" className="form-label">
              Kecamatan *
            </Label>
            <Input
              id="district"
              value={formData.district || ''}
              onChange={(e) => handleInputChange('district', e.target.value)}
              placeholder="Masukkan kecamatan"
            />
            {errors.district && <p className="form-error">{errors.district}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-field">
            <Label htmlFor="city" className="form-label">
              Kota/Kabupaten *
            </Label>
            <Input
              id="city"
              value={formData.city || ''}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="Masukkan kota/kabupaten"
            />
            {errors.city && <p className="form-error">{errors.city}</p>}
          </div>

          <div className="form-field">
            <Label htmlFor="province" className="form-label">
              Provinsi *
            </Label>
            <Select
              value={formData.province || ''}
              onValueChange={(value) => handleInputChange('province', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih provinsi" />
              </SelectTrigger>
              <SelectContent>
                {PROVINCES.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.province && <p className="form-error">{errors.province}</p>}
          </div>

          <div className="form-field">
            <Label htmlFor="postalCode" className="form-label">
              Kode Pos *
            </Label>
            <Input
              id="postalCode"
              value={formData.postalCode || ''}
              onChange={(e) => handleInputChange('postalCode', e.target.value)}
              placeholder="12345"
              maxLength={5}
            />
            {errors.postalCode && <p className="form-error">{errors.postalCode}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="childOrder" className="text-sm font-medium">
              Anak ke- <span className="text-red-500">*</span>
            </Label>
            <Input
              id="childOrder"
              type="number"
              min="1"
              value={formData.childOrder || ''}
              onChange={(e) => handleNumberChange('childOrder', e.target.value)}
              placeholder="Contoh: 1"
              className={errors.childOrder ? 'border-red-500' : ''}
            />
            {errors.childOrder && (
              <p className="form-error text-xs">{errors.childOrder}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalSiblings" className="text-sm font-medium">
              Dari berapa bersaudara <span className="text-red-500">*</span>
            </Label>
            <Input
              id="totalSiblings"
              type="number"
              min="1"
              value={formData.totalSiblings || ''}
              onChange={(e) => handleNumberChange('totalSiblings', e.target.value)}
              placeholder="Contoh: 3"
              className={errors.totalSiblings ? 'border-red-500' : ''}
            />
            {errors.totalSiblings && (
              <p className="form-error text-xs">{errors.totalSiblings}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="height" className="text-sm font-medium">
              Tinggi Badan (cm) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="height"
              type="number"
              min="100"
              max="250"
              value={formData.height || ''}
              onChange={(e) => handleNumberChange('height', e.target.value)}
              placeholder="Contoh: 165"
              className={errors.height ? 'border-red-500' : ''}
            />
            {errors.height && (
              <p className="form-error text-xs">{errors.height}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight" className="text-sm font-medium">
              Berat Badan (kg) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="weight"
              type="number"
              min="20"
              max="200"
              value={formData.weight || ''}
              onChange={(e) => handleNumberChange('weight', e.target.value)}
              placeholder="Contoh: 55"
              className={errors.weight ? 'border-red-500' : ''}
            />
            {errors.weight && (
              <p className="form-error text-xs">{errors.weight}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="medicalHistory" className="text-sm font-medium">
            Riwayat Penyakit
          </Label>
          <Input
            id="medicalHistory"
            value={formData.medicalHistory || ''}
            onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
            placeholder="Tuliskan riwayat penyakit jika ada, atau tulis 'Tidak ada'"
            className={errors.medicalHistory ? 'border-red-500' : ''}
          />
          <p className="text-xs text-muted-foreground">
            Kosongkan jika tidak ada riwayat penyakit khusus
          </p>
          {errors.medicalHistory && (
            <p className="form-error text-xs">{errors.medicalHistory}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-sm font-medium">
              Nomor Telepon <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber || ''}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              placeholder="Contoh: 08123456789"
              className={errors.phoneNumber ? 'border-red-500' : ''}
            />
            {errors.phoneNumber && (
              <p className="form-error text-xs">{errors.phoneNumber}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="contoh@email.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="form-error text-xs">{errors.email}</p>
            )}
          </div>
        </div>

        <div className="flex justify-between pt-4">
          {onPrevious && (
            <Button type="button" variant="outline" onClick={onPrevious}>
              Sebelumnya
            </Button>
          )}
          <Button 
            type="button" 
            onClick={handleNext} 
            className="ml-auto"
            disabled={isValidating || !onNext}
          >
            {isValidating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Memvalidasi...
              </>
            ) : (
              'Selanjutnya'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}