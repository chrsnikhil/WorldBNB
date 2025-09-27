import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Contract addresses (update these after deployment)
const PROPERTY_HOSTING_ADDRESS = process.env.NEXT_PUBLIC_PROPERTY_HOSTING_ADDRESS || '';
const PROPERTY_BOOKING_ADDRESS = process.env.NEXT_PUBLIC_PROPERTY_BOOKING_ADDRESS || '';

// ABI for PropertyHosting contract
const PROPERTY_HOSTING_ABI = [
  "function listProperty(string memory _name, string memory _description, string memory _location, uint256 _pricePerNight, string memory _imageHash) external returns (uint256)",
  "function getProperty(uint256 _propertyId) external view returns (tuple(uint256 id, address host, string name, string description, string location, uint256 pricePerNight, bool isActive, uint256 createdAt, string imageHash))",
  "function getActiveProperties() external view returns (uint256[])",
  "function getAllProperties() external view returns (uint256[])",
  "function getHostProperties(address _host) external view returns (uint256[])",
  "event PropertyListed(uint256 indexed propertyId, address indexed host, string name, uint256 price)"
];

// ABI for PropertyBooking contract
const PROPERTY_BOOKING_ABI = [
  "function createBooking(uint256 _propertyId, uint256 _checkInDate, uint256 _checkOutDate, string memory _paymentReference) external returns (uint256)",
  "function confirmBooking(uint256 _bookingId) external",
  "function cancelBooking(uint256 _bookingId, string memory _reason) external",
  "function getBooking(uint256 _bookingId) external view returns (tuple(uint256 id, uint256 propertyId, address guest, address host, uint256 checkInDate, uint256 checkOutDate, uint256 totalAmount, bool isConfirmed, bool isCancelled, uint256 createdAt, string paymentReference))",
  "function getGuestBookings(address _guest) external view returns (uint256[])",
  "function getHostBookings(address _host) external view returns (uint256[])",
  "function isPropertyAvailable(uint256 _propertyId, uint256 _checkIn, uint256 _checkOut) external view returns (bool)",
  "event BookingCreated(uint256 indexed bookingId, uint256 indexed propertyId, address indexed guest, address host, uint256 checkInDate, uint256 checkOutDate, uint256 totalAmount, string paymentReference)"
];

export interface Property {
  id: number;
  host: string;
  name: string;
  description: string;
  location: string;
  pricePerNight: string;
  isActive: boolean;
  createdAt: number;
  imageHash: string;
}

export interface Booking {
  id: number;
  propertyId: number;
  guest: string;
  host: string;
  checkInDate: number;
  checkOutDate: number;
  totalAmount: string;
  isConfirmed: boolean;
  isCancelled: boolean;
  createdAt: number;
  paymentReference: string;
}

export const usePropertyContracts = () => {
  const [propertyHostingContract, setPropertyHostingContract] = useState<ethers.Contract | null>(null);
  const [propertyBookingContract, setPropertyBookingContract] = useState<ethers.Contract | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string>('');

  useEffect(() => {
    initializeContracts();
  }, []);

  const initializeContracts = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        
        const propertyHosting = new ethers.Contract(
          PROPERTY_HOSTING_ADDRESS,
          PROPERTY_HOSTING_ABI,
          signer
        );
        
        const propertyBooking = new ethers.Contract(
          PROPERTY_BOOKING_ADDRESS,
          PROPERTY_BOOKING_ABI,
          signer
        );

        setPropertyHostingContract(propertyHosting);
        setPropertyBookingContract(propertyBooking);
        setIsConnected(true);

        // Get user address
        const address = await signer.getAddress();
        setUserAddress(address);
      }
    } catch (error) {
      console.error('Failed to initialize contracts:', error);
    }
  };

  const listProperty = async (
    name: string,
    description: string,
    location: string,
    pricePerNight: string,
    imageHash: string
  ) => {
    if (!propertyHostingContract) throw new Error('Contract not initialized');
    
    const priceInWei = ethers.utils.parseEther(pricePerNight);
    const tx = await propertyHostingContract.listProperty(
      name,
      description,
      location,
      priceInWei,
      imageHash
    );
    
    const receipt = await tx.wait();
    return receipt;
  };

  const getProperty = async (propertyId: number): Promise<Property> => {
    if (!propertyHostingContract) throw new Error('Contract not initialized');
    
    const property = await propertyHostingContract.getProperty(propertyId);
    return {
      id: property.id.toNumber(),
      host: property.host,
      name: property.name,
      description: property.description,
      location: property.location,
      pricePerNight: ethers.utils.formatEther(property.pricePerNight),
      isActive: property.isActive,
      createdAt: property.createdAt.toNumber(),
      imageHash: property.imageHash
    };
  };

  const getActiveProperties = async (): Promise<number[]> => {
    if (!propertyHostingContract) throw new Error('Contract not initialized');
    
    const propertyIds = await propertyHostingContract.getActiveProperties();
    return propertyIds.map((id: any) => id.toNumber());
  };

  const getHostProperties = async (hostAddress: string): Promise<number[]> => {
    if (!propertyHostingContract) throw new Error('Contract not initialized');
    
    const propertyIds = await propertyHostingContract.getHostProperties(hostAddress);
    return propertyIds.map((id: any) => id.toNumber());
  };

  const createBooking = async (
    propertyId: number,
    checkInDate: number,
    checkOutDate: number,
    paymentReference: string
  ) => {
    if (!propertyBookingContract) throw new Error('Contract not initialized');
    
    const tx = await propertyBookingContract.createBooking(
      propertyId,
      checkInDate,
      checkOutDate,
      paymentReference
    );
    
    const receipt = await tx.wait();
    return receipt;
  };

  const confirmBooking = async (bookingId: number) => {
    if (!propertyBookingContract) throw new Error('Contract not initialized');
    
    const tx = await propertyBookingContract.confirmBooking(bookingId);
    const receipt = await tx.wait();
    return receipt;
  };

  const getBooking = async (bookingId: number): Promise<Booking> => {
    if (!propertyBookingContract) throw new Error('Contract not initialized');
    
    const booking = await propertyBookingContract.getBooking(bookingId);
    return {
      id: booking.id.toNumber(),
      propertyId: booking.propertyId.toNumber(),
      guest: booking.guest,
      host: booking.host,
      checkInDate: booking.checkInDate.toNumber(),
      checkOutDate: booking.checkOutDate.toNumber(),
      totalAmount: ethers.utils.formatEther(booking.totalAmount),
      isConfirmed: booking.isConfirmed,
      isCancelled: booking.isCancelled,
      createdAt: booking.createdAt.toNumber(),
      paymentReference: booking.paymentReference
    };
  };

  const getGuestBookings = async (guestAddress: string): Promise<number[]> => {
    if (!propertyBookingContract) throw new Error('Contract not initialized');
    
    const bookingIds = await propertyBookingContract.getGuestBookings(guestAddress);
    return bookingIds.map((id: any) => id.toNumber());
  };

  const getHostBookings = async (hostAddress: string): Promise<number[]> => {
    if (!propertyBookingContract) throw new Error('Contract not initialized');
    
    const bookingIds = await propertyBookingContract.getHostBookings(hostAddress);
    return bookingIds.map((id: any) => id.toNumber());
  };

  const isPropertyAvailable = async (
    propertyId: number,
    checkInDate: number,
    checkOutDate: number
  ): Promise<boolean> => {
    if (!propertyBookingContract) throw new Error('Contract not initialized');
    
    return await propertyBookingContract.isPropertyAvailable(
      propertyId,
      checkInDate,
      checkOutDate
    );
  };

  return {
    propertyHostingContract,
    propertyBookingContract,
    isConnected,
    userAddress,
    listProperty,
    getProperty,
    getActiveProperties,
    getHostProperties,
    createBooking,
    confirmBooking,
    getBooking,
    getGuestBookings,
    getHostBookings,
    isPropertyAvailable
  };
};
