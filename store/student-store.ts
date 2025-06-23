import { create } from 'zustand'
import { Student, StudentWithRanking, CompleteStudentFormData } from '@/types'

interface StudentState {
  students: StudentWithRanking[]
  currentStudent: StudentWithRanking | null
  formData: Partial<CompleteStudentFormData>
  isLoading: boolean
  error: string | null
}

interface StudentActions {
  setStudents: (students: StudentWithRanking[]) => void
  setCurrentStudent: (student: StudentWithRanking | null) => void
  updateFormData: (data: Partial<CompleteStudentFormData>) => void
  clearFormData: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addStudent: (student: StudentWithRanking) => void
  updateStudent: (id: string, student: Partial<StudentWithRanking>) => void
  removeStudent: (id: string) => void
}

const initialFormData: Partial<CompleteStudentFormData> = {
  // Personal Data
  fullName: '',
  nickname: '',
  birthPlace: '',
  birthDate: '',
  gender: undefined,
  religion: '',
  address: '',
  village: '',
  district: '',
  city: '',
  province: '',
  postalCode: '',
  phone: '',
  email: '',
  
  // Parent Data
  fatherName: '',
  motherName: '',
  guardianName: '',
  fatherJob: '',
  motherJob: '',
  guardianJob: '',
  fatherPhone: '',
  motherPhone: '',
  guardianPhone: '',
  parentAddress: '',
  
  // Education Data
  previousSchool: '',
  nisn: '',
  graduationYear: 0,
  
  // Major Choices
  firstMajor: '',
  secondMajor: '',
  thirdMajor: '',
  
  // Documents
  hasIjazah: false,
  hasKK: false,
  hasAktaLahir: false,
  hasSKHUN: false,
  hasFoto: false,
  hasRaport: false,
  hasSertifikat: false,
  
  // Ranking Data
  ranking: {
    indonesianScore: 0,
    englishScore: 0,
    mathScore: 0,
    scienceScore: 0,
    academicAchievement: '',
    nonAcademicAchievement: '',
    certificateScore: ''
  }
}

export const useStudentStore = create<StudentState & StudentActions>()(
  (set, get) => ({
    // State
    students: [],
    currentStudent: null,
    formData: initialFormData,
    isLoading: false,
    error: null,

    // Actions
    setStudents: (students: StudentWithRanking[]) => {
      set({ students, error: null })
    },

    setCurrentStudent: (student: StudentWithRanking | null) => {
      set({ currentStudent: student, error: null })
    },

    updateFormData: (data: Partial<CompleteStudentFormData>) => {
      set(state => ({
        formData: { ...state.formData, ...data }
      }))
    },

    clearFormData: () => {
      set({ formData: initialFormData })
    },

    setLoading: (loading: boolean) => {
      set({ isLoading: loading })
    },

    setError: (error: string | null) => {
      set({ error })
    },

    addStudent: (student: StudentWithRanking) => {
      set(state => ({
        students: [...state.students, student],
        error: null
      }))
    },

    updateStudent: (id: string, updatedStudent: Partial<StudentWithRanking>) => {
      set(state => ({
        students: state.students.map(student => 
          student.id === id ? { ...student, ...updatedStudent } : student
        ),
        currentStudent: state.currentStudent?.id === id 
          ? { ...state.currentStudent, ...updatedStudent }
          : state.currentStudent,
        error: null
      }))
    },

    removeStudent: (id: string) => {
      set(state => ({
        students: state.students.filter(student => student.id !== id),
        currentStudent: state.currentStudent?.id === id ? null : state.currentStudent,
        error: null
      }))
    }
  })
)