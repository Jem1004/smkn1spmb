import { z } from 'zod'
import { Gender, RegistrationStatus } from '@/types'

// Base validation schemas
const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const nisnRegex = /^[0-9]{10}$/
const postalCodeRegex = /^[0-9]{5}$/

// Personal Data Schema
export const personalDataSchema = z.object({
  fullName: z.string()
    .min(2, 'Nama lengkap minimal 2 karakter')
    .max(100, 'Nama lengkap maksimal 100 karakter')
    .regex(/^[a-zA-Z\s.,']+$/, 'Nama hanya boleh mengandung huruf, spasi, titik, koma, dan apostrof'),
  
  nickname: z.string()
    .max(50, 'Nama panggilan maksimal 50 karakter')
    .optional()
    .or(z.literal('')),
  
  birthPlace: z.string()
    .min(2, 'Tempat lahir minimal 2 karakter')
    .max(50, 'Tempat lahir maksimal 50 karakter'),
  
  birthDate: z.string()
    .refine((date) => {
      const birthDate = new Date(date)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      return age >= 15 && age <= 25
    }, 'Usia harus antara 15-25 tahun'),
  
  gender: z.nativeEnum(Gender, {
    errorMap: () => ({ message: 'Jenis kelamin harus dipilih' })
  }),
  
  religion: z.string()
    .min(1, 'Agama harus dipilih')
    .max(30, 'Agama maksimal 30 karakter'),
  
  nationality: z.string()
    .min(1, 'Kewarganegaraan harus diisi')
    .max(30, 'Kewarganegaraan maksimal 30 karakter')
    .default('Indonesia'),
  
  address: z.string()
    .min(10, 'Alamat minimal 10 karakter')
    .max(200, 'Alamat maksimal 200 karakter'),
  
  rt: z.string()
    .max(3, 'RT maksimal 3 karakter')
    .optional()
    .or(z.literal('')),
  
  rw: z.string()
    .max(3, 'RW maksimal 3 karakter')
    .optional()
    .or(z.literal('')),
  
  village: z.string()
    .min(2, 'Kelurahan/Desa minimal 2 karakter')
    .max(50, 'Kelurahan/Desa maksimal 50 karakter'),
  
  district: z.string()
    .min(2, 'Kecamatan minimal 2 karakter')
    .max(50, 'Kecamatan maksimal 50 karakter'),
  
  city: z.string()
    .min(2, 'Kota/Kabupaten minimal 2 karakter')
    .max(50, 'Kota/Kabupaten maksimal 50 karakter'),
  
  province: z.string()
    .min(2, 'Provinsi minimal 2 karakter')
    .max(50, 'Provinsi maksimal 50 karakter'),
  
  postalCode: z.string()
    .regex(postalCodeRegex, 'Kode pos harus 5 digit angka'),
  
  phone: z.string()
    .regex(phoneRegex, 'Format nomor telepon tidak valid')
    .optional()
    .or(z.literal('')),
  
  email: z.string()
    .regex(emailRegex, 'Format email tidak valid')
    .optional()
    .or(z.literal(''))
})

// Parent Data Schema
export const parentDataSchema = z.object({
  fatherName: z.string()
    .min(2, 'Nama ayah minimal 2 karakter')
    .max(100, 'Nama ayah maksimal 100 karakter'),
  
  fatherJob: z.string()
    .max(50, 'Pekerjaan ayah maksimal 50 karakter')
    .optional()
    .or(z.literal('')),
  
  fatherPhone: z.string()
    .regex(phoneRegex, 'Format nomor telepon ayah tidak valid')
    .optional()
    .or(z.literal('')),
  
  motherName: z.string()
    .min(2, 'Nama ibu minimal 2 karakter')
    .max(100, 'Nama ibu maksimal 100 karakter'),
  
  motherJob: z.string()
    .max(50, 'Pekerjaan ibu maksimal 50 karakter')
    .optional()
    .or(z.literal('')),
  
  motherPhone: z.string()
    .regex(phoneRegex, 'Format nomor telepon ibu tidak valid')
    .optional()
    .or(z.literal('')),
  
  guardianName: z.string()
    .max(100, 'Nama wali maksimal 100 karakter')
    .optional()
    .or(z.literal('')),
  
  guardianJob: z.string()
    .max(50, 'Pekerjaan wali maksimal 50 karakter')
    .optional()
    .or(z.literal('')),
  
  guardianPhone: z.string()
    .regex(phoneRegex, 'Format nomor telepon wali tidak valid')
    .optional()
    .or(z.literal('')),
  
  parentAddress: z.string()
    .max(200, 'Alamat orang tua maksimal 200 karakter')
    .optional()
    .or(z.literal(''))
})

// Education Data Schema
export const educationDataSchema = z.object({
  previousSchool: z.string()
    .min(5, 'Nama sekolah minimal 5 karakter')
    .max(100, 'Nama sekolah maksimal 100 karakter'),
  
  nisn: z.string()
    .regex(nisnRegex, 'NISN harus 10 digit angka')
    .optional()
    .or(z.literal('')),
  
  graduationYear: z.number()
    .min(2020, 'Tahun lulus minimal 2020')
    .max(new Date().getFullYear(), `Tahun lulus maksimal ${new Date().getFullYear()}`)
})

// Major Selection Schema
export const majorDataSchema = z.object({
  firstMajor: z.string()
    .min(1, 'Pilihan jurusan pertama harus dipilih'),
  
  secondMajor: z.string()
    .optional()
    .or(z.literal('')),
  
  thirdMajor: z.string()
    .optional()
    .or(z.literal(''))
}).refine((data) => {
  const majors = [data.firstMajor, data.secondMajor, data.thirdMajor].filter(Boolean)
  const uniqueMajors = new Set(majors)
  return majors.length === uniqueMajors.size
}, {
  message: 'Pilihan jurusan tidak boleh sama',
  path: ['secondMajor']
})

// Document Data Schema
export const documentDataSchema = z.object({
  hasIjazah: z.boolean(),
  hasSKHUN: z.boolean(),
  hasKK: z.boolean(),
  hasAktaLahir: z.boolean(),
  hasFoto: z.boolean(),
  hasRaport: z.boolean(),
  hasSertifikat: z.boolean()
}).refine((data) => {
  // Required documents
  const requiredDocs = ['hasIjazah', 'hasSKHUN', 'hasKK', 'hasAktaLahir', 'hasFoto'] as const
  return requiredDocs.every(doc => data[doc] === true)
}, {
  message: 'Semua dokumen wajib harus disiapkan',
  path: ['hasIjazah']
})

// Achievement levels for scoring
const achievementLevels = z.enum(['none', 'sekolah', 'kecamatan', 'kabupaten', 'provinsi', 'nasional', 'internasional'])

// Ranking Data Schema
export const rankingDataSchema = z.object({
  indonesianScore: z.number()
    .min(0, 'Nilai Bahasa Indonesia minimal 0')
    .max(100, 'Nilai Bahasa Indonesia maksimal 100'),
  
  englishScore: z.number()
    .min(0, 'Nilai Bahasa Inggris minimal 0')
    .max(100, 'Nilai Bahasa Inggris maksimal 100'),
  
  mathScore: z.number()
    .min(0, 'Nilai Matematika minimal 0')
    .max(100, 'Nilai Matematika maksimal 100'),
  
  scienceScore: z.number()
    .min(0, 'Nilai IPA minimal 0')
    .max(100, 'Nilai IPA maksimal 100'),
  
  // Achievement levels (will be converted to scores)
  academicAchievement: achievementLevels.default('none'),
  nonAcademicAchievement: achievementLevels.default('none'),
  certificateScore: achievementLevels.default('none')
})

// Complete Student Data Schema
export const completeStudentSchema = z.object({
  personal: personalDataSchema,
  parent: parentDataSchema,
  education: educationDataSchema,
  major: majorDataSchema,
  document: documentDataSchema,
  ranking: rankingDataSchema.optional()
})

// Student Update Schema (for API)
export const studentUpdateSchema = z.object({
  // Personal data
  fullName: z.string().min(2).max(100).optional(),
  nickname: z.string().max(50).optional(),
  birthPlace: z.string().min(2).max(50).optional(),
  birthDate: z.string().optional(),
  gender: z.nativeEnum(Gender).optional(),
  religion: z.string().min(1).max(30).optional(),
  nationality: z.string().min(1).max(30).optional(),
  address: z.string().min(10).max(200).optional(),
  rt: z.string().max(3).optional(),
  rw: z.string().max(3).optional(),
  village: z.string().min(2).max(50).optional(),
  district: z.string().min(2).max(50).optional(),
  city: z.string().min(2).max(50).optional(),
  province: z.string().min(2).max(50).optional(),
  postalCode: z.string().regex(postalCodeRegex).optional(),
  phone: z.string().regex(phoneRegex).optional(),
  email: z.string().regex(emailRegex).optional(),
  
  // Parent data
  fatherName: z.string().min(2).max(100).optional(),
  fatherJob: z.string().max(50).optional(),
  fatherPhone: z.string().regex(phoneRegex).optional(),
  motherName: z.string().min(2).max(100).optional(),
  motherJob: z.string().max(50).optional(),
  motherPhone: z.string().regex(phoneRegex).optional(),
  guardianName: z.string().max(100).optional(),
  guardianJob: z.string().max(50).optional(),
  guardianPhone: z.string().regex(phoneRegex).optional(),
  parentAddress: z.string().max(200).optional(),
  
  // Education data
  previousSchool: z.string().min(5).max(100).optional(),
  nisn: z.string().regex(nisnRegex).optional(),
  graduationYear: z.number().min(2020).max(new Date().getFullYear()).optional(),
  
  // Major data
  firstMajor: z.string().min(1).optional(),
  secondMajor: z.string().optional(),
  thirdMajor: z.string().optional(),
  
  // Document data
  hasIjazah: z.boolean().optional(),
  hasSKHUN: z.boolean().optional(),
  hasKK: z.boolean().optional(),
  hasAktaLahir: z.boolean().optional(),
  hasFoto: z.boolean().optional(),
  hasRaport: z.boolean().optional(),
  hasSertifikat: z.boolean().optional(),
  
  // Registration status
  registrationStatus: z.nativeEnum(RegistrationStatus).optional()
})

// Export types
export type PersonalData = z.infer<typeof personalDataSchema>
export type ParentData = z.infer<typeof parentDataSchema>
export type EducationData = z.infer<typeof educationDataSchema>
export type MajorData = z.infer<typeof majorDataSchema>
export type DocumentData = z.infer<typeof documentDataSchema>
export type RankingData = z.infer<typeof rankingDataSchema>
export type CompleteStudentData = z.infer<typeof completeStudentSchema>
export type StudentUpdateData = z.infer<typeof studentUpdateSchema>