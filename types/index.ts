// Types untuk aplikasi PPDB
// Types for enum values as strings
export type Role = 'ADMIN' | 'STUDENT'
export type Gender = 'MALE' | 'FEMALE'
export type StudentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITLIST'
export type ProcessAction = 'ACCEPT' | 'REJECT'

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
  birthPlace: string
  birthDate: Date
  gender: Gender
  religion: string
  nationality: string
  address: string
  rt?: string
  rw?: string
  village?: string
  district: string
  city: string
  province: string
  postalCode: string
  phoneNumber?: string
  email?: string
  childOrder?: number
  totalSiblings?: number
  height?: number
  weight?: number
  medicalHistory?: string
  
  // Data Orang Tua/Wali
  fatherName: string
  fatherJob?: string
  fatherEducation?: string
  motherName: string
  motherJob?: string
  motherEducation?: string
  guardianName?: string
  guardianJob?: string
  parentPhone?: string
  parentAddress?: string
  
  // Data Pendidikan
  schoolName: string
  npsn?: string
  nisn?: string
  graduationYear: number
  certificateNumber?: string
  
  // Pilihan Jurusan
  selectedMajor: string
  
  // Status Dokumen (untuk tracking upload)
  hasIjazah: boolean
  hasSKHUN: boolean
  hasKK: boolean
  hasAktaLahir: boolean
  hasFoto: boolean
  hasRaport: boolean
  hasSertifikat: boolean



  // Status Penerimaan Sederhana
  finalStatus: StudentStatus
  adminNotes?: string
  processedAt?: Date
  processedBy?: string
  
  createdAt: Date
  updatedAt: Date
}

export interface Ranking {
  id: string
  studentId: string
  
  // Nilai Akademik
  mathScore: number
  indonesianScore: number
  englishScore: number
  scienceScore: number
  
  // Prestasi dan Sertifikat
  academicAchievement: string
  nonAcademicAchievement: string
  certificateScore: string
  
  // Akreditasi Sekolah
  accreditation: string
  
  // Total dan Ranking
  totalScore: number
  rank?: number
  
  createdAt: Date
  updatedAt: Date
}

export interface StudentProcessLog {
  id: string
  studentId: string
  action: ProcessAction
  reason?: string
  processedBy: string
  createdAt: Date
  processor?: User
}



export interface StudentWithRanking extends Student {
  ranking?: Ranking
  user?: User
  processLogs?: StudentProcessLog[]
}

export interface StudentProcessRequest {
  action: ProcessAction
  reason?: string
}

export interface BulkProcessRequest {
  action: ProcessAction
  studentIds: string[]
  reason?: string
}

export interface ProcessSummary {
  totalStudents: number
  acceptedStudents: number
  rejectedStudents: number
  waitlistStudents: number
  pendingStudents: number
}

export interface LoginCredentials {
  username: string
  password: string
  role: Role
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
  birthPlace: string
  birthDate: string
  gender: Gender
  religion: string
  nationality: string
  address: string
  rt?: string
  rw?: string
  village?: string
  district: string
  city: string
  province: string
  postalCode: string
  phoneNumber?: string
  email?: string
  childOrder?: number
  totalSiblings?: number
  height?: number
  weight?: number
  medicalHistory?: string
}

export interface ParentFormData {
  fatherName: string
  fatherJob?: string
  fatherEducation?: string
  motherName: string
  motherJob?: string
  motherEducation?: string
  guardianName?: string
  guardianJob?: string
  parentPhone?: string
  parentAddress?: string
}

export interface EducationFormData {
  schoolName: string
  npsn?: string
  nisn?: string
  graduationYear?: number
  certificateNumber?: string
}

export interface MajorFormData {
  selectedMajor: string
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
  mathScore?: number
  indonesianScore?: number
  englishScore?: number
  scienceScore?: number
  academicAchievement?: string
  nonAcademicAchievement?: string
  certificateScore?: string
  accreditation?: string
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
  'Teknik Kendaraan Ringan Otomotif',
  'Teknik Alat Berat',
  'Teknik Komputer dan Jaringan',
  'Akuntansi dan Keuangan Lembaga',
  'Asisten Keperawatan',
  'Agribisnis Ternak Ruminansia'
] as const

export type MajorType = typeof AVAILABLE_MAJORS[number]

// Types already exported above