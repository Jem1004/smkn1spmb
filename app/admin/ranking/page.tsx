'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, Search, Filter, Trophy, Target, Users, TrendingUp, RefreshCw, Play, PlayCircle } from 'lucide-react'
import { Student, MajorType, AVAILABLE_MAJORS } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { useAuth, authFetch } from '@/hooks/use-auth'
import AdminLayout from '@/components/AdminLayout'
import { 
  RankingStatistics, 
  MajorRankingData 
} from '@/lib/ranking-manager'

interface RankingPageProps {}

export default function RankingPage({}: RankingPageProps) {
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

  const getStatusBadge = (student: any) => {
    const displayStatus = student.finalStatus || student.status;

    switch (displayStatus) {
      case 'APPROVED':
      case 'DITERIMA':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Diterima</Badge>
      case 'REJECTED':
      case 'TIDAK_DITERIMA':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Tidak Diterima</Badge>
      case 'WAITLIST':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Cadangan</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }

    switch (displayStatus) {
      case 'DITERIMA':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Diterima</Badge>
      case 'TIDAK_DITERIMA':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Tidak Diterima</Badge>
      case 'WAITLIST':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Cadangan</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
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
        if (statusFilter === 'CADANGAN') return currentStatus === 'WAITLIST'; // Assuming 'CADANGAN' maps to 'WAITLIST'
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

        // Optimistic UI update to ensure consistency
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
                // Update status for UI
                studentToUpdate.finalStatus = newStatus;
                studentToUpdate.status = newStatus === 'APPROVED' ? 'DITERIMA' : 'TIDAK_DITERIMA';

                // Update statistics
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

        // Optional: Reload data from server to ensure consistency
        // loadRankingData();
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



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data ranking...</p>
        </div>
      </div>
    )
  }

  if (!comprehensiveData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Tidak ada data ranking tersedia</p>
      </div>
    )
  }

  const filteredRankings = getFilteredRankings()
  const { overallStatistics } = comprehensiveData

  return (
    <AdminLayout 
      title="Ranking Pendaftaran"
      subtitle="Lihat ranking dan status penerimaan siswa berdasarkan jurusan"
    >
      <div className="space-y-6">
        {/* Export Button */}
        <div className="flex justify-end">
          <Button onClick={() => handleExportCSV()} className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Pendaftar</p>
                  <p className="text-2xl font-bold">{overallStatistics?.totalStudents ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Trophy className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Diterima</p>
                  <p className="text-2xl font-bold text-green-600">
                    {overallStatistics?.totalAccepted ?? 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <TrendingUp className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tidak Diterima</p>
                  <p className="text-2xl font-bold text-red-600">
                    {overallStatistics?.totalRejected ?? 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Cari berdasarkan nama atau NISN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={selectedMajor} onValueChange={setSelectedMajor}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Pilih Jurusan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Jurusan</SelectItem>
                    {AVAILABLE_MAJORS.map((major) => (
                      <SelectItem key={major} value={major}>
                        {major}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="DITERIMA">Diterima</SelectItem>
                  <SelectItem value="CADANGAN">Cadangan</SelectItem>
                  <SelectItem value="TIDAK_DITERIMA">Tidak Diterima</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different views */}
        <Tabs defaultValue="ranking" className="space-y-4">
          <TabsList>
            <TabsTrigger value="ranking">Ranking Siswa</TabsTrigger>
            <TabsTrigger value="competition">Analisis Kompetisi</TabsTrigger>

            <TabsTrigger value="simulation">Simulasi Penerimaan</TabsTrigger>
          </TabsList>

          {/* Ranking Tab */}
          <TabsContent value="ranking">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span>Ranking Siswa</span>
                  {selectedMajor !== 'all' && (
                    <Badge variant="outline">{getMajorName(selectedMajor)}</Badge>
                  )}
                </div>
                <Button onClick={() => handleExportCSV(selectedMajor !== 'all' ? selectedMajor : undefined)} size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ranking</TableHead>
                        <TableHead>NISN</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Jurusan</TableHead>
                        <TableHead>Total Skor</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRankings.map((student, index) => (
                        <TableRow key={student.studentId}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {student.rank <= 3 && selectedMajor !== 'all' && (
                                <Trophy className={`w-4 h-4 ${
                                  student.rank === 1 ? 'text-yellow-500' :
                                  student.rank === 2 ? 'text-gray-400' :
                                  'text-amber-600'
                                }`} />
                              )}
                              <span className="font-medium">#{student.rank}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono">{student.nisn}</TableCell>
                          <TableCell>{student.fullName}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge variant="outline" className="text-xs">
                                {getMajorName(student.selectedMajor || student.firstChoice)}
                              </Badge>
                              <div className="text-xs text-muted-foreground">
                                {getFullMajorName(student.selectedMajor || student.firstChoice)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold">{student.totalScore.toFixed(2)}</span>
                          </TableCell>
                                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(student)}
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 px-2 text-xs bg-green-50 hover:bg-green-100 text-green-700"
                                  onClick={() => updateStudentStatus(student.studentId, 'APPROVED')}
                                  disabled={student.finalStatus === 'APPROVED'}
                                >
                                  Terima
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 px-2 text-xs bg-red-50 hover:bg-red-100 text-red-700"
                                  onClick={() => updateStudentStatus(student.studentId, 'REJECTED')}
                                  disabled={student.finalStatus === 'REJECTED'}
                                >
                                  Tolak
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {filteredRankings.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <RefreshCw className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Tidak ada data yang ditemukan</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Competition Analysis Tab */}
          <TabsContent value="competition">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Analisis Kompetisi per Jurusan</span>
                </CardTitle>
                <CardDescription>
                  Analisis tingkat kompetisi dan statistik penerimaan untuk setiap jurusan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Jurusan</TableHead>
                        <TableHead>Pendaftar</TableHead>
                        <TableHead>Kuota</TableHead>
                        <TableHead>Rasio Kompetisi</TableHead>
                        <TableHead>Rata-rata Skor</TableHead>
                        <TableHead>Skor Terendah Diterima</TableHead>
                        <TableHead>Tingkat Kesulitan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {competitionAnalysis.map((analysis) => (
                        <TableRow key={analysis.majorCode}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{getMajorName(analysis.majorCode)}</div>
                              <div className="text-sm text-muted-foreground">{getFullMajorName(analysis.majorCode)}</div>
                            </div>
                          </TableCell>
                          <TableCell>{analysis.applicants}</TableCell>
                          <TableCell>{analysis.quota}</TableCell>
                          <TableCell>
                            <Badge variant={analysis.competitionRatio > 3 ? 'destructive' : analysis.competitionRatio > 2 ? 'secondary' : 'default'}>
                              {analysis.competitionRatio.toFixed(1)}:1
                            </Badge>
                          </TableCell>
                          <TableCell>{analysis.averageScore.toFixed(2)}</TableCell>
                          <TableCell>{analysis.cutoffScore.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={analysis.difficulty === 'HIGH' ? 'destructive' : analysis.difficulty === 'MEDIUM' ? 'secondary' : 'default'}>
                              {analysis.difficulty}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>



          {/* Simulation Tab */}
          <TabsContent value="simulation">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Simulasi Penerimaan</span>
                </CardTitle>
                <CardDescription>
                  Jalankan simulasi proses penerimaan berdasarkan kuota saat ini
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Button onClick={runSimulation} className="flex items-center space-x-2">
                    <Play className="w-4 h-4" />
                    <span>Jalankan Simulasi</span>
                  </Button>
                  <Button variant="outline" onClick={() => loadRankingData()}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Data
                  </Button>
                </div>

                {simulationResults ? (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Ringkasan Hasil Simulasi</CardTitle>
                        <CardDescription>
                          Hasil ini adalah proyeksi berdasarkan kuota saat ini dan tidak mengubah status siswa secara permanen.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                          <div className="p-4 bg-green-50 rounded-lg">
                            <div className="text-3xl font-bold text-green-700">{simulationResults.summary?.totalAccepted ?? 0}</div>
                            <div className="text-sm font-medium text-green-600">Total Diterima</div>
                          </div>
                          <div className="p-4 bg-red-50 rounded-lg">
                            <div className="text-3xl font-bold text-red-700">{simulationResults.summary?.totalRejected ?? 0}</div>
                            <div className="text-sm font-medium text-red-600">Total Ditolak</div>
                          </div>
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="text-3xl font-bold text-blue-700">{(simulationResults.summary?.quotaUtilization ?? 0).toFixed(1)}%</div>
                            <div className="text-sm font-medium text-blue-600">Utilisasi Kuota</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Detail Simulasi per Jurusan</CardTitle>
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
      </div>
    </AdminLayout>
  )
}