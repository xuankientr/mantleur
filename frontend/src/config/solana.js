// Solana Program Configuration
export const SOLANA_CONFIG = {
  // Program ID (deployed on Solana Devnet)
  PROGRAM_ID: 'FP49gbXjQE5LwaCoGQti5wyJ7W1oRZK88WeUha8gHJ3h',
  
  // USDC Mint trên Solana Devnet
  USDC_MINT: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  
  // RPC URL
  RPC_URL: 'https://api.devnet.solana.com',
  
  // Exchange rate: 1 USDC = 100 Coins
  EXCHANGE_RATE: 100,
  
  // USDC decimals
  USDC_DECIMALS: 6,
};

// Program instruction discriminators
export const INSTRUCTIONS = {
  INITIALIZE: 0,
  DEPOSIT_USDC: 1,
  WITHDRAW_USDC: 2,
};
