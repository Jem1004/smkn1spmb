'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoginCredentials, ApiResponse, AuthSession } from '@/types'
import { Eye, EyeOff, GraduationCap } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login, setLoading, isLoading } = useAuthStore()
  
  const [formData, setFormData] = useState<LoginCredentials & { role: string }>({
    username: '',
    password: '',
    role: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result: ApiResponse<AuthSession> = await response.json()

      if (result.success && result.data) {
        login(result.data)
        
        // Redirect berdasarkan role
        if (result.data.user.role === 'ADMIN') {
          router.push('/admin/dashboard')
        } else if (result.data.user.role === 'STUDENT') {
          router.push('/student/status')
        }
      } else {
        setError(result.message || 'Login gagal')
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            PPDB SMK Digital
          </CardTitle>
          <CardDescription>
            Masuk ke sistem pendaftaran siswa baru
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-field">
              <Label htmlFor="role" className="form-label">
                Login Sebagai
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleInputChange('role', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                  <SelectItem value="STUDENT">Siswa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="form-field">
              <Label htmlFor="username" className="form-label">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Masukkan username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-field">
              <Label htmlFor="password" className="form-label">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="form-error">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !formData.role || !formData.username || !formData.password}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Memproses...
                </>
              ) : (
                'Masuk'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Demo Credentials:</p>
            <p className="text-xs mt-1">
              Admin: admin / admin123<br />
              Siswa: siswa001 / siswa123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}