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
import { StudentEditModal } from '@/components/ui/student-edit-modal';
import { StudentCreateModal } from '@/components/ui/student-create-modal';
import { StudentWithRanking, StudentStatus } from '@/types';
import { 
  Search, 
  Trophy, 
  CheckCircle, 
  Clock, 
  XCircle,
  RefreshCw,
  Plus,
  Eye,
  Pencil,
  Trash
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth, authFetch } from '@/hooks/use-auth';
import AdminLayout from '@/components/AdminLayout';
import { useRouter } from 'next/navigation'

interface StudentsPageProps {}

const StudentsPage = ({}: StudentsPageProps) => {
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
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

  // Show loading while authenticating
  if (authLoading) {
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
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Diterima</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Ditolak</Badge>;
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  

  return (
    <AdminLayout 
      title="Manajemen Siswa"
      subtitle="Kelola penerimaan siswa berdasarkan ranking"
    >
      <div className="container mx-auto p-6 space-y-6">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Daftar Siswa</h1>
            <p className="text-muted-foreground">Kelola data siswa dan status penerimaan</p>
          </div>
          <Button onClick={() => router.push('/admin/students/add')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Tambah Siswa Baru
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Diterima</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rejected}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama siswa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === 'ALL' ? 'Semua' : 
                     status === 'PENDING' ? 'Pending' :
                     status === 'APPROVED' ? 'Diterima' : 'Ditolak'}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Daftar Siswa</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-8">
                  <p>Memuat data...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px] hidden sm:table-cell">Ranking</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead className="hidden md:table-cell">Jurusan</TableHead>
                      <TableHead className="w-[100px] hidden lg:table-cell">Skor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Tgl Daftar</TableHead>
                      <TableHead className="text-right w-[180px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium hidden sm:table-cell">
                          {student.ranking?.rank || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{student.fullName}</div>
                          <div className="text-sm text-muted-foreground md:hidden">
                            {student.selectedMajor}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{student.selectedMajor}</TableCell>
                        <TableCell className="hidden lg:table-cell">{student.ranking?.totalScore.toFixed(2) || '-'}</TableCell>
                        <TableCell>{getStatusBadge(student.finalStatus)}</TableCell>
                        <TableCell className="hidden lg:table-cell">{new Date(student.createdAt).toLocaleDateString('id-ID')}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleViewDetail(student)}
                              title="Lihat Detail"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                               variant="outline"
                               size="icon"
                               onClick={() => handleEditStudent(student)}
                               title="Edit"
                             >
                               <Pencil className="h-4 w-4" />
                             </Button>
                             <Button
                               variant="destructive"
                               size="icon"
                               onClick={() => handleDeleteStudent(student.id, student.fullName)}
                               title="Hapus"
                             >
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
              <div className="flex items-center justify-center gap-2 mt-4 p-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Sebelumnya
                </Button>
                <span className="text-sm">
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