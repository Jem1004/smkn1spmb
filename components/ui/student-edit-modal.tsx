'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StudentWithRanking, AVAILABLE_MAJORS } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Save, X } from 'lucide-react'

interface StudentEditModalProps {
  student: StudentWithRanking | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStudentUpdated?: () => void
}

export function StudentEditModal({ student, open, onOpenChange, onStudentUpdated }: StudentEditModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const { toast } = useToast()

  useEffect(() => {
    if (student) {
      setFormData({
        // Data Pribadi
        fullName: student.fullName || '',
        birthPlace: student.birthPlace || '',
        birthDate: student.birthDate ? new Date(student.birthDate).toISOString().split('T')[0] : '',
        gender: student.gender || '',
        religion: student.religion || '',
        nationality: student.nationality || 'Indonesia',
        address: student.address || '',
        rt: student.rt || '',
        rw: student.rw || '',
        village: student.village || '',
        district: student.district || '',
        city: student.city || '',
        province: student.province || '',
        postalCode: student.postalCode || '',
        phoneNumber: student.phoneNumber || '',
        email: student.email || '',
        childOrder: student.childOrder || 1,
        totalSiblings: student.totalSiblings || 1,
        height: student.height || 0,
        weight: student.weight || 0,
        medicalHistory: student.medicalHistory || '',
        
        // Data Orang Tua
        fatherName: student.fatherName || '',
        fatherJob: student.fatherJob || '',
        fatherEducation: student.fatherEducation || '',
        motherName: student.motherName || '',
        motherJob: student.motherJob || '',
        motherEducation: student.motherEducation || '',
        guardianName: student.guardianName || '',
        guardianJob: student.guardianJob || '',
        parentPhone: student.parentPhone || '',
        parentAddress: student.parentAddress || '',
        
        // Data Pendidikan
        schoolName: student.schoolName || '',
        npsn: student.npsn || '',
        nisn: student.nisn || '',
        graduationYear: student.graduationYear || new Date().getFullYear(),
        certificateNumber: student.certificateNumber || '',
        selectedMajor: student.selectedMajor || '',
        
        // Status Dokumen
        hasIjazah: student.hasIjazah || false,
        hasSKHUN: student.hasSKHUN || false,
        hasKK: student.hasKK || false,
        hasAktaLahir: student.hasAktaLahir || false,
        hasFoto: student.hasFoto || false,
        hasRaport: student.hasRaport || false,
        hasSertifikat: student.hasSertifikat || false,
        
        // Ranking (jika ada)
        mathScore: student.ranking?.mathScore || 0,
        indonesianScore: student.ranking?.indonesianScore || 0,
        englishScore: student.ranking?.englishScore || 0,
        scienceScore: student.ranking?.scienceScore || 0,
        academicAchievement: student.ranking?.academicAchievement || 'none',
        nonAcademicAchievement: student.ranking?.nonAcademicAchievement || 'none',
        certificateScore: student.ranking?.certificateScore || 'none',
        accreditation: student.ranking?.accreditation || 'Belum Terakreditasi'
      })
    }
  }, [student])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    if (!student) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/students/${student.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: 'Data siswa berhasil diperbarui'
        })
        onStudentUpdated?.()
        onOpenChange(false)
      } else {
        throw new Error(result.message || 'Gagal memperbarui data siswa')
      }
    } catch (error) {
      console.error('Error updating student:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal memperbarui data siswa',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!student) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Data Siswa: {student.fullName}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="personal">Pribadi</TabsTrigger>
            <TabsTrigger value="address">Alamat</TabsTrigger>
            <TabsTrigger value="parents">Orang Tua</TabsTrigger>
            <TabsTrigger value="education">Pendidikan</TabsTrigger>
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Pribadi</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Nama Lengkap *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="birthPlace">Tempat Lahir *</Label>
                  <Input
                    id="birthPlace"
                    value={formData.birthPlace}
                    onChange={(e) => handleInputChange('birthPlace', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="birthDate">Tanggal Lahir *</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Jenis Kelamin *</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Laki-laki</SelectItem>
                      <SelectItem value="FEMALE">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="religion">Agama *</Label>
                  <Input
                    id="religion"
                    value={formData.religion}
                    onChange={(e) => handleInputChange('religion', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="nationality">Kewarganegaraan</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">No. Telepon</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="address" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Alamat</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="address">Alamat Lengkap *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="rt">RT</Label>
                  <Input
                    id="rt"
                    value={formData.rt}
                    onChange={(e) => handleInputChange('rt', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="rw">RW</Label>
                  <Input
                    id="rw"
                    value={formData.rw}
                    onChange={(e) => handleInputChange('rw', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="village">Desa/Kelurahan</Label>
                  <Input
                    id="village"
                    value={formData.village}
                    onChange={(e) => handleInputChange('village', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="district">Kecamatan *</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city">Kota/Kabupaten *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="province">Provinsi *</Label>
                  <Input
                    id="province"
                    value={formData.province}
                    onChange={(e) => handleInputChange('province', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Kode Pos *</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Orang Tua/Wali</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fatherName">Nama Ayah *</Label>
                  <Input
                    id="fatherName"
                    value={formData.fatherName}
                    onChange={(e) => handleInputChange('fatherName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fatherJob">Pekerjaan Ayah</Label>
                  <Input
                    id="fatherJob"
                    value={formData.fatherJob}
                    onChange={(e) => handleInputChange('fatherJob', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="motherName">Nama Ibu *</Label>
                  <Input
                    id="motherName"
                    value={formData.motherName}
                    onChange={(e) => handleInputChange('motherName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="motherJob">Pekerjaan Ibu</Label>
                  <Input
                    id="motherJob"
                    value={formData.motherJob}
                    onChange={(e) => handleInputChange('motherJob', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="guardianName">Nama Wali</Label>
                  <Input
                    id="guardianName"
                    value={formData.guardianName}
                    onChange={(e) => handleInputChange('guardianName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="parentPhone">No. Telepon Orang Tua</Label>
                  <Input
                    id="parentPhone"
                    value={formData.parentPhone}
                    onChange={(e) => handleInputChange('parentPhone', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="education" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Pendidikan</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="schoolName">Asal Sekolah *</Label>
                  <Input
                    id="schoolName"
                    value={formData.schoolName}
                    onChange={(e) => handleInputChange('schoolName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="npsn">NPSN</Label>
                  <Input
                    id="npsn"
                    value={formData.npsn}
                    onChange={(e) => handleInputChange('npsn', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="nisn">NISN</Label>
                  <Input
                    id="nisn"
                    value={formData.nisn}
                    onChange={(e) => handleInputChange('nisn', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="graduationYear">Tahun Lulus *</Label>
                  <Input
                    id="graduationYear"
                    type="number"
                    value={formData.graduationYear}
                    onChange={(e) => handleInputChange('graduationYear', parseInt(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="selectedMajor">Jurusan Pilihan *</Label>
                  <Select value={formData.selectedMajor} onValueChange={(value) => handleInputChange('selectedMajor', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jurusan" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_MAJORS.map((major) => (
                        <SelectItem key={major} value={major}>
                          {major}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ranking" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Ranking</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mathScore">Nilai Matematika</Label>
                  <Input
                    id="mathScore"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.mathScore}
                    onChange={(e) => handleInputChange('mathScore', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="indonesianScore">Nilai Bahasa Indonesia</Label>
                  <Input
                    id="indonesianScore"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.indonesianScore}
                    onChange={(e) => handleInputChange('indonesianScore', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="englishScore">Nilai Bahasa Inggris</Label>
                  <Input
                    id="englishScore"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.englishScore}
                    onChange={(e) => handleInputChange('englishScore', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="scienceScore">Nilai IPA</Label>
                  <Input
                    id="scienceScore"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.scienceScore}
                    onChange={(e) => handleInputChange('scienceScore', parseFloat(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            <X className="w-4 h-4 mr-2" />
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}