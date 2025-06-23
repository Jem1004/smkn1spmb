'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { useStudentStore } from '@/store/student-store'
import { Student, StudentWithRanking } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  GraduationCap,
  Trophy,
  FileText,
  BarChart3
} from 'lucide-react'
import { getRegistrationStatusText, getRegistrationStatusColor, formatDate } from '@/lib/utils'

interface DashboardStats {
  totalStudents: number
  pendingStudents: number
  approvedStudents: number
  rejectedStudents: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const { students, isLoading, error, setStudents, setLoading, setError } = useStudentStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [majorFilter, setMajorFilter] = useState<string>('all')
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    pendingStudents: 0,
    approvedStudents: 0,
    rejectedStudents: 0
  })

  useEffect(() => {
    if (!isAuthenticated || user?.role as string !== 'admin') {
      router.push('/login')
      return
    }
    
    fetchStudents()
  }, [isAuthenticated, user, router])

  useEffect(() => {
    calculateStats()
  }, [students])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/students', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch students')
      }
      
      const data = await response.json()
      setStudents(data.students || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = () => {
    const totalStudents = students.length
    const pendingStudents = students.filter(s => s.registrationStatus === 'PENDING').length
    const approvedStudents = students.filter(s => s.registrationStatus === 'APPROVED').length
    const rejectedStudents = students.filter(s => s.registrationStatus === 'REJECTED').length
    
    setStats({
      totalStudents,
      pendingStudents,
      approvedStudents,
      rejectedStudents
    })
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nisn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.previousSchool?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || student.registrationStatus === statusFilter
    const matchesMajor = majorFilter === 'all' || student.firstMajor === majorFilter
    
    return matchesSearch && matchesStatus && matchesMajor
  })

  const handleAddStudent = () => {
    router.push('/admin/students/add')
  }

  const handleEditStudent = (studentId: string) => {
    router.push(`/admin/students/edit/${studentId}`)
  }

  const handleViewStudent = (studentId: string) => {
    router.push(`/admin/students/view/${studentId}`)
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) {
      return
    }
    
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete student')
      }
      
      await fetchStudents()
    } catch (err) {
      alert('Gagal menghapus data siswa')
    }
  }

  const handleExportData = () => {
    // TODO: Implement export functionality
    alert('Fitur export akan segera tersedia')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Admin</h1>
          <p className="text-muted-foreground">Kelola data pendaftaran siswa baru</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleExportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button onClick={handleAddStudent}>
            <UserPlus className="h-4 w-4 mr-2" />
            Tambah Siswa
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Siswa</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Menunggu</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingStudents}</p>
              </div>
              <FileText className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Diterima</p>
                <p className="text-2xl font-bold text-green-600">{stats.approvedStudents}</p>
              </div>
              <Trophy className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ditolak</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejectedStudents}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama, NISN, atau asal sekolah..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Menunggu</SelectItem>
                <SelectItem value="approved">Diterima</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
              </SelectContent>
            </Select>
            <Select value={majorFilter} onValueChange={setMajorFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter Jurusan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jurusan</SelectItem>
                <SelectItem value="tkj">TKJ</SelectItem>
                <SelectItem value="rpl">RPL</SelectItem>
                <SelectItem value="mm">Multimedia</SelectItem>
                <SelectItem value="tkr">TKR</SelectItem>
                <SelectItem value="tei">TEI</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GraduationCap className="h-5 w-5" />
            <span>Data Siswa ({filteredStudents.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Tidak ada data siswa</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Nama Lengkap</th>
                    <th className="text-left p-4">NISN</th>
                    <th className="text-left p-4">Asal Sekolah</th>
                    <th className="text-left p-4">Jurusan Pilihan</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Tanggal Daftar</th>
                    <th className="text-left p-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{student.fullName}</td>
                      <td className="p-4">{student.nisn || '-'}</td>
                      <td className="p-4">{student.previousSchool || '-'}</td>
                      <td className="p-4">{student.firstMajor?.toUpperCase() || '-'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          getRegistrationStatusColor(student.registrationStatus)
                        }`}>
                          {getRegistrationStatusText(student.registrationStatus)}
                        </span>
                      </td>
                      <td className="p-4">{formatDate(student.createdAt)}</td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewStudent(student.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditStudent(student.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteStudent(student.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}