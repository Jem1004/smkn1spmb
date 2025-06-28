'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

import { StudentDetailModal } from '@/components/ui/student-detail-modal';
import { StudentWithRanking, StudentStatus } from '@/types';
import { 
  Search, 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle,
  RefreshCw,
  Eye,
  Pencil,
  Trash
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth, authFetch } from '@/hooks/use-auth';
import AdminLayout from '@/components/AdminLayout';
import { useRouter } from 'next/navigation';

const StudentsPage = () => {
  const router = useRouter();
  const { user, loading: authLoading, error: authError } = useAuth('ADMIN');
  const [students, setStudents] = useState<StudentWithRanking[]>([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StudentStatus | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [selectedStudent, setSelectedStudent] = useState<StudentWithRanking | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const { toast } = useToast();

  const fetchStudents = useCallback(async () => {
    if (authLoading || !user) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        search: searchTerm,
        ...(statusFilter !== 'ALL' && { status: statusFilter })
      });

      const response = await authFetch(`/api/students?${params}`);
      const result = await response.json();

      if (result.success) {
        setStudents(result.data.students);
        setTotalPages(Math.ceil(result.data.pagination.total / 20));
        if (result.data.stats) {
          setStats(result.data.stats);
        }
      } else {
        throw new Error(result.error || 'Failed to fetch data');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat data siswa',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [authLoading, user, currentPage, searchTerm, statusFilter, toast]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleViewDetail = (student: StudentWithRanking) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  const handleEditStudent = (student: StudentWithRanking) => {
    router.push(`/admin/students/edit/${student.id}`);
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus siswa ${studentName}?`)) {
      return;
    }

    try {
      const response = await authFetch(`/api/students/${studentId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: `Siswa ${studentName} berhasil dihapus`
        });
        fetchStudents();
      } else {
        throw new Error(result.message || 'Gagal menghapus siswa');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal menghapus siswa',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: StudentStatus) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200"><CheckCircle className="h-3 w-3 mr-1" />Diterima</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200"><XCircle className="h-3 w-3 mr-1" />Ditolak</Badge>;
      case 'WAITLIST':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200"><Clock className="h-3 w-3 mr-1" />Cadangan</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  // Show loading state
  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Show error if authentication failed
  if (authError || !user) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Authentication failed</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-2xl p-8 border border-gray-200/50 dark:border-gray-800/50 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent dark:from-gray-200 dark:to-gray-400 mb-3">Manajemen Siswa</h1>
              <p className="text-muted-foreground text-lg font-medium">Kelola data pendaftar dan status penerimaan di SMKN 1 PPU.</p>
              <p className="text-sm text-muted-foreground mt-1">Pastikan semua data siswa terverifikasi dengan benar.</p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-600">{stats.total}</span>
                <span className="text-sm text-muted-foreground">Total Siswa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Pendaftar</p>
                  <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Menunggu Review</p>
                  <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Diterima</p>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-300">{stats.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Ditolak</p>
                  <p className="text-3xl font-bold text-red-700 dark:text-red-300">{stats.rejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students Table */}
        <Card className="shadow-lg border-0 bg-white dark:bg-gray-900">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Database Calon Siswa</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Cari, filter, dan kelola pendaftar.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama atau NISN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-50 dark:bg-gray-800/50 rounded-full"
                  />
                </div>
                <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                  {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
                    <Button
                      key={status}
                      variant={statusFilter === status ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setStatusFilter(status)}
                      className={`rounded-full transition-colors duration-200 ${statusFilter === status ? 'bg-black text-white dark:bg-white dark:text-black shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                      {status === 'ALL' ? 'Semua' : 
                       status === 'PENDING' ? 'Menunggu' :
                       status === 'APPROVED' ? 'Diterima' : 'Ditolak'}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Memuat data siswa...</p>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                    <TableRow>
                      <TableHead className="w-[80px] hidden sm:table-cell font-semibold">Peringkat</TableHead>
                      <TableHead className="font-semibold">Nama Siswa</TableHead>
                      <TableHead className="hidden md:table-cell font-semibold">Pilihan Jurusan</TableHead>
                      <TableHead className="w-[100px] hidden lg:table-cell font-semibold">Skor Akhir</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="hidden lg:table-cell font-semibold">Tanggal Daftar</TableHead>
                      <TableHead className="text-right font-semibold">Tindakan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium text-center hidden sm:table-cell">
                          <span className="font-bold text-lg">{student.ranking?.rank || '-'}</span>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-base">{student.fullName}</div>
                          <div className="text-sm text-muted-foreground">NISN: {student.nisn}</div>
                          <div className="text-sm text-muted-foreground md:hidden mt-1">
                            {student.selectedMajor}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">{student.selectedMajor}</TableCell>
                        <TableCell className="hidden lg:table-cell font-semibold text-center">{student.ranking?.totalScore.toFixed(2) || '-'}</TableCell>
                        <TableCell>{getStatusBadge(student.finalStatus)}</TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">{new Date(student.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleViewDetail(student)} title="Lihat Detail">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEditStudent(student)} title="Edit">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-100" onClick={() => handleDeleteStudent(student.id, student.fullName)} title="Hapus">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-2 p-4 border-t border-gray-200 dark:border-gray-800">
                <p className="text-sm text-muted-foreground">
                  Total <span className="font-semibold">{students.length}</span> dari <span className="font-semibold">{stats.total}</span> siswa
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Sebelumnya
                  </Button>
                  <span className="text-sm font-medium">
                    Halaman {currentPage} dari {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {showDetailModal && selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          open={showDetailModal}
          onOpenChange={(open) => {
            setShowDetailModal(open);
            if (!open) setSelectedStudent(null);
          }}
        />
      )}
    </AdminLayout>
  );
};

export default StudentsPage;