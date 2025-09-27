# WorldBNB Smart Contracts

This document describes the smart contract system for WorldBNB, a decentralized Airbnb platform built on World Chain.

## Overview

The system consists of two main smart contracts:

1. **PropertyHosting.sol** - Manages property listings
2. **PropertyBooking.sol** - Handles property bookings with payment integration

## Contract Architecture

### PropertyHosting Contract

**Purpose**: Allows users to list, update, and manage their properties on-chain.

**Key Features**:
- List new properties with details (name, description, location, price, image)
- Update existing property information
- Activate/deactivate properties
- Query properties by host or get all active properties

**Main Functions**:
```solidity
function listProperty(string memory _name, string memory _description, string memory _location, uint256 _pricePerNight, string memory _imageHash) external returns (uint256)
function updateProperty(uint256 _propertyId, string memory _name, string memory _description, string memory _location, uint256 _pricePerNight, string memory _imageHash) external
function deactivateProperty(uint256 _propertyId) external
function getProperty(uint256 _propertyId) external view returns (Property memory)
function getActiveProperties() external view returns (uint256[])
```

### PropertyBooking Contract

**Purpose**: Handles property bookings with integrated payment verification.

**Key Features**:
- Create bookings with payment reference validation
- Prevent double-booking of the same dates
- Track booking status (confirmed, cancelled)
- Link bookings to payment references

**Main Functions**:
```solidity
function createBooking(uint256 _propertyId, uint256 _checkInDate, uint256 _checkOutDate, string memory _paymentReference) external returns (uint256)
function confirmBooking(uint256 _bookingId) external
function cancelBooking(uint256 _bookingId, string memory _reason) external
function isPropertyAvailable(uint256 _propertyId, uint256 _checkIn, uint256 _checkOut) external view returns (bool)
```

## Payment Integration Flow

### 1. Property Listing Flow
```
User → PropertyHosting.listProperty() → Property listed on-chain
```

### 2. Property Booking Flow
```
1. User selects property and dates
2. User initiates payment via WorldCoin MiniKit
3. Payment is processed and confirmed
4. PropertyBooking.createBooking() is called with payment reference
5. Booking is created on-chain and dates are marked as unavailable
```

### 3. Payment Verification
- Each booking requires a unique payment reference
- Payment reference is validated before booking creation
- Prevents duplicate bookings with the same payment reference

## Data Structures

### Property Struct
```solidity
struct Property {
    uint256 id;
    address host;
    string name;
    string description;
    string location;
    uint256 pricePerNight; // in wei
    bool isActive;
    uint256 createdAt;
    string imageHash; // IPFS hash
}
```

### Booking Struct
```solidity
struct Booking {
    uint256 id;
    uint256 propertyId;
    address guest;
    address host;
    uint256 checkInDate;
    uint256 checkOutDate;
    uint256 totalAmount;
    bool isConfirmed;
    bool isCancelled;
    uint256 createdAt;
    string paymentReference;
}
```

## Security Features

### ReentrancyGuard
- Prevents reentrancy attacks on both contracts
- Ensures atomic operations

### Access Control
- Only property hosts can update their properties
- Only booking guests can cancel their bookings
- Only booking hosts can confirm bookings

### Date Validation
- Prevents booking in the past
- Ensures check-out is after check-in
- Maximum stay duration of 365 days

### Payment Integration
- Unique payment reference validation
- Prevents duplicate bookings
- Links on-chain bookings to off-chain payments

## Events

### PropertyHosting Events
```solidity
event PropertyListed(uint256 indexed propertyId, address indexed host, string name, uint256 price);
event PropertyUpdated(uint256 indexed propertyId, address indexed host);
event PropertyDeactivated(uint256 indexed propertyId, address indexed host);
```

### PropertyBooking Events
```solidity
event BookingCreated(uint256 indexed bookingId, uint256 indexed propertyId, address indexed guest, address host, uint256 checkInDate, uint256 checkOutDate, uint256 totalAmount, string paymentReference);
event BookingConfirmed(uint256 indexed bookingId, address indexed host);
event BookingCancelled(uint256 indexed bookingId, address indexed guest, string reason);
```

## Deployment

### Prerequisites
- Hardhat installed
- World Chain RPC URL
- Private key for deployment

### Environment Variables
```bash
WORLDCHAIN_RPC_URL=https://worldchain-mainnet.g.alchemy.com/public
PRIVATE_KEY=your_private_key_here
```

### Deployment Steps
1. Install dependencies: `npm install`
2. Compile contracts: `npx hardhat compile`
3. Deploy contracts: `npx hardhat run scripts/deploy.js --network worldchain`

### Contract Addresses
After deployment, update these in your frontend:
- `NEXT_PUBLIC_PROPERTY_HOSTING_ADDRESS`
- `NEXT_PUBLIC_PROPERTY_BOOKING_ADDRESS`

## Frontend Integration

### React Hooks
- `usePropertyContracts()` - Interact with smart contracts
- `usePayment()` - Handle payments and bookings

### API Routes
- `/api/complete-booking` - Create booking after payment confirmation

## Gas Optimization

### String Storage
- Minimize string storage by using IPFS hashes for images
- Use short, descriptive property names
- Store only essential data on-chain

### Batch Operations
- Consider batching multiple property updates
- Use events for off-chain data storage

## Testing

### Unit Tests
```bash
npx hardhat test
```

### Integration Tests
- Test payment flow end-to-end
- Verify booking creation after payment
- Test date availability logic

## Security Considerations

### Access Control
- Implement proper role-based access control
- Use OpenZeppelin's AccessControl for complex permissions

### Input Validation
- Validate all user inputs
- Check date ranges and amounts
- Prevent integer overflow

### Payment Security
- Verify payment references are unique
- Implement payment amount validation
- Consider escrow mechanisms for large amounts

## Future Enhancements

### Escrow System
- Implement escrow for holding payments
- Automatic release after check-in
- Dispute resolution mechanism

### Reputation System
- On-chain reputation scores
- Review and rating system
- Trust indicators

### Multi-token Support
- Support for multiple payment tokens
- Price conversion mechanisms
- Token-specific booking logic

## Troubleshooting

### Common Issues
1. **Transaction Reverted**: Check gas limits and contract state
2. **Payment Reference Already Used**: Ensure unique references
3. **Date Not Available**: Check property availability before booking
4. **Insufficient Permissions**: Verify caller has proper access

### Debug Tools
- Use Hardhat console for debugging
- Check transaction logs for events
- Verify contract state with view functions

## Support

For issues or questions:
1. Check contract events for transaction details
2. Verify payment reference uniqueness
3. Ensure proper contract deployment order
4. Check World Chain network status
