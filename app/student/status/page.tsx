'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Student, StudentWithRanking } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  User, 
  School, 
  FileText, 
  Trophy, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail,
  GraduationCap,
  Award,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  RefreshCw,
  LogOut
} from 'lucide-react'
import { getRegistrationStatusText, getRegistrationStatusColor, formatDate, calculateAge } from '@/lib/utils'

export default function StudentStatusPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [student, setStudent] = useState<StudentWithRanking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Don't redirect while still loading
    if (status === 'loading') return
    
    if (status !== 'authenticated' || session?.user?.role !== 'STUDENT') {
      router.push('/login')
      return
    }
    
    // Fetch student data
    fetchStudentData()
  }, [session, status, router])

  const fetchStudentData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!session?.user?.id) {
        throw new Error('User session not found')
      }
      
      const response = await fetch('/api/students/me')
      
      if (!response.ok) {
        throw new Error('Failed to fetch student data')
      }
      
      const data = await response.json()
      setStudent(data.student)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch student data')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchStudentData()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case 'rejected':
        return <XCircle className="h-6 w-6 text-red-600" />
      default:
        return <Clock className="h-6 w-6 text-yellow-600" />
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          title: 'Selamat! Anda Diterima',
          message: 'Pendaftaran Anda telah disetujui. Silakan lakukan daftar ulang sesuai jadwal yang ditentukan.',
          color: 'text-green-700',
          bgColor: 'bg-green-50 border-green-200'
        }
      case 'rejected':
        return {
          title: 'Pendaftaran Ditolak',
          message: 'Maaf, pendaftaran Anda tidak dapat diproses. Silakan hubungi admin untuk informasi lebih lanjut.',
          color: 'text-red-700',
          bgColor: 'bg-red-50 border-red-200'
        }
      default:
        return {
          title: 'Sedang Diproses',
          message: 'Pendaftaran Anda sedang dalam tahap verifikasi. Mohon tunggu pengumuman selanjutnya.',
          color: 'text-yellow-700',
          bgColor: 'bg-yellow-50 border-yellow-200'
        }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Memuat data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Terjadi Kesalahan</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Data Tidak Ditemukan</h2>
            <p className="text-muted-foreground">Data pendaftaran Anda tidak ditemukan.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusInfo = getStatusMessage(student.registrationStatus)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Status Pendaftaran</h1>
          <p className="text-muted-foreground">Informasi lengkap pendaftaran PPDB</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={() => router.push('/student/logout')} 
            variant="outline"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Status Card */}
      <Card className={`mb-8 border-2 ${statusInfo.bgColor}`}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            {getStatusIcon(student.registrationStatus)}
            <div className="flex-1">
              <h2 className={`text-xl font-semibold ${statusInfo.color}`}>
                {statusInfo.title}
              </h2>
              <p className={statusInfo.color}>{statusInfo.message}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Status</p>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                getRegistrationStatusColor(student.registrationStatus)
              }`}>
                {getRegistrationStatusText(student.registrationStatus)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Data Pribadi</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nama Lengkap</p>
                <p className="font-medium">{student.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">NISN</p>
                <p className="font-medium">{student.nisn || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tempat Lahir</p>
                <p className="font-medium">{student.birthPlace}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tanggal Lahir</p>
                <p className="font-medium">
                  {formatDate(student.birthDate)} ({calculateAge(student.birthDate)} tahun)
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Jenis Kelamin</p>
                <p className="font-medium">{student.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Agama</p>
                <p className="font-medium">{student.religion}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex items-start space-x-2 mb-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Alamat</p>
                  <p className="font-medium">{student.address}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">No. HP</p>
                    <p className="font-medium">{student.phoneNumber || '-'}</p>
                  </div>
                </div>
                {student.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{student.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Education Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <School className="h-5 w-5" />
              <span>Data Pendidikan</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Asal Sekolah</p>
              <p className="font-medium">{student.schoolName}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Tahun Lulus</p>
              <p className="font-medium">{student.graduationYear}</p>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-3 flex items-center space-x-2">
                <GraduationCap className="h-4 w-4" />
                <span>Pilihan Jurusan</span>
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Jurusan Pilihan:</span>
                  <span className="font-medium">{student.selectedMajor?.toUpperCase() || 'Belum dipilih'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parent Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Data Orang Tua/Wali</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nama Ayah</p>
                <p className="font-medium">{student.fatherName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pekerjaan Ayah</p>
                <p className="font-medium">{student.fatherJob}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nama Ibu</p>
                <p className="font-medium">{student.motherName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pekerjaan Ibu</p>
                <p className="font-medium">{student.motherJob}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">No. HP Orang Tua</p>
                  <p className="font-medium">{student.parentPhone || '-'}</p>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Ranking Information */}
        {student.ranking && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Penilaian dan Ranking</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Skor</p>
                  <p className="text-2xl font-bold text-blue-600">{student.ranking.totalScore}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ranking</p>
                  <p className="text-2xl font-bold text-purple-600">#{student.ranking.rank}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-3">Nilai Akademik</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span>Matematika:</span>
                    <span className="font-medium">{student.ranking.mathScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>B. Indonesia:</span>
                    <span className="font-medium">{student.ranking.indonesianScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>B. Inggris:</span>
                    <span className="font-medium">{student.ranking.englishScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IPA:</span>
                    <span className="font-medium">{student.ranking.scienceScore}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Registration Timeline */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Timeline Pendaftaran</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Pendaftaran Dibuat</p>
                <p className="text-sm text-muted-foreground">{formatDate(student.createdAt)}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                student.registrationStatus !== 'PENDING' ? 'bg-green-100' : 'bg-yellow-100'
              }`}>
                {student.registrationStatus !== 'PENDING' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Clock className="h-4 w-4 text-yellow-600" />
                )}
              </div>
              <div>
                <p className="font-medium">Verifikasi Data</p>
                <p className="text-sm text-muted-foreground">
                  {student.registrationStatus !== 'PENDING' 
                    ? formatDate(student.updatedAt)
                    : 'Sedang diproses'
                  }
                </p>
              </div>
            </div>
            
            {student.registrationStatus === 'APPROVED' && (
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Award className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Daftar Ulang</p>
                  <p className="text-sm text-muted-foreground">Silakan lakukan daftar ulang</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}