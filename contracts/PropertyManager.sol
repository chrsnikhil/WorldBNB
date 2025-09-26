// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PropertyManager is ReentrancyGuard, Ownable {
    
    // Property structure
    struct Property {
        uint256 id;
        address owner;
        string name; // Keep name for display
        uint256 pricePerDay; // in wei
        bool isActive;
        bool isAvailable;
        string imageHash; // Single IPFS hash for main image
        uint256 createdAt;
        uint256 updatedAt;
    }
    
    // Booking structure
    struct Booking {
        uint256 id;
        uint256 propertyId;
        address guest;
        uint256 checkIn;
        uint256 checkOut;
        uint256 totalPrice;
        BookingStatus status;
        uint256 createdAt;
    }
    
    enum BookingStatus {
        Pending,
        Confirmed,
        Cancelled,
        Completed
    }
    
    // State variables
    uint256 public nextPropertyId = 1;
    uint256 public nextBookingId = 1;
    uint256 public platformFeePercentage = 3; // 3% platform fee
    address public feeRecipient;
    
    // Mappings
    mapping(uint256 => Property) public properties;
    mapping(uint256 => Booking) public bookings;
    mapping(address => uint256[]) public userProperties;
    mapping(address => uint256[]) public userBookings;
    mapping(uint256 => uint256[]) public propertyBookings;
    
    // Events
    event PropertyListed(
        uint256 indexed propertyId,
        address indexed owner,
        string name,
        uint256 pricePerDay
    );
    
    event PropertyUpdated(
        uint256 indexed propertyId,
        address indexed owner,
        bool isActive
    );
    
    event BookingCreated(
        uint256 indexed bookingId,
        uint256 indexed propertyId,
        address indexed guest,
        uint256 checkIn,
        uint256 checkOut,
        uint256 totalPrice
    );
    
    event BookingConfirmed(
        uint256 indexed bookingId,
        address indexed guest
    );
    
    event BookingCancelled(
        uint256 indexed bookingId,
        address indexed guest
    );
    
    event PaymentProcessed(
        uint256 indexed bookingId,
        uint256 amount,
        uint256 platformFee
    );
    
    constructor(address _feeRecipient) {
        feeRecipient = _feeRecipient;
    }
    
    // Property Management Functions
    
    function listProperty(
        string memory _name,
        uint256 _pricePerDay,
        string memory _imageHash
    ) external returns (uint256) {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_pricePerDay > 0, "Price must be greater than 0");
        require(bytes(_imageHash).length > 0, "Image hash required");
        
        uint256 propertyId = nextPropertyId++;
        
        properties[propertyId] = Property({
            id: propertyId,
            owner: msg.sender,
            name: _name,
            pricePerDay: _pricePerDay,
            isActive: true,
            isAvailable: true,
            imageHash: _imageHash,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        
        userProperties[msg.sender].push(propertyId);
        
        emit PropertyListed(propertyId, msg.sender, _name, _pricePerDay);
        
        return propertyId;
    }
    
    function updateProperty(
        uint256 _propertyId,
        string memory _name,
        uint256 _pricePerDay,
        bool _isActive,
        bool _isAvailable,
        string memory _imageHash
    ) external {
        Property storage property = properties[_propertyId];
        require(property.owner == msg.sender, "Only property owner can update");
        require(property.id != 0, "Property does not exist");
        
        property.name = _name;
        property.pricePerDay = _pricePerDay;
        property.isActive = _isActive;
        property.isAvailable = _isAvailable;
        property.imageHash = _imageHash;
        property.updatedAt = block.timestamp;
        
        emit PropertyUpdated(_propertyId, msg.sender, _isActive);
    }
    
    // Booking Functions
    
    function createBooking(
        uint256 _propertyId,
        uint256 _checkIn,
        uint256 _checkOut
    ) external payable nonReentrant returns (uint256) {
        Property storage property = properties[_propertyId];
        require(property.id != 0, "Property does not exist");
        require(property.isActive && property.isAvailable, "Property not available");
        require(property.owner != msg.sender, "Cannot book your own property");
        require(_checkIn > block.timestamp, "Check-in must be in the future");
        require(_checkOut > _checkIn, "Check-out must be after check-in");
        
        // Calculate total price
        uint256 days = (_checkOut - _checkIn) / 1 days;
        require(days > 0, "Minimum 1 day booking required");
        
        uint256 totalPrice = property.pricePerDay * days;
        require(msg.value >= totalPrice, "Insufficient payment");
        
        // Check for conflicts
        require(!hasBookingConflict(_propertyId, _checkIn, _checkOut), "Dates not available");
        
        uint256 bookingId = nextBookingId++;
        
        bookings[bookingId] = Booking({
            id: bookingId,
            propertyId: _propertyId,
            guest: msg.sender,
            checkIn: _checkIn,
            checkOut: _checkOut,
            totalPrice: totalPrice,
            status: BookingStatus.Pending,
            createdAt: block.timestamp
        });
        
        userBookings[msg.sender].push(bookingId);
        propertyBookings[_propertyId].push(bookingId);
        
        emit BookingCreated(bookingId, _propertyId, msg.sender, _checkIn, _checkOut, totalPrice);
        
        return bookingId;
    }
    
    function confirmBooking(uint256 _bookingId) external {
        Booking storage booking = bookings[_bookingId];
        Property storage property = properties[booking.propertyId];
        
        require(property.owner == msg.sender, "Only property owner can confirm");
        require(booking.status == BookingStatus.Pending, "Booking not pending");
        
        booking.status = BookingStatus.Confirmed;
        
        // Process payment
        uint256 platformFee = (booking.totalPrice * platformFeePercentage) / 100;
        uint256 ownerAmount = booking.totalPrice - platformFee;
        
        // Transfer funds
        payable(property.owner).transfer(ownerAmount);
        payable(feeRecipient).transfer(platformFee);
        
        emit BookingConfirmed(_bookingId, booking.guest);
        emit PaymentProcessed(_bookingId, booking.totalPrice, platformFee);
    }
    
    function cancelBooking(uint256 _bookingId) external {
        Booking storage booking = bookings[_bookingId];
        Property storage property = properties[booking.propertyId];
        
        require(
            booking.guest == msg.sender || property.owner == msg.sender,
            "Not authorized to cancel"
        );
        require(booking.status == BookingStatus.Pending, "Cannot cancel confirmed booking");
        
        booking.status = BookingStatus.Cancelled;
        
        // Refund guest
        payable(booking.guest).transfer(booking.totalPrice);
        
        emit BookingCancelled(_bookingId, booking.guest);
    }
    
    // View Functions
    
    function getProperty(uint256 _propertyId) external view returns (Property memory) {
        return properties[_propertyId];
    }
    
    function getBooking(uint256 _bookingId) external view returns (Booking memory) {
        return bookings[_bookingId];
    }
    
    function getUserProperties(address _user) external view returns (uint256[] memory) {
        return userProperties[_user];
    }
    
    function getUserBookings(address _user) external view returns (uint256[] memory) {
        return userBookings[_user];
    }
    
    function getPropertyBookings(uint256 _propertyId) external view returns (uint256[] memory) {
        return propertyBookings[_propertyId];
    }
    
    function hasBookingConflict(
        uint256 _propertyId,
        uint256 _checkIn,
        uint256 _checkOut
    ) public view returns (bool) {
        uint256[] memory propertyBookingIds = propertyBookings[_propertyId];
        
        for (uint256 i = 0; i < propertyBookingIds.length; i++) {
            Booking memory booking = bookings[propertyBookingIds[i]];
            if (booking.status == BookingStatus.Confirmed) {
                // Check for overlap
                if (!(_checkOut <= booking.checkIn || _checkIn >= booking.checkOut)) {
                    return true;
                }
            }
        }
        return false;
    }
    
    // Admin Functions
    
    function setPlatformFee(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 10, "Fee cannot exceed 10%");
        platformFeePercentage = _feePercentage;
    }
    
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }
    
    // Emergency functions
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
