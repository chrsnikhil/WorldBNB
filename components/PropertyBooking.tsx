"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePropertyManager } from '../hooks/usePropertyManager';
import { Property, BookingStatus } from '../lib/contracts';

interface PropertyBookingProps {
  property: Property;
  onBookingCreated: (bookingId: number) => void;
}

export default function PropertyBooking({ property, onBookingCreated }: PropertyBookingProps) {
  const { createBooking, hasBookingConflict, isConnected } = usePropertyManager();
  const [isLoading, setIsLoading] = useState(false);
  const [hasConflict, setHasConflict] = useState(false);
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: ''
  });

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const checkForConflicts = async () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return;
    
    try {
      const checkInDate = new Date(bookingData.checkIn);
      const checkOutDate = new Date(bookingData.checkOut);
      const conflict = await hasBookingConflict(property.id, checkInDate, checkOutDate);
      setHasConflict(conflict);
    } catch (error) {
      console.error('Error checking conflicts:', error);
    }
  };

  useEffect(() => {
    checkForConflicts();
  }, [bookingData.checkIn, bookingData.checkOut]);

  const calculateTotalPrice = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return '0';
    
    const checkInDate = new Date(bookingData.checkIn);
    const checkOutDate = new Date(bookingData.checkOut);
    const days = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = parseFloat(property.pricePerDay) * days;
    
    return totalPrice.toFixed(4);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (hasConflict) {
      alert('Selected dates are not available');
      return;
    }

    setIsLoading(true);
    
    try {
      const checkInDate = new Date(bookingData.checkIn);
      const checkOutDate = new Date(bookingData.checkOut);
      
      const receipt = await createBooking(property.id, checkInDate, checkOutDate);
      
      // Extract booking ID from events
      const event = receipt.events?.find(e => e.event === 'BookingCreated');
      const bookingId = event?.args?.bookingId?.toNumber();
      
      if (bookingId) {
        onBookingCreated(bookingId);
        alert('Booking created successfully!');
        
        // Reset form
        setBookingData({
          checkIn: '',
          checkOut: ''
        });
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-neutral-800 rounded-xl p-6 text-center">
        <p className="text-neutral-400">Please connect your wallet to book this property</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-neutral-800 rounded-xl p-6"
    >
      <h2 className="text-xl font-semibold mb-4 text-orange-500">Book This Property</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-neutral-400">Price per day:</span>
          <span className="font-semibold">{property.pricePerDay} ETH</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-neutral-400">Location:</span>
          <span className="font-semibold">{property.location}</span>
        </div>
      </div>

      <form onSubmit={handleBooking} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Check-in Date
          </label>
          <input
            type="date"
            name="checkIn"
            value={bookingData.checkIn}
            onChange={handleDateChange}
            required
            min={new Date().toISOString().split('T')[0]}
            className="w-full mobile-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Check-out Date
          </label>
          <input
            type="date"
            name="checkOut"
            value={bookingData.checkOut}
            onChange={handleDateChange}
            required
            min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
            className="w-full mobile-input"
          />
        </div>

        {hasConflict && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-red-500 text-sm">Selected dates are not available</p>
          </div>
        )}

        {bookingData.checkIn && bookingData.checkOut && !hasConflict && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-green-500">Total Price:</span>
              <span className="font-semibold text-green-500">{calculateTotalPrice()} ETH</span>
            </div>
          </div>
        )}

        <motion.button
          type="submit"
          disabled={isLoading || hasConflict || !bookingData.checkIn || !bookingData.checkOut}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mobile-button bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-neutral-700 disabled:to-neutral-800 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 shadow-lg disabled:shadow-none"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Creating Booking...</span>
            </div>
          ) : (
            'Book Property'
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
