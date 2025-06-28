'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StudentWithRanking } from '@/types'
import { format } from 'date-fns'
import { id } from 'date-fns/locale/id'
import { User, GraduationCap, MapPin, Phone, Mail, Users, FileText, Award } from 'lucide-react'

interface StudentDetailModalProps {
  student: StudentWithRanking | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StudentDetailModal({ student, open, onOpenChange }: StudentDetailModalProps) {
  if (!student) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <Badge className="bg-green-100 text-green-800">DITERIMA</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">DITOLAK</Badge>
      case 'PENDING':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">MENUNGGU</Badge>
    }
  }

  const getDocumentStatus = (hasDocument: boolean) => {
    return hasDocument ? (
      <Badge className="bg-green-100 text-green-800">Sudah Upload</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">Belum Upload</Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Detail Siswa: {student.fullName}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Data Pribadi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Data Pribadi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Nama Lengkap</label>
                <p className="text-sm">{student.fullName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tempat, Tanggal Lahir</label>
                <p className="text-sm">
                  {student.birthPlace}, {format(new Date(student.birthDate), 'dd MMMM yyyy', { locale: id })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Jenis Kelamin</label>
                <p className="text-sm">{student.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Agama</label>
                <p className="text-sm">{student.religion}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Kewarganegaraan</label>
                <p className="text-sm">{student.nationality}</p>
              </div>
              {student.phoneNumber && (
                <div>
                  <label className="text-sm font-medium text-gray-500">No. Telepon</label>
                  <p className="text-sm flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {student.phoneNumber}
                  </p>
                </div>
              )}
              {student.email && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {student.email}
                  </p>
                </div>
              )}
              {(student.childOrder || student.totalSiblings) && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Anak ke / Jumlah Saudara</label>
                  <p className="text-sm">{student.childOrder || '-'} dari {student.totalSiblings || '-'} bersaudara</p>
                </div>
              )}
              {(student.height || student.weight) && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Tinggi / Berat Badan</label>
                  <p className="text-sm">{student.height || '-'} cm / {student.weight || '-'} kg</p>
                </div>
              )}
              {student.medicalHistory && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Riwayat Penyakit</label>
                  <p className="text-sm bg-gray-50 p-2 rounded">{student.medicalHistory}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alamat */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Alamat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Alamat Lengkap</label>
                <p className="text-sm">{student.address}</p>
              </div>
              {(student.rt || student.rw) && (
                <div>
                  <label className="text-sm font-medium text-gray-500">RT/RW</label>
                  <p className="text-sm">{student.rt || '-'}/{student.rw || '-'}</p>
                </div>
              )}
              {student.village && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Desa/Kelurahan</label>
                  <p className="text-sm">{student.village}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Kecamatan</label>
                <p className="text-sm">{student.district}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Kota/Kabupaten</label>
                <p className="text-sm">{student.city}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Provinsi</label>
                <p className="text-sm">{student.province}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Kode Pos</label>
                <p className="text-sm">{student.postalCode}</p>
              </div>
            </CardContent>
          </Card>

          {/* Data Orang Tua */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Data Orang Tua/Wali
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Nama Ayah</label>
                <p className="text-sm">{student.fatherName}</p>
              </div>
              {student.fatherJob && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Pekerjaan Ayah</label>
                  <p className="text-sm">{student.fatherJob}</p>
                </div>
              )}
              {student.fatherEducation && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Pendidikan Ayah</label>
                  <p className="text-sm">{student.fatherEducation}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Nama Ibu</label>
                <p className="text-sm">{student.motherName}</p>
              </div>
              {student.motherJob && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Pekerjaan Ibu</label>
                  <p className="text-sm">{student.motherJob}</p>
                </div>
              )}
              {student.motherEducation && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Pendidikan Ibu</label>
                  <p className="text-sm">{student.motherEducation}</p>
                </div>
              )}
              {student.guardianName && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Nama Wali</label>
                  <p className="text-sm">{student.guardianName}</p>
                </div>
              )}
              {student.guardianJob && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Pekerjaan Wali</label>
                  <p className="text-sm">{student.guardianJob}</p>
                </div>
              )}
              {student.parentPhone && (
                <div>
                  <label className="text-sm font-medium text-gray-500">No. Telepon Orang Tua</label>
                  <p className="text-sm flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {student.parentPhone}
                  </p>
                </div>
              )}
              {student.parentAddress && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Alamat Orang Tua</label>
                  <p className="text-sm">{student.parentAddress}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Pendidikan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Data Pendidikan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Asal Sekolah</label>
                <p className="text-sm">{student.schoolName}</p>
              </div>
              {student.npsn && (
                <div>
                  <label className="text-sm font-medium text-gray-500">NPSN</label>
                  <p className="text-sm">{student.npsn}</p>
                </div>
              )}
              {student.nisn && (
                <div>
                  <label className="text-sm font-medium text-gray-500">NISN</label>
                  <p className="text-sm">{student.nisn}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Tahun Lulus</label>
                <p className="text-sm">{student.graduationYear}</p>
              </div>
              {student.certificateNumber && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Nomor Sertifikat</label>
                  <p className="text-sm">{student.certificateNumber}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Jurusan Pilihan</label>
                <p className="text-sm font-medium">{student.selectedMajor}</p>
              </div>
            </CardContent>
          </Card>

          {/* Status Dokumen */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Status Upload Dokumen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Ijazah</span>
                {getDocumentStatus(student.hasIjazah)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">SKHUN</span>
                {getDocumentStatus(student.hasSKHUN)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Kartu Keluarga</span>
                {getDocumentStatus(student.hasKK)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Akta Lahir</span>
                {getDocumentStatus(student.hasAktaLahir)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Foto</span>
                {getDocumentStatus(student.hasFoto)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Raport</span>
                {getDocumentStatus(student.hasRaport)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Sertifikat</span>
                {getDocumentStatus(student.hasSertifikat)}
              </div>
            </CardContent>
          </Card>

          {/* Nilai Akademik */}
          {student.ranking && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Nilai Akademik
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Matematika</label>
                    <p className="text-sm font-bold">{student.ranking.mathScore}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Bahasa Indonesia</label>
                    <p className="text-sm font-bold">{student.ranking.indonesianScore}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Bahasa Inggris</label>
                    <p className="text-sm font-bold">{student.ranking.englishScore}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">IPA</label>
                    <p className="text-sm font-bold">{student.ranking.scienceScore}</p>
                  </div>
                </div>
                {student.ranking.academicAchievement && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Prestasi Akademik</label>
                    <p className="text-sm bg-blue-50 p-2 rounded">{student.ranking.academicAchievement}</p>
                  </div>
                )}
                {student.ranking.nonAcademicAchievement && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Prestasi Non-Akademik</label>
                    <p className="text-sm bg-green-50 p-2 rounded">{student.ranking.nonAcademicAchievement}</p>
                  </div>
                )}
                {student.ranking.certificateScore && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Skor Sertifikat</label>
                    <p className="text-sm bg-yellow-50 p-2 rounded">{student.ranking.certificateScore}</p>
                  </div>
                )}
                {student.ranking.accreditation && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Akreditasi Sekolah Asal</label>
                    <p className="text-sm font-medium">{student.ranking.accreditation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Ranking & Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Ranking & Status Penerimaan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {student.ranking && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Skor</label>
                    <p className="text-lg font-bold text-blue-600">{student.ranking.totalScore.toFixed(2)}</p>
                  </div>
                  {student.ranking.rank && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Peringkat</label>
                      <p className="text-lg font-bold text-green-600">#{student.ranking.rank}</p>
                    </div>
                  )}
                </>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Status Penerimaan</label>
                <div className="mt-1">{getStatusBadge(student.finalStatus)}</div>
              </div>
              {student.adminNotes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Catatan Admin</label>
                  <p className="text-sm bg-gray-50 p-2 rounded">{student.adminNotes}</p>
                </div>
              )}
              {student.processedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Diproses Pada</label>
                  <p className="text-sm">
                    {format(new Date(student.processedAt), 'dd MMMM yyyy HH:mm', { locale: id })}
                  </p>
                </div>
              )}
              {student.processedBy && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Diproses Oleh</label>
                  <p className="text-sm">{student.processedBy}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Tanggal Pendaftaran</label>
                <p className="text-sm">
                  {format(new Date(student.createdAt), 'dd MMMM yyyy HH:mm', { locale: id })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}