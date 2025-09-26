import { ethers } from 'ethers';

// Contract ABI (Application Binary Interface)
export const PROPERTY_MANAGER_ABI = [
  // Property Management
  "function listProperty(string memory _name, string memory _description, string memory _location, uint256 _pricePerDay, string[] memory _imageHashes) external returns (uint256)",
  "function updateProperty(uint256 _propertyId, string memory _name, string memory _description, string memory _location, uint256 _pricePerDay, bool _isActive, bool _isAvailable, string[] memory _imageHashes) external",
  
  // Booking Functions
  "function createBooking(uint256 _propertyId, uint256 _checkIn, uint256 _checkOut) external payable returns (uint256)",
  "function confirmBooking(uint256 _bookingId) external",
  "function cancelBooking(uint256 _bookingId, string memory _reason) external",
  
  // View Functions
  "function getProperty(uint256 _propertyId) external view returns (tuple(uint256 id, address owner, string name, string description, string location, uint256 pricePerDay, bool isActive, bool isAvailable, string[] imageHashes, uint256 createdAt, uint256 updatedAt))",
  "function getBooking(uint256 _bookingId) external view returns (tuple(uint256 id, uint256 propertyId, address guest, uint256 checkIn, uint256 checkOut, uint256 totalPrice, uint8 status, uint256 createdAt))",
  "function getUserProperties(address _user) external view returns (uint256[] memory)",
  "function getUserBookings(address _user) external view returns (uint256[] memory)",
  "function hasBookingConflict(uint256 _propertyId, uint256 _checkIn, uint256 _checkOut) external view returns (bool)",
  
  // Events
  "event PropertyListed(uint256 indexed propertyId, address indexed owner, string name, uint256 pricePerDay)",
  "event BookingCreated(uint256 indexed bookingId, uint256 indexed propertyId, address indexed guest, uint256 checkIn, uint256 checkOut, uint256 totalPrice)",
  "event BookingConfirmed(uint256 indexed bookingId, address indexed guest)",
  "event BookingCancelled(uint256 indexed bookingId, address indexed guest, string reason)"
];

// Contract address (replace with your deployed contract address)
export const PROPERTY_MANAGER_ADDRESS = "0x..."; // Replace with actual contract address

// Contract instance factory
export const getPropertyManagerContract = (provider: ethers.providers.Provider | ethers.Signer) => {
  return new ethers.Contract(PROPERTY_MANAGER_ADDRESS, PROPERTY_MANAGER_ABI, provider);
};

// Types
export interface Property {
  id: number;
  owner: string;
  name: string;
  description: string;
  location: string;
  pricePerDay: string;
  isActive: boolean;
  isAvailable: boolean;
  imageHashes: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Booking {
  id: number;
  propertyId: number;
  guest: string;
  checkIn: number;
  checkOut: number;
  totalPrice: string;
  status: number; // 0: Pending, 1: Confirmed, 2: Cancelled, 3: Completed
  createdAt: number;
}

export enum BookingStatus {
  Pending = 0,
  Confirmed = 1,
  Cancelled = 2,
  Completed = 3
}
