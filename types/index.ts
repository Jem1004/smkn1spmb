// Types untuk aplikasi PPDB
import { Role, Gender, RegistrationStatus } from '@prisma/client'

export interface User {
  id: string
  username: string
  role: Role
  createdAt: Date
  updatedAt: Date
}

export interface Student {
  id: string
  userId: string
  
  // Data Personal
  fullName: string
  nickname?: string
  birthPlace: string
  birthDate: Date
  gender: Gender
  religion: string
  nationality: string
  address: string
  rt?: string
  rw?: string
  village: string
  district: string
  city: string
  province: string
  postalCode: string
  phone?: string
  email?: string
  
  // Data Orang Tua/Wali
  fatherName: string
  fatherJob?: string
  fatherPhone?: string
  motherName: string
  motherJob?: string
  motherPhone?: string
  guardianName?: string
  guardianJob?: string
  guardianPhone?: string
  parentAddress?: string
  
  // Data Pendidikan
  previousSchool: string
  nisn?: string
  graduationYear: number
  
  // Pilihan Jurusan
  firstMajor: string
  secondMajor?: string
  thirdMajor?: string
  
  // Status Dokumen
  hasIjazah: boolean
  hasSKHUN: boolean
  hasKK: boolean
  hasAktaLahir: boolean
  hasFoto: boolean
  hasRaport: boolean
  hasSertifikat: boolean
  
  // Status Pendaftaran
  registrationStatus: RegistrationStatus
  
  createdAt: Date
  updatedAt: Date
}

export interface Ranking {
  id: string
  studentId: string
  
  // Nilai Akademik
  indonesianScore: number
  englishScore: number
  mathScore: number
  scienceScore: number
  
  // Nilai Tambahan
  certificateScore: number
  achievementScore: number
  
  // Total dan Ranking
  totalScore: number
  rank?: number
  
  createdAt: Date
  updatedAt: Date
}

export interface StudentWithRanking extends Student {
  ranking?: Ranking
  user?: User
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthSession {
  user: {
    id: string
    username: string
    role: Role
  }
  token: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message: string
  error?: string
}

// Form Data Types
export interface PersonalFormData {
  fullName: string
  nickname?: string
  birthPlace: string
  birthDate: string
  gender: Gender
  religion: string
  nationality: string
  address: string
  rt?: string
  rw?: string
  village: string
  district: string
  city: string
  province: string
  postalCode: string
  phone?: string
  email?: string
}

export interface ParentFormData {
  fatherName: string
  fatherJob?: string
  fatherPhone?: string
  motherName: string
  motherJob?: string
  motherPhone?: string
  guardianName?: string
  guardianJob?: string
  guardianPhone?: string
  parentAddress?: string
}

export interface EducationFormData {
  previousSchool: string
  nisn?: string
  graduationYear: number
}

export interface MajorFormData {
  firstMajor: string
  secondMajor?: string
  thirdMajor?: string
}

export interface DocumentFormData {
  hasIjazah: boolean
  hasSKHUN: boolean
  hasKK: boolean
  hasAktaLahir: boolean
  hasFoto: boolean
  hasRaport: boolean
  hasSertifikat: boolean
}

export interface RankingFormData {
  indonesianScore: number
  englishScore: number
  mathScore: number
  scienceScore: number
  academicAchievement: string
  nonAcademicAchievement: string
  certificateScore: string
}

export interface CompleteStudentFormData extends 
  PersonalFormData, 
  ParentFormData, 
  EducationFormData, 
  MajorFormData, 
  DocumentFormData {
  ranking?: RankingFormData
}

// Available Majors
export const AVAILABLE_MAJORS = [
  'Teknik Komputer dan Jaringan (TKJ)',
  'Rekayasa Perangkat Lunak (RPL)',
  'Multimedia (MM)',
  'Teknik Kendaraan Ringan (TKR)',
  'Teknik Sepeda Motor (TSM)',
  'Teknik Elektronika Industri (TEI)',
  'Akuntansi dan Keuangan Lembaga (AKL)',
  'Otomatisasi dan Tata Kelola Perkantoran (OTKP)',
  'Bisnis Daring dan Pemasaran (BDP)'
] as const

export type MajorType = typeof AVAILABLE_MAJORS[number]

// Re-export Prisma enums for convenience
export { Role, Gender, RegistrationStatus }