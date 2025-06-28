'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// Loading button with different states
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  success?: boolean
  error?: boolean
  loadingText?: string
  successText?: string
  errorText?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function LoadingButton({
  children,
  loading = false,
  success = false,
  error = false,
  loadingText = 'Memproses...',
  successText = 'Berhasil!',
  errorText = 'Gagal!',
  disabled,
  className,
  variant = 'default',
  size = 'default',
  ...props
}: LoadingButtonProps) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    if (success) {
      setShowSuccess(true)
      const timer = setTimeout(() => setShowSuccess(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      setShowError(true)
      const timer = setTimeout(() => setShowError(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const getButtonContent = () => {
    if (loading) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      )
    }
    
    if (showSuccess) {
      return (
        <>
          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
          {successText}
        </>
      )
    }
    
    if (showError) {
      return (
        <>
          <XCircle className="mr-2 h-4 w-4 text-red-500" />
          {errorText}
        </>
      )
    }
    
    return children
  }

  return (
    <Button
      disabled={disabled || loading}
      className={cn(
        showSuccess && 'bg-green-500 hover:bg-green-600',
        showError && 'bg-red-500 hover:bg-red-600',
        className
      )}
      variant={variant}
      size={size}
      {...props}
    >
      {getButtonContent()}
    </Button>
  )
}

// Progress indicator for multi-step processes
interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  steps?: string[]
  className?: string
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  steps,
  className
}: ProgressIndicatorProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className={cn('space-y-4', className)}>
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Langkah {currentStep} dari {totalSteps}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      {/* Step indicators */}
      {steps && (
        <div className="flex justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1
            const isCompleted = stepNumber < currentStep
            const isCurrent = stepNumber === currentStep
            
            return (
              <div
                key={index}
                className="flex flex-col items-center space-y-2"
              >
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium',
                    isCompleted && 'border-primary bg-primary text-primary-foreground',
                    isCurrent && 'border-primary bg-background text-primary',
                    !isCompleted && !isCurrent && 'border-muted bg-background text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    stepNumber
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs text-center max-w-20',
                    isCurrent && 'text-primary font-medium',
                    !isCurrent && 'text-muted-foreground'
                  )}
                >
                  {step}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Loading overlay for full page loading
interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  children: React.ReactNode
}

export function LoadingOverlay({
  isLoading,
  message = 'Memuat...',
  children
}: LoadingOverlayProps) {
  if (!isLoading) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  )
}

// Inline loading spinner
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <Loader2 className={cn('animate-spin text-primary', sizeClasses[size], className)} />
  )
}

// Retry component for failed requests
interface RetryComponentProps {
  onRetry: () => void
  error?: string
  retryText?: string
  className?: string
}

export function RetryComponent({
  onRetry,
  error = 'Terjadi kesalahan saat memuat data',
  retryText = 'Coba Lagi',
  className
}: RetryComponentProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center space-y-4 p-8', className)}>
      <XCircle className="h-12 w-12 text-destructive" />
      <div className="text-center space-y-2">
        <h3 className="font-medium text-destructive">Gagal Memuat Data</h3>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
      <Button onClick={onRetry} variant="outline">
        <Loader2 className="mr-2 h-4 w-4" />
        {retryText}
      </Button>
    </div>
  )
}

// Empty state component
interface EmptyStateProps {
  title?: string
  description?: string
  action?: React.ReactNode
  icon?: React.ReactNode
  className?: string
}

export function EmptyState({
  title = 'Tidak ada data',
  description = 'Belum ada data untuk ditampilkan',
  action,
  icon,
  className
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center space-y-4 p-8 text-center', className)}>
      {icon && <div className="text-muted-foreground">{icon}</div>}
      <div className="space-y-2">
        <h3 className="font-medium text-muted-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action && action}
    </div>
  )
}