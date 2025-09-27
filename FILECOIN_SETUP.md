# Filecoin Integration Testing Guide

## 🚀 Quick Setup

### 1. Environment Configuration

Create a `.env.local` file in your project root with:

```bash
# World Chain Configuration (your existing contracts)
NEXT_PUBLIC_PROPERTY_HOSTING_ADDRESS=0x...
NEXT_PUBLIC_PROPERTY_BOOKING_ADDRESS=0x...
NEXT_PUBLIC_SIMPLE_STAKING_ADDRESS=0x...

# Filecoin Configuration for Image Storage
# IMPORTANT: Use a test wallet for development
NEXT_PUBLIC_PRIVATE_KEY=0x... # Replace with your test wallet private key

# Filecoin Network Configuration
NEXT_PUBLIC_FILECOIN_RPC_URL=https://api.calibration.node.glif.io/rpc/v1
```

### 2. Get Test FIL Tokens

1. **Create a test wallet** (use MetaMask or any wallet)
2. **Add Filecoin Calibration Testnet** to MetaMask:
   - Network Name: Filecoin Calibration
   - RPC URL: https://api.calibration.node.glif.io/rpc/v1
   - Chain ID: 314159
   - Currency Symbol: tFIL
   - Block Explorer: https://calibration.filfox.info

3. **Get test tokens** (CRITICAL - both are required):
   - **FIL tokens**: Visit https://faucet.calibration.fildev.network/
     - Enter your wallet address
     - Request test FIL tokens (needed for gas fees)
   - **USDFC tokens**: Same faucet
     - Request USDFC tokens (needed for storage payments)
     - You need BOTH FIL and USDFC tokens to upload files!

4. **Verify your balances**:
   - Use the "Test Filecoin Connection" button in your app
   - Check that FIL balance shows ✅
   - Check that USDFC balance shows ✅
   - Check that "Storage Allowances" shows ✅ Sufficient
   - If you see ❌, you need to get more tokens from the faucet

5. **Set up storage allowances** (if needed):
   - The app will automatically try to set up the required allowances
   - You may need to approve the Warm Storage service
   - This is a one-time setup per wallet

### 3. Testing Steps

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to your app** and sign in with World App

3. **Test the Filecoin upload**:
   - Click "List Your Property"
   - Click "Upload to Filecoin" in the image section
   - Select an image file
   - Click "Upload to Filecoin"
   - Wait for upload to complete
   - You should see "Image stored on Filecoin" confirmation

4. **Check the upload**:
   - The image will be stored on Filecoin network
   - You'll get a PieceCID (Filecoin's content identifier)
   - This PieceCID will be saved with your property listing

### 4. Troubleshooting

**If upload fails with "cannot read properties of null":**
- Check browser console for detailed error messages
- Verify your private key is set correctly in .env.local
- Ensure you have FIL tokens for gas fees
- Make sure you have USDFC tokens for storage payments
- Try the "Test Filecoin Connection" button first

**If you get "Failed to initialize Filecoin storage":**
- Make sure your private key is valid (starts with 0x)
- Ensure you have FIL tokens in your wallet
- Check that the RPC URL is accessible
- Verify the private key is not the placeholder "0x..."

**Common Issues:**
- **"Please set NEXT_PUBLIC_PRIVATE_KEY"**: Add your private key to .env.local
- **"Synapse SDK failed to initialize"**: Check your private key format
- **"Failed to create data set: 500 Failed to send transaction, failed to estimate gas"**: 
  - You need BOTH FIL and USDFC tokens
  - Get FIL tokens for gas fees: https://faucet.calibration.fildev.network/
  - Get USDFC tokens for storage payments: Same faucet
  - Check your balances with the "Test Filecoin Connection" button
- **"No USDFC tokens available"**: Get USDFC tokens from the faucet
- **"No FIL tokens available"**: Get FIL tokens from the faucet
- **"Upload failed"**: Check browser console for specific error details
- **Network connection issues**: Try different RPC URL or check internet connection

### 5. Production Considerations

For production, you should:
- Use proper wallet integration (MetaMask, WalletConnect, etc.)
- Never expose private keys in frontend code
- Use environment variables securely
- Consider using a backend service for Filecoin operations

## 🎯 Expected Behavior

1. **Upload Process**:
   - Select image → Upload to Filecoin → Get PieceCID → Store in property

2. **Storage Benefits**:
   - Images stored permanently on decentralized network
   - Economic incentives ensure data persistence
   - Censorship-resistant storage
   - Global accessibility

3. **Integration**:
   - Seamless integration with property listing form
   - Visual feedback during upload
   - Error handling for failed uploads

## 🔍 Debugging

Check browser console for:
- Filecoin SDK initialization errors
- Upload progress and completion
- Network connection issues
- Token balance requirements

The integration uses the Synapse SDK which handles all the complexity of Filecoin storage, so you just need to provide the wallet credentials and tokens!
