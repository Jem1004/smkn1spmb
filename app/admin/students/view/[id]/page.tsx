'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Student } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, User, School, MapPin, Phone, Mail, Calendar, FileText, Eye, GraduationCap } from 'lucide-react'
import { getRegistrationStatusText, formatDate } from '@/lib/utils'
import AdminLayout from '@/components/AdminLayout'

export default function ViewStudentPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isAuthenticated, token } = useAuthStore()
  const [student, setStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    fetchStudent()
  }, [isAuthenticated, user, params.id])

  const fetchStudent = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/students/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch student data')
      }

      const data = await response.json()
      setStudent(data.student || data)
    } catch (err) {
      setError('Gagal memuat data siswa')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/admin/dashboard')
  }

  const handleEdit = () => {
    router.push(`/admin/students/edit/${params.id}`)
  }

  // Convert registration status to badge variant
  const getStatusVariant = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'pending'
      case 'approved':
        return 'approved'
      case 'rejected':
        return 'rejected'
      case 'completed':
        return 'success'
      default:
        return 'default'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Memuat data siswa...</p>
        </div>
      </div>
    )
  }

  if (error || !student) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-600 mb-4">{error || 'Data siswa tidak ditemukan'}</p>
              <Button onClick={handleBack} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
        {/* Page Header */}
        <div className="bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-purple-950/20 dark:via-violet-950/20 dark:to-indigo-950/20 rounded-2xl p-8 border border-purple-200/50 dark:border-purple-800/50 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">Detail Siswa</h1>
              <p className="text-muted-foreground text-lg font-medium">Informasi lengkap siswa: {student.fullName}</p>
              <p className="text-sm text-muted-foreground mt-1">Lihat dan kelola data siswa secara detail</p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <Eye className="h-12 w-12 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end mb-6">
          <Button onClick={handleEdit} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
            <Edit className="h-4 w-4 mr-2" />
            Edit Data
          </Button>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Informasi Pribadi</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nama Lengkap</label>
                  <p className="font-medium">{student.fullName}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">NISN</label>
                  <p className="font-medium">{student.nisn || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Jenis Kelamin</label>
                  <p className="font-medium">{student.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tempat Lahir</label>
                  <p className="font-medium">{student.birthPlace}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tanggal Lahir</label>
                  <p className="font-medium">{formatDate(student.birthDate)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Alamat</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Alamat Lengkap</label>
                <p className="font-medium">{student.address}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Kecamatan</label>
                  <p className="font-medium">{student.district}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Kabupaten/Kota</label>
                  <p className="font-medium">{student.city}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Kode Pos</label>
                  <p className="font-medium">{student.postalCode}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <School className="h-5 w-5" />
                <span>Informasi Sekolah</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Asal Sekolah</label>
                  <p className="font-medium">{student.schoolName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">NPSN</label>
                  <p className="font-medium">{student.npsn || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Pilihan Jurusan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Jurusan Pilihan</label>
                  <p className="font-medium">{student.selectedMajor?.toUpperCase() || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status and Contact */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status Pendaftaran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Badge variant={getStatusVariant(student.registrationStatus) as "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "error" | "pending" | "approved" | "rejected"}>
                    {getRegistrationStatusText(student.registrationStatus)}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tanggal Daftar</label>
                  <p className="font-medium flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(student.createdAt)}</span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Terakhir Diperbarui</label>
                  <p className="font-medium flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(student.updatedAt)}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="h-5 w-5" />
                <span>Kontak</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nomor Telepon</label>
                <p className="font-medium">{student.phoneNumber || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="font-medium flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{student.email}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Alamat</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Alamat Lengkap</label>
                <p className="font-medium">{student.address}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Kecamatan</label>
                  <p className="font-medium">{student.district}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Kabupaten/Kota</label>
                  <p className="font-medium">{student.city}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Kode Pos</label>
                  <p className="font-medium">{student.postalCode}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}