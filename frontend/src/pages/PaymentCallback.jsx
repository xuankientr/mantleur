import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePayment } from '../contexts/PaymentContext';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handlePaymentCallback } = usePayment();
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Get payment data from URL parameters
        const paymentData = {
          vnp_ResponseCode: searchParams.get('vnp_ResponseCode'),
          vnp_Amount: searchParams.get('vnp_Amount'),
          vnp_TxnRef: searchParams.get('vnp_TxnRef'),
          vnp_OrderInfo: searchParams.get('vnp_OrderInfo'),
          vnp_TransactionNo: searchParams.get('vnp_TransactionNo'),
          vnp_BankCode: searchParams.get('vnp_BankCode'),
          vnp_PayDate: searchParams.get('vnp_PayDate'),
          vnp_SecureHash: searchParams.get('vnp_SecureHash')
        };

        console.log('Payment callback data:', paymentData);

        // Handle payment callback
        await handlePaymentCallback(paymentData);
        
        setStatus('success');
        
        // Redirect to profile after 3 seconds
        setTimeout(() => {
          navigate('/profile');
        }, 3000);

      } catch (error) {
        console.error('Payment processing error:', error);
        setStatus('error');
      }
    };

    processPayment();
  }, [searchParams, handlePaymentCallback, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        {status === 'processing' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Processing Payment...
            </h2>
            <p className="text-gray-600">
              Please wait while we process your payment.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-4">
              Your payment has been processed successfully.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to profile page...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">✗</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Payment Failed
            </h2>
            <p className="text-gray-600 mb-4">
              There was an error processing your payment.
            </p>
            <button
              onClick={() => navigate('/profile')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Back to Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;


