'use client'

import { useState, useEffect } from 'react'
import { MajorFormData, AVAILABLE_MAJORS } from '@/types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Info } from 'lucide-react'
import { majorDataSchema, type MajorData } from '@/lib/validations/student'
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
    
    // Reset pilihan yang sama jika dipilih di pilihan lain
    if (field === 'firstMajor') {
      if (value === newData.secondMajor) newData.secondMajor = ''
      if (value === newData.thirdMajor) newData.thirdMajor = ''
    } else if (field === 'secondMajor') {
      if (value === newData.firstMajor) newData.firstMajor = ''
      if (value === newData.thirdMajor) newData.thirdMajor = ''
    } else if (field === 'thirdMajor') {
      if (value === newData.firstMajor) newData.firstMajor = ''
      if (value === newData.secondMajor) newData.secondMajor = ''
    }
    
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
      // Convert formData to match schema expectations
      const dataToValidate = {
        ...formData,
        secondMajor: formData.secondMajor || '',
        thirdMajor: formData.thirdMajor || ''
      }
      
      majorDataSchema.parse(dataToValidate)
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

  const getAvailableOptions = (currentField: keyof MajorFormData) => {
    const selectedMajors = [
      currentField !== 'firstMajor' ? formData.firstMajor : '',
      currentField !== 'secondMajor' ? formData.secondMajor : '',
      currentField !== 'thirdMajor' ? formData.thirdMajor : ''
    ].filter(Boolean)

    return AVAILABLE_MAJORS.filter(major => !selectedMajors.includes(major))
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
          <div className="form-field">
            <Label htmlFor="firstMajor" className="form-label">
              Pilihan Jurusan Pertama *
            </Label>
            <Select
              value={formData.firstMajor || ''}
              onValueChange={(value) => handleInputChange('firstMajor', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih jurusan pertama" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableOptions('firstMajor').map((major) => (
                  <SelectItem key={major} value={major}>
                    {major}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.firstMajor && <p className="form-error">{errors.firstMajor}</p>}
            <p className="text-sm text-muted-foreground mt-1">
              Pilihan utama yang paling Anda inginkan
            </p>
          </div>

          <div className="form-field">
            <Label htmlFor="secondMajor" className="form-label">
              Pilihan Jurusan Kedua
            </Label>
            <Select
              value={formData.secondMajor || ''}
              onValueChange={(value) => handleInputChange('secondMajor', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih jurusan kedua (opsional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">-- Tidak memilih --</SelectItem>
                {getAvailableOptions('secondMajor').map((major) => (
                  <SelectItem key={major} value={major}>
                    {major}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              Pilihan alternatif jika pilihan pertama tidak tersedia
            </p>
          </div>

          <div className="form-field">
            <Label htmlFor="thirdMajor" className="form-label">
              Pilihan Jurusan Ketiga
            </Label>
            <Select
              value={formData.thirdMajor || ''}
              onValueChange={(value) => handleInputChange('thirdMajor', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih jurusan ketiga (opsional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">-- Tidak memilih --</SelectItem>
                {getAvailableOptions('thirdMajor').map((major) => (
                  <SelectItem key={major} value={major}>
                    {major}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              Pilihan cadangan terakhir
            </p>
          </div>
        </div>

        {/* Deskripsi Jurusan */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Deskripsi Jurusan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">Teknologi Informasi:</h4>
              <ul className="text-muted-foreground space-y-1">
                <li>• <strong>TKJ:</strong> Jaringan komputer dan server</li>
                <li>• <strong>RPL:</strong> Pemrograman dan aplikasi</li>
                <li>• <strong>MM:</strong> Desain grafis dan video</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Teknik:</h4>
              <ul className="text-muted-foreground space-y-1">
                <li>• <strong>TKR:</strong> Otomotif mobil</li>
                <li>• <strong>TSM:</strong> Otomotif sepeda motor</li>
                <li>• <strong>TEI:</strong> Elektronika industri</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Bisnis:</h4>
              <ul className="text-muted-foreground space-y-1">
                <li>• <strong>AKL:</strong> Akuntansi dan keuangan</li>
                <li>• <strong>OTKP:</strong> Administrasi perkantoran</li>
                <li>• <strong>BDP:</strong> Pemasaran digital</li>
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