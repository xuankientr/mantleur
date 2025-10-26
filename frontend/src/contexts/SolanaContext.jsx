// Prevent wallet extension conflicts
if (typeof window !== 'undefined') {
  // Log detected wallets for debugging
  console.log('Wallet extensions detected:', {
    ethereum: !!window.ethereum,
    solana: !!window.solana,
    tronWeb: !!window.tronWeb
  });
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL, Transaction, SystemProgram, TransactionInstruction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import { SOLANA_CONFIG, INSTRUCTIONS } from '../config/solana';
import { useAuth } from './AuthContext';

const SolanaContext = createContext();

export const useSolana = () => {
  const context = useContext(SolanaContext);
  if (!context) {
    throw new Error('useSolana must be used within a SolanaProvider');
  }
  return context;
};

export const SolanaProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [solBalance, setSolBalance] = useState('0.00');
  const [usdcBalance, setUsdcBalance] = useState('0.00');
  const [isLoading, setIsLoading] = useState(false);
  const [connection, setConnection] = useState(null);
  const { user, updateUser } = useAuth();

  // Solana configuration
  const PROGRAM_ID = new PublicKey(SOLANA_CONFIG.PROGRAM_ID);
  const USDC_MINT = new PublicKey(SOLANA_CONFIG.USDC_MINT);

  useEffect(() => {
    if (connection) {
      updateSolBalance();
    }
  }, [connection, account]);

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      
      // Kiểm tra window object
      if (typeof window === 'undefined') {
        throw new Error('Window object not available');
      }
      
      // Log wallet extensions for debugging
      console.log('Wallet extensions detected:', {
        ethereum: !!window.ethereum,
        solana: !!window.solana,
        tronWeb: !!window.tronWeb
      });
      
      // Check if Phantom wallet is installed
      if (!window.solana) {
        // Fallback: show mock wallet for testing
        console.warn('Phantom wallet not found. Using mock wallet for testing');
        setAccount('MockWallet123456789');
        setIsConnected(true);
        setSolBalance('10.00');
        setUsdcBalance('100.00');
        setIsLoading(false);
        return;
      }
      
      if (!window.solana.isPhantom) {
        throw new Error('Phantom wallet not detected. Please make sure Phantom wallet is installed and enabled');
      }

      // Connect to Phantom wallet
      const response = await window.solana.connect();
      const publicKey = new PublicKey(response.publicKey.toString());
      
      setAccount(publicKey.toString());
      setIsConnected(true);
      
      // Create Solana connection
      const solanaConnection = new Connection(SOLANA_CONFIG.RPC_URL, 'confirmed');
      setConnection(solanaConnection);
      
      console.log('✅ Connected to Solana wallet:', publicKey.toString());
      
      // Update balances
      await updateSolBalance();
      await updateUSDCBalance();
      
    } catch (error) {
      console.error('❌ Error connecting to Solana wallet:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAccount(null);
    setSolBalance('0.00');
    setUsdcBalance('0.00');
    setConnection(null);
    console.log('🔌 Disconnected from Solana wallet');
  };

  const updateSolBalance = async () => {
    if (!connection || !account) return;
    
    try {
      const publicKey = new PublicKey(account);
      const balance = await connection.getBalance(publicKey);
      const solBalance = balance / LAMPORTS_PER_SOL;
      setSolBalance(solBalance.toFixed(4));
      console.log('💰 SOL Balance:', solBalance.toFixed(4));
    } catch (error) {
      console.error('❌ Error fetching SOL balance:', error);
    }
  };

  const updateUSDCBalance = async () => {
    if (!connection || !account) {
      setUsdcBalance('0.00');
      return;
    }
    
    try {
      // For now, simulate USDC balance
      // In a real implementation, you would fetch SPL token balance
      setUsdcBalance('10.00');
      console.log('💰 USDC Balance: 10.00 (simulated)');
    } catch (error) {
      console.error('❌ Error fetching USDC balance:', error);
      setUsdcBalance('0.00');
    }
  };

  const topUpCoins = async (usdcAmount) => {
    try {
      setIsLoading(true);
      console.log('💳 Topping up coins with USDC:', usdcAmount);
      
      if (!connection || !account) {
        throw new Error('Wallet not connected');
      }

      // For now, simulate the transaction
      // In production, you would implement real Solana transaction
      const userPublicKey = new PublicKey(account);
      const usdcAmountLamports = Math.floor(parseFloat(usdcAmount) * Math.pow(10, SOLANA_CONFIG.USDC_DECIMALS));

      console.log('🔄 Simulating USDC deposit...', {
        usdcAmount,
        usdcAmountLamports,
        userPublicKey: userPublicKey.toString()
      });

      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate mock transaction hash
      const mockTxHash = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Calculate coins received
      const actualCoins = parseInt(usdcAmount) * SOLANA_CONFIG.EXCHANGE_RATE;

      console.log('✅ Mock transaction successful:', {
        txHash: mockTxHash,
        coinsReceived: actualCoins.toString()
      });

      // Update database
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/add-coins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: actualCoins,
          txHash: mockTxHash
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${errorText}`);
      }

      const responseData = await response.json();
      console.log('✅ Database updated:', responseData);

      // Update UI
      updateUser({ coinBalance: responseData.newBalance });

      // Update USDC balance
      await updateUSDCBalance();

      return {
        txHash: mockTxHash,
        coinsReceived: actualCoins.toString()
      };

    } catch (error) {
      console.error('❌ Error topping up coins:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const withdrawUSDC = async (coinsAmount) => {
    try {
      setIsLoading(true);
      console.log('💸 Withdrawing USDC for coins:', coinsAmount);
      
      if (!connection || !account) {
        throw new Error('Wallet not connected');
      }
      
      const userPublicKey = new PublicKey(account);
      const coins = parseInt(coinsAmount);
      
      // For now, simulate the transaction
      // In production, you would implement real Solana transaction
      console.log('🔄 Simulating USDC withdrawal...', {
        coinsAmount,
        userPublicKey: userPublicKey.toString()
      });

      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate mock transaction hash
      const mockTxHash = `mock_withdraw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Calculate USDC received
      const usdcAmount = coins / SOLANA_CONFIG.EXCHANGE_RATE;
      
      console.log('✅ Mock withdrawal successful:', {
        txHash: mockTxHash,
        usdcReceived: usdcAmount.toString()
      });
      
      // Update database
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/deduct-coins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: coins,
          txHash: mockTxHash
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log('✅ Database updated:', responseData);
      
      // Update UI
      updateUser({ coinBalance: responseData.newBalance });
      
      // Update USDC balance
      await updateUSDCBalance();
      
      return {
        txHash: mockTxHash,
        usdcReceived: usdcAmount.toString()
      };
      
    } catch (error) {
      console.error('❌ Error withdrawing USDC:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const syncCoinsFromContract = async () => {
    try {
      console.log('🔄 Syncing coins from Solana contract...');
      
      // For Solana, we would check SPL token balance
      // For now, simulate sync
      const mockCoinBalance = 0;
      
      if (mockCoinBalance > 0) {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/add-coins`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            amount: mockCoinBalance,
            txHash: 'sync-from-solana'
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Error: ${errorText}`);
        }
        
        const responseData = await response.json();
        console.log('✅ Coins synced from Solana:', responseData);
        
        updateUser({ coinBalance: responseData.newBalance });
        alert('✅ Coins synced successfully from Solana!');
      } else {
        console.log('ℹ️ No coins to sync from Solana contract');
        alert('ℹ️ No coins found in Solana contract');
      }
      
    } catch (error) {
      console.error('❌ Error syncing coins from Solana:', error);
      alert('❌ Error syncing coins: ' + error.message);
    }
  };

  const value = {
    isConnected,
    account,
    solBalance,
    usdcBalance,
    connectWallet,
    disconnectWallet,
    topUpCoins,
    withdrawUSDC,
    updateUSDCBalance,
    syncCoinsFromContract,
    connection,
    isLoading
  };

  return (
    <SolanaContext.Provider value={value}>
      {children}
    </SolanaContext.Provider>
  );
};