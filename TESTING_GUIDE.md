# 🧪 Testing Your Web3 Airbnb Mini App

## 🚀 Quick Start

### 1. **Start the Local Environment**

**Terminal 1 - Hardhat Node:**
```bash
npx hardhat node
```

**Terminal 2 - Setup Environment:**
```bash
node scripts/setup-local-env.cjs
```

**Terminal 3 - Start Your App:**
```bash
npm run dev
```

### 2. **Open in World App**
- Open World App on your phone
- Navigate to your Mini App
- Authenticate with your wallet

## 🏠 Testing Property Hosting

### **Step 1: List a Property**
1. Click the **"Host"** tab
2. Click **"List Your Property"**
3. Fill out the form:
   - **Name**: "Beautiful Beach House"
   - **Description**: "Amazing ocean view with private beach access"
   - **Location**: "Miami, FL"
   - **Price per Night**: "0.5" (WLD)
   - **Image Hash**: "QmDefaultImageHash" (optional)
4. Click **"List Property"**
5. Wait for transaction confirmation

### **Step 2: Verify Property Listing**
1. Go back to **"Explore"** tab
2. You should see your property in the "Available Properties" section
3. Check the **"Host"** tab to see your listed properties

## 🏨 Testing Property Booking

### **Step 1: Book a Property**
1. In the **"Explore"** tab, click on any property
2. Fill out the booking form:
   - **Check-in Date**: Select a future date
   - **Check-out Date**: Select a date after check-in
3. Review the total cost (calculated automatically)
4. Click **"Book & Pay"**

### **Step 2: Complete Payment**
1. WorldCoin MiniKit will open for payment
2. Review the payment details
3. Confirm the payment
4. Wait for booking confirmation

## 💰 Testing Payment System

### **Step 1: Send Money**
1. Click the **"Send"** tab
2. Enter recipient address
3. Enter amount in WLD
4. Add description
5. Send payment

### **Step 2: Receive Money**
1. Click the **"Receive"** tab
2. Share your wallet address
3. Receive payments from others

## 🔧 Debugging

### **Check Contract Status**
- Open browser console (F12)
- Look for debug info at the bottom of the page
- Check for any error messages

### **Verify Smart Contract Integration**
- Properties should appear in real-time
- Transactions should be confirmed on-chain
- Payment should trigger booking creation

### **Common Issues**
1. **"No properties available"** - List a property first
2. **"Payment failed"** - Check WorldCoin MiniKit setup
3. **"Transaction failed"** - Ensure Hardhat node is running

## 📱 Mobile Testing

### **In World App:**
1. **Authentication**: Should work seamlessly
2. **Property Listing**: Form should be mobile-friendly
3. **Booking Flow**: Payment should integrate with WorldCoin
4. **Navigation**: Tabs should work smoothly

## 🎯 Expected Behavior

### **Property Hosting:**
- ✅ Properties appear immediately after listing
- ✅ Host can see their properties in "Host" tab
- ✅ Properties show correct details and pricing

### **Property Booking:**
- ✅ Booking form calculates total correctly
- ✅ Payment integrates with WorldCoin MiniKit
- ✅ Booking is created on-chain after payment
- ✅ Double-booking is prevented

### **Payment System:**
- ✅ WLD payments work seamlessly
- ✅ USDC payments work (if configured)
- ✅ Payment confirmation is reliable

## 🚀 Production Deployment

When ready for production:

1. **Deploy to World Chain Testnet:**
   ```bash
   npx hardhat run scripts/deploy.cjs --network worldchainSepolia
   ```

2. **Deploy to World Chain Mainnet:**
   ```bash
   npx hardhat run scripts/deploy.cjs --network worldchain
   ```

3. **Update Environment Variables:**
   - Replace local contract addresses with deployed addresses
   - Set up production WorldCoin credentials

## 🎉 Success!

Your Web3 Airbnb Mini App is now fully functional with:
- ✅ Smart contract integration
- ✅ WorldCoin payment system
- ✅ Property hosting and booking
- ✅ Mobile-first design
- ✅ Real-time blockchain data

Happy testing! 🚀
