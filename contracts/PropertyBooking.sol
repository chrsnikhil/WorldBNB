// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PropertyHosting.sol";

contract PropertyBooking is ReentrancyGuard, Ownable {
    struct Booking {
        uint256 id;
        uint256 propertyId;
        address guest;
        address host;
        uint256 checkInDate;
        uint256 checkOutDate;
        uint256 totalAmount;
        uint256 platformFee;        // Fee taken by platform
        uint256 hostAmount;          // Amount sent to host
        bool isConfirmed;
        bool isCancelled;
        bool fundsReleased;          // Whether funds have been released
        uint256 createdAt;
        string paymentReference; // WorldCoin payment reference
    }

    // Events
    event BookingCreated(
        uint256 indexed bookingId,
        uint256 indexed propertyId,
        address indexed guest,
        address host,
        uint256 checkInDate,
        uint256 checkOutDate,
        uint256 totalAmount,
        uint256 platformFee,
        uint256 hostAmount,
        string paymentReference
    );
    
    event BookingConfirmed(uint256 indexed bookingId, address indexed host);
    event BookingCancelled(uint256 indexed bookingId, address indexed guest, string reason);
    event FundsReleased(uint256 indexed bookingId, address indexed host, uint256 amount);
    event GuestRefunded(uint256 indexed bookingId, address indexed guest, uint256 amount);

    // State variables
    uint256 public nextBookingId = 1;
    mapping(uint256 => Booking) public bookings;
    mapping(address => uint256[]) public guestBookings;
    mapping(address => uint256[]) public hostBookings;
    mapping(uint256 => mapping(uint256 => bool)) public propertyDateBooked; // propertyId => date => booked
    mapping(string => uint256) public paymentReferenceToBooking; // payment reference => booking ID
    
    PropertyHosting public propertyHosting;
    
    // Platform configuration
    uint256 public platformFeeBasisPoints = 300; // 3% (300 basis points)
    address public platformWallet;
    uint256 public totalPlatformFees; // Total fees collected by platform

    // Modifiers
    modifier onlyBookingGuest(uint256 _bookingId) {
        require(bookings[_bookingId].guest == msg.sender, "Not the booking guest");
        _;
    }

    modifier onlyBookingHost(uint256 _bookingId) {
        require(bookings[_bookingId].host == msg.sender, "Not the booking host");
        _;
    }

    modifier bookingExists(uint256 _bookingId) {
        require(_bookingId > 0 && _bookingId < nextBookingId, "Booking does not exist");
        _;
    }

    modifier validDates(uint256 _checkIn, uint256 _checkOut) {
        require(_checkIn >= block.timestamp, "Check-in date must be in the future");
        require(_checkOut > _checkIn, "Check-out date must be after check-in");
        require(_checkOut - _checkIn <= 365 days, "Stay cannot exceed 365 days");
        _;
    }

    constructor(address _propertyHostingAddress, address _platformWallet) Ownable(msg.sender) {
        propertyHosting = PropertyHosting(_propertyHostingAddress);
        platformWallet = _platformWallet;
    }

    function createBooking(
        uint256 _propertyId,
        uint256 _checkInDate,
        uint256 _checkOutDate,
        string memory _paymentReference
    ) external validDates(_checkInDate, _checkOutDate) nonReentrant returns (uint256) {
        // Verify property exists and is active
        PropertyHosting.Property memory property = propertyHosting.getProperty(_propertyId);
        require(property.isActive, "Property is not active");
        // require(property.host != msg.sender, "Cannot book your own property"); // Disabled for testing - allows self-booking
        require(property.host != address(0), "Property does not exist");

        // Check if dates are available
        require(isDateRangeAvailable(_propertyId, _checkInDate, _checkOutDate), "Dates are not available");

        // Calculate total amount and fees
        uint256 nights = (_checkOutDate - _checkInDate) / 1 days;
        uint256 totalAmount = property.pricePerNight * nights;
        require(totalAmount > 0, "Invalid booking amount");

        // Calculate platform fee (3% by default)
        uint256 platformFee = (totalAmount * platformFeeBasisPoints) / 10000;
        uint256 hostAmount = totalAmount - platformFee;

        // Verify payment reference is unique
        require(paymentReferenceToBooking[_paymentReference] == 0, "Payment reference already used");

        // Create booking
        uint256 bookingId = nextBookingId++;
        Booking storage newBooking = bookings[bookingId];
        newBooking.id = bookingId;
        newBooking.propertyId = _propertyId;
        newBooking.guest = msg.sender;
        newBooking.host = property.host;
        newBooking.checkInDate = _checkInDate;
        newBooking.checkOutDate = _checkOutDate;
        newBooking.totalAmount = totalAmount;
        newBooking.platformFee = platformFee;
        newBooking.hostAmount = hostAmount;
        newBooking.isConfirmed = false;
        newBooking.isCancelled = false;
        newBooking.fundsReleased = false;
        newBooking.createdAt = block.timestamp;
        newBooking.paymentReference = _paymentReference;

        // Update guest and host bookings
        guestBookings[msg.sender].push(bookingId);
        hostBookings[property.host].push(bookingId);

        // Mark dates as booked
        _markDatesAsBooked(_propertyId, _checkInDate, _checkOutDate);

        // Map payment reference to booking
        paymentReferenceToBooking[_paymentReference] = bookingId;

        emit BookingCreated(
            bookingId,
            _propertyId,
            msg.sender,
            property.host,
            _checkInDate,
            _checkOutDate,
            totalAmount,
            platformFee,
            hostAmount,
            _paymentReference
        );

        return bookingId;
    }

    function confirmBooking(uint256 _bookingId) 
        external 
        bookingExists(_bookingId) 
        onlyBookingHost(_bookingId) 
    {
        Booking storage booking = bookings[_bookingId];
        require(!booking.isConfirmed, "Booking already confirmed");
        require(!booking.isCancelled, "Booking is cancelled");

        booking.isConfirmed = true;

        emit BookingConfirmed(_bookingId, msg.sender);
    }

    function cancelBooking(uint256 _bookingId, string memory _reason) 
        external 
        bookingExists(_bookingId) 
    {
        Booking storage booking = bookings[_bookingId];
        require(!booking.isCancelled, "Booking already cancelled");
        require(
            msg.sender == booking.guest || msg.sender == booking.host,
            "Not authorized to cancel this booking"
        );

        booking.isCancelled = true;

        // Free up the dates
        _markDatesAsAvailable(booking.propertyId, booking.checkInDate, booking.checkOutDate);

        emit BookingCancelled(_bookingId, msg.sender, _reason);
    }

    function isDateRangeAvailable(uint256 _propertyId, uint256 _checkIn, uint256 _checkOut) 
        public 
        view 
        returns (bool) 
    {
        uint256 currentDate = _checkIn;
        while (currentDate < _checkOut) {
            if (propertyDateBooked[_propertyId][currentDate]) {
                return false;
            }
            currentDate += 1 days;
        }
        return true;
    }

    function _markDatesAsBooked(uint256 _propertyId, uint256 _checkIn, uint256 _checkOut) internal {
        uint256 currentDate = _checkIn;
        while (currentDate < _checkOut) {
            propertyDateBooked[_propertyId][currentDate] = true;
            currentDate += 1 days;
        }
    }

    function _markDatesAsAvailable(uint256 _propertyId, uint256 _checkIn, uint256 _checkOut) internal {
        uint256 currentDate = _checkIn;
        while (currentDate < _checkOut) {
            propertyDateBooked[_propertyId][currentDate] = false;
            currentDate += 1 days;
        }
    }

    // View functions
    function getBooking(uint256 _bookingId) 
        external 
        view 
        bookingExists(_bookingId) 
        returns (Booking memory) 
    {
        return bookings[_bookingId];
    }

    function getGuestBookings(address _guest) external view returns (uint256[] memory) {
        return guestBookings[_guest];
    }

    function getHostBookings(address _host) external view returns (uint256[] memory) {
        return hostBookings[_host];
    }

    function getBookingByPaymentReference(string memory _paymentReference) 
        external 
        view 
        returns (uint256) 
    {
        return paymentReferenceToBooking[_paymentReference];
    }

    function getPropertyBookings(uint256 _propertyId) external view returns (uint256[] memory) {
        uint256[] memory propertyBookings = new uint256[](nextBookingId - 1);
        uint256 count = 0;
        
        for (uint256 i = 1; i < nextBookingId; i++) {
            if (bookings[i].propertyId == _propertyId) {
                propertyBookings[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = propertyBookings[i];
        }
        
        return result;
    }

    function getBookingsCount() external view returns (uint256) {
        return nextBookingId - 1;
    }

    function isPropertyAvailable(uint256 _propertyId, uint256 _checkIn, uint256 _checkOut) 
        external 
        view 
        returns (bool) 
    {
        return isDateRangeAvailable(_propertyId, _checkIn, _checkOut);
    }

    // Escrow functions - Host can claim their funds
    function claimHostFunds(uint256 _bookingId) 
        external 
        bookingExists(_bookingId) 
        onlyBookingHost(_bookingId)
        nonReentrant 
    {
        Booking storage booking = bookings[_bookingId];
        require(booking.isConfirmed, "Booking must be confirmed");
        require(!booking.fundsReleased, "Funds already claimed");
        require(!booking.isCancelled, "Booking is cancelled");
        require(block.timestamp >= booking.checkInDate, "Cannot claim before check-in");

        booking.fundsReleased = true;

        // Transfer platform fee to platform wallet (accumulate for later withdrawal)
        if (booking.platformFee > 0) {
            totalPlatformFees += booking.platformFee;
        }

        // Transfer host amount to host
        if (booking.hostAmount > 0) {
            // Note: In a real implementation, you'd transfer WLD tokens here
            // payable(booking.host).transfer(booking.hostAmount);
        }

        emit FundsReleased(_bookingId, booking.host, booking.hostAmount);
    }

    function refundGuest(uint256 _bookingId) 
        external 
        bookingExists(_bookingId) 
        onlyOwner 
        nonReentrant 
    {
        Booking storage booking = bookings[_bookingId];
        require(!booking.fundsReleased, "Funds already released");
        require(booking.isCancelled, "Booking must be cancelled to refund");

        // Refund the full amount to guest
        // Note: In a real implementation, you'd transfer WLD tokens here
        // payable(booking.guest).transfer(booking.totalAmount);

        emit GuestRefunded(_bookingId, booking.guest, booking.totalAmount);
    }

    // Platform management functions
    function setPlatformFee(uint256 _newFeeBasisPoints) external onlyOwner {
        require(_newFeeBasisPoints <= 1000, "Fee cannot exceed 10%"); // Max 10%
        platformFeeBasisPoints = _newFeeBasisPoints;
    }

    function setPlatformWallet(address _newPlatformWallet) external onlyOwner {
        require(_newPlatformWallet != address(0), "Invalid platform wallet");
        platformWallet = _newPlatformWallet;
    }

    function withdrawPlatformFees() external onlyOwner {
        require(totalPlatformFees > 0, "No fees to withdraw");
        uint256 amount = totalPlatformFees;
        totalPlatformFees = 0;
        // Note: In a real implementation, you'd transfer WLD tokens here
        // payable(platformWallet).transfer(amount);
    }

    // View functions for escrow
    function getBookingEscrowInfo(uint256 _bookingId) 
        external 
        view 
        bookingExists(_bookingId) 
        returns (
            uint256 totalAmount,
            uint256 platformFee,
            uint256 hostAmount,
            bool fundsReleased,
            bool canClaim
        ) 
    {
        Booking storage booking = bookings[_bookingId];
        return (
            booking.totalAmount,
            booking.platformFee,
            booking.hostAmount,
            booking.fundsReleased,
            booking.isConfirmed && 
            !booking.fundsReleased && 
            !booking.isCancelled && 
            block.timestamp >= booking.checkInDate
        );
    }

    function getTotalPlatformFees() external view returns (uint256) {
        return totalPlatformFees;
    }
}
