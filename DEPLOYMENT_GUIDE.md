# WorldBNB Deployment Guide

## Prerequisites

1. **Install Dependencies** (already done):
   ```bash
   npm install
   ```

2. **Set up Environment Variables**:
   Create a `.env` file in your project root with:
   ```bash
   # World Chain Configuration
   WORLDCHAIN_RPC_URL=https://worldchain-mainnet.g.alchemy.com/public
   WORLDCHAIN_TESTNET_RPC_URL=https://worldchain-sepolia.g.alchemy.com/public
   
   # Private Key for Deployment (NEVER commit this to git)
   PRIVATE_KEY=your_private_key_here
   
   # Contract Addresses (update after deployment)
   PROPERTY_HOSTING_ADDRESS=
   PROPERTY_BOOKING_ADDRESS=
   
   # Frontend Environment Variables
   NEXT_PUBLIC_PROPERTY_HOSTING_ADDRESS=
   NEXT_PUBLIC_PROPERTY_BOOKING_ADDRESS=
   
   # WorldCoin Configuration
   APP_ID=your_app_id_here
   DEV_PORTAL_API_KEY=your_dev_portal_api_key_here
   SKIP_SIWE_VERIFICATION=true
   ```

## Deployment Steps

### 1. Compile Contracts
```bash
npx hardhat compile
```

### 2. Deploy to World Chain
```bash
npx hardhat run scripts/deploy.js --network worldchain
```

### 3. Update Environment Variables
After deployment, copy the contract addresses to your `.env` file:
- `PROPERTY_HOSTING_ADDRESS=0x...`
- `PROPERTY_BOOKING_ADDRESS=0x...`
- `NEXT_PUBLIC_PROPERTY_HOSTING_ADDRESS=0x...`
- `NEXT_PUBLIC_PROPERTY_BOOKING_ADDRESS=0x...`

### 4. Test Deployment
```bash
npx hardhat run scripts/deploy.js --network worldchain
```

## Expected Output

```
Deploying contracts...
PropertyHosting deployed to: 0x1234...
PropertyBooking deployed to: 0x5678...

=== Deployment Complete ===
PropertyHosting: 0x1234...
PropertyBooking: 0x5678...

Save these addresses for your frontend integration!
```

## Next Steps

1. **Update Frontend**: Add contract addresses to your environment variables
2. **Test Integration**: Use the React hooks to interact with contracts
3. **Deploy Frontend**: Deploy your Next.js app with the new contract addresses

## Troubleshooting

### Common Issues:

1. **"Private key not found"**: Make sure your `.env` file has `PRIVATE_KEY=your_private_key`
2. **"Network not found"**: Check your `hardhat.config.js` network configuration
3. **"Insufficient funds"**: Make sure your wallet has enough WLD for gas fees
4. **"Contract deployment failed"**: Check your RPC URL and network connection

### Gas Optimization:

- Contracts are optimized for gas efficiency
- String storage is minimized
- Events are used for off-chain data storage

## Security Notes

- **Never commit your private key to git**
- **Use a test wallet for development**
- **Verify contract addresses on World Chain explorer**
- **Test on testnet before mainnet deployment**

## Support

If you encounter issues:
1. Check the Hardhat documentation
2. Verify your network configuration
3. Ensure you have sufficient gas fees
4. Check World Chain network status
