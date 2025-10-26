// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PaymentProcessor is ReentrancyGuard {
    IERC20 public immutable usdt;

    // 1 USDT = 100 Coins
    uint256 public constant EXCHANGE_RATE = 100;

    mapping(address => uint256) private userCoinBalance;

    event Deposit(address indexed user, uint256 usdtAmount, uint256 coinAmount);
    event Withdraw(address indexed user, uint256 coinAmount, uint256 usdtAmount);

    constructor(address usdtAddress) {
        require(usdtAddress != address(0), "Invalid USDT address");
        usdt = IERC20(usdtAddress);
    }

    function depositUSDT(uint256 usdtAmount) external nonReentrant {
        require(usdtAmount > 0, "Amount must be > 0");
        // Transfer USDT from user to this contract
        require(usdt.transferFrom(msg.sender, address(this), usdtAmount), "USDT transfer failed");
        uint256 coins = usdtAmount * EXCHANGE_RATE;
        userCoinBalance[msg.sender] += coins;
        emit Deposit(msg.sender, usdtAmount, coins);
    }

    function withdrawUSDT(uint256 coinAmount) external nonReentrant {
        require(coinAmount > 0, "Amount must be > 0");
        require(userCoinBalance[msg.sender] >= coinAmount, "Insufficient coins");
        // Convert raw coins to USDC units: rawCoins / EXCHANGE_RATE = USDC units
        uint256 usdtAmount = coinAmount / EXCHANGE_RATE;
        require(usdtAmount > 0, "Too few coins for 1 unit of USDT");
        userCoinBalance[msg.sender] -= coinAmount;
        require(usdt.transfer(msg.sender, usdtAmount), "USDT transfer failed");
        emit Withdraw(msg.sender, coinAmount, usdtAmount);
    }

    function getExchangeRate() external pure returns (uint256) {
        return EXCHANGE_RATE;
    }

    function getUserCoinBalance(address user) external view returns (uint256) {
        return userCoinBalance[user];
    }

    function getContractUSDTBalance() external view returns (uint256) {
        return usdt.balanceOf(address(this));
    }
}

