# World Chain Deployment Setup

## Environment Variables Required

To deploy to World Chain, you need to set up the following environment variables:

### 1. Create a `.env` file in your project root:

```bash
# World Chain Configuration
WORLDCHAIN_RPC_URL=https://worldchain-mainnet.g.alchemy.com/public
PRIVATE_KEY=your_private_key_here

# Optional: If you have a custom RPC URL
# WORLDCHAIN_RPC_URL=https://your-custom-rpc-url.com
```

### 2. Get a Private Key

You need a private key from a wallet that has some ETH on World Chain for gas fees.

**Option A: Use MetaMask**
1. Open MetaMask
2. Go to Account Details → Export Private Key
3. Copy the private key (starts with 0x)

**Option B: Create a new wallet**
```bash
# Generate a new private key (for testing only)
npx hardhat run --network hardhat scripts/generate-key.js
```

### 3. Get World Chain ETH

You need some ETH on World Chain for gas fees:
- Bridge ETH from Ethereum to World Chain
- Or get testnet ETH from faucets

### 4. Deploy to World Chain

Once you have the environment variables set up:

```bash
# Deploy to World Chain
npx hardhat run scripts/deploy.cjs --network worldchain
```

## Troubleshooting

### Error: "factory runner does not support sending transactions"

This means:
1. No private key is configured
2. The RPC URL is not accessible
3. The account has no ETH for gas

**Solutions:**
1. Check your `.env` file has `PRIVATE_KEY=0x...`
2. Verify `WORLDCHAIN_RPC_URL` is correct
3. Ensure your account has ETH on World Chain

### Error: "insufficient funds"

Your account needs ETH on World Chain for gas fees.

### Error: "network not found"

Make sure you're using the correct network name: `worldchain`

## Local Testing

You can test locally without World Chain:

```bash
# Deploy to local Hardhat network
npx hardhat run scripts/deploy.cjs
```

This will deploy to a local network and give you contract addresses for testing.
