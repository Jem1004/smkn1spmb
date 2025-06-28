'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import StudentFormWizard from '@/modules/students/components/StudentFormWizard'
import AdminLayout from '@/components/AdminLayout'
import { UserPlus, GraduationCap } from 'lucide-react'

export default function AddStudentPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  // AdminLayout sudah menangani autentikasi, jadi tidak perlu useEffect redirect di sini
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Form */}
        <StudentFormWizard 
          mode="create"
          onCancel={() => router.push('/admin/students')}
        />
      </div>
    </AdminLayout>
  )
}