'use client'

import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

interface UseRetryOptions {
  maxRetries?: number
  retryDelay?: number
  onError?: (error: Error, attempt: number) => void
  onSuccess?: () => void
}

interface UseRetryReturn<T> {
  execute: (...args: any[]) => Promise<T | null>
  isLoading: boolean
  error: Error | null
  retryCount: number
  reset: () => void
}

export function useRetry<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseRetryOptions = {}
): UseRetryReturn<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onError,
    onSuccess
  } = options

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const { toast } = useToast()

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    setIsLoading(true)
    setError(null)
    
    let lastError: Error
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await asyncFunction(...args)
        setIsLoading(false)
        setRetryCount(0)
        onSuccess?.()
        return result
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Unknown error')
        setRetryCount(attempt + 1)
        onError?.(lastError, attempt + 1)
        
        if (attempt < maxRetries) {
          // Show retry toast
          toast({
            title: `Percobaan ${attempt + 1} gagal`,
            description: `Mencoba lagi dalam ${retryDelay / 1000} detik...`,
            variant: 'destructive'
          })
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)))
        }
      }
    }
    
    setError(lastError!)
    setIsLoading(false)
    
    // Show final error toast
    toast({
      title: 'Gagal setelah beberapa percobaan',
      description: lastError!.message || 'Terjadi kesalahan yang tidak diketahui',
      variant: 'destructive'
    })
    
    return null
  }, [asyncFunction, maxRetries, retryDelay, onError, onSuccess, toast])

  const reset = useCallback(() => {
    setIsLoading(false)
    setError(null)
    setRetryCount(0)
  }, [])

  return {
    execute,
    isLoading,
    error,
    retryCount,
    reset
  }
}

// Hook for optimistic updates
interface UseOptimisticOptions<T> {
  onError?: (error: Error, rollbackData: T) => void
  onSuccess?: (data: T) => void
}

interface UseOptimisticReturn<T> {
  data: T
  execute: (optimisticData: T, asyncFunction: () => Promise<T>) => Promise<void>
  isLoading: boolean
  error: Error | null
}

export function useOptimistic<T>(
  initialData: T,
  options: UseOptimisticOptions<T> = {}
): UseOptimisticReturn<T> {
  const [data, setData] = useState<T>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()
  const { onError, onSuccess } = options

  const execute = useCallback(async (
    optimisticData: T,
    asyncFunction: () => Promise<T>
  ) => {
    const previousData = data
    
    // Apply optimistic update immediately
    setData(optimisticData)
    setIsLoading(true)
    setError(null)
    
    try {
      // Execute the actual async operation
      const result = await asyncFunction()
      
      // Update with real data
      setData(result)
      setIsLoading(false)
      onSuccess?.(result)
      
      toast({
        title: 'Berhasil',
        description: 'Operasi berhasil dilakukan',
      })
    } catch (err) {
      // Rollback to previous data on error
      setData(previousData)
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      setIsLoading(false)
      onError?.(error, previousData)
      
      toast({
        title: 'Gagal',
        description: error.message || 'Terjadi kesalahan',
        variant: 'destructive'
      })
    }
  }, [data, onError, onSuccess, toast])

  return {
    data,
    execute,
    isLoading,
    error
  }
}

// Hook for debounced search with retry
interface UseSearchOptions {
  debounceMs?: number
  minLength?: number
  maxRetries?: number
}

interface UseSearchReturn<T> {
  results: T[]
  isLoading: boolean
  error: Error | null
  search: (query: string) => void
  clear: () => void
}

export function useSearch<T>(
  searchFunction: (query: string) => Promise<T[]>,
  options: UseSearchOptions = {}
): UseSearchReturn<T> {
  const {
    debounceMs = 300,
    minLength = 2,
    maxRetries = 2
  } = options

  const [results, setResults] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  const { execute } = useRetry(searchFunction, { maxRetries })

  const search = useCallback((query: string) => {
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    // Clear results if query is too short
    if (query.length < minLength) {
      setResults([])
      setError(null)
      return
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(async () => {
      setIsLoading(true)
      setError(null)
      
      const result = await execute(query)
      
      if (result) {
        setResults(result)
      }
      
      setIsLoading(false)
    }, debounceMs)

    setSearchTimeout(timeout)
  }, [execute, debounceMs, minLength, searchTimeout])

  const clear = useCallback(() => {
    setResults([])
    setError(null)
    setIsLoading(false)
    
    if (searchTimeout) {
      clearTimeout(searchTimeout)
      setSearchTimeout(null)
    }
  }, [searchTimeout])

  return {
    results,
    isLoading,
    error,
    search,
    clear
  }
}