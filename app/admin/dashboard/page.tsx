'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useStudentStore } from '@/store/student-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  GraduationCap,
  Trophy,
  FileText,
  BarChart3
} from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'
import { getRegistrationStatusText, formatDate } from '@/lib/utils'

interface DashboardStats {
  totalStudents: number
  pendingStudents: number
  approvedStudents: number
  rejectedStudents: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { students, isLoading, error, setStudents, setLoading, setError } = useStudentStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [majorFilter, setMajorFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    pendingStudents: 0,
    approvedStudents: 0,
    rejectedStudents: 0
  })

  useEffect(() => {
    // Don't redirect while still loading
    if (status === 'loading') return
    
    if (status !== 'authenticated' || session?.user?.role !== 'ADMIN') {
      router.push('/login')
      return
    }
    
    fetchStudents()
  }, [session, status, router])

  useEffect(() => {
    calculateStats()
  }, [students])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/students')
      
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

  // Convert registration status to badge variant
  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "error" | "pending" | "approved" | "rejected" => {
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

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nisn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.schoolName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || student.registrationStatus === statusFilter
    const matchesMajor = majorFilter === 'all' || student.selectedMajor === majorFilter
    
    return matchesSearch && matchesStatus && matchesMajor
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

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
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete student')
      }
      
      await fetchStudents()
    } catch (err) {
      alert('Gagal menghapus data siswa')
    }
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
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 rounded-2xl p-8 border border-blue-200/50 dark:border-blue-800/50 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">Dashboard Admin</h1>
              <p className="text-muted-foreground text-lg font-medium">Sistem Penerimaan Siswa Baru (PPDB) SMK</p>
              <p className="text-sm text-muted-foreground mt-1">Kelola data siswa dan pantau proses penerimaan</p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <GraduationCap className="h-12 w-12 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      
      {/* Action Buttons */}
      <div className="flex justify-end mb-6">
        <Button onClick={handleAddStudent}>
          <UserPlus className="h-4 w-4 mr-2" />
          Tambah Siswa
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Total Siswa</p>
                <p className="text-3xl font-bold mt-2 text-blue-900 dark:text-blue-100">{stats.totalStudents}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Keseluruhan pendaftar</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/50 dark:to-yellow-900/50 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 uppercase tracking-wide">Menunggu</p>
                <p className="text-3xl font-bold mt-2 text-yellow-900 dark:text-yellow-100">{stats.pendingStudents}</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Dalam proses review</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-yellow-500 flex items-center justify-center shadow-lg">
                <FileText className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">Diterima</p>
                <p className="text-3xl font-bold mt-2 text-green-900 dark:text-green-100">{stats.approvedStudents}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Berhasil lolos seleksi</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg">
                <Trophy className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-300 uppercase tracking-wide">Ditolak</p>
                <p className="text-3xl font-bold mt-2 text-red-900 dark:text-red-100">{stats.rejectedStudents}</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">Tidak memenuhi syarat</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-red-500 flex items-center justify-center shadow-lg">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 border shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama, NISN, atau asal sekolah..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200">
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
                <SelectTrigger className="w-full sm:w-48 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200">
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
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-t-xl">
          <CardTitle className="flex items-center justify-between text-xl">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-slate-800 dark:text-slate-200">Data Siswa</span>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-normal">Total: {filteredStudents.length} siswa</p>
              </div>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Halaman {currentPage} dari {totalPages}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 mx-6 mt-6 rounded-r">
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                {error}
              </div>
            </div>
          )}
          
          {filteredStudents.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-slate-100 dark:bg-slate-800 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">Tidak ada data siswa</h3>
              <p className="text-slate-500 dark:text-slate-500">Belum ada siswa yang terdaftar atau sesuai dengan filter</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 border-y border-slate-200 dark:border-slate-600">
                      <th className="text-left p-4 font-bold text-slate-700 dark:text-slate-300 bg-blue-50 dark:bg-blue-900/20">Nama Lengkap</th>
                      <th className="text-left p-4 font-bold text-slate-700 dark:text-slate-300 bg-indigo-50 dark:bg-indigo-900/20">NISN</th>
                      <th className="text-left p-4 font-bold text-slate-700 dark:text-slate-300 bg-purple-50 dark:bg-purple-900/20">Asal Sekolah</th>
                      <th className="text-left p-4 font-bold text-slate-700 dark:text-slate-300 bg-pink-50 dark:bg-pink-900/20">Jurusan Pilihan</th>
                      <th className="text-left p-4 font-bold text-slate-700 dark:text-slate-300 bg-green-50 dark:bg-green-900/20">Status</th>
                      <th className="text-left p-4 font-bold text-slate-700 dark:text-slate-300 bg-yellow-50 dark:bg-yellow-900/20">Tanggal Daftar</th>
                      <th className="text-left p-4 font-bold text-slate-700 dark:text-slate-300 bg-red-50 dark:bg-red-900/20">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStudents.map((student, index) => (
                      <tr key={student.id} className={`border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/30'}`}>
                        <td className="p-4">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{student.fullName}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">ID: {student.id.slice(0, 8)}...</div>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-sm bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                            {student.nisn || '-'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="text-slate-700 dark:text-slate-300">{student.schoolName || '-'}</div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            {student.selectedMajor?.toUpperCase() || '-'}
                          </span>
                        </td>
                        <td className="p-4">
                          <Badge variant={getStatusVariant(student.registrationStatus) as "pending" | "approved" | "rejected" | "success" | "default"} className="font-semibold">
                            {getRegistrationStatusText(student.registrationStatus)}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-slate-600 dark:text-slate-400">{formatDate(student.createdAt)}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewStudent(student.id)}
                              className="h-8 w-8 p-0 border-blue-200 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                              title="Lihat Detail"
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditStudent(student.id)}
                              className="h-8 w-8 p-0 border-green-200 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200"
                              title="Edit Data"
                            >
                              <Edit className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteStudent(student.id)}
                              className="h-8 w-8 p-0 border-red-200 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                              title="Hapus Data"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredStudents.length)} dari {filteredStudents.length} siswa
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="h-8 px-3 border-slate-300 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
                    >
                      ← Sebelumnya
                    </Button>
                    
                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className={`h-8 w-8 p-0 ${
                              currentPage === pageNum 
                                ? 'bg-blue-600 text-white border-blue-600' 
                                : 'border-slate-300 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700'
                            }`}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="h-8 px-3 border-slate-300 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
                    >
                      Selanjutnya →
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      </div>
    </AdminLayout>
  )
}