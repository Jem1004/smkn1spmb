'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
}

interface ErrorFallbackProps {
  error?: Error
  resetError: () => void
  goHome: () => void
}

// Default error fallback component
function DefaultErrorFallback({ error, resetError, goHome }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 text-destructive">
            <AlertTriangle className="h-full w-full" />
          </div>
          <CardTitle className="text-xl font-semibold text-destructive">
            Oops! Terjadi Kesalahan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">
              Maaf, terjadi kesalahan yang tidak terduga. Tim kami telah diberitahu tentang masalah ini.
            </p>
            {process.env.NODE_ENV === 'development' && error && (
              <details className="mt-4 p-3 bg-muted rounded-md text-left">
                <summary className="cursor-pointer font-medium">Detail Error (Development)</summary>
                <pre className="mt-2 text-xs overflow-auto">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            )}
          </div>
          
          <div className="flex flex-col gap-2">
            <Button onClick={resetError} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Coba Lagi
            </Button>
            <Button variant="outline" onClick={goHome} className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Kembali ke Beranda
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Error boundary class component
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
    
    // In production, you might want to log to an error reporting service
    // Example: logErrorToService(error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  goHome = () => {
    // This will be handled by the functional wrapper component
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          goHome={this.goHome}
        />
      )
    }

    return this.props.children
  }
}

// Functional wrapper to use Next.js router
function ErrorBoundaryWrapper({ children, fallback }: ErrorBoundaryProps) {
  const router = useRouter()
  
  const goHome = () => {
    router.push('/')
  }
  
  // Create a custom fallback that includes router navigation
  const CustomFallback = fallback || (({ error, resetError }: ErrorFallbackProps) => (
    <DefaultErrorFallback error={error} resetError={resetError} goHome={goHome} />
  ))
  
  return (
    <ErrorBoundary fallback={CustomFallback}>
      {children}
    </ErrorBoundary>
  )
}

export default ErrorBoundaryWrapper
export { ErrorBoundary, DefaultErrorFallback }
export type { ErrorFallbackProps }