'use client';

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, Search, Filter, Trophy, Target, Users, TrendingUp, RefreshCw, Play, PlayCircle, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Student, MajorType, AVAILABLE_MAJORS } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { useAuth, authFetch } from '@/hooks/use-auth'
import AdminLayout from '@/components/AdminLayout'
import { 
  RankingStatistics, 
  MajorRankingData 
} from '@/lib/ranking-manager'

export default function RankingPage() {
  const { user, loading: authLoading, error: authError } = useAuth('ADMIN')
  const [comprehensiveData, setComprehensiveData] = useState<{
    rankings: Record<MajorType, any[]>
    majorData: MajorRankingData[]
    overallStatistics: RankingStatistics
  } | null>(null)
  const [competitionAnalysis, setCompetitionAnalysis] = useState<any[]>([])
  const [selectedMajor, setSelectedMajor] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [simulationResults, setSimulationResults] = useState<any>(null)
  const { toast } = useToast()

  const loadRankingData = useCallback(async () => {
    if (authLoading || !user) return
    
    try {
      setLoading(true)
      const response = await authFetch('/api/ranking?type=comprehensive')
      if (response.ok) {
        const data = await response.json()
        setComprehensiveData(data)
      } else {
        throw new Error('Failed to load ranking data')
      }
    } catch (error) {
      console.error('Error loading ranking data:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data ranking',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [authLoading, user, toast])

  const loadCompetitionAnalysis = useCallback(async () => {
    if (authLoading || !user) return
    
    try {
      const response = await authFetch('/api/ranking?type=competition')
      if (response.ok) {
        const data = await response.json()
        setCompetitionAnalysis(data)
      }
    } catch (error) {
      console.error('Error loading competition analysis:', error)
    }
  }, [authLoading, user])

  useEffect(() => {
    loadRankingData()
    loadCompetitionAnalysis()
  }, [loadRankingData, loadCompetitionAnalysis])

  const getStatusBadge = (student: any) => {
    const displayStatus = student.finalStatus || student.status;

    switch (displayStatus) {
      case 'APPROVED':
      case 'DITERIMA':
        return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200"><CheckCircle className="h-3 w-3 mr-1" />Diterima</Badge>;
      case 'REJECTED':
      case 'TIDAK_DITERIMA':
        return <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200"><XCircle className="h-3 w-3 mr-1" />Ditolak</Badge>;
      case 'WAITLIST':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200"><Clock className="h-3 w-3 mr-1" />Cadangan</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  }

  const getMajorName = (majorCode: string): string => {
    const majorMap: Record<string, string> = {
      'Teknik Kendaraan Ringan Otomotif': 'TKRO',
      'Teknik Alat Berat': 'TAB',
      'Teknik Komputer dan Jaringan': 'TKJ',
      'Akuntansi dan Keuangan Lembaga': 'AKL',
      'Asisten Keperawatan': 'AK',
      'Agribisnis Ternak Ruminansia': 'ATR'
    }
    return majorMap[majorCode] || majorCode
  }

  const getFullMajorName = (majorCode: string): string => {
    return AVAILABLE_MAJORS.find(m => m === majorCode) || majorCode
  }

  const getFilteredRankings = () => {
    if (!comprehensiveData) return []
    
    let filteredRankings: any[] = []
    
    if (selectedMajor === 'all') {
      filteredRankings = Object.values(comprehensiveData.rankings).flat()
    } else {
      filteredRankings = comprehensiveData.rankings[selectedMajor as MajorType] || []
    }
    
    // Apply search filter
    if (searchTerm) {
      filteredRankings = filteredRankings.filter(student => 
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.nisn.includes(searchTerm)
      )
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filteredRankings = filteredRankings.filter(student => {
        const currentStatus = student.finalStatus || student.status;
        if (statusFilter === 'DITERIMA') return currentStatus === 'APPROVED' || currentStatus === 'DITERIMA';
        if (statusFilter === 'TIDAK_DITERIMA') return currentStatus === 'REJECTED' || currentStatus === 'TIDAK_DITERIMA';
        if (statusFilter === 'CADANGAN') return currentStatus === 'WAITLIST';
        return false;
      });
    }
    
    return filteredRankings
  }

  const handleExportCSV = async (majorCode?: string) => {
    try {
      const url = majorCode 
        ? `/api/ranking?type=export&major=${majorCode}&format=download`
        : '/api/ranking?type=export&format=download'
      
      const response = await fetch(url)
      if (response.ok) {
        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = `ranking_${majorCode || 'all'}_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(downloadUrl)
        
        toast({
          title: "Sukses",
          description: "Data ranking berhasil diekspor"
        })
      }
    } catch (error) {
      console.error('Error exporting CSV:', error)
      toast({
        title: "Error",
        description: "Gagal mengekspor data",
        variant: "destructive"
      })
    }
  }

  const runSimulation = async () => {
    try {
      const response = await authFetch('/api/ranking?type=simulation')
      if (response.ok) {
        const data = await response.json()
        setSimulationResults(data)
        toast({
          title: "Simulasi Berhasil",
          description: "Simulasi penerimaan telah dijalankan"
        })
      }
    } catch (error) {
      console.error('Error running simulation:', error)
      toast({
        title: "Error",
        description: "Gagal menjalankan simulasi",
        variant: "destructive"
      })
    }
  }

  const updateStudentStatus = async (studentId: string, newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await authFetch(`/api/students/${studentId}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'update_status',
          status: newStatus,
          reason: `Status diubah secara manual dari halaman ranking`
        })
      })
      
      if (response.ok) {
        toast({
          title: "Berhasil",
          description: `Status siswa berhasil diubah.`
        });

        // Optimistic UI update
        setComprehensiveData(prevData => {
          if (!prevData) return null;

          const updatedRankings = JSON.parse(JSON.stringify(prevData.rankings));
          const updatedStatistics = { ...prevData.overallStatistics };

          let studentFound = false;
          for (const major in updatedRankings) {
            const studentIndex = updatedRankings[major].findIndex((s: any) => s.studentId === studentId);
            if (studentIndex !== -1) {
              const studentToUpdate = updatedRankings[major][studentIndex];
              const oldDbStatus = studentToUpdate.finalStatus || (studentToUpdate.status === 'DITERIMA' ? 'APPROVED' : 'REJECTED');

              if (oldDbStatus !== newStatus) {
                studentToUpdate.finalStatus = newStatus;
                studentToUpdate.status = newStatus === 'APPROVED' ? 'DITERIMA' : 'TIDAK_DITERIMA';

                if (oldDbStatus === 'APPROVED') updatedStatistics.totalAccepted--;
                else if (oldDbStatus === 'REJECTED') updatedStatistics.totalRejected--;

                if (newStatus === 'APPROVED') updatedStatistics.totalAccepted++;
                else if (newStatus === 'REJECTED') updatedStatistics.totalRejected++;
              }
              studentFound = true;
              break;
            }
          }

          if (studentFound) {
            return {
              ...prevData,
              rankings: updatedRankings,
              overallStatistics: updatedStatistics,
            };
          }
          return prevData;
        });
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Gagal memperbarui status siswa')
      }
    } catch (error) {
      console.error('Error updating student status:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal mengubah status siswa",
        variant: "destructive"
      })
    }
  }

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
    )
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
    )
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data ranking...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!comprehensiveData) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <p className="text-gray-600">Tidak ada data ranking tersedia</p>
        </div>
      </AdminLayout>
    )
  }

  const filteredRankings = getFilteredRankings()
  const { overallStatistics } = comprehensiveData

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-2xl p-8 border border-gray-200/50 dark:border-gray-800/50 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent dark:from-gray-200 dark:to-gray-400 mb-3">Peringkat & Analisis</h1>
              <p className="text-muted-foreground text-lg font-medium">Analisis dan kelola peringkat pendaftaran siswa SMKN 1 PPU.</p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <Trophy className="h-12 w-12 text-yellow-500" />
              </div>
              <Button onClick={() => loadRankingData()} disabled={loading} className="shadow-md hover:shadow-lg transition-shadow">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>
          </div>
        </div>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <Card key={i} className="p-4 bg-muted animate-pulse h-32 rounded-xl" />
            ))
          ) : comprehensiveData ? (
            <>
              <Card className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Pendaftar</CardTitle>
                  <Users className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{overallStatistics?.totalStudents ?? 0}</p>
                </CardContent>
              </Card>
              <Card className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Diterima</CardTitle>
                  <Target className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{overallStatistics?.totalAccepted ?? 0}</p>
                </CardContent>
              </Card>
              <Card className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-red-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tidak Diterima</CardTitle>
                  <TrendingUp className="h-5 w-5 text-red-500" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{overallStatistics?.totalRejected ?? 0}</p>
                </CardContent>
              </Card>
            </>
          ) : (
            <p>Data tidak tersedia.</p>
          )}
        </div>

        {/* Main Content - Tabs for Rankings and Analysis */}
        <Card className="shadow-lg border-none">
          <Tabs defaultValue="ranking" className="w-full">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <TabsList className="bg-gray-100 dark:bg-gray-800 p-1 rounded-full">
                  <TabsTrigger value="ranking" className="rounded-full">Peringkat Jurusan</TabsTrigger>
                  <TabsTrigger value="competition" className="rounded-full">Analisis Kompetisi</TabsTrigger>
                  <TabsTrigger value="simulation" className="rounded-full">Simulasi Penerimaan</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => handleExportCSV()} className="rounded-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Rankings Tab */}
            <TabsContent value="ranking" className="p-0">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Filters */}
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Cari nama atau NISN siswa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 rounded-full"
                      />
                    </div>
                    <Select value={selectedMajor} onValueChange={setSelectedMajor}>
                      <SelectTrigger className="w-full lg:w-64 rounded-full">
                        <SelectValue placeholder="Pilih Jurusan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Jurusan</SelectItem>
                        {AVAILABLE_MAJORS.map((major) => (
                          <SelectItem key={major} value={major}>
                            {getMajorName(major)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full lg:w-48 rounded-full">
                        <SelectValue placeholder="Filter Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="DITERIMA">Diterima</SelectItem>
                        <SelectItem value="TIDAK_DITERIMA">Tidak Diterima</SelectItem>
                        <SelectItem value="CADANGAN">Cadangan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Rankings Table */}
                  <div className="border rounded-xl overflow-hidden">
                    <Table>
                      <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                        <TableRow>
                          <TableHead className="w-[80px] font-semibold">Rank</TableHead>
                          <TableHead className="font-semibold">Nama Siswa</TableHead>
                          <TableHead className="hidden md:table-cell font-semibold">Jurusan</TableHead>
                          <TableHead className="w-[120px] font-semibold">Total Skor</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="text-right font-semibold">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRankings.length > 0 ? (
                          filteredRankings.map((student, index) => (
                            <TableRow key={student.studentId}>
                              <TableCell className="font-bold text-center">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold">
                                  {student.rank || index + 1}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-semibold">{student.fullName}</div>
                                <div className="text-sm text-muted-foreground">NISN: {student.nisn}</div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <Badge variant="outline" className="font-medium">
                                  {getMajorName(student.selectedMajor)}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-bold text-center">
                                {student.totalScore?.toFixed(2) || '0.00'}
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(student)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateStudentStatus(student.studentId, 'APPROVED')}
                                    className="text-green-600 hover:bg-green-50"
                                  >
                                    Terima
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateStudentStatus(student.studentId, 'REJECTED')}
                                    className="text-red-600 hover:bg-red-50"
                                  >
                                    Tolak
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                              <div className="flex flex-col items-center gap-2">
                                <Search className="h-8 w-8 opacity-50" />
                                <p>Tidak ada data yang ditemukan</p>
                                <p className="text-sm">Coba ubah filter atau kata kunci pencarian</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </TabsContent>

            {/* Competition Analysis Tab */}
            <TabsContent value="competition" className="p-0">
              <CardContent className="p-6">
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-semibold">Analisis Kompetisi</p>
                  <p className="text-sm">Fitur ini sedang dalam pengembangan</p>
                </div>
              </CardContent>
            </TabsContent>

            {/* Simulation Tab */}
            <TabsContent value="simulation" className="p-0">
              <Card className="border-none shadow-none">
                <CardHeader className="border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">Simulasi Penerimaan Siswa</CardTitle>
                      <CardDescription className="mt-2">
                        Jalankan simulasi untuk melihat prediksi hasil penerimaan berdasarkan kuota dan ranking saat ini.
                      </CardDescription>
                    </div>
                    <Button onClick={runSimulation} className="rounded-full">
                      <Play className="h-4 w-4 mr-2" />
                      Jalankan Simulasi
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {simulationResults ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border-l-4 border-blue-500">
                          <CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">
                              {simulationResults.summary?.totalProcessed || 0}
                            </div>
                            <p className="text-sm text-muted-foreground">Total Diproses</p>
                          </CardContent>
                        </Card>
                        <Card className="border-l-4 border-green-500">
                          <CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">
                              {simulationResults.summary?.totalAccepted || 0}
                            </div>
                            <p className="text-sm text-muted-foreground">Total Diterima</p>
                          </CardContent>
                        </Card>
                        <Card className="border-l-4 border-red-500">
                          <CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">
                              {simulationResults.summary?.totalRejected || 0}
                            </div>
                            <p className="text-sm text-muted-foreground">Total Ditolak</p>
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Hasil Per Jurusan</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Jurusan</TableHead>
                                <TableHead>Kuota</TableHead>
                                <TableHead>Diterima</TableHead>
                                <TableHead>Ditolak</TableHead>
                                <TableHead>Sisa Kuota</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {simulationResults.results && Object.keys(simulationResults.results).length > 0 ? (
                                Object.entries(simulationResults.results).map(([majorCode, res]: [string, any]) => (
                                  <TableRow key={majorCode}>
                                    <TableCell className="font-medium">{getMajorName(majorCode) ?? 'N/A'}</TableCell>
                                    <TableCell>{res.quota ?? 0}</TableCell>
                                    <TableCell className="text-green-600 font-semibold">{res.acceptedCount ?? 0}</TableCell>
                                    <TableCell className="text-red-600 font-semibold">{res.rejectedCount ?? 0}</TableCell>
                                    <TableCell>{(res.quota ?? 0) - (res.acceptedCount ?? 0)}</TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    Jalankan simulasi untuk melihat hasilnya.
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                      <PlayCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="font-semibold">Simulasi Belum Dijalankan</p>
                      <p className="text-sm">Klik tombol &quot;Jalankan Simulasi&quot; untuk memulai.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </AdminLayout>
  )
}