// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./WorldBNBStaking.sol";

contract DisputeResolution is ReentrancyGuard, Ownable {
    enum DisputeStatus { Pending, Resolved, Cancelled }
    enum DisputeType { GuestDispute, HostDispute }
    
    struct Dispute {
        uint256 id;
        uint256 bookingId;
        address initiator;
        address otherParty;
        DisputeType disputeType;
        string reason;
        string evidence;
        DisputeStatus status;
        address arbitrator;
        uint256 createdAt;
        uint256 resolvedAt;
        bool hostAtFault;
        uint256 slashedAmount;
    }
    
    // State variables
    uint256 public nextDisputeId = 1;
    mapping(uint256 => Dispute) public disputes;
    mapping(uint256 => uint256) public bookingToDispute; // bookingId => disputeId
    mapping(address => uint256[]) public userDisputes;
    
    WorldBNBStaking public stakingContract;
    
    // Events
    event DisputeCreated(uint256 indexed disputeId, uint256 indexed bookingId, address indexed initiator);
    event DisputeResolved(uint256 indexed disputeId, bool hostAtFault, uint256 slashedAmount);
    event DisputeCancelled(uint256 indexed disputeId);
    
    constructor(address _stakingContract) Ownable(msg.sender) {
        stakingContract = WorldBNBStaking(_stakingContract);
    }
    
    // Create dispute
    function createDispute(
        uint256 _bookingId,
        bool _isGuestDispute,
        string memory _reason,
        string memory _evidence
    ) external nonReentrant {
        require(bookingToDispute[_bookingId] == 0, "Dispute already exists for this booking");
        
        // Check if user is staked
        if (_isGuestDispute) {
            require(stakingContract.isUserStaked(msg.sender), "User must be staked to create dispute");
        } else {
            require(stakingContract.isUserStaked(msg.sender), "User must be staked to create dispute");
        }
        
        uint256 disputeId = nextDisputeId++;
        Dispute storage newDispute = disputes[disputeId];
        
        newDispute.id = disputeId;
        newDispute.bookingId = _bookingId;
        newDispute.initiator = msg.sender;
        newDispute.disputeType = _isGuestDispute ? DisputeType.GuestDispute : DisputeType.HostDispute;
        newDispute.reason = _reason;
        newDispute.evidence = _evidence;
        newDispute.status = DisputeStatus.Pending;
        newDispute.createdAt = block.timestamp;
        
        // Set other party (this would need to be determined from booking data)
        // For now, we'll set it as the platform for arbitration
        newDispute.otherParty = address(this);
        
        bookingToDispute[_bookingId] = disputeId;
        userDisputes[msg.sender].push(disputeId);
        
        emit DisputeCreated(disputeId, _bookingId, msg.sender);
    }
    
    // Resolve dispute (only owner/arbitrator)
    function resolveDispute(
        uint256 _disputeId,
        bool _hostAtFault,
        string memory _resolution
    ) external onlyOwner {
        Dispute storage dispute = disputes[_disputeId];
        require(dispute.status == DisputeStatus.Pending, "Dispute not pending");
        
        dispute.status = DisputeStatus.Resolved;
        dispute.hostAtFault = _hostAtFault;
        dispute.resolvedAt = block.timestamp;
        dispute.arbitrator = msg.sender;
        
        // Determine who gets slashed and who gets reimbursed
        address partyToSlash;
        address partyToReimburse;
        uint256 slashAmount = 0.1 ether; // Full stake amount
        
        if (_hostAtFault) {
            // Host is at fault, slash host stake, reimburse guest
            partyToSlash = dispute.otherParty; // Host address
            partyToReimburse = dispute.initiator; // Guest address
            stakingContract.slashStake(partyToSlash, slashAmount, _resolution);
        } else {
            // Guest is at fault, slash guest stake, reimburse host
            partyToSlash = dispute.initiator; // Guest address
            partyToReimburse = dispute.otherParty; // Host address
            stakingContract.slashStake(partyToSlash, slashAmount, _resolution);
        }
        
        // Reimburse the victim
        payable(partyToReimburse).transfer(slashAmount);
        
        dispute.slashedAmount = slashAmount;
        
        emit DisputeResolved(_disputeId, _hostAtFault, slashAmount);
    }
    
    // Cancel dispute
    function cancelDispute(uint256 _disputeId) external {
        Dispute storage dispute = disputes[_disputeId];
        require(dispute.initiator == msg.sender, "Only initiator can cancel");
        require(dispute.status == DisputeStatus.Pending, "Dispute not pending");
        
        dispute.status = DisputeStatus.Cancelled;
        emit DisputeCancelled(_disputeId);
    }
    
    // View functions
    function getDispute(uint256 _disputeId) external view returns (Dispute memory) {
        return disputes[_disputeId];
    }
    
    function getBookingDispute(uint256 _bookingId) external view returns (uint256) {
        return bookingToDispute[_bookingId];
    }
    
    function getUserDisputes(address _user) external view returns (uint256[] memory) {
        return userDisputes[_user];
    }
    
    function getDisputesCount() external view returns (uint256) {
        return nextDisputeId - 1;
    }
    
    // Check if user can create dispute
    function canCreateDispute(address _user, bool _isGuest) external view returns (bool) {
        if (_isGuest) {
            return stakingContract.isUserStaked(_user);
        } else {
            return stakingContract.isUserStaked(_user);
        }
    }
}
