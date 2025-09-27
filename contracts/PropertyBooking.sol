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
        bool isConfirmed;
        bool isCancelled;
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
        string paymentReference
    );
    
    event BookingConfirmed(uint256 indexed bookingId, address indexed host);
    event BookingCancelled(uint256 indexed bookingId, address indexed guest, string reason);

    // State variables
    uint256 public nextBookingId = 1;
    mapping(uint256 => Booking) public bookings;
    mapping(address => uint256[]) public guestBookings;
    mapping(address => uint256[]) public hostBookings;
    mapping(uint256 => mapping(uint256 => bool)) public propertyDateBooked; // propertyId => date => booked
    mapping(string => uint256) public paymentReferenceToBooking; // payment reference => booking ID
    
    PropertyHosting public propertyHosting;

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

    constructor(address _propertyHostingAddress) Ownable(msg.sender) {
        propertyHosting = PropertyHosting(_propertyHostingAddress);
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

        // Calculate total amount
        uint256 nights = (_checkOutDate - _checkInDate) / 1 days;
        uint256 totalAmount = property.pricePerNight * nights;
        require(totalAmount > 0, "Invalid booking amount");

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
        newBooking.isConfirmed = false;
        newBooking.isCancelled = false;
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
}
