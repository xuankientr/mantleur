import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { CreditCard, CheckCircle, XCircle, Clock, Smartphone, Building2 } from 'lucide-react';

const MockPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, success, failed
  
  const paymentId = searchParams.get('paymentId');
  const amount = searchParams.get('amount');
  const method = searchParams.get('method');

  const paymentMethods = {
    momo: { name: 'MoMo', icon: Smartphone, color: 'bg-pink-500' },
    zalopay: { name: 'ZaloPay', icon: Smartphone, color: 'bg-blue-500' },
    vnpay: { name: 'VNPay', icon: CreditCard, color: 'bg-green-500' },
    bank_transfer: { name: 'Chuyển khoản', icon: Building2, color: 'bg-gray-500' }
  };

  const currentMethod = paymentMethods[method] || paymentMethods.momo;

  const handlePaymentSuccess = async () => {
    setLoading(true);
    try {
      const response = await api.post('/mock-payment/mock-payment-success', {
        paymentId
      });
      
      if (response.data.message === 'Payment completed successfully') {
        setPaymentStatus('success');
        // Redirect to payment page after 3 seconds
        setTimeout(() => {
          navigate('/payment');
        }, 3000);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentFailure = async () => {
    setLoading(true);
    try {
      const response = await api.post('/mock-payment/mock-payment-failure', {
        paymentId
      });
      
      if (response.data.message === 'Payment failed') {
        setPaymentStatus('failed');
        // Redirect to payment page after 3 seconds
        setTimeout(() => {
          navigate('/payment');
        }, 3000);
      }
    } catch (error) {
      console.error('Error processing payment failure:', error);
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/payment');
  };

  if (!paymentId || !amount || !method) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Thông tin thanh toán không hợp lệ</h2>
          <p className="text-gray-600 mb-4">Vui lòng thử lại từ trang thanh toán</p>
          <button
            onClick={() => navigate('/payment')}
            className="btn btn-primary"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-center mb-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${currentMethod.color}`}>
              <currentMethod.icon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Thanh toán {currentMethod.name}
          </h1>
          <p className="text-gray-600 text-center">
            Đây là trang thanh toán mô phỏng để test
          </p>
        </div>

        {/* Payment Details */}
        <div className="p-6">
          {paymentStatus === 'pending' && (
            <>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-semibold text-gray-900">
                    {parseInt(amount).toLocaleString()} VNĐ
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Coin nhận được:</span>
                  <span className="font-semibold text-blue-600">
                    +{parseInt(amount).toLocaleString()} coin
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Phương thức:</span>
                  <span className="font-semibold text-gray-900">{currentMethod.name}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handlePaymentSuccess}
                  disabled={loading}
                  className="w-full btn btn-success flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner w-4 h-4 mr-2"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Thanh toán thành công
                    </>
                  )}
                </button>

                <button
                  onClick={handlePaymentFailure}
                  disabled={loading}
                  className="w-full btn btn-danger flex items-center justify-center"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Thanh toán thất bại
                </button>

                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="w-full btn btn-secondary"
                >
                  Hủy thanh toán
                </button>
              </div>
            </>
          )}

          {paymentStatus === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Thanh toán thành công!
              </h2>
              <p className="text-gray-600 mb-4">
                Bạn đã nhận được {parseInt(amount).toLocaleString()} coin
              </p>
              <p className="text-sm text-gray-500">
                Đang chuyển hướng về trang thanh toán...
              </p>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="text-center py-8">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Thanh toán thất bại
              </h2>
              <p className="text-gray-600 mb-4">
                Giao dịch không thể hoàn tất. Vui lòng thử lại.
              </p>
              <p className="text-sm text-gray-500">
                Đang chuyển hướng về trang thanh toán...
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <p className="text-xs text-gray-500 text-center">
            Đây là trang thanh toán mô phỏng để test tính năng. 
            Trong thực tế sẽ tích hợp với payment gateway thực.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MockPayment;
