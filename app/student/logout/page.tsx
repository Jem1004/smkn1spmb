'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  LogOut, 
  User, 
  Shield,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

export default function StudentLogoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      await signOut({
        redirect: false
      })
      
      // Redirect to login page after successful logout
      router.push('/login')
    } catch (err) {
      console.error('Logout error:', err)
      setError('Terjadi kesalahan saat logout')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="bg-card border-border shadow-lg">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-destructive/10 rounded-full">
                  <LogOut className="h-10 w-10 text-destructive" />
                </div>
              </div>
              
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold text-foreground">
                  Konfirmasi Logout
                </CardTitle>
                <p className="text-muted-foreground">
                  Apakah Anda yakin ingin keluar dari sistem?
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* User Info */}
              {session?.user && (
                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {session.user.username}
                      </p>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Shield className="h-3 w-3" />
                        <span>Siswa</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Warning Alert */}
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Setelah logout, Anda perlu login kembali untuk mengakses sistem.
                </AlertDescription>
              </Alert>
              
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1 h-12 border-border hover:bg-accent transition-colors"
                  disabled={isLoading}
                >
                  Batal
                </Button>
                
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  className="flex-1 h-12 bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-destructive-foreground mr-2"></div>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4 mr-2" />
                      Ya, Logout
                    </>
                  )}
                </Button>
              </div>
              
              {/* Additional Info */}
              <div className="text-center pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Sistem akan menyimpan data Anda dengan aman
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}