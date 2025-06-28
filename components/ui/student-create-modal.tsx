'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { AVAILABLE_MAJORS } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Plus, X } from 'lucide-react'

interface StudentCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onStudentCreated?: () => void
}

const initialFormData = {
  // Data Pribadi
  fullName: '',
  birthPlace: '',
  birthDate: '',
  gender: '',
  religion: '',
  nationality: 'Indonesia',
  address: '',
  rt: '',
  rw: '',
  village: '',
  district: '',
  city: '',
  province: '',
  postalCode: '',
  phoneNumber: '',
  email: '',
  childOrder: 1,
  totalSiblings: 1,
  height: 0,
  weight: 0,
  medicalHistory: '',
  
  // Data Orang Tua
  fatherName: '',
  fatherJob: '',
  fatherEducation: '',
  motherName: '',
  motherJob: '',
  motherEducation: '',
  guardianName: '',
  guardianJob: '',
  parentPhone: '',
  parentAddress: '',
  
  // Data Pendidikan
  schoolName: '',
  npsn: '',
  nisn: '',
  graduationYear: new Date().getFullYear(),
  certificateNumber: '',
  selectedMajor: '',
  
  // Status Dokumen
  hasIjazah: false,
  hasSKHUN: false,
  hasKK: false,
  hasAktaLahir: false,
  hasFoto: false,
  hasRaport: false,
  hasSertifikat: false,
  
  // Ranking
  mathScore: 0,
  indonesianScore: 0,
  englishScore: 0,
  scienceScore: 0,
  academicAchievement: 'none',
  nonAcademicAchievement: 'none',
  certificateScore: 'none',
  accreditation: 'Belum Terakreditasi'
}

export function StudentCreateModal({ open, onOpenChange, onStudentCreated }: StudentCreateModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const { toast } = useToast()

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const resetForm = () => {
    setFormData(initialFormData)
  }

  const validateForm = () => {
    const requiredFields = [
      'fullName', 'birthPlace', 'birthDate', 'gender', 'religion',
      'address', 'district', 'city', 'province', 'postalCode',
      'fatherName', 'motherName', 'schoolName', 'graduationYear', 'selectedMajor'
    ]

    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        return `Field ${field} harus diisi`
      }
    }

    return null
  }

  const handleSubmit = async () => {
    const validationError = validateForm()
    if (validationError) {
      toast({
        title: 'Validasi Error',
        description: validationError,
        variant: 'destructive'
      })
      return
    }
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: 'Siswa baru berhasil ditambahkan'
        })
        resetForm()
        onStudentCreated?.()
        onOpenChange(false)
      } else {
        throw new Error(result.message || 'Gagal menambahkan siswa baru')
      }
    } catch (error) {
      console.error('Error creating student:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal menambahkan siswa baru',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Siswa Baru</DialogTitle>
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
                <div>
                  <Label htmlFor="childOrder">Anak ke-</Label>
                  <Input
                    id="childOrder"
                    type="number"
                    min="1"
                    value={formData.childOrder}
                    onChange={(e) => handleInputChange('childOrder', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="totalSiblings">Jumlah Saudara</Label>
                  <Input
                    id="totalSiblings"
                    type="number"
                    min="1"
                    value={formData.totalSiblings}
                    onChange={(e) => handleInputChange('totalSiblings', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="height">Tinggi Badan (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    min="0"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Berat Badan (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    min="0"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', parseInt(e.target.value))}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="medicalHistory">Riwayat Kesehatan</Label>
                  <Textarea
                    id="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                    placeholder="Riwayat penyakit atau kondisi kesehatan khusus"
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
                  <Label htmlFor="fatherEducation">Pendidikan Ayah</Label>
                  <Input
                    id="fatherEducation"
                    value={formData.fatherEducation}
                    onChange={(e) => handleInputChange('fatherEducation', e.target.value)}
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
                  <Label htmlFor="motherEducation">Pendidikan Ibu</Label>
                  <Input
                    id="motherEducation"
                    value={formData.motherEducation}
                    onChange={(e) => handleInputChange('motherEducation', e.target.value)}
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
                  <Label htmlFor="guardianJob">Pekerjaan Wali</Label>
                  <Input
                    id="guardianJob"
                    value={formData.guardianJob}
                    onChange={(e) => handleInputChange('guardianJob', e.target.value)}
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
                <div>
                  <Label htmlFor="parentAddress">Alamat Orang Tua</Label>
                  <Input
                    id="parentAddress"
                    value={formData.parentAddress}
                    onChange={(e) => handleInputChange('parentAddress', e.target.value)}
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
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label htmlFor="certificateNumber">No. Ijazah</Label>
                    <Input
                      id="certificateNumber"
                      value={formData.certificateNumber}
                      onChange={(e) => handleInputChange('certificateNumber', e.target.value)}
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
                </div>
                
                <div>
                  <Label className="text-base font-medium">Status Upload Dokumen</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasIjazah"
                        checked={formData.hasIjazah}
                        onCheckedChange={(checked) => handleInputChange('hasIjazah', checked)}
                      />
                      <Label htmlFor="hasIjazah">Ijazah</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasSKHUN"
                        checked={formData.hasSKHUN}
                        onCheckedChange={(checked) => handleInputChange('hasSKHUN', checked)}
                      />
                      <Label htmlFor="hasSKHUN">SKHUN</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasKK"
                        checked={formData.hasKK}
                        onCheckedChange={(checked) => handleInputChange('hasKK', checked)}
                      />
                      <Label htmlFor="hasKK">Kartu Keluarga</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasAktaLahir"
                        checked={formData.hasAktaLahir}
                        onCheckedChange={(checked) => handleInputChange('hasAktaLahir', checked)}
                      />
                      <Label htmlFor="hasAktaLahir">Akta Lahir</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasFoto"
                        checked={formData.hasFoto}
                        onCheckedChange={(checked) => handleInputChange('hasFoto', checked)}
                      />
                      <Label htmlFor="hasFoto">Foto</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasRaport"
                        checked={formData.hasRaport}
                        onCheckedChange={(checked) => handleInputChange('hasRaport', checked)}
                      />
                      <Label htmlFor="hasRaport">Raport</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasSertifikat"
                        checked={formData.hasSertifikat}
                        onCheckedChange={(checked) => handleInputChange('hasSertifikat', checked)}
                      />
                      <Label htmlFor="hasSertifikat">Sertifikat</Label>
                    </div>
                  </div>
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
                <div>
                  <Label htmlFor="academicAchievement">Prestasi Akademik</Label>
                  <Select value={formData.academicAchievement} onValueChange={(value) => handleInputChange('academicAchievement', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih prestasi akademik" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tidak Ada</SelectItem>
                      <SelectItem value="school">Tingkat Sekolah</SelectItem>
                      <SelectItem value="district">Tingkat Kecamatan</SelectItem>
                      <SelectItem value="city">Tingkat Kota/Kabupaten</SelectItem>
                      <SelectItem value="province">Tingkat Provinsi</SelectItem>
                      <SelectItem value="national">Tingkat Nasional</SelectItem>
                      <SelectItem value="international">Tingkat Internasional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="nonAcademicAchievement">Prestasi Non-Akademik</Label>
                  <Select value={formData.nonAcademicAchievement} onValueChange={(value) => handleInputChange('nonAcademicAchievement', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih prestasi non-akademik" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tidak Ada</SelectItem>
                      <SelectItem value="school">Tingkat Sekolah</SelectItem>
                      <SelectItem value="district">Tingkat Kecamatan</SelectItem>
                      <SelectItem value="city">Tingkat Kota/Kabupaten</SelectItem>
                      <SelectItem value="province">Tingkat Provinsi</SelectItem>
                      <SelectItem value="national">Tingkat Nasional</SelectItem>
                      <SelectItem value="international">Tingkat Internasional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="certificateScore">Sertifikat Keahlian</Label>
                  <Select value={formData.certificateScore} onValueChange={(value) => handleInputChange('certificateScore', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih sertifikat keahlian" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tidak Ada</SelectItem>
                      <SelectItem value="basic">Sertifikat Dasar</SelectItem>
                      <SelectItem value="intermediate">Sertifikat Menengah</SelectItem>
                      <SelectItem value="advanced">Sertifikat Lanjutan</SelectItem>
                      <SelectItem value="professional">Sertifikat Profesional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="accreditation">Akreditasi Sekolah Asal</Label>
                  <Select value={formData.accreditation} onValueChange={(value) => handleInputChange('accreditation', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih akreditasi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Belum Terakreditasi">Belum Terakreditasi</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="Unggul">Unggul</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
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
              <Plus className="w-4 h-4 mr-2" />
            )}
            {isLoading ? 'Menambahkan...' : 'Tambah Siswa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}