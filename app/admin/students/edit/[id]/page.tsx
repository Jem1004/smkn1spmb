'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Student } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Edit, GraduationCap } from 'lucide-react'
import StudentFormWizard from '@/modules/students/components/StudentFormWizard'
import AdminLayout from '@/components/AdminLayout'
import { authFetch } from '@/hooks/use-auth'

export default function EditStudentPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isAuthenticated, token } = useAuthStore()
  const [student, setStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStudent = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await authFetch(`/api/students/${params.id}`)

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
  }, [params.id])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    fetchStudent()
  }, [isAuthenticated, user, params.id, fetchStudent, router])

  const handleBack = () => {
    router.push('/admin/students')
  }

  const handleSave = async (formData: any) => {
    try {
      const response = await authFetch(`/api/students/${params.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to update student')
      }

      alert('Data siswa berhasil diperbarui')
      router.push('/admin/students')
    } catch (err) {
      alert('Gagal memperbarui data siswa')
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
      <div className="space-y-8">
        {/* Page Header */}
        <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/20 dark:via-amber-950/20 dark:to-yellow-950/20 rounded-2xl p-8 border border-orange-200/50 dark:border-orange-800/50 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent mb-3">Edit Data Siswa</h1>
              <p className="text-muted-foreground text-lg font-medium">Perbarui informasi siswa: {student.fullName}</p>
              <p className="text-sm text-muted-foreground mt-1">Pastikan data yang diubah sudah benar dan akurat</p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <Edit className="h-12 w-12 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <StudentFormWizard 
          initialData={{
            ...student,
            birthDate: student.birthDate.toString()
          }}
          onSubmit={handleSave}
          mode="edit"
        />
      </div>
    </AdminLayout>
  )
}