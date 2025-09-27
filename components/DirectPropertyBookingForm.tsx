"use client";

import { useState } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';
import PropertyBookingABI from '../abi/PropertyBooking.json';

interface Property {
  id: number;
  name: string;
  description: string;
  location: string;
  pricePerNight: number;
  host: string;
}

interface DirectPropertyBookingFormProps {
  property: Property;
  onBookingCreated: (bookingId: string) => void;
  onClose: () => void;
}

export default function DirectPropertyBookingForm({ property, onBookingCreated, onClose }: DirectPropertyBookingFormProps) {
  const [formData, setFormData] = useState({
    checkInDate: '',
    checkOutDate: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateTotal = () => {
    if (!formData.checkInDate || !formData.checkOutDate) return 0;
    
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    return nights * property.pricePerNight;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Convert dates to timestamps
      const checkInTimestamp = Math.floor(new Date(formData.checkInDate).getTime() / 1000);
      const checkOutTimestamp = Math.floor(new Date(formData.checkOutDate).getTime() / 1000);

      // Generate a unique payment reference
      const paymentReference = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Send transaction directly to smart contract
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: process.env.NEXT_PUBLIC_PROPERTY_BOOKING_ADDRESS!, // Your booking contract address
            abi: PropertyBookingABI,
            functionName: 'createBooking',
            args: [
              property.id.toString(), // _propertyId
              checkInTimestamp.toString(), // _checkInDate
              checkOutTimestamp.toString(), // _checkOutDate
              paymentReference // _paymentReference
            ],
          },
        ],
      });

      if (finalPayload.status === 'error') {
        throw new Error(finalPayload.error || 'Transaction failed');
      }

      // Extract booking ID from transaction result
      // Note: You might need to parse the transaction receipt to get the actual booking ID
      const bookingId = "1"; // This would come from parsing the transaction receipt
      
      onBookingCreated(bookingId);
      
    } catch (error: any) {
      console.error('Error creating booking:', error);
      setError(error.message || 'Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  const totalNights = formData.checkInDate && formData.checkOutDate 
    ? Math.ceil((new Date(formData.checkOutDate).getTime() - new Date(formData.checkInDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Book {property.name}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-in Date
            </label>
            <input
              type="date"
              value={formData.checkInDate}
              onChange={(e) => setFormData({...formData, checkInDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-out Date
            </label>
            <input
              type="date"
              value={formData.checkOutDate}
              onChange={(e) => setFormData({...formData, checkOutDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              required
            />
          </div>

          {/* Billing Section */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium text-gray-900 mb-2">Billing</h3>
            <div className="space-y-1 text-sm text-gray-900">
              <div className="flex justify-between">
                <span>Total nights:</span>
                <span>{totalNights}</span>
              </div>
              <div className="flex justify-between">
                <span>Price per night:</span>
                <span>{property.pricePerNight} WLD</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>{calculateTotal()} WLD</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Book & Pay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
