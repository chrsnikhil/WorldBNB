<div align="center">
  <img src="https://github.com/chrsnikhil/WorldBNB/blob/main/public/logo.png" alt="WorldBNB Logo" width="200" height="200">
  <h1>WorldBNB</h1>
  <p><strong>The world's first decentralized property rental platform built on World Chain</strong></p>
</div>

[![World Chain](https://img.shields.io/badge/Built%20on-World%20Chain-orange)](https://worldchain.org)
[![World ID](https://img.shields.io/badge/Verified-World%20ID-blue)](https://worldcoin.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org)

## Overview

WorldBNB is a revolutionary property rental platform that combines the power of World Chain's native wallet, World ID verification, and decentralized storage to create a secure, transparent, and trustless rental experience. Built entirely on World Chain infrastructure, WorldBNB eliminates intermediaries and creates a truly decentralized marketplace for property rentals.

## Key Features

### World Chain Integration
- **Native Wallet**: Seamless integration with World's native wallet system
- **Sponsored Gas Fees**: All transactions are gas-free for users
- **World ID Verification**: Sybil-resistant authentication using World ID
- **MiniKit Integration**: Native World App functionality

### Decentralized Property Listings
- **On-Chain Storage**: All property data stored permanently on blockchain
- **Decentralized Images**: Property images stored using decentralized storage
- **Transparent Listings**: Fully verifiable and censorship-resistant
- **Smart Contracts**: Automated property management

### Automated Escrow System
- **Smart Contract Escrow**: Payments held securely until check-in
- **Automated Release**: Hosts receive payment after successful check-in
- **Platform Fees**: Automatic fee distribution
- **Dispute Resolution**: Built-in conflict resolution mechanisms

### Stake-Based Dispute Resolution
- **User Staking**: Users stake WLD tokens to participate
- **Dispute Mechanisms**: On-chain dispute resolution system
- **Stake Slashing**: Bad actors lose their stake
- **Compensation**: Affected parties receive reimbursements

### Transparent Reviews
- **World ID Verified Reviews**: Sybil-resistant review system
- **On-Chain Storage**: All reviews stored permanently
- **Trust Scores**: Reputation system based on verified interactions

## Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **World MiniKit** - World App integration

### Blockchain
- **World Chain** - Native blockchain infrastructure
- **Solidity** - Smart contract development
- **Hardhat** - Development and deployment
- **Ethers.js** - Blockchain interaction

### Smart Contracts
- **PropertyHosting.sol** - Property listing management
- **PropertyBooking.sol** - Booking and payment handling
- **DisputeResolution.sol** - Dispute resolution system
- **SimpleStaking.sol** - User staking mechanism

## Prerequisites

- **Node.js** 18.0 or later
- **npm** or **yarn** package manager
- **World App** for testing
- **World ID Developer Account**

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/chrsnikhil/WorldBNB.git
   cd WorldBNB
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in the required environment variables:
   ```env
   # World ID Configuration
   NEXT_PUBLIC_WLD_APP_ID=your_app_id
   APP_ID=your_app_id
   
   # Blockchain Configuration
   NEXT_PUBLIC_PROPERTY_HOSTING_ADDRESS=contract_address
   NEXT_PUBLIC_PROPERTY_BOOKING_ADDRESS=contract_address
   NEXT_PUBLIC_SIMPLE_STAKING_ADDRESS=contract_address
   NEXT_PUBLIC_DISPUTE_RESOLUTION_ADDRESS=contract_address
   
   # RPC URLs
   NEXT_PUBLIC_RPC_URL=your_rpc_url
   ```

4. **Deploy smart contracts**
   ```bash
   npx hardhat compile
   npx hardhat run scripts/deploy.js --network your_network
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open World App**
   - Navigate to `http://localhost:3000`
   - Open in World App for full functionality

## Project Structure

```
WorldBNB/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── verify/        # World ID verification
│   │   ├── nonce/         # Authentication nonce
│   │   └── complete-siwe/ # SIWE completion
│   └── page.tsx           # Main application
├── components/            # React components
│   ├── PropertyListingForm.tsx
│   ├── PropertyBookingForm.tsx
│   ├── SimpleImageUpload.tsx
│   ├── SimpleStakingButton.tsx
│   └── ...
├── contracts/             # Smart contracts
│   ├── PropertyHosting.sol
│   ├── PropertyBooking.sol
│   ├── DisputeResolution.sol
│   └── SimpleStaking.sol
├── hooks/                 # Custom React hooks
├── abi/                   # Contract ABIs
├── scripts/               # Deployment scripts
└── public/                # Static assets
```

## Smart Contracts

### PropertyHosting.sol
Manages property listings with features:
- Property creation and management
- Host verification
- Property status tracking

### PropertyBooking.sol
Handles booking and payment logic:
- Booking creation and confirmation
- Escrow payment management
- Host fund claiming

### DisputeResolution.sol
Dispute resolution system:
- Dispute creation and management
- Stake slashing mechanisms
- Compensation distribution

### SimpleStaking.sol
User staking mechanism:
- WLD token staking
- Stake management
- Unstaking functionality

## Usage

### For Guests
1. **Connect Wallet**: Use World App to connect your wallet
2. **Browse Properties**: Explore available properties
3. **Book Property**: Create booking with automated escrow
4. **Check-in**: Confirm arrival to release payment
5. **Leave Review**: Submit World ID verified reviews

### For Hosts
1. **Verify Identity**: Complete World ID verification
2. **List Property**: Create property listing with images
3. **Manage Bookings**: View and manage incoming bookings
4. **Claim Funds**: Receive payments after successful check-ins
5. **Handle Disputes**: Participate in dispute resolution

## Security Features

- **World ID Verification**: Sybil-resistant authentication
- **Smart Contract Escrow**: Secure payment handling
- **Stake-based Incentives**: Economic security through staking
- **Decentralized Storage**: Censorship-resistant data storage
- **Transparent Transactions**: All operations verifiable on-chain

## World Chain Integration

WorldBNB leverages World Chain's unique features:

- **Native Wallet**: Seamless user experience through World's wallet
- **Sponsored Gas**: Zero-cost transactions for users
- **World ID**: Built-in identity verification
- **MiniKit**: Native World App functionality

## Mobile Experience

Optimized for mobile-first experience:
- **Responsive Design**: Works perfectly on all screen sizes
- **Touch-Friendly**: Optimized for mobile interactions
- **World App Integration**: Native World App experience
- **Offline Capability**: Core functionality works offline

## Testing

```bash
# Run smart contract tests
npx hardhat test

# Run frontend tests
npm run test

# Run linting
npm run lint
```

## Deployment

### Smart Contracts
```bash
# Deploy to World Chain Mainnet
npx hardhat run scripts/deploy.js --network worldchain-mainnet

# Deploy to World Chain Sepolia
npx hardhat run scripts/deploy.js --network worldchain-sepolia
```

### Frontend
```bash
# Build for production
npm run build

# Deploy to Vercel
vercel deploy
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **World Chain** for providing the blockchain infrastructure
- **World ID** for identity verification
- **World App** for the native wallet experience
- **Next.js** for the React framework
- **Tailwind CSS** for styling

## Support

- **Documentation**: [World Chain Docs](https://docs.worldchain.org)
- **World ID**: [World ID Developer Portal](https://developer.worldcoin.org)
- **Issues**: [GitHub Issues](https://github.com/chrsnikhil/WorldBNB/issues)

## Roadmap

- [ ] **Multi-chain Support**: Expand to other EVM chains
- [ ] **Advanced Dispute Resolution**: AI-powered dispute analysis
- [ ] **Property Insurance**: Decentralized insurance integration
- [ ] **DAO Governance**: Community-driven platform governance
- [ ] **Mobile App**: Native mobile applications

---

**Built with ❤️ for the World Ecosystem**

*WorldBNB - Where trust meets technology*
