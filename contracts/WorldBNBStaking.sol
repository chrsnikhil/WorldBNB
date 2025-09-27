// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WorldBNBStaking is ReentrancyGuard, Ownable {
    // Staking requirements
    uint256 public requiredStake = 0.1 ether; // 0.1 WLD
    
    // User stakes
    mapping(address => uint256) public userStakes;
    mapping(address => bool) public isStaked;
    
    // Total staked amounts
    uint256 public totalStakes;
    
    // Slashing
    mapping(address => uint256) public slashedAmounts;
    uint256 public totalSlashed;
    
    // Events
    event UserStaked(address indexed user, uint256 amount);
    event UserUnstaked(address indexed user, uint256 amount);
    event StakeSlashed(address indexed user, uint256 amount, string reason);
    
    constructor() Ownable(msg.sender) {}
    
    // Single staking function
    function stake() external payable nonReentrant {
        require(msg.value >= requiredStake, "Insufficient stake amount");
        require(!isStaked[msg.sender], "Already staked");
        
        userStakes[msg.sender] = msg.value;
        isStaked[msg.sender] = true;
        totalStakes += msg.value;
        
        emit UserStaked(msg.sender, msg.value);
    }
    
    // Unstaking (only if no active disputes)
    function unstake() external nonReentrant {
        require(isStaked[msg.sender], "Not staked");
        require(userStakes[msg.sender] > 0, "No stake to withdraw");
        
        uint256 amount = userStakes[msg.sender];
        userStakes[msg.sender] = 0;
        isStaked[msg.sender] = false;
        totalStakes -= amount;
        
        payable(msg.sender).transfer(amount);
        emit UserUnstaked(msg.sender, amount);
    }
    
    // Slashing functions (only owner or dispute contract)
    function slashStake(address user, uint256 amount, string memory reason) external onlyOwner {
        require(isStaked[user], "User not staked");
        require(userStakes[user] >= amount, "Insufficient stake to slash");
        
        userStakes[user] -= amount;
        slashedAmounts[user] += amount;
        totalSlashed += amount;
        
        // If stake becomes 0, remove staking status
        if (userStakes[user] == 0) {
            isStaked[user] = false;
        }
        
        emit StakeSlashed(user, amount, reason);
    }
    
    // View functions
    function getUserStake(address user) external view returns (uint256) {
        return userStakes[user];
    }
    
    function isUserStaked(address user) external view returns (bool) {
        return isStaked[user];
    }
    
    // Owner functions
    function setRequiredStake(uint256 _stake) external onlyOwner {
        requiredStake = _stake;
    }
    
    function withdrawSlashedFunds() external onlyOwner {
        require(totalSlashed > 0, "No slashed funds to withdraw");
        uint256 amount = totalSlashed;
        totalSlashed = 0;
        payable(owner()).transfer(amount);
    }
}
