import { NextRequest, NextResponse } from 'next/server'
import { 
  getCurrentQuotas, 
  updateMultipleQuotas, 
  validateQuotaConfiguration,
  getQuotaStatistics,
  QuotaData
} from '@/lib/quota-manager'

// GET /api/quota - Get current quota configuration
export async function GET(request: NextRequest) {
  try {
    // Get user info from request headers (set by client)
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')
    
    if (!userId || !userRole) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing user information' },
        { status: 401 }
      )
    }

    // Only admin can access quota data
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat mengakses data kuota.' },
        { status: 403 }
      )
    }

    const quotas = await getCurrentQuotas()
    const statistics = getQuotaStatistics(quotas)

    return NextResponse.json({
      success: true,
      data: {
        quotas,
        statistics
      }
    })
  } catch (error) {
    console.error('Error fetching quota data:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data kuota' },
      { status: 500 }
    )
  }
}

// PUT /api/quota - Update quota configuration
export async function PUT(request: NextRequest) {
  try {
    // Get user info from request headers (set by client)
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')
    
    if (!userId || !userRole) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing user information' },
        { status: 401 }
      )
    }

    // Only admin can update quota
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat mengubah kuota.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { quotas }: { quotas: QuotaData } = body

    if (!quotas || typeof quotas !== 'object') {
      return NextResponse.json(
        { error: 'Data kuota tidak valid' },
        { status: 400 }
      )
    }

    // Validate quota configuration
    const validation = validateQuotaConfiguration(quotas)
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Konfigurasi kuota tidak valid',
          details: validation.errors
        },
        { status: 400 }
      )
    }

    // Update quotas
    const updatedQuotas = await updateMultipleQuotas(quotas)
    const statistics = getQuotaStatistics(updatedQuotas)
    
    return NextResponse.json({
      success: true,
      message: 'Kuota berhasil diperbarui',
      data: {
        quotas: updatedQuotas,
        statistics
      },
      warnings: validation.warnings
    })
  } catch (error) {
    console.error('Error updating quota:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui kuota' },
      { status: 500 }
    )
  }
}

// POST /api/quota/reset - Reset quotas to default
export async function POST(request: NextRequest) {
  try {
    // Get user info from request headers (set by client)
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')
    
    if (!userId || !userRole) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing user information' },
        { status: 401 }
      )
    }

    // Only admin can reset quota
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat mereset kuota.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action } = body

    if (action === 'reset') {
      const defaultQuotas = {
        'TKJ': 72,
        'RPL': 72,
        'MM': 36,
        'TKR': 72,
        'TSM': 36,
        'AKL': 36,
        'OTKP': 36,
        'BDP': 36
      }

      // Update quotas in database
      const updatedQuotas = await updateMultipleQuotas(defaultQuotas)
      const statistics = getQuotaStatistics(updatedQuotas)

      return NextResponse.json({
        success: true,
        message: 'Kuota berhasil direset ke nilai default',
        data: {
          quotas: updatedQuotas,
          statistics
        }
      })
    }

    return NextResponse.json(
      { error: 'Aksi tidak valid' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error resetting quota:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mereset kuota' },
      { status: 500 }
    )
  }
}