import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const uuid = crypto.randomUUID().replace(/-/g, '')
    
    // Store the reference in a cookie for verification (matching your confirm-payment route)
    cookies().set('payment-nonce', uuid, { 
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 300 // 5 minutes
    })
    
    console.log('Payment initiated with reference:', uuid)
    
    return NextResponse.json({ id: uuid })
  } catch (error) {
    console.error('Error initiating payment:', error)
    return NextResponse.json(
      { error: 'Failed to initiate payment' },
      { status: 500 }
    )
  }
}
