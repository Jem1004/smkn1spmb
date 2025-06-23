'use client'

import { useState, useEffect } from 'react'
import { DocumentFormData } from '@/types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { documentDataSchema } from '@/lib/validations/student'
import { useToast } from '@/hooks/use-toast'
import { z } from 'zod'

interface FormDocumentsProps {
  data?: Partial<DocumentFormData>
  onDataChange?: (data: Partial<DocumentFormData>) => void
  onNext?: () => void
  onPrevious?: () => void
}

interface DocumentItem {
  key: keyof DocumentFormData
  label: string
  description: string
  required: boolean
}

const REQUIRED_DOCUMENTS: DocumentItem[] = [
  {
    key: 'hasIjazah',
    label: 'Ijazah SMP/MTs',
    description: 'Fotokopi ijazah yang telah dilegalisir',
    required: true
  },
  {
    key: 'hasSKHUN',
    label: 'SKHUN (Surat Keterangan Hasil Ujian Nasional)',
    description: 'Fotokopi SKHUN yang telah dilegalisir',
    required: true
  },
  {
    key: 'hasKK',
    label: 'Kartu Keluarga (KK)',
    description: 'Fotokopi Kartu Keluarga',
    required: true
  },
  {
    key: 'hasAktaLahir',
    label: 'Akta Kelahiran',
    description: 'Fotokopi akta kelahiran',
    required: true
  },
  {
    key: 'hasFoto',
    label: 'Pas Foto',
    description: 'Pas foto 3x4 sebanyak 6 lembar (background merah)',
    required: true
  }
]

const OPTIONAL_DOCUMENTS: DocumentItem[] = [
  {
    key: 'hasRaport',
    label: 'Raport SMP/MTs',
    description: 'Fotokopi raport semester 1-5 yang telah dilegalisir',
    required: false
  },
  {
    key: 'hasSertifikat',
    label: 'Sertifikat Prestasi',
    description: 'Fotokopi sertifikat prestasi akademik/non-akademik (jika ada)',
    required: false
  }
]

export default function FormDocuments({ data, onDataChange, onNext, onPrevious }: FormDocumentsProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<Partial<DocumentFormData>>(data || {})
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setFormData(data || {})
  }, [data])

  const handleCheckboxChange = (field: keyof DocumentFormData, checked: boolean) => {
    const newData = { ...formData, [field]: checked }
    setFormData(newData)
    if (onDataChange) {
      onDataChange(newData)
    }
    
    // Clear error when user checks required document
    if (errors[field] && checked) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    try {
      // Convert formData to match schema expectations
      const dataToValidate = {
        hasIjazah: formData.hasIjazah || false,
        hasSKHUN: formData.hasSKHUN || false,
        hasKK: formData.hasKK || false,
        hasAktaLahir: formData.hasAktaLahir || false,
        hasFoto: formData.hasFoto || false,
        hasRaport: formData.hasRaport || false,
        hasSertifikat: formData.hasSertifikat || false
      }

      documentDataSchema.parse(dataToValidate)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        
        error.errors.forEach((err) => {
          const field = err.path[0] as string
          const document = REQUIRED_DOCUMENTS.find(doc => doc.key === field)
          newErrors[field] = document ? `${document.label} wajib disiapkan` : err.message
        })
        
        setErrors(newErrors)
        
        toast({
          variant: "destructive",
          title: "Validasi Gagal",
          description: "Mohon lengkapi semua dokumen yang wajib"
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

  const getCompletionStats = () => {
    const requiredCount = REQUIRED_DOCUMENTS.length
    const requiredCompleted = REQUIRED_DOCUMENTS.filter(doc => formData[doc.key]).length
    const optionalCompleted = OPTIONAL_DOCUMENTS.filter(doc => formData[doc.key]).length
    
    return {
      requiredCount,
      requiredCompleted,
      optionalCompleted,
      isRequiredComplete: requiredCompleted === requiredCount
    }
  }

  const stats = getCompletionStats()

  const DocumentCheckbox = ({ document }: { document: DocumentItem }) => (
    <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <Checkbox
        id={document.key}
        checked={formData[document.key] || false}
        onCheckedChange={(checked) => handleCheckboxChange(document.key, checked as boolean)}
        className="mt-1"
      />
      <div className="flex-1 space-y-1">
        <div className="flex items-center space-x-2">
          <Label htmlFor={document.key} className="font-medium cursor-pointer">
            {document.label}
          </Label>
          {document.required && (
            <span className="text-red-500 text-sm">*</span>
          )}
          {formData[document.key] && (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {document.description}
        </p>
        {errors[document.key] && (
          <p className="form-error text-xs">{errors[document.key]}</p>
        )}
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Kelengkapan Dokumen</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Summary */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-blue-900">Status Kelengkapan</h3>
            {stats.isRequiredComplete ? (
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Lengkap</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-orange-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Belum Lengkap</span>
              </div>
            )}
          </div>
          <div className="text-sm text-blue-800">
            <p>Dokumen Wajib: {stats.requiredCompleted}/{stats.requiredCount}</p>
            <p>Dokumen Tambahan: {stats.optionalCompleted}/{OPTIONAL_DOCUMENTS.length}</p>
          </div>
        </div>

        {/* Required Documents */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-red-700">Dokumen Wajib</h3>
            <span className="text-red-500 text-sm">*</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Semua dokumen berikut wajib disiapkan untuk melengkapi pendaftaran
          </p>
          <div className="space-y-3">
            {REQUIRED_DOCUMENTS.map((document) => (
              <DocumentCheckbox key={document.key} document={document} />
            ))}
          </div>
        </div>

        {/* Optional Documents */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-700">Dokumen Tambahan</h3>
          <p className="text-sm text-muted-foreground">
            Dokumen berikut bersifat opsional namun dapat mendukung proses seleksi
          </p>
          <div className="space-y-3">
            {OPTIONAL_DOCUMENTS.map((document) => (
              <DocumentCheckbox key={document.key} document={document} />
            ))}
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">Catatan Penting</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Semua fotokopi dokumen harus jelas dan dapat dibaca</li>
                <li>• Dokumen yang dilegalisir harus dari sekolah asal atau instansi berwenang</li>
                <li>• Pas foto harus terbaru (maksimal 6 bulan)</li>
                <li>• Dokumen asli akan diminta saat daftar ulang</li>
                <li>• Sertifikat prestasi dapat meningkatkan peluang diterima</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onPrevious} disabled={!onPrevious}>
            Sebelumnya
          </Button>
          <Button 
            type="button" 
            onClick={handleNext}
            disabled={!stats.isRequiredComplete || !onNext}
          >
            Selanjutnya
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}