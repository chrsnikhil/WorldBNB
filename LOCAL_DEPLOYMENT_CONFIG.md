# Local Deployment Configuration

## Contract Addresses (Local Hardhat Network)

Your contracts have been successfully deployed to the local Hardhat network:

- **PropertyHosting**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **PropertyBooking**: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`

## Environment Variables for Local Development

Add these to your `.env.local` file:

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

## How to Use Local Contracts

1. **Start Hardhat Node** (in a separate terminal):
   ```bash
   npx hardhat node
   ```

2. **Deploy Contracts** (if not already deployed):
   ```bash
   npx hardhat run scripts/deploy.cjs --network localhost
   ```

3. **Start Your Next.js App**:
   ```bash
   npm run dev
   ```

## Benefits of Local Development

- ✅ **No gas fees** - transactions are free
- ✅ **Instant transactions** - no network delays
- ✅ **Full control** - you own the network
- ✅ **Easy testing** - reset state anytime
- ✅ **Debug friendly** - detailed logs and error messages

## Next Steps

1. Update your `.env.local` file with the contract addresses
2. Start the Hardhat node
3. Test your Mini App with the local contracts
4. When ready, deploy to World Chain testnet/mainnet
