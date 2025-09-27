# Mini App Integration Guide

## 🎯 Using Local Contracts in Your World Mini App

Your contracts are deployed locally and ready to use! Here's how to integrate them:

### 1. Environment Setup

Create a `.env.local` file with these values:

```bash
# Local Contract Addresses
PROPERTY_HOSTING_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
PROPERTY_BOOKING_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

# Public contract addresses for frontend
NEXT_PUBLIC_PROPERTY_HOSTING_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_PROPERTY_BOOKING_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

# Local Hardhat Network
WORLDCHAIN_RPC_URL=http://localhost:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Development settings
SKIP_SIWE_VERIFICATION=true
```

### 2. Start Local Development

**Terminal 1 - Start Hardhat Node:**
```bash
npx hardhat node
```

**Terminal 2 - Start Your Mini App:**
```bash
npm run dev
```

### 3. Available Contract Functions

**PropertyHosting Contract:**
- `listProperty()` - List a new property
- `getProperty()` - Get property details
- `getActiveProperties()` - Get all active properties
- `getHostProperties()` - Get properties by host

**PropertyBooking Contract:**
- `createBooking()` - Create a new booking
- `getBooking()` - Get booking details
- `isPropertyAvailable()` - Check availability

### 4. Integration with WorldCoin MiniKit

Your Mini App can now:
- ✅ **List properties** using the PropertyHosting contract
- ✅ **Book properties** with WorldCoin payments
- ✅ **Verify payments** before creating bookings
- ✅ **Manage bookings** on-chain

### 5. Testing Your Mini App

1. **Start the local environment**
2. **Open your Mini App** in World App
3. **Test property listing** - create a property
4. **Test booking flow** - book a property with payment
5. **Verify on-chain data** - check contract state

### 6. Benefits of Local Development

- 🚀 **No gas fees** - transactions are free
- ⚡ **Instant transactions** - no network delays
- 🔧 **Full debugging** - detailed logs and errors
- 🔄 **Easy reset** - restart anytime
- 🎯 **Perfect for testing** - safe environment

### 7. Next Steps

Once you're happy with the local testing:
1. **Deploy to World Chain testnet** (when you get testnet ETH)
2. **Deploy to World Chain mainnet** (for production)
3. **Update environment variables** with new addresses

## 🎉 You're Ready!

Your Mini App can now use the local contracts for full Web3 functionality!
