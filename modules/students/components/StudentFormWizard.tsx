'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
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
import { authFetch } from '@/hooks/use-auth'
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
  // Authentication handled by authFetch
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const [formData, setFormData] = useState<{
    personal: PersonalFormData;
    parent: ParentFormData;
    education: EducationFormData;
    major: MajorFormData;
    documents: DocumentFormData;
    ranking: RankingFormData;
  }>({
    personal: {
      fullName: initialData?.fullName || '',
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
      phoneNumber: initialData?.phoneNumber || '',
      email: initialData?.email || '',
      childOrder: initialData?.childOrder || 1,
      totalSiblings: initialData?.totalSiblings || 1,
      height: initialData?.height || 0,
      weight: initialData?.weight || 0,
      medicalHistory: initialData?.medicalHistory || ''
    },
    parent: {
      fatherName: initialData?.fatherName || '',
      fatherJob: initialData?.fatherJob || '',
      fatherEducation: initialData?.fatherEducation || '',
      motherName: initialData?.motherName || '',
      motherJob: initialData?.motherJob || '',
      motherEducation: initialData?.motherEducation || '',
      guardianName: initialData?.guardianName || '',
      guardianJob: initialData?.guardianJob || '',
      parentPhone: initialData?.parentPhone || '',
      parentAddress: initialData?.parentAddress || ''
    },
    education: {
      schoolName: initialData?.schoolName || '',
      npsn: initialData?.npsn || '',
      nisn: initialData?.nisn || '',
      graduationYear: initialData?.graduationYear || new Date().getFullYear(),
      certificateNumber: initialData?.certificateNumber || ''
    },
    major: {
      selectedMajor: initialData?.selectedMajor || ''
    },
    documents: {
      hasIjazah: initialData?.hasIjazah || false,
      hasSKHUN: initialData?.hasSKHUN || false,
      hasKK: initialData?.hasKK || false,
      hasAktaLahir: initialData?.hasAktaLahir || false,
      hasFoto: initialData?.hasFoto || false,
      hasRaport: initialData?.hasRaport || false,
      hasSertifikat: initialData?.hasSertifikat || false
    },
    ranking: {
      mathScore: initialData?.ranking?.mathScore || 0,
      indonesianScore: initialData?.ranking?.indonesianScore || 0,
      englishScore: initialData?.ranking?.englishScore || 0,
      scienceScore: initialData?.ranking?.scienceScore || 0,
      academicAchievement: initialData?.ranking?.academicAchievement || 'none',
      nonAcademicAchievement: initialData?.ranking?.nonAcademicAchievement || 'none',
      certificateScore: initialData?.ranking?.certificateScore || 'none',
      accreditation: initialData?.ranking?.accreditation || 'Belum Terakreditasi'
    }
  })

  const handleDataChange = (stepId: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [stepId]: { ...prev[stepId as keyof typeof prev], ...data }
    }))
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

      // Validate required fields for authentication
      if (!formData.education.nisn) {
        toast({
          variant: "destructive",
          title: "Validasi Gagal",
          description: "NISN harus diisi untuk membuat akun siswa"
        })
        return
      }

      if (!formData.personal.birthDate) {
        toast({
          variant: "destructive",
          title: "Validasi Gagal",
          description: "Tanggal lahir harus diisi untuk membuat password"
        })
        return
      }

      if (!formData.personal.fullName) {
        toast({
          variant: "destructive",
          title: "Validasi Gagal",
          description: "Nama lengkap harus diisi"
        })
        return
      }

      if (onSubmit) {
        // For custom submit handler, pass flattened data
        const flattenedData = {
          // Authentication fields
          username: formData.education.nisn,
          password: formData.personal.birthDate,
          
          // All other fields flattened
          ...formData.personal,
          ...formData.parent,
          ...formData.education,
          ...formData.major,
          ...formData.documents,
          ranking: formData.ranking
        }
        
        await onSubmit(flattenedData)
      } else {
        // Default submit behavior
        const endpoint = mode === 'edit' && (initialData as any)?.id
          ? `/api/students/${(initialData as any)?.id}`
          : '/api/students'

        const method = mode === 'edit' ? 'PUT' : 'POST'

        // Prepare data in the correct flat structure for API
        const submitData: any = {
          // Authentication fields (only for create mode)
          ...(mode === 'create' && {
            username: formData.education.nisn, // Username = NISN
            password: formData.personal.birthDate // Password = birth date
          }),
          
          // Personal data (flattened)
          fullName: formData.personal.fullName,
          birthPlace: formData.personal.birthPlace,
          birthDate: formData.personal.birthDate,
          gender: formData.personal.gender,
          religion: formData.personal.religion,
          nationality: formData.personal.nationality,
          address: formData.personal.address,
          rt: formData.personal.rt,
          rw: formData.personal.rw,
          village: formData.personal.village,
          district: formData.personal.district,
          city: formData.personal.city,
          province: formData.personal.province,
          postalCode: formData.personal.postalCode,
          phoneNumber: formData.personal.phoneNumber,
          email: formData.personal.email,
          childOrder: formData.personal.childOrder,
          totalSiblings: formData.personal.totalSiblings,
          height: formData.personal.height,
          weight: formData.personal.weight,
          medicalHistory: formData.personal.medicalHistory,
          
          // Parent data (flattened)
          fatherName: formData.parent.fatherName,
          fatherJob: formData.parent.fatherJob,
          fatherEducation: formData.parent.fatherEducation,
          motherName: formData.parent.motherName,
          motherJob: formData.parent.motherJob,
          motherEducation: formData.parent.motherEducation,
          guardianName: formData.parent.guardianName,
          guardianJob: formData.parent.guardianJob,
          parentPhone: formData.parent.parentPhone,
          parentAddress: formData.parent.parentAddress,
          
          // Education data (flattened)
          schoolName: formData.education.schoolName,
          npsn: formData.education.npsn,
          nisn: formData.education.nisn,
          graduationYear: formData.education.graduationYear,
          certificateNumber: formData.education.certificateNumber,
          
          // Major choice (flattened)
          selectedMajor: formData.major.selectedMajor,
          
          // Documents (flattened)
          hasIjazah: formData.documents.hasIjazah,
          hasSKHUN: formData.documents.hasSKHUN,
          hasKK: formData.documents.hasKK,
          hasAktaLahir: formData.documents.hasAktaLahir,
          hasFoto: formData.documents.hasFoto,
          hasRaport: formData.documents.hasRaport,
          hasSertifikat: formData.documents.hasSertifikat,
          
          // Ranking data (as object)
          ranking: formData.ranking
        }

        const response = await authFetch(endpoint, {
          method,
          body: JSON.stringify(submitData)
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

        // Navigate back to students management page
        router.push('/admin/students')
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
      router.push('/admin/students')
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
        return formData.personal
      case 'parent':
        return formData.parent
      case 'education':
        return formData.education
      case 'major':
        return formData.major
      case 'documents':
        return formData.documents
      case 'ranking':
        return formData.ranking
      default:
        return {}
    }
  }

  return (
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 rounded-2xl p-8 border border-blue-200/50 dark:border-blue-800/50 shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            {mode === 'edit' ? 'Edit Data Siswa' : 'Formulir Pendaftaran Siswa'}
          </h1>
          <p className="text-muted-foreground text-lg font-medium">
            {mode === 'edit'
              ? 'Perbarui informasi data siswa dengan lengkap dan akurat'
              : 'Lengkapi semua informasi yang diperlukan untuk pendaftaran PPDB'
            }
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Pastikan semua data yang dimasukkan benar dan sesuai dengan dokumen resmi
          </p>
        </div>
      </div>

      {/* Minimalist Progress Section */}
      <Card className="border-0 shadow-md bg-white/90 dark:bg-gray-900/90">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Progress</span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {completedSteps.size}/{STEPS.length}
            </span>
          </div>
          <Progress value={progress} className="h-2 mb-4" />

          {/* Compact Step Navigation */}
          <div className="flex flex-wrap gap-2">
            {STEPS.map((step, index) => {
              const isCompleted = isStepCompleted(index)
              const isCurrent = index === currentStep
              const isAccessible = isStepAccessible(index)

              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  disabled={!isAccessible}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${isCurrent
                      ? 'bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600'
                      : isCompleted
                        ? 'bg-green-100 text-green-700 border border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600'
                        : isAccessible
                          ? 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700'
                          : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700'
                    }`}
                >
                  <div className="flex items-center space-x-1">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${isCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrent
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-300 text-slate-600 dark:bg-slate-600 dark:text-slate-400'
                      }`}>
                      {isCompleted ? '✓' : index + 1}
                    </span>
                    <span className="hidden sm:inline">{step.title}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
        <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-t-xl">
          <CardTitle className="flex items-center space-x-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isStepCompleted(currentStep)
                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500'
              }`}>
              {isStepCompleted(currentStep) ? (
                <CheckCircle className="h-5 w-5 text-white" />
              ) : (
                <span className="text-sm font-bold text-white">{currentStep + 1}</span>
              )}
            </div>
            <div>
              <span className="text-xl font-bold text-slate-800 dark:text-slate-200">{currentStepData.title}</span>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-normal">{currentStepData.description}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <CurrentStepComponent
            data={getStepData(currentStepData.id)}
            onDataChange={(data: any) => handleDataChange(currentStepData.id, data)}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isFirstStep={currentStep === 0}
            isLastStep={currentStep === STEPS.length - 1}
          />
        </CardContent>
      </Card>

      {/* Enhanced Navigation */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="border-2 border-red-200 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 hover:text-red-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Batal
              </Button>

              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isSubmitting}
                  className="border-2 border-slate-200 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Sebelumnya
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {!isLastStep ? (
                <Button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-3"
                >
                  Selanjutnya
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
            <div className="mt-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-600 rounded-2xl shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center">
                  <span className="text-yellow-800 font-bold text-sm">!</span>
                </div>
                <div>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 font-semibold">
                    Silakan lengkapi semua langkah wajib sebelum mengirim data.
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    Pastikan semua informasi yang diperlukan telah diisi dengan benar.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}