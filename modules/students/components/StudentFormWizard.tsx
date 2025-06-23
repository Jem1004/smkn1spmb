'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  PersonalFormData, 
  ParentFormData, 
  EducationFormData, 
  MajorFormData, 
  DocumentFormData, 
  RankingFormData,
  CompleteStudentFormData 
} from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Circle, ArrowLeft, ArrowRight, Save, Send } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import FormPersonal from './FormPersonal'
import FormParent from './FormParent'
import FormEducation from './FormEducation'
import FormMajor from './FormMajor'
import FormDocuments from './FormDocuments'
import FormRanking from './FormRanking'

interface StudentFormWizardProps {
  initialData?: CompleteStudentFormData
  mode?: 'create' | 'edit'
  onSubmit?: (data: CompleteStudentFormData) => Promise<void>
  onCancel?: () => void
}

interface Step {
  id: string
  title: string
  description: string
  component: React.ComponentType<any>
  required: boolean
}

const STEPS: Step[] = [
  {
    id: 'personal',
    title: 'Data Pribadi',
    description: 'Informasi pribadi siswa',
    component: FormPersonal,
    required: true
  },
  {
    id: 'parent',
    title: 'Data Orang Tua',
    description: 'Informasi orang tua/wali',
    component: FormParent,
    required: true
  },
  {
    id: 'education',
    title: 'Data Pendidikan',
    description: 'Riwayat pendidikan sebelumnya',
    component: FormEducation,
    required: true
  },
  {
    id: 'major',
    title: 'Pilihan Jurusan',
    description: 'Pilihan program keahlian',
    component: FormMajor,
    required: true
  },
  {
    id: 'documents',
    title: 'Kelengkapan Dokumen',
    description: 'Checklist dokumen persyaratan',
    component: FormDocuments,
    required: true
  },
  {
    id: 'ranking',
    title: 'Penilaian',
    description: 'Nilai akademik dan prestasi',
    component: FormRanking,
    required: false
  }
]

export default function StudentFormWizard({ 
  initialData, 
  mode = 'create', 
  onSubmit, 
  onCancel 
}: StudentFormWizardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  
  const [formData, setFormData] = useState<CompleteStudentFormData>({
    // Personal data - spread individual fields
    fullName: initialData?.fullName || '',
    nickname: initialData?.nickname || '',
    birthPlace: initialData?.birthPlace || '',
    birthDate: initialData?.birthDate || '',
    gender: initialData?.gender || 'MALE',
    religion: initialData?.religion || '',
    nationality: initialData?.nationality || 'Indonesia',
    address: initialData?.address || '',
    rt: initialData?.rt || '',
    rw: initialData?.rw || '',
    village: initialData?.village || '',
    district: initialData?.district || '',
    city: initialData?.city || '',
    province: initialData?.province || '',
    postalCode: initialData?.postalCode || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    
    // Parent data
    fatherName: initialData?.fatherName || '',
    fatherJob: initialData?.fatherJob || '',
    fatherPhone: initialData?.fatherPhone || '',
    motherName: initialData?.motherName || '',
    motherJob: initialData?.motherJob || '',
    motherPhone: initialData?.motherPhone || '',
    guardianName: initialData?.guardianName || '',
    guardianJob: initialData?.guardianJob || '',
    guardianPhone: initialData?.guardianPhone || '',
    parentAddress: initialData?.parentAddress || '',
    
    // Education data
    previousSchool: initialData?.previousSchool || '',
    nisn: initialData?.nisn || '',
    graduationYear: initialData?.graduationYear || new Date().getFullYear(),
    
    // Major data
    firstMajor: initialData?.firstMajor || '',
    secondMajor: initialData?.secondMajor || '',
    thirdMajor: initialData?.thirdMajor || '',
    
    // Document data
    hasIjazah: initialData?.hasIjazah || false,
    hasSKHUN: initialData?.hasSKHUN || false,
    hasKK: initialData?.hasKK || false,
    hasAktaLahir: initialData?.hasAktaLahir || false,
    hasFoto: initialData?.hasFoto || false,
    hasRaport: initialData?.hasRaport || false,
    hasSertifikat: initialData?.hasSertifikat || false,
    
    // Ranking data (optional)
    ranking: initialData?.ranking ? {
      indonesianScore: initialData.ranking.indonesianScore || 0,
      englishScore: initialData.ranking.englishScore || 0,
      mathScore: initialData.ranking.mathScore || 0,
      scienceScore: initialData.ranking.scienceScore || 0,
      academicAchievement: initialData.ranking.academicAchievement || 'none',
      nonAcademicAchievement: initialData.ranking.nonAcademicAchievement || 'none',
      certificateScore: initialData.ranking.certificateScore || 'none'
    } : undefined
  })

  const handleDataChange = (stepId: string, data: any) => {
    if (stepId === 'ranking') {
      setFormData(prev => ({
        ...prev,
        ranking: { ...prev.ranking, ...data }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        ...data
      }))
    }
  }

  const handleNext = () => {
    // Mark current step as completed
setCompletedSteps(prev => new Set(Array.from(prev).concat([currentStep])))
    
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = (stepIndex: number) => {
    // Allow navigation to completed steps or next step
    if (completedSteps.has(stepIndex) || stepIndex <= Math.max(...Array.from(completedSteps)) + 1) {
      setCurrentStep(stepIndex)
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      
      if (onSubmit) {
        await onSubmit(formData)
      } else {
        // Default submit behavior
        const endpoint = mode === 'edit' && (initialData as any)?.id
          ? `/api/students/${(initialData as any)?.id}`
          : '/api/students'
        
        const method = mode === 'edit' ? 'PUT' : 'POST'
        
        const response = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(formData)
        })
        
        if (!response.ok) {
          const error = await response.json()
          
          // Show detailed validation errors if available
          if (error.details && Array.isArray(error.details)) {
            const errorMessages = error.details.map((detail: any) => 
              `${detail.field}: ${detail.message}`
            ).join('\n')
            
            toast({
              variant: "destructive",
              title: "Validasi Gagal",
              description: errorMessages
            })
          } else {
            toast({
              variant: "destructive",
              title: "Error",
              description: error.error || 'Gagal menyimpan data siswa'
            })
          }
          
          throw new Error(error.error || 'Failed to save student data')
        }
        
        const result = await response.json()
        
        // Show success message
        toast({
          title: "Berhasil!",
          description: mode === 'edit' ? 'Data siswa berhasil diperbarui!' : 'Data siswa berhasil disimpan!'
        })
        
        // Navigate back to dashboard
        router.push('/admin/dashboard')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      
      // Only show toast if it's not already shown above
      if (!(error instanceof Error && error.message.includes('Failed to save student data'))) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan data'
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.push('/admin/dashboard')
    }
  }

  const isStepCompleted = (stepIndex: number) => completedSteps.has(stepIndex)
  const isStepAccessible = (stepIndex: number) => {
    return stepIndex === 0 || completedSteps.has(stepIndex - 1) || completedSteps.has(stepIndex)
  }

  const progress = ((completedSteps.size) / STEPS.length) * 100
  const currentStepData = STEPS[currentStep]
  const CurrentStepComponent = currentStepData.component

  const isLastStep = currentStep === STEPS.length - 1
  const canSubmit = STEPS.filter(step => step.required).every((step, index) => 
    completedSteps.has(index)
  )

  // Helper function to get step-specific data
  const getStepData = (stepId: string) => {
    switch (stepId) {
      case 'personal':
        return {
          fullName: formData.fullName,
          nickname: formData.nickname,
          birthPlace: formData.birthPlace,
          birthDate: formData.birthDate,
          gender: formData.gender,
          religion: formData.religion,
          nationality: formData.nationality,
          address: formData.address,
          rt: formData.rt,
          rw: formData.rw,
          village: formData.village,
          district: formData.district,
          city: formData.city,
          province: formData.province,
          postalCode: formData.postalCode,
          phone: formData.phone,
          email: formData.email
        }
      case 'parent':
        return {
          fatherName: formData.fatherName,
          fatherJob: formData.fatherJob,
          fatherPhone: formData.fatherPhone,
          motherName: formData.motherName,
          motherJob: formData.motherJob,
          motherPhone: formData.motherPhone,
          guardianName: formData.guardianName,
          guardianJob: formData.guardianJob,
          guardianPhone: formData.guardianPhone,
          parentAddress: formData.parentAddress
        }
      case 'education':
        return {
          previousSchool: formData.previousSchool,
          nisn: formData.nisn,
          graduationYear: formData.graduationYear
        }
      case 'major':
        return {
          firstMajor: formData.firstMajor,
          secondMajor: formData.secondMajor,
          thirdMajor: formData.thirdMajor
        }
      case 'documents':
        return {
          hasIjazah: formData.hasIjazah,
          hasSKHUN: formData.hasSKHUN,
          hasKK: formData.hasKK,
          hasAktaLahir: formData.hasAktaLahir,
          hasFoto: formData.hasFoto,
          hasRaport: formData.hasRaport,
          hasSertifikat: formData.hasSertifikat
        }
      case 'ranking':
        return formData.ranking
      default:
        return {}
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {mode === 'edit' ? 'Edit Data Siswa' : 'Pendaftaran Siswa Baru'}
        </h1>
        <p className="text-muted-foreground">
          {mode === 'edit' 
            ? 'Perbarui informasi data siswa' 
            : 'Lengkapi semua informasi yang diperlukan untuk pendaftaran'
          }
        </p>
      </div>

      {/* Progress */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress Pengisian</span>
              <span className="text-sm text-muted-foreground">
                {completedSteps.size}/{STEPS.length} langkah selesai
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          {/* Step Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {STEPS.map((step, index) => {
              const isCompleted = isStepCompleted(index)
              const isCurrent = index === currentStep
              const isAccessible = isStepAccessible(index)
              
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  disabled={!isAccessible}
                  className={`p-3 rounded-lg text-left transition-colors ${
                    isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : isCompleted
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : isAccessible
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                    <span className="text-xs font-medium">{index + 1}</span>
                  </div>
                  <div className="text-xs font-medium">{step.title}</div>
                  {step.required && (
                    <div className="text-xs opacity-75">Wajib</div>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Step */}
      <div className="mb-8">
        <CurrentStepComponent
          data={getStepData(currentStepData.id)}
          onDataChange={(data: any) => handleDataChange(currentStepData.id, data)}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      </div>

      {/* Navigation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              
              {currentStep > 0 && (
                <Button 
                  variant="outline" 
                  onClick={handlePrevious}
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Sebelumnya
                </Button>
              )}
            </div>
            
            <div className="flex space-x-2">
              {!isLastStep ? (
                <Button 
                  onClick={handleNext}
                  disabled={isSubmitting}
                >
                  Selanjutnya
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {mode === 'edit' ? 'Perbarui Data' : 'Simpan & Kirim'}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
          
          {!canSubmit && isLastStep && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Silakan lengkapi semua langkah wajib sebelum mengirim data.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}