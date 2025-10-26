# Blockchain Payment Integration

## Overview
Đã tích hợp blockchain payment system với Polygon Mumbai testnet và USDT.

## Features Implemented

### Frontend
- ✅ **Web3Context** - Wallet connection và blockchain state management
- ✅ **PaymentModal** - UI cho top-up và withdraw
- ✅ **MetaMask Integration** - Connect wallet, check balance
- ✅ **Real-time Updates** - Balance updates qua Socket.IO

### Backend
- ✅ **Payment Controller** - API endpoints cho coin management
- ✅ **Database Schema** - Updated Payment model
- ✅ **Socket Integration** - Real-time balance updates

### Smart Contract
- ✅ **PaymentProcessor.sol** - USDT ↔ Coins conversion
- ✅ **Exchange Rate** - 1 USDT = 100 Coins
- ✅ **Security** - ReentrancyGuard, Ownable
- ✅ **Events** - Deposit, Withdraw, Transfer

## Setup Instructions

### 1. Install Dependencies
```bash
cd contracts
npm install
```

### 2. Configure Environment
```bash
cp env.example .env
# Edit .env with your private key and API keys
```

### 3. Deploy Smart Contract
```bash
npm run compile
npm run deploy
```

### 4. Update Frontend
Update `PAYMENT_CONTRACT_ADDRESS` in `frontend/src/contexts/Web3Context.jsx` với deployed contract address.

## Usage Flow

### For Viewers (Top-up)
1. Connect MetaMask wallet
2. Click "Nạp/Rút coin" button
3. Enter USDT amount
4. Approve USDT spending
5. Receive coins instantly

### For Streamers (Withdraw)
1. Connect MetaMask wallet  
2. Click "Nạp/Rút coin" button
3. Enter coins amount
4. Receive USDT to wallet

### Donation Flow (Unchanged)
- Viewers donate coins to streamers
- Real-time notifications
- Balance updates

## Testnet Information

### Polygon Mumbai
- **Network ID**: 80001
- **RPC URL**: https://rpc-mumbai.maticvigil.com
- **USDT Address**: 0x3813e82e6f7098b9583FC0F33a962D02018B6803
- **Faucet**: https://faucet.polygon.technology/

### Getting Test USDT
1. Get MATIC from faucet
2. Swap MATIC → USDT on QuickSwap
3. Use USDT to top-up coins

## Security Features
- ✅ ReentrancyGuard protection
- ✅ Owner-only emergency functions
- ✅ Input validation
- ✅ Balance checks
- ✅ Allowance verification

## Next Steps
1. Deploy contract to Mumbai
2. Update contract address in frontend
3. Test complete flow
4. Deploy to mainnet (Polygon) when ready








