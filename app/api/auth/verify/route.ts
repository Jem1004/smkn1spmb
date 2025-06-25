import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { ApiResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    
    if (!authResult.success) {
      return NextResponse.json({
        success: false,
        message: authResult.error
      } as ApiResponse, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      data: {
        user: authResult.user,
        valid: true
      },
      message: 'Token valid'
    } as ApiResponse)

  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan server'
    } as ApiResponse, { status: 500 })
  }
}