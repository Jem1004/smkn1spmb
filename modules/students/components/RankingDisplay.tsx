'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Trophy, 
  Users, 
  TrendingUp, 
  Download, 
  Search,
  Filter,
  Award,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { 
  createMajorRankings, 
  getMajorStatistics, 
  exportRankingToCSV,
  StudentRanking,
  AcceptanceStatus,
  MAJOR_QUOTAS
} from '@/lib/ranking';
import { Student, MajorType, AVAILABLE_MAJORS } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface RankingDisplayProps {
  students: Student[];
}

const RankingDisplay: React.FC<RankingDisplayProps> = ({ students }) => {
  const [rankings, setRankings] = useState<Record<MajorType, StudentRanking[]>>({} as any);
  const [selectedMajor, setSelectedMajor] = useState<MajorType | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AcceptanceStatus | 'ALL'>('ALL');
  const { toast } = useToast();

  useEffect(() => {
    if (students.length > 0) {
      const newRankings = createMajorRankings(students);
      setRankings(newRankings);
    }
  }, [students]);

  const statistics = getMajorStatistics(rankings);

  const getStatusBadge = (status: AcceptanceStatus) => {
    switch (status) {
      case 'DITERIMA':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Diterima
          </Badge>
        );
      case 'CADANGAN':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Cadangan
          </Badge>
        );
      case 'TIDAK_DITERIMA':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Tidak Diterima
          </Badge>
        );
    }
  };

  const getFilteredStudents = () => {
    let allStudents: StudentRanking[] = [];
    
    if (selectedMajor === 'ALL') {
      Object.values(rankings).forEach(majorStudents => {
        allStudents = [...allStudents, ...majorStudents];
      });
    } else {
      allStudents = rankings[selectedMajor] || [];
    }

    // Filter berdasarkan pencarian nama
    if (searchTerm) {
      allStudents = allStudents.filter(student => 
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter berdasarkan status
    if (statusFilter !== 'ALL') {
      allStudents = allStudents.filter(student => student.status === statusFilter);
    }

    return allStudents;
  };

  const handleExportCSV = () => {
    try {
      const csv = exportRankingToCSV(rankings);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `ranking_siswa_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Export Berhasil',
        description: 'Data ranking telah diexport ke file CSV.',
      });
    } catch (error) {
      toast({
        title: 'Export Gagal',
        description: 'Terjadi kesalahan saat mengexport data.',
        variant: 'destructive',
      });
    }
  };

  const filteredStudents = getFilteredStudents();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ranking dan Status Penerimaan</h2>
          <p className="text-gray-600 mt-1">
            Ranking siswa berdasarkan total skor per jurusan
          </p>
        </div>
        <Button onClick={handleExportCSV} className="flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </Button>
      </div>

      {/* Statistik Umum */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pendaftar</p>
                <p className="text-2xl font-bold text-gray-900">{students.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Diterima</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.values(statistics).reduce((sum, stat) => sum + stat.accepted, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Cadangan</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.values(statistics).reduce((sum, stat) => sum + stat.waitlist, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Tidak Diterima</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.values(statistics).reduce((sum, stat) => sum + stat.rejected, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistik Per Jurusan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Statistik Per Jurusan</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {AVAILABLE_MAJORS.map(major => {
              const stat = statistics[major];
              if (!stat) return null;
              
              return (
                <div key={major} className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">{major}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kuota:</span>
                      <span className="font-medium">{stat.quota}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pendaftar:</span>
                      <span className="font-medium">{stat.totalApplicants}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Diterima:</span>
                      <span className="font-medium text-green-600">{stat.accepted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yellow-600">Cadangan:</span>
                      <span className="font-medium text-yellow-600">{stat.waitlist}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Skor Tertinggi:</span>
                      <span className="font-medium">{stat.highestScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Skor Terendah Diterima:</span>
                      <span className="font-medium">{stat.lowestAcceptedScore}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filter dan Pencarian */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter dan Pencarian</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Cari Nama Siswa</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Masukkan nama siswa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Filter Jurusan</Label>
              <Select value={selectedMajor} onValueChange={(value) => setSelectedMajor(value as MajorType | 'ALL')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Jurusan</SelectItem>
                  {AVAILABLE_MAJORS.map(major => (
                    <SelectItem key={major} value={major}>{major}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Filter Status</Label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as AcceptanceStatus | 'ALL')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Status</SelectItem>
                  <SelectItem value="DITERIMA">Diterima</SelectItem>
                  <SelectItem value="CADANGAN">Cadangan</SelectItem>
                  <SelectItem value="TIDAK_DITERIMA">Tidak Diterima</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabel Ranking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Daftar Ranking Siswa</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Ranking</th>
                  <th className="text-left p-3 font-semibold">Nama Siswa</th>
                  <th className="text-left p-3 font-semibold">Jurusan</th>
                  <th className="text-left p-3 font-semibold">Total Skor</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, index) => (
                    <tr key={`${student.studentId}-${student.selectedMajor}`} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          {student.rank <= 3 && (
                            <Award className={`h-4 w-4 ${
                              student.rank === 1 ? 'text-yellow-500' :
                              student.rank === 2 ? 'text-gray-400' :
                              'text-orange-600'
                            }`} />
                          )}
                          <span className="font-medium">{student.rank}</span>
                        </div>
                      </td>
                      <td className="p-3 font-medium">{student.fullName}</td>
                      <td className="p-3">
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {student.selectedMajor}
                        </span>
                      </td>
                      <td className="p-3 font-mono">{student.totalScore}</td>
                      <td className="p-3">{getStatusBadge(student.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      Tidak ada data yang sesuai dengan filter
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RankingDisplay;