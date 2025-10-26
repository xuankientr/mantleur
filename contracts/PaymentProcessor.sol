// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PaymentProcessor is ReentrancyGuard, Ownable {
    IERC20 public usdcToken;
    
    // Exchange rate: 1 USDC = 100 coins
    uint256 public constant EXCHANGE_RATE = 100;
    
    // Events
    event CoinsPurchased(address indexed user, uint256 usdcAmount, uint256 coinsReceived);
    event CoinsWithdrawn(address indexed user, uint256 coinsAmount, uint256 usdcReceived);
    
    constructor(address _usdcToken) {
        usdcToken = IERC20(_usdcToken);
    }
    
    /**
     * @dev Purchase coins with USDC
     * @param usdcAmount Amount of USDC to spend
     */
    function purchaseCoins(uint256 usdcAmount) external nonReentrant {
        require(usdcAmount > 0, "USDC amount must be greater than 0");
        
        // Calculate coins to receive
        uint256 coinsToReceive = usdcAmount * EXCHANGE_RATE;
        
        // Transfer USDC from user to contract
        require(
            usdcToken.transferFrom(msg.sender, address(this), usdcAmount),
            "USDC transfer failed"
        );
        
        emit CoinsPurchased(msg.sender, usdcAmount, coinsToReceive);
    }
    
    /**
     * @dev Withdraw USDC by burning coins
     * @param coinsAmount Amount of coins to burn
     */
    function withdrawUSDC(uint256 coinsAmount) external nonReentrant {
        require(coinsAmount > 0, "Coins amount must be greater than 0");
        
        // Calculate USDC to receive
        uint256 usdcToReceive = coinsAmount / EXCHANGE_RATE;
        require(usdcToReceive > 0, "USDC amount too small");
        
        // Check contract has enough USDC
        require(
            usdcToken.balanceOf(address(this)) >= usdcToReceive,
            "Insufficient USDC in contract"
        );
        
        // Transfer USDC to user
        require(
            usdcToken.transfer(msg.sender, usdcToReceive),
            "USDC transfer failed"
        );
        
        emit CoinsWithdrawn(msg.sender, coinsAmount, usdcToReceive);
    }
    
    /**
     * @dev Get contract USDC balance
     */
    function getUSDCBalance() external view returns (uint256) {
        return usdcToken.balanceOf(address(this));
    }
    
    /**
     * @dev Emergency withdraw USDC (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = usdcToken.balanceOf(address(this));
        require(balance > 0, "No USDC to withdraw");
        
        usdcToken.transfer(owner(), balance);
    }
}


