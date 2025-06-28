'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Users,
  GraduationCap,
  FileText,
  Award,
  Heart,
  RefreshCw,
  LogOut,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Home,
  BookOpen,
  Activity
} from 'lucide-react'

interface StudentData {
  id: string
  fullName: string
  birthPlace: string
  birthDate: string
  gender: string
  religion: string
  nationality: string
  address: string
  rt?: string
  rw?: string
  village?: string
  district: string
  city: string
  province: string
  postalCode: string
  phoneNumber?: string
  email?: string
  childOrder: number
  totalSiblings: number
  height?: number
  weight?: number
  medicalHistory?: string
  fatherName: string
  fatherJob?: string
  fatherEducation?: string
  motherName: string
  motherJob?: string
  motherEducation?: string
  guardianName?: string
  guardianJob?: string
  parentPhone?: string
  parentAddress?: string
  schoolName: string
  npsn?: string
  nisn?: string
  graduationYear: number
  certificateNumber?: string
  selectedMajor: string
  hasIjazah: boolean
  hasSKHUN: boolean
  hasKK: boolean
  hasAktaLahir: boolean
  hasFoto: boolean
  hasRaport: boolean
  hasSertifikat: boolean
  finalStatus: string
  ranking?: {
    mathScore: number
    indonesianScore: number
    englishScore: number
    scienceScore: number
    academicAchievement: string
    nonAcademicAchievement: string
    certificateScore: string
    accreditation: string
    totalScore: number
    rank?: number
  }
  user: {
    username: string
    createdAt: string
  }
  createdAt: string
  updatedAt: string
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-64" />
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function getStatusColor(status: string) {
  switch (status) {
    case 'APPROVED':
    case 'COMPLETED':
      return 'bg-green-500'
    case 'PENDING':
      return 'bg-yellow-500'
    case 'WAITLIST':
      return 'bg-orange-500'
    case 'REJECTED':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'APPROVED':
      return 'DITERIMA'
    case 'COMPLETED':
      return 'DITERIMA - SELESAI'
    case 'PENDING':
      return 'MENUNGGU VERIFIKASI'
    case 'WAITLIST':
      return 'DAFTAR TUNGGU'
    case 'REJECTED':
      return 'TIDAK DITERIMA'
    default:
      return 'STATUS BELUM DIKETAHUI'
  }
}

function getStatusDescription(status: string, ranking?: any) {
  switch (status) {
    case 'APPROVED':
      return 'Selamat! Pendaftaran Anda telah disetujui. Silakan menunggu informasi lebih lanjut.'
    case 'COMPLETED':
      return 'Selamat! Anda telah diterima dan proses pendaftaran telah selesai.'
    case 'PENDING':
      if (ranking && ranking.rank) {
        return `Pendaftaran Anda sedang dalam proses verifikasi. Ranking saat ini: ${ranking.rank} dengan total skor ${ranking.totalScore}.`
      }
      return 'Pendaftaran Anda sedang dalam proses verifikasi. Mohon bersabar menunggu hasil.'
    case 'WAITLIST':
      return 'Anda berada dalam daftar tunggu. Masih ada kemungkinan diterima jika ada yang mengundurkan diri.'
    case 'REJECTED':
      return 'Maaf, pendaftaran Anda tidak dapat disetujui. Silakan hubungi admin untuk informasi lebih lanjut.'
    default:
      return 'Status pendaftaran belum dapat ditentukan. Silakan hubungi administrator.'
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'APPROVED':
    case 'COMPLETED':
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case 'PENDING':
      return <Clock className="h-5 w-5 text-yellow-500" />
    case 'WAITLIST':
      return <Clock className="h-5 w-5 text-orange-500" />
    case 'REJECTED':
      return <XCircle className="h-5 w-5 text-red-500" />
    default:
      return <AlertCircle className="h-5 w-5 text-gray-500" />
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function calculateAge(birthDate: string) {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

export default function StudentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [student, setStudent] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchStudentData = useCallback(async () => {
    try {
      const response = await fetch('/api/students/me')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch student data')
      }
      const data = await response.json()
      setStudent(data.student)
    } catch (error) {
      console.error('Error fetching student data:', error)
      const errorMessage = error instanceof Error ? error.message : 'Gagal memuat data siswa'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [toast])

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    if (session.user?.role !== 'STUDENT') {
      router.push('/login')
      return
    }

    fetchStudentData()
  }, [session, status, router, fetchStudentData])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchStudentData()
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  if (status === 'loading' || loading) {
    return <LoadingSkeleton />
  }

  if (!student) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Data Tidak Ditemukan</h3>
            <p className="text-muted-foreground text-center mb-4">
              Data siswa tidak ditemukan. Silakan hubungi administrator.
            </p>
            <Button onClick={handleRefresh} disabled={refreshing}>
              {refreshing && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const documentsSubmitted = student ? [
    student.hasIjazah,
    student.hasSKHUN,
    student.hasKK,
    student.hasAktaLahir,
    student.hasFoto,
    student.hasRaport,
    student.hasSertifikat
  ].filter(Boolean).length : 0

  const totalDocuments = 7
  const documentProgress = (documentsSubmitted / totalDocuments) * 100

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Siswa</h1>
          <p className="text-muted-foreground">
            Selamat datang, {student.fullName}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Status Pendaftaran */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Status Pendaftaran</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Status Badge dengan Icon */}
            <div className="flex items-center space-x-3">
              {getStatusIcon(student.finalStatus)}
              <div className="flex-1">
                <Badge className={`${getStatusColor(student.finalStatus)} text-white font-semibold px-3 py-1`}>
                  {getStatusText(student.finalStatus)}
                </Badge>
              </div>
            </div>
            
            {/* Deskripsi Status */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700">
                {getStatusDescription(student.finalStatus, student.ranking)}
              </p>
              {student.ranking && (
                <div className="mt-3 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                  <p className="text-sm font-medium text-blue-800">Informasi Ranking:</p>
                  <div className="space-y-2 mt-2">
                     <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                       <div><span className="font-medium">Ranking:</span> {student.ranking.rank || 'Belum dihitung'}</div>
                       <div><span className="font-medium">Total Skor:</span> {student.ranking.totalScore}</div>
                     </div>
                     <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                       <div>Matematika: {student.ranking.mathScore}</div>
                       <div>B. Indonesia: {student.ranking.indonesianScore}</div>
                       <div>B. Inggris: {student.ranking.englishScore}</div>
                       <div>IPA: {student.ranking.scienceScore}</div>
                     </div>
                     {(student.ranking.academicAchievement || student.ranking.nonAcademicAchievement) && (
                       <div className="pt-1 border-t border-blue-200">
                         <p className="text-xs font-medium text-blue-800 mb-1">Prestasi:</p>
                         {student.ranking.academicAchievement && (
                           <div className="text-xs text-blue-700">Akademik: {student.ranking.academicAchievement}</div>
                         )}
                         {student.ranking.nonAcademicAchievement && (
                           <div className="text-xs text-blue-700">Non-Akademik: {student.ranking.nonAcademicAchievement}</div>
                         )}
                       </div>
                     )}
                     {student.ranking.accreditation && (
                       <div className="pt-1 border-t border-blue-200">
                         <div className="text-xs text-blue-700"><span className="font-medium">Akreditasi Sekolah:</span> {student.ranking.accreditation}</div>
                       </div>
                     )}
                   </div>
                </div>
              )}
            </div>
            
            {/* Informasi Pendaftaran */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <p className="text-sm font-medium text-gray-600">Jurusan Pilihan</p>
                <p className="text-sm font-semibold">{student.selectedMajor}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tanggal Pendaftaran</p>
                <p className="text-sm font-semibold">{formatDate(student.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Username/NISN</p>
                <p className="text-sm font-semibold">{student.user.username}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status Terakhir Update</p>
                <p className="text-sm font-semibold">{formatDate(student.updatedAt)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Data Pribadi */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Data Pribadi</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">Nama Lengkap</p>
              <p className="text-sm text-muted-foreground">{student.fullName}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Tempat, Tanggal Lahir</p>
              <p className="text-sm text-muted-foreground">
                {student.birthPlace}, {formatDate(student.birthDate)}
              </p>
              <p className="text-xs text-muted-foreground">
                Usia: {calculateAge(student.birthDate)} tahun
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Jenis Kelamin</p>
              <p className="text-sm text-muted-foreground">
                {student.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Agama</p>
              <p className="text-sm text-muted-foreground">{student.religion}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Kewarganegaraan</p>
              <p className="text-sm text-muted-foreground">{student.nationality}</p>
            </div>
          </CardContent>
        </Card>

        {/* Data Kontak */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Data Kontak</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">Alamat</p>
              <p className="text-sm text-muted-foreground">{student.address}</p>
              {(student.rt || student.rw) && (
                <p className="text-xs text-muted-foreground">
                  RT {student.rt || '-'} / RW {student.rw || '-'}
                </p>
              )}
              {student.village && (
                <p className="text-xs text-muted-foreground">
                  Desa/Kelurahan: {student.village}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {student.district}, {student.city}, {student.province} {student.postalCode}
              </p>
            </div>
            {student.phoneNumber && (
              <div>
                <p className="text-sm font-medium flex items-center space-x-1">
                  <Phone className="h-4 w-4" />
                  <span>Telepon</span>
                </p>
                <p className="text-sm text-muted-foreground">{student.phoneNumber}</p>
              </div>
            )}
            {student.email && (
              <div>
                <p className="text-sm font-medium flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </p>
                <p className="text-sm text-muted-foreground">{student.email}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Keluarga */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Data Keluarga</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">Anak ke-</p>
              <p className="text-sm text-muted-foreground">
                {student.childOrder} dari {student.totalSiblings} bersaudara
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Nama Ayah</p>
              <p className="text-sm text-muted-foreground">{student.fatherName}</p>
              {student.fatherJob && (
                <p className="text-xs text-muted-foreground">Pekerjaan: {student.fatherJob}</p>
              )}
              {student.fatherEducation && (
                <p className="text-xs text-muted-foreground">Pendidikan: {student.fatherEducation}</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium">Nama Ibu</p>
              <p className="text-sm text-muted-foreground">{student.motherName}</p>
              {student.motherJob && (
                <p className="text-xs text-muted-foreground">Pekerjaan: {student.motherJob}</p>
              )}
              {student.motherEducation && (
                <p className="text-xs text-muted-foreground">Pendidikan: {student.motherEducation}</p>
              )}
            </div>
            {student.guardianName && (
              <div>
                <p className="text-sm font-medium">Nama Wali</p>
                <p className="text-sm text-muted-foreground">{student.guardianName}</p>
                {student.guardianJob && (
                  <p className="text-xs text-muted-foreground">Pekerjaan: {student.guardianJob}</p>
                )}
              </div>
            )}
            {student.parentPhone && (
              <div>
                <p className="text-sm font-medium">Telepon Orang Tua</p>
                <p className="text-sm text-muted-foreground">{student.parentPhone}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Pendidikan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5" />
              <span>Data Pendidikan</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">Asal Sekolah</p>
              <p className="text-sm text-muted-foreground">{student.schoolName}</p>
            </div>
            {student.npsn && (
              <div>
                <p className="text-sm font-medium">NPSN</p>
                <p className="text-sm text-muted-foreground">{student.npsn}</p>
              </div>
            )}
            {student.nisn && (
              <div>
                <p className="text-sm font-medium">NISN</p>
                <p className="text-sm text-muted-foreground">{student.nisn}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium">Tahun Lulus</p>
              <p className="text-sm text-muted-foreground">{student.graduationYear}</p>
            </div>
            {student.certificateNumber && (
              <div>
                <p className="text-sm font-medium">No. Ijazah</p>
                <p className="text-sm text-muted-foreground">{student.certificateNumber}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Dokumen */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Status Dokumen</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progress Dokumen</span>
                <span className="text-sm text-muted-foreground">
                  {documentsSubmitted}/{totalDocuments}
                </span>
              </div>
              <Progress value={documentProgress} className="h-2" />
            </div>
            <div className="space-y-2">
              {[
                { label: 'Ijazah', status: student.hasIjazah },
                { label: 'SKHUN', status: student.hasSKHUN },
                { label: 'Kartu Keluarga', status: student.hasKK },
                { label: 'Akta Lahir', status: student.hasAktaLahir },
                { label: 'Foto', status: student.hasFoto },
                { label: 'Raport', status: student.hasRaport },
                { label: 'Sertifikat', status: student.hasSertifikat }
              ].map((doc, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{doc.label}</span>
                  {doc.status ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ranking & Prestasi */}
        {student.ranking && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Ranking & Prestasi</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {student.ranking.rank && (
                <div>
                  <p className="text-sm font-medium">Peringkat</p>
                  <p className="text-lg font-bold text-primary">#{student.ranking.rank}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium">Total Skor</p>
                <p className="text-sm text-muted-foreground">{student.ranking.totalScore}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="font-medium">Matematika</p>
                  <p className="text-muted-foreground">{student.ranking.mathScore}</p>
                </div>
                <div>
                  <p className="font-medium">B. Indonesia</p>
                  <p className="text-muted-foreground">{student.ranking.indonesianScore}</p>
                </div>
                <div>
                  <p className="font-medium">B. Inggris</p>
                  <p className="text-muted-foreground">{student.ranking.englishScore}</p>
                </div>
                <div>
                  <p className="font-medium">IPA</p>
                  <p className="text-muted-foreground">{student.ranking.scienceScore}</p>
                </div>
              </div>
              {student.ranking.academicAchievement !== 'none' && (
                <div>
                  <p className="text-sm font-medium">Prestasi Akademik</p>
                  <p className="text-sm text-muted-foreground">{student.ranking.academicAchievement}</p>
                </div>
              )}
              {student.ranking.nonAcademicAchievement !== 'none' && (
                <div>
                  <p className="text-sm font-medium">Prestasi Non-Akademik</p>
                  <p className="text-sm text-muted-foreground">{student.ranking.nonAcademicAchievement}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Data Kesehatan */}
        {(student.height || student.weight || student.medicalHistory) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5" />
                <span>Data Kesehatan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {student.height && student.height > 0 && (
                <div>
                  <p className="text-sm font-medium">Tinggi Badan</p>
                  <p className="text-sm text-muted-foreground">{student.height} cm</p>
                </div>
              )}
              {student.weight && student.weight > 0 && (
                <div>
                  <p className="text-sm font-medium">Berat Badan</p>
                  <p className="text-sm text-muted-foreground">{student.weight} kg</p>
                </div>
              )}
              {student.medicalHistory && (
                <div>
                  <p className="text-sm font-medium">Riwayat Penyakit</p>
                  <p className="text-sm text-muted-foreground">{student.medicalHistory}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Timeline Pendaftaran</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Pendaftaran Dibuat</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(student.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  student.finalStatus === 'PENDING' ? 'bg-yellow-500' :
                  student.finalStatus === 'APPROVED' || student.finalStatus === 'COMPLETED' ? 'bg-green-500' :
                  'bg-red-500'
                }`}></div>
                <div>
                  <p className="text-sm font-medium">Status Saat Ini</p>
                  <p className="text-xs text-muted-foreground">
                    {getStatusText(student.finalStatus)} - {formatDate(student.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}