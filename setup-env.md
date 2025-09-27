# Environment Setup Guide

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# WorldCoin MiniKit Configuration
APP_ID=your_app_id_here
DEV_PORTAL_API_KEY=your_dev_portal_api_key_here

# World Chain Configuration
WORLDCHAIN_RPC_URL=http://localhost:8545
WORLDCHAIN_SEPOLIA_RPC_URL=https://worldchain-sepolia.g.alchemy.com/public

# Wallet Configuration (for local development)
PRIVATE_KEY=your_private_key_here

# Contract Addresses (will be set after deployment)
PROPERTY_HOSTING_ADDRESS=0x0000000000000000000000000000000000000000
PROPERTY_BOOKING_ADDRESS=0x0000000000000000000000000000000000000000

# Public contract addresses (for frontend)
NEXT_PUBLIC_PROPERTY_HOSTING_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_PROPERTY_BOOKING_ADDRESS=0x0000000000000000000000000000000000000000

# Development settings
SKIP_SIWE_VERIFICATION=true
NODE_ENV=development
```

## Quick Setup for Local Development

1. **Start the local Hardhat node:**
   ```bash
   npx hardhat node
   ```

2. **Deploy contracts to local network:**
   ```bash
   npx hardhat run scripts/deploy.cjs --network localhost
   ```

3. **Copy the deployed contract addresses to your `.env.local` file**

4. **Generate a test wallet (optional):**
   ```bash
   node scripts/generate-key.cjs
   ```

## For Production/Testnet

Replace the local URLs with your actual WorldCoin credentials and testnet RPC URLs.
