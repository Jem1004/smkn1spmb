'use client'

import { useState, useEffect } from 'react'
import { RankingFormData } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calculator, Trophy, Award, BookOpen, Users, Target } from 'lucide-react'
import { calculateTotalScore } from '@/lib/utils'
import { rankingDataSchema } from '@/lib/validations/student'
import { useToast } from '@/hooks/use-toast'
import { z } from 'zod'

interface FormRankingProps {
  data?: Partial<RankingFormData>
  onDataChange?: (data: Partial<RankingFormData>) => void
  onNext?: () => void
  onPrevious?: () => void
}

interface ScoreField {
  key: keyof RankingFormData
  label: string
  description: string
  min: number
  max: number
  weight: number
}

const ACADEMIC_SCORES: ScoreField[] = [
  {
    key: 'mathScore',
    label: 'Nilai Matematika',
    description: 'Nilai rata-rata Matematika semester 1-5',
    min: 0,
    max: 100,
    weight: 0.25
  },
  {
    key: 'indonesianScore',
    label: 'Nilai Bahasa Indonesia',
    description: 'Nilai rata-rata Bahasa Indonesia semester 1-5',
    min: 0,
    max: 100,
    weight: 0.25
  },
  {
    key: 'englishScore',
    label: 'Nilai Bahasa Inggris',
    description: 'Nilai rata-rata Bahasa Inggris semester 1-5',
    min: 0,
    max: 100,
    weight: 0.25
  },
  {
    key: 'scienceScore',
    label: 'Nilai IPA',
    description: 'Nilai rata-rata IPA semester 1-5',
    min: 0,
    max: 100,
    weight: 0.25
  }
]

const ACHIEVEMENT_LEVELS = [
  { value: 'none', label: 'Tidak Ada', points: 0 },
  { value: 'sekolah', label: 'Tingkat Sekolah', points: 5 },
  { value: 'kecamatan', label: 'Tingkat Kecamatan', points: 10 },
  { value: 'kabupaten', label: 'Tingkat Kabupaten/Kota', points: 15 },
  { value: 'provinsi', label: 'Tingkat Provinsi', points: 20 },
  { value: 'nasional', label: 'Tingkat Nasional', points: 25 },
  { value: 'internasional', label: 'Tingkat Internasional', points: 30 }
]

export default function FormRanking({ data, onDataChange, onNext, onPrevious }: FormRankingProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<Partial<RankingFormData>>(data || {})
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setFormData(data || {})
  }, [data])

  const handleInputChange = (field: keyof RankingFormData, value: string | number) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    
    // Safely call onDataChange if it exists
    if (onDataChange) {
      onDataChange(newData)
    }
    
    // Clear error when user inputs valid value
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    try {
      // Convert formData to match schema expectations
      const dataToValidate = {
        mathScore: formData.mathScore || 0,
        indonesianScore: formData.indonesianScore || 0,
        englishScore: formData.englishScore || 0,
        scienceScore: formData.scienceScore || 0,
        academicAchievement: formData.academicAchievement || 'none',
        nonAcademicAchievement: formData.nonAcademicAchievement || 'none',
        certificateScore: formData.certificateScore || 'none'
      }

      rankingDataSchema.parse(dataToValidate)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        
        error.errors.forEach((err) => {
          const field = err.path[0] as string
          const scoreField = ACADEMIC_SCORES.find(s => s.key === field)
          
          if (scoreField) {
            newErrors[field] = `${scoreField.label} harus antara ${scoreField.min}-${scoreField.max}`
          } else {
            newErrors[field] = err.message
          }
        })
        
        setErrors(newErrors)
        
        toast({
          variant: "destructive",
          title: "Validasi Gagal",
          description: "Mohon periksa kembali nilai dan prestasi yang diisi"
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

  const getAchievementPoints = (level: string): number => {
    const achievement = ACHIEVEMENT_LEVELS.find(a => a.value === level)
    return achievement ? achievement.points : 0
  }

  const calculateScores = () => {
    const academicAverage = ACADEMIC_SCORES.reduce((sum, score) => {
      const value = formData[score.key] as number || 0
      return sum + (value * score.weight)
    }, 0)

    const achievementPoints = (
      getAchievementPoints(formData.academicAchievement as string) +
      getAchievementPoints(formData.nonAcademicAchievement as string) +
      getAchievementPoints(formData.certificateScore as string)
    )

    const totalScore = academicAverage + achievementPoints

    return {
      academicAverage: Math.round(academicAverage * 100) / 100,
      achievementPoints,
      totalScore: Math.round(totalScore * 100) / 100
    }
  }

  const scores = calculateScores()

  const ScoreInput = ({ score }: { score: ScoreField }) => (
    <div className="space-y-2">
      <Label htmlFor={score.key} className="text-sm font-medium">
        {score.label} <span className="text-red-500">*</span>
      </Label>
      <Input
        id={score.key}
        type="number"
        min={score.min}
        max={score.max}
        step="0.1"
        value={formData[score.key] || ''}
        onChange={(e) => handleInputChange(score.key, parseFloat(e.target.value) || 0)}
        placeholder={`${score.min}-${score.max}`}
        className={errors[score.key] ? 'border-red-500' : ''}
      />
      <p className="text-xs text-muted-foreground">{score.description}</p>
      {errors[score.key] && (
        <p className="form-error text-xs">{errors[score.key]}</p>
      )}
    </div>
  )

  const AchievementSelect = ({ 
    field, 
    label, 
    icon: Icon 
  }: { 
    field: keyof RankingFormData
    label: string
    icon: any
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium flex items-center space-x-2">
        <Icon className="h-4 w-4" />
        <span>{label} <span className="text-red-500">*</span></span>
      </Label>
      <Select
        value={formData[field] as string || ''}
        onValueChange={(value) => handleInputChange(field, value)}
      >
        <SelectTrigger className={errors[field] ? 'border-red-500' : ''}>
          <SelectValue placeholder="Pilih tingkat prestasi" />
        </SelectTrigger>
        <SelectContent>
          {ACHIEVEMENT_LEVELS.map((level) => (
            <SelectItem key={level.value} value={level.value}>
              <div className="flex justify-between items-center w-full">
                <span>{level.label}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  (+{level.points} poin)
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors[field] && (
        <p className="form-error text-xs">{errors[field]}</p>
      )}
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calculator className="h-5 w-5" />
          <span>Penilaian dan Ranking</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Academic Scores */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Nilai Akademik</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Masukkan nilai rata-rata dari semester 1-5 untuk setiap mata pelajaran
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ACADEMIC_SCORES.map((score) => (
              <ScoreInput key={score.key} score={score} />
            ))}
          </div>
        </div>

        {/* Achievement Scores */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <h3 className="text-lg font-semibold">Prestasi dan Sertifikat</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Pilih tingkat prestasi tertinggi yang pernah diraih untuk setiap kategori
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AchievementSelect
              field="academicAchievement"
              label="Prestasi Akademik"
              icon={BookOpen}
            />
            <AchievementSelect
              field="nonAcademicAchievement"
              label="Prestasi Non-Akademik"
              icon={Users}
            />
            <AchievementSelect
              field="certificateScore"
              label="Prestasi Lainnya"
              icon={Award}
            />
          </div>
        </div>

        {/* Score Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
          <div className="flex items-center space-x-2 mb-4">
            <Target className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-purple-900">Ringkasan Penilaian</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Rata-rata Akademik</div>
              <div className="text-2xl font-bold text-blue-600">
                {scores.academicAverage.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">dari 100</div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Poin Prestasi</div>
              <div className="text-2xl font-bold text-yellow-600">
                {scores.achievementPoints}
              </div>
              <div className="text-xs text-muted-foreground">poin bonus</div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Total Skor</div>
              <div className="text-2xl font-bold text-purple-600">
                {scores.totalScore.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">skor akhir</div>
            </div>
          </div>
        </div>

        {/* Scoring Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Informasi Penilaian</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p>• Nilai akademik dihitung berdasarkan rata-rata tertimbang (25% per mata pelajaran)</p>
            <p>• Prestasi memberikan poin bonus sesuai tingkat pencapaian</p>
            <p>• Skor total = Rata-rata akademik + Poin prestasi</p>
            <p>• Ranking ditentukan berdasarkan skor total tertinggi</p>
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
            disabled={Object.keys(errors).length > 0 || !onNext}
          >
            Selanjutnya
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}