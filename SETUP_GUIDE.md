# 🚀 WorldCoin Payment System Setup Guide

## Step 1: Get Your WorldCoin Credentials

### 1.1 Go to WorldCoin Developer Portal
- Visit: https://developer.worldcoin.org/
- Sign in with your WorldCoin account

### 1.2 Create a Mini App
- Click "Create New App"
- Fill in your app details:
  - **App Name**: WorldBNB Payment App
  - **Description**: Peer-to-peer payment system
  - **Category**: Finance/Payments

### 1.3 Get Your Credentials
After creating your app, you'll find:
- **App ID**: `app_xxxxxxxxxxxxxxxx` (in your app settings)
- **API Key**: Generate in the "API Keys" section

## Step 2: Set Up Environment Variables

### 2.1 Create `.env.local` file
Create a file called `.env.local` in your project root with:

```bash
# WorldCoin MiniKit Configuration
APP_ID=your_worldcoin_app_id_here
DEV_PORTAL_API_KEY=your_developer_portal_api_key_here

# Optional: World Chain Configuration
WORLD_CHAIN_RPC_URL=https://world-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
WORLD_CHAIN_CHAIN_ID=480
```

### 2.2 Replace the placeholder values
- Replace `your_worldcoin_app_id_here` with your actual App ID
- Replace `your_developer_portal_api_key_here` with your actual API Key

## Step 3: Configure Payment Settings

### 3.1 Whitelist Addresses (Optional)
- Go to your app settings in the Developer Portal
- Add addresses that can receive payments
- Or disable whitelisting for testing

### 3.2 Test Your Setup
1. Start your development server: `npm run dev`
2. Open the app in World App
3. Try sending a test payment

## Step 4: Production Deployment

### 4.1 Update Environment Variables
Make sure to set these in your production environment:
- Vercel: Add in Project Settings → Environment Variables
- Netlify: Add in Site Settings → Environment Variables
- Other platforms: Follow their environment variable setup

### 4.2 Update App Settings
- Update your app's domain in the Developer Portal
- Configure production URLs
- Test payments in production

## 🔧 Troubleshooting

### Common Issues:
1. **"MiniKit is not available"**: Make sure you're testing in World App
2. **"Invalid App ID"**: Check your APP_ID in .env.local
3. **"Payment verification failed"**: Check your API key and network connection

### Debug Steps:
1. Check browser console for errors
2. Verify environment variables are loaded
3. Test with a small amount first
4. Check WorldCoin Developer Portal for app status

## 📱 Testing Checklist

- [ ] App loads in World App
- [ ] Wallet authentication works
- [ ] Send money form appears
- [ ] Receive money shows wallet address
- [ ] Payment flow completes successfully
- [ ] Error handling works properly

## 🎉 You're Ready!

Once you've set up your credentials, your payment system will be fully functional with:
- ✅ WLD and USDC payments
- ✅ Zero gas fees (sponsored by World App)
- ✅ Secure backend verification
- ✅ Mobile-optimized interface
