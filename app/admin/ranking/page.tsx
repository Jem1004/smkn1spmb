'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, Search, Filter, Trophy, Target, Users, TrendingUp, RefreshCw, Play } from 'lucide-react'
import { Student, MajorType, AVAILABLE_MAJORS } from '@/types'
import { useToast } from '@/hooks/use-toast'
import AdminLayout from '@/components/AdminLayout'
import { 
  RankingStatistics, 
  MajorRankingData 
} from '@/lib/ranking-manager'

interface RankingPageProps {}

export default function RankingPage({}: RankingPageProps) {
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

  useEffect(() => {
    loadRankingData()
    loadCompetitionAnalysis()
  }, [])

  const loadRankingData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ranking?type=comprehensive')
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
  }

  const loadCompetitionAnalysis = async () => {
    try {
      const response = await fetch('/api/ranking?type=competition')
      if (response.ok) {
        const data = await response.json()
        setCompetitionAnalysis(data)
      }
    } catch (error) {
      console.error('Error loading competition analysis:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DITERIMA':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Diterima</Badge>
      case 'CADANGAN':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Cadangan</Badge>
      case 'TIDAK_DITERIMA':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Tidak Diterima</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  const getMajorName = (majorCode: string): string => {
    const major = AVAILABLE_MAJORS.find(m => m === majorCode)
    return major || majorCode
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
      filteredRankings = filteredRankings.filter(student => 
        student.status === statusFilter
      )
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
      const response = await fetch('/api/ranking?type=simulation')
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Pendaftar</p>
                  <p className="text-2xl font-bold">{overallStatistics.totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Diterima</p>
                  <p className="text-2xl font-bold text-green-600">
                    {overallStatistics.totalAccepted}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cadangan</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {overallStatistics.totalWaitlist}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tidak Diterima</p>
                  <p className="text-2xl font-bold text-red-600">
                    {overallStatistics.totalRejected}
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
                            <Badge variant="outline">{getMajorName(student.firstChoice)}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold">{student.totalScore.toFixed(2)}</span>
                          </TableCell>
                          <TableCell>{getStatusBadge(student.status)}</TableCell>
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
                              <div className="font-medium">{analysis.majorName}</div>
                              <div className="text-sm text-muted-foreground">{analysis.majorCode}</div>
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

                {simulationResults && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {simulationResults.summary.totalAccepted}
                            </div>
                            <div className="text-sm text-muted-foreground">Diterima</div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">
                              {simulationResults.summary.totalWaitlist}
                            </div>
                            <div className="text-sm text-muted-foreground">Cadangan</div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">
                              {simulationResults.summary.totalRejected}
                            </div>
                            <div className="text-sm text-muted-foreground">Ditolak</div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {simulationResults.summary.quotaUtilization.toFixed(1)}%
                            </div>
                            <div className="text-sm text-muted-foreground">Utilisasi Kuota</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Hasil Simulasi per Jurusan</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Jurusan</TableHead>
                              <TableHead>Diterima</TableHead>
                              <TableHead>Cadangan</TableHead>
                              <TableHead>Ditolak</TableHead>
                              <TableHead>Total Pendaftar</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Object.entries(simulationResults.results).map(([majorCode, results]: [string, any]) => (
                              <TableRow key={majorCode}>
                                <TableCell>{getMajorName(majorCode)}</TableCell>
                                <TableCell>
                                  <Badge className="bg-green-100 text-green-800">
                                    {results.accepted.length}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge className="bg-yellow-100 text-yellow-800">
                                    {results.waitlist.length}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge className="bg-red-100 text-red-800">
                                    {results.rejected.length}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {results.accepted.length + results.waitlist.length + results.rejected.length}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
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