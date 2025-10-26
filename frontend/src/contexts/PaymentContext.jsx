import React, { createContext, useContext, useState } from 'react';

const PaymentContext = createContext();

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

export const PaymentProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);

  // VNPay configuration
  const VNPAY_CONFIG = {
    vnp_TmnCode: 'YOUR_TMN_CODE', // Your VNPay terminal code
    vnp_HashSecret: 'YOUR_HASH_SECRET', // Your VNPay hash secret
    vnp_Url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html', // VNPay sandbox URL
    vnp_ReturnUrl: 'http://localhost:5173/payment/callback', // Return URL after payment
  };

  // Generate VNPay payment URL
  const generatePaymentUrl = async (amount, orderInfo) => {
    try {
      setIsLoading(true);
      
      // Create order data
      const orderData = {
        vnp_Amount: amount * 100, // Convert to VND (multiply by 100)
        vnp_Command: 'pay',
        vnp_CreateDate: new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, ''),
        vnp_CurrCode: 'VND',
        vnp_IpAddr: '127.0.0.1',
        vnp_Locale: 'vn',
        vnp_OrderInfo: orderInfo,
        vnp_OrderType: 'other',
        vnp_ReturnUrl: VNPAY_CONFIG.vnp_ReturnUrl,
        vnp_TmnCode: VNPAY_CONFIG.vnp_TmnCode,
        vnp_TxnRef: Date.now().toString(),
        vnp_Version: '2.1.0'
      };

      // Sort parameters for hash
      const sortedParams = Object.keys(orderData)
        .sort()
        .map(key => `${key}=${orderData[key]}`)
        .join('&');

      // Create secure hash
      const crypto = require('crypto');
      const hash = crypto
        .createHmac('sha512', VNPAY_CONFIG.vnp_HashSecret)
        .update(sortedParams)
        .digest('hex');

      // Add hash to parameters
      const paymentParams = {
        ...orderData,
        vnp_SecureHash: hash
      };

      // Create payment URL
      const paymentUrl = `${VNPAY_CONFIG.vnp_Url}?${Object.keys(paymentParams)
        .map(key => `${key}=${encodeURIComponent(paymentParams[key])}`)
        .join('&')}`;

      setPaymentUrl(paymentUrl);
      return paymentUrl;

    } catch (error) {
      console.error('Error generating payment URL:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Top up coins with VNPay
  const topUpCoins = async (amount) => {
    try {
      setIsLoading(true);
      console.log('Topping up coins with VNPay:', amount);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Call backend API to create payment
      const response = await fetch('http://localhost:5000/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseInt(amount) // Amount in VND
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${errorText}`);
      }

      const data = await response.json();
      console.log('Payment URL received:', data);

      // Calculate coins amount (100 VND = 1 coin)
      const coinsAmount = Math.floor(parseInt(amount) / 100);

      // Redirect to VNPay
      window.location.href = data.paymentUrl;

      return {
        paymentUrl: data.paymentUrl,
        orderId: data.orderId,
        coinsAmount: coinsAmount,
        vndAmount: parseInt(amount)
      };

    } catch (error) {
      console.error('Error topping up coins:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Withdraw USDC (manual admin approval)
  const withdrawUSDC = async (coinsAmount, bankInfo = {}) => {
    try {
      setIsLoading(true);
      console.log('Requesting withdrawal:', coinsAmount, 'Bank info:', bankInfo);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Call backend API to request withdrawal
      const response = await fetch('http://localhost:5000/api/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          coinAmount: parseInt(coinsAmount),
          method: 'bank_transfer',
          accountInfo: bankInfo.accountName || 'User withdrawal request',
          bankAccount: bankInfo.bankAccount || '',
          bankName: bankInfo.bankName || ''
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${errorText}`);
      }

      const data = await response.json();
      console.log('Withdrawal request created:', data);

      // Calculate VND amount (1 coin = 100 VND)
      const vndAmount = parseInt(coinsAmount) * 100;

      return {
        requestId: data.id,
        vndAmount: vndAmount,
        message: 'Withdrawal request submitted successfully. Admin will process it.'
      };

    } catch (error) {
      console.error('Error withdrawing USDC:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle payment callback
  const handlePaymentCallback = async (callbackData) => {
    try {
      console.log('Payment callback received:', callbackData);
      
      // Verify payment status
      if (callbackData.vnp_ResponseCode === '00') {
        // Payment successful
        console.log('Payment successful!');
        
        // Update user balance in database
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch('http://localhost:5000/api/users/add-coins', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              amount: parseInt(callbackData.vnp_Amount) / 100 / 25000 * 100, // Convert back to coins
              txHash: callbackData.vnp_TxnRef
            })
          });

          if (response.ok) {
            const result = await response.json();
            console.log('Database updated:', result);
            return result;
          }
        }
      } else {
        // Payment failed
        console.error('Payment failed:', callbackData.vnp_ResponseCode);
        throw new Error('Payment failed');
      }
    } catch (error) {
      console.error('Error handling payment callback:', error);
      throw error;
    }
  };

  const value = {
    isLoading,
    paymentUrl,
    topUpCoins,
    withdrawUSDC,
    handlePaymentCallback
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};
