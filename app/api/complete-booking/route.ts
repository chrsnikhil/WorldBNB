import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'

// Contract configuration
const PROPERTY_BOOKING_ADDRESS = process.env.PROPERTY_BOOKING_ADDRESS || ''
const PRIVATE_KEY = process.env.PRIVATE_KEY || ''
const RPC_URL = process.env.WORLDCHAIN_RPC_URL || 'https://worldchain-mainnet.g.alchemy.com/public'

// ABI for PropertyBooking contract
const PROPERTY_BOOKING_ABI = [
  "function createBooking(uint256 _propertyId, uint256 _checkInDate, uint256 _checkOutDate, string memory _paymentReference) external returns (uint256)"
]

interface BookingRequest {
  propertyId: number
  checkInDate: number
  checkOutDate: number
  paymentReference: string
  totalAmount: string
}

export async function POST(req: NextRequest) {
  try {
    const { propertyId, checkInDate, checkOutDate, paymentReference, totalAmount }: BookingRequest = await req.json()
    
    console.log('Booking request:', { propertyId, checkInDate, checkOutDate, paymentReference, totalAmount })
    
    // Validate input
    if (!propertyId || !checkInDate || !checkOutDate || !paymentReference) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required booking parameters' 
      })
    }

    // Initialize provider and signer
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL)
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
    const contract = new ethers.Contract(PROPERTY_BOOKING_ADDRESS, PROPERTY_BOOKING_ABI, wallet)

    // Create booking on-chain
    console.log('Creating booking on-chain...')
    const tx = await contract.createBooking(
      propertyId,
      checkInDate,
      checkOutDate,
      paymentReference
    )
    
    console.log('Transaction hash:', tx.hash)
    
    // Wait for transaction confirmation
    const receipt = await tx.wait()
    console.log('Transaction confirmed:', receipt.transactionHash)
    
    // Extract booking ID from events
    const bookingCreatedEvent = receipt.events?.find(
      (event: any) => event.event === 'BookingCreated'
    )
    
    const bookingId = bookingCreatedEvent?.args?.id?.toNumber()
    
    if (!bookingId) {
      throw new Error('Failed to extract booking ID from transaction')
    }

    return NextResponse.json({
      success: true,
      bookingId,
      transactionHash: receipt.transactionHash,
      message: 'Booking created successfully on-chain'
    })

  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create booking on-chain',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
