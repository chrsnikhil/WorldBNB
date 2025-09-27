// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleStaking {
    mapping(address => bool) public isStaked;
    mapping(address => uint256) public stakeAmount;
    uint256 public constant REQUIRED_STAKE = 0.1 ether; // 0.1 WLD
    
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    
    function stake() external payable {
        require(msg.value == REQUIRED_STAKE, "Must stake exactly 0.1 WLD");
        require(!isStaked[msg.sender], "Already staked");
        
        isStaked[msg.sender] = true;
        stakeAmount[msg.sender] = msg.value;
        
        emit Staked(msg.sender, msg.value);
    }
    
    function unstake() external {
        require(isStaked[msg.sender], "Not staked");
        
        uint256 amount = stakeAmount[msg.sender];
        isStaked[msg.sender] = false;
        stakeAmount[msg.sender] = 0;
        
        payable(msg.sender).transfer(amount);
        
        emit Unstaked(msg.sender, amount);
    }
    
    function checkStakeStatus(address user) external view returns (bool) {
        return isStaked[user];
    }
}
