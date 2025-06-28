'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, getSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoginCredentials } from '@/types'
import { Eye, EyeOff, GraduationCap, Shield, User } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
    role: 'STUDENT'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        username: credentials.username,
        password: credentials.password,
        role: credentials.role,
        redirect: false
      })

      if (result?.error) {
        setError(result.error)
      } else if (result?.ok) {
        // Get session to determine redirect
        const session = await getSession()
        if (session?.user?.role === 'ADMIN') {
          router.push('/admin/students')
        } else {
          router.push('/student')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Terjadi kesalahan saat login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  return (
    <div className="min-h-screen bg-background">

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="bg-card border-border shadow-lg">
            <CardHeader className="text-center space-y-6 pb-8">
              {/* Logo */}
              <div className="flex justify-center">
                <div className="p-4 bg-primary rounded-full">
                  <GraduationCap className="h-10 w-10 text-primary-foreground" />
                </div>
              </div>
              
              {/* Title */}
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold text-foreground">
                  SPMB SMK 1 PPU
                </CardTitle>
                <CardDescription className="text-muted-foreground text-base">
                  Sistem Pendataan Siswa Baru SMK 1 PPU
                </CardDescription>
              </div>
            </CardHeader>
        
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Selection with Icons */}
                <div className="space-y-3">
                  <Label htmlFor="role" className="text-foreground font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Login Sebagai
                  </Label>
                  <Select
                    value={credentials.role}
                    onValueChange={(value) => handleInputChange('role', value)}
                  >
                    <SelectTrigger className="bg-input border-border text-foreground hover:bg-accent transition-colors">
                      <SelectValue placeholder="Pilih role" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="ADMIN" className="text-popover-foreground hover:bg-accent focus:bg-accent">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Administrator
                        </div>
                      </SelectItem>
                      <SelectItem value="STUDENT" className="text-popover-foreground hover:bg-accent focus:bg-accent">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Siswa
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Username Field */}
                <div className="space-y-3">
                  <Label htmlFor="username" className="text-foreground font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {credentials.role === 'STUDENT' ? 'NISN' : 'Username'}
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder={credentials.role === 'STUDENT' ? 'Masukkan NISN Anda' : 'Masukkan username'}
                    value={credentials.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    autoComplete="username"
                    required
                    disabled={isLoading}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground hover:bg-accent focus:bg-accent transition-colors h-12"
                  />
                  {credentials.role === 'STUDENT' && (
                    <p className="text-sm text-muted-foreground">
                      Gunakan NISN Anda sebagai username
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-foreground font-medium flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={credentials.role === 'STUDENT' ? 'Masukkan tanggal lahir (DDMMYYYY)' : 'Masukkan password'}
                      value={credentials.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      autoComplete="current-password"
                      required
                      disabled={isLoading}
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground hover:bg-accent focus:bg-accent transition-colors h-12 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
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
                  {credentials.role === 'STUDENT' && (
                    <p className="text-sm text-muted-foreground">
                      Gunakan tanggal lahir Anda dalam format DDMMYYYY (contoh: 15081995)
                    </p>
                  )}
                </div>

                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || !credentials.role || !credentials.username || !credentials.password}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-3"></div>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <GraduationCap className="h-5 w-5 mr-2" />
                      Masuk ke Sistem
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}