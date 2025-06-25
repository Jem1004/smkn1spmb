'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Users, 
  Trophy,
  Download,
  Filter
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Student } from '@/types';
import AdminLayout from '@/components/AdminLayout';
import RankingDisplay from '@/modules/students/components/RankingDisplay';
import { useToast } from '@/hooks/use-toast';

// Mock data - dalam implementasi nyata, ini akan diambil dari API
const mockStudents: Student[] = [
  // Data contoh akan ditambahkan di sini
];

const StudentsPage = () => {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Dalam implementasi nyata, fetch data dari API
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      // Simulasi API call
      // const response = await fetch('/api/students');
      // const data = await response.json();
      // setStudents(data);
      
      // Untuk sementara menggunakan mock data
      setStudents(mockStudents);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat data siswa.',
        variant: 'destructive',
      });
    }
  };

  const filteredStudents = students.filter(student =>
    student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddStudent = () => {
    router.push('/admin/students/add');
  };

  const handleViewStudent = (studentId: string) => {
    router.push(`/admin/students/view/${studentId}`);
  };

  const handleEditStudent = (studentId: string) => {
    router.push(`/admin/students/edit/${studentId}`);
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) {
      try {
        // Dalam implementasi nyata, panggil API delete
        // await fetch(`/api/students/${studentId}`, { method: 'DELETE' });
        
        setStudents(prev => prev.filter(s => s.id !== studentId));
        toast({
          title: 'Berhasil',
          description: 'Data siswa berhasil dihapus.',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Gagal menghapus data siswa.',
          variant: 'destructive',
        });
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DITERIMA':
        return <Badge className="bg-green-100 text-green-800">Diterima</Badge>;
      case 'CADANGAN':
        return <Badge className="bg-yellow-100 text-yellow-800">Cadangan</Badge>;
      case 'TIDAK_DITERIMA':
        return <Badge className="bg-red-100 text-red-800">Tidak Diterima</Badge>;
      case 'PENDING':
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
    }
  };

  return (
    <AdminLayout 
      title="Manajemen Siswa"
      subtitle="Kelola data siswa dan lihat ranking penerimaan"
    >
      <div className="space-y-6">
        {/* Add Student Button */}
        <div className="flex justify-end">
          <Button onClick={handleAddStudent} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </Button>
        </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Daftar Siswa</span>
          </TabsTrigger>
          <TabsTrigger value="ranking" className="flex items-center space-x-2">
            <Trophy className="w-4 h-4" />
            <span>Ranking & Status</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab Content: Daftar Siswa */}
        <TabsContent value="list" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filter dan Pencarian</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Cari nama atau email siswa..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export Data</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Students Table */}
          <Card>
            <CardHeader>
              <CardTitle>Daftar Siswa ({filteredStudents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Nama Lengkap</th>
                      <th className="text-left p-3 font-semibold">Email</th>
                      <th className="text-left p-3 font-semibold">Jurusan Pilihan</th>
                      <th className="text-left p-3 font-semibold">Status</th>
                      <th className="text-left p-3 font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <tr key={student.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{student.fullName}</td>
                          <td className="p-3">{student.email || '-'}</td>
                          <td className="p-3">
                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {student.selectedMajor || 'Belum dipilih'}
                            </span>
                          </td>
                          <td className="p-3">
                            {getStatusBadge(student.registrationStatus || 'PENDING')}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewStudent(student.id)}
                                className="flex items-center space-x-1"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Lihat</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditStudent(student.id)}
                                className="flex items-center space-x-1"
                              >
                                <Edit className="w-3 h-3" />
                                <span>Edit</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteStudent(student.id)}
                                className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Hapus</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500">
                          {searchTerm ? 'Tidak ada siswa yang sesuai dengan pencarian' : 'Belum ada data siswa'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Content: Ranking & Status */}
        <TabsContent value="ranking">
          <RankingDisplay students={students} />
        </TabsContent>
      </Tabs>
      </div>
    </AdminLayout>
  );
};

export default StudentsPage;