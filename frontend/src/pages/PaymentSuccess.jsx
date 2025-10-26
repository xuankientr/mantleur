import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [paymentInfo, setPaymentInfo] = useState(null);

  const orderId = searchParams.get('orderId');
  const resultCode = searchParams.get('resultCode');
  const amount = searchParams.get('amount');

  useEffect(() => {
    // Check payment status based on URL parameters
    const checkPaymentStatus = () => {
      // If we have orderId and amount, it means payment was successful
      if (orderId && amount) {
        setStatus('success');
        setPaymentInfo({
          orderId,
          amount: parseInt(amount),
          coinAmount: Math.floor(parseInt(amount) / 100) // Convert VND to coins (100 VND = 1 coin)
        });
      } else if (resultCode === '0') {
        // Fallback for resultCode check
        setStatus('success');
        setPaymentInfo({
          orderId,
          amount: amount ? parseInt(amount) : 0,
          coinAmount: amount ? Math.floor(parseInt(amount) / 100) : 0
        });
      } else {
        setStatus('failed');
      }
    };

    // Delay để simulate checking
    setTimeout(checkPaymentStatus, 2000);
  }, [resultCode, orderId, amount]);

  const handleBackToPayment = () => {
    navigate('/payment');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-center mb-4">
            {status === 'loading' && (
              <Clock className="w-16 h-16 text-blue-500 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="w-16 h-16 text-green-500" />
            )}
            {status === 'failed' && (
              <XCircle className="w-16 h-16 text-red-500" />
            )}
          </div>
          
          {status === 'loading' && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Đang xử lý thanh toán
              </h1>
              <p className="text-gray-600 text-center">
                Vui lòng chờ trong giây lát...
              </p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Thanh toán thành công!
              </h1>
              <p className="text-gray-600 text-center">
                Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi
              </p>
            </>
          )}
          
          {status === 'failed' && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Thanh toán thất bại
              </h1>
              <p className="text-gray-600 text-center">
                Giao dịch không thể hoàn tất. Vui lòng thử lại.
              </p>
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {status === 'success' && paymentInfo && (
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Chi tiết giao dịch</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Mã giao dịch:</span>
                    <span className="font-mono text-green-800">{paymentInfo.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Số tiền:</span>
                    <span className="font-semibold text-green-800">
                      {paymentInfo.amount.toLocaleString()} VNĐ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Coin nhận được:</span>
                    <span className="font-semibold text-blue-600">
                      +{paymentInfo.coinAmount.toLocaleString()} coin
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Phí MoMo</h4>
                <div className="text-sm text-blue-700">
                  <p>Phí cố định: 3,000 VNĐ</p>
                  <p>Phí phần trăm: 1.5%</p>
                  <p className="font-semibold">
                    Tổng phí: {Math.round(paymentInfo.amount * 0.015 + 3000).toLocaleString()} VNĐ
                  </p>
                </div>
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">Lý do thất bại</h3>
              <div className="text-sm text-red-700">
                <p>• Số dư tài khoản không đủ</p>
                <p>• Thông tin thẻ không chính xác</p>
                <p>• Giao dịch bị hủy bởi người dùng</p>
                <p>• Lỗi hệ thống tạm thời</p>
              </div>
            </div>
          )}

          {status === 'loading' && (
            <div className="text-center py-8">
              <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang kiểm tra trạng thái giao dịch...</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex space-x-3">
            <button
              onClick={handleBackToPayment}
              className="flex-1 btn btn-outline flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại thanh toán
            </button>
            <button
              onClick={handleBackToHome}
              className="flex-1 btn btn-primary"
            >
              Về trang chủ
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <p className="text-xs text-gray-500 text-center">
            Nếu có vấn đề gì, vui lòng liên hệ hỗ trợ khách hàng
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
