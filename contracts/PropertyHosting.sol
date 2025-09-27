// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PropertyHosting is ReentrancyGuard, Ownable {
    struct Property {
        uint256 id;
        address host;
        string name;
        string description;
        string location;
        uint256 pricePerNight; // in wei
        bool isActive;
        uint256 createdAt;
        string imageHash; // IPFS hash for property image
    }

    // Events
    event PropertyListed(uint256 indexed propertyId, address indexed host, string name, uint256 price);
    event PropertyUpdated(uint256 indexed propertyId, address indexed host);
    event PropertyDeactivated(uint256 indexed propertyId, address indexed host);

    // State variables
    uint256 public nextPropertyId = 1;
    mapping(uint256 => Property) public properties;
    mapping(address => uint256[]) public hostProperties;
    uint256[] public allPropertyIds;

    // Constructor
    constructor() Ownable(msg.sender) {}

    // Modifiers
    modifier onlyPropertyHost(uint256 _propertyId) {
        require(properties[_propertyId].host == msg.sender, "Not the property host");
        _;
    }

    modifier propertyExists(uint256 _propertyId) {
        require(_propertyId > 0 && _propertyId < nextPropertyId, "Property does not exist");
        _;
    }

    // Functions
    function listProperty(
        string memory _name,
        string memory _description,
        string memory _location,
        uint256 _pricePerNight,
        string memory _imageHash
    ) external returns (uint256) {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(bytes(_location).length > 0, "Location cannot be empty");
        require(_pricePerNight > 0, "Price must be greater than 0");

        uint256 propertyId = nextPropertyId++;
        
        Property storage newProperty = properties[propertyId];
        newProperty.id = propertyId;
        newProperty.host = msg.sender;
        newProperty.name = _name;
        newProperty.description = _description;
        newProperty.location = _location;
        newProperty.pricePerNight = _pricePerNight;
        newProperty.isActive = true;
        newProperty.createdAt = block.timestamp;
        newProperty.imageHash = _imageHash;

        hostProperties[msg.sender].push(propertyId);
        allPropertyIds.push(propertyId);

        emit PropertyListed(propertyId, msg.sender, _name, _pricePerNight);
        
        return propertyId;
    }

    function listPropertyForHost(
        address _host,
        string memory _name,
        string memory _description,
        string memory _location,
        uint256 _pricePerNight,
        string memory _imageHash
    ) external returns (uint256) {
        require(_host != address(0), "Host address cannot be zero");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(bytes(_location).length > 0, "Location cannot be empty");
        require(_pricePerNight > 0, "Price must be greater than 0");

        uint256 propertyId = nextPropertyId++;
        
        Property storage newProperty = properties[propertyId];
        newProperty.id = propertyId;
        newProperty.host = _host; // Use the provided host address
        newProperty.name = _name;
        newProperty.description = _description;
        newProperty.location = _location;
        newProperty.pricePerNight = _pricePerNight;
        newProperty.isActive = true;
        newProperty.createdAt = block.timestamp;
        newProperty.imageHash = _imageHash;

        // Add to host's properties and all properties
        hostProperties[_host].push(propertyId);
        allPropertyIds.push(propertyId);

        emit PropertyListed(propertyId, _host, _name, _pricePerNight);
        
        return propertyId;
    }

    function updateProperty(
        uint256 _propertyId,
        string memory _name,
        string memory _description,
        string memory _location,
        uint256 _pricePerNight,
        string memory _imageHash
    ) external propertyExists(_propertyId) onlyPropertyHost(_propertyId) {
        require(properties[_propertyId].isActive, "Property is not active");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(bytes(_location).length > 0, "Location cannot be empty");
        require(_pricePerNight > 0, "Price must be greater than 0");

        Property storage property = properties[_propertyId];
        property.name = _name;
        property.description = _description;
        property.location = _location;
        property.pricePerNight = _pricePerNight;
        property.imageHash = _imageHash;

        emit PropertyUpdated(_propertyId, msg.sender);
    }

    function deactivateProperty(uint256 _propertyId) 
        external 
        propertyExists(_propertyId) 
        onlyPropertyHost(_propertyId) 
    {
        require(properties[_propertyId].isActive, "Property already inactive");
        
        properties[_propertyId].isActive = false;
        
        emit PropertyDeactivated(_propertyId, msg.sender);
    }

    function reactivateProperty(uint256 _propertyId) 
        external 
        propertyExists(_propertyId) 
        onlyPropertyHost(_propertyId) 
    {
        require(!properties[_propertyId].isActive, "Property already active");
        
        properties[_propertyId].isActive = true;
        
        emit PropertyUpdated(_propertyId, msg.sender);
    }

    // View functions
    function getProperty(uint256 _propertyId) 
        external 
        view 
        propertyExists(_propertyId) 
        returns (Property memory) 
    {
        return properties[_propertyId];
    }

    function getHostProperties(address _host) external view returns (uint256[] memory) {
        return hostProperties[_host];
    }

    function getAllProperties() external view returns (uint256[] memory) {
        return allPropertyIds;
    }

    function getActiveProperties() external view returns (uint256[] memory) {
        uint256[] memory activeProperties = new uint256[](allPropertyIds.length);
        uint256 activeCount = 0;
        
        for (uint256 i = 0; i < allPropertyIds.length; i++) {
            if (properties[allPropertyIds[i]].isActive) {
                activeProperties[activeCount] = allPropertyIds[i];
                activeCount++;
            }
        }
        
        // Resize array to actual active count
        uint256[] memory result = new uint256[](activeCount);
        for (uint256 i = 0; i < activeCount; i++) {
            result[i] = activeProperties[i];
        }
        
        return result;
    }

    function getPropertiesCount() external view returns (uint256) {
        return allPropertyIds.length;
    }

    function getActivePropertiesCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < allPropertyIds.length; i++) {
            if (properties[allPropertyIds[i]].isActive) {
                count++;
            }
        }
        return count;
    }
}
