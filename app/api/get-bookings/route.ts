import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'

const PROPERTY_BOOKING_ADDRESS = process.env.PROPERTY_BOOKING_ADDRESS
const WORLDCHAIN_RPC_URL = process.env.WORLDCHAIN_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY

// PropertyBooking contract ABI (simplified)
const PROPERTY_BOOKING_ABI = [
  "function getBooking(uint256 bookingId) external view returns (tuple(uint256 id, uint256 propertyId, address guest, address host, uint256 checkInDate, uint256 checkOutDate, uint256 totalAmount, bool isConfirmed, bool isCancelled, uint256 createdAt, string paymentReference) booking)",
  "function getBookingsCount() external view returns (uint256)",
  "function getGuestBookings(address guest) external view returns (uint256[] memory)",
  "function getHostBookings(address host) external view returns (uint256[] memory)"
]

export async function GET(req: NextRequest) {
  try {
    console.log('📋 Fetching bookings request received')
    
    if (!PROPERTY_BOOKING_ADDRESS || !WORLDCHAIN_RPC_URL || !PRIVATE_KEY) {
      console.log('❌ Missing environment variables')
      return NextResponse.json({ 
        success: false, 
        error: 'Server not configured for booking retrieval' 
      })
    }

    console.log('🔗 Connecting to blockchain...')
    console.log('📍 Contract address:', PROPERTY_BOOKING_ADDRESS)
    
    const provider = new ethers.JsonRpcProvider(WORLDCHAIN_RPC_URL)
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
    const contract = new ethers.Contract(PROPERTY_BOOKING_ADDRESS, PROPERTY_BOOKING_ABI, wallet)

    console.log('📤 Fetching bookings from contract...')
    
    try {
      // Get total number of bookings
      const totalBookings = await contract.getBookingsCount()
      console.log('📊 Total bookings in contract:', totalBookings.toString())
      
      const bookings = []
      const total = parseInt(totalBookings.toString())
      
      if (total === 0) {
        console.log('📋 No bookings found in contract')
        return NextResponse.json({
          success: true,
          bookings: []
        })
      }
      
      // Fetch individual bookings
      for (let i = 1; i <= total; i++) {
        try {
          const booking = await contract.getBooking(i)
          console.log(`📋 Fetched booking ${i}:`, {
            id: booking.id.toString(),
            propertyId: booking.propertyId.toString(),
            guest: booking.guest,
            isConfirmed: booking.isConfirmed,
            isCancelled: booking.isCancelled
          })
          
          bookings.push({
            id: booking.id.toString(),
            propertyId: booking.propertyId.toString(),
            checkInDate: booking.checkInDate.toString(),
            checkOutDate: booking.checkOutDate.toString(),
            paymentReference: booking.paymentReference,
            totalAmount: ethers.formatEther(booking.totalAmount),
            guest: booking.guest,
            host: booking.host,
            isConfirmed: booking.isConfirmed,
            isCancelled: booking.isCancelled,
            createdAt: booking.createdAt.toString(),
            status: booking.isCancelled ? 'cancelled' : (booking.isConfirmed ? 'confirmed' : 'pending')
          })
        } catch (bookingError: any) {
          console.log(`⚠️ Could not fetch booking ${i}:`, bookingError.message)
        }
      }

      console.log('✅ Bookings fetched successfully!')
      console.log('🏠 Total bookings:', bookings.length)
      console.log('📋 Processed bookings:', bookings)

      return NextResponse.json({
        success: true,
        bookings: bookings
      })

    } catch (error: any) {
      console.log('❌ Contract call failed:', error.message)
      return NextResponse.json({
        success: true,
        bookings: []
      })
    }

  } catch (error: any) {
    console.error('❌ Error fetching bookings:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to fetch bookings' 
    })
  }
}
