import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { 
  CreditCard, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  History, 
  Plus, 
  Minus,
  Banknote,
  Smartphone,
  Building2
} from 'lucide-react';

const Payment = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('deposit');
  const [payments, setPayments] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);

  // Deposit form state
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState('momo');

  // Withdraw form state
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bank_transfer');
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const paymentMethods = [
    { id: 'momo', name: 'MoMo', icon: Smartphone, color: 'bg-pink-500' }
  ];

  const withdrawMethods = [
    { id: 'bank_transfer', name: 'Chuyển khoản ngân hàng', icon: Building2 },
    { id: 'momo', name: 'MoMo', icon: Smartphone },
    { id: 'zalopay', name: 'ZaloPay', icon: Smartphone }
  ];

  useEffect(() => {
    if (activeTab === 'deposit') {
      fetchPayments();
    } else {
      fetchWithdrawals();
    }
  }, [activeTab]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payment/payments');
      setPayments(response.data.payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payment/withdrawals');
      setWithdrawals(response.data.withdrawals);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositAmount || depositAmount < 10000) {
      alert('Số tiền tối thiểu là 10,000 VNĐ');
      return;
    }

    try {
      const response = await api.post('/payment/payments', {
        amount: parseInt(depositAmount),
        method: depositMethod
      });

      // Redirect to payment URL
      window.open(response.data.paymentUrl, '_blank');
      setShowDepositForm(false);
      setDepositAmount('');
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Tạo giao dịch nạp tiền thất bại');
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || withdrawAmount < 50000) {
      alert('Số tiền tối thiểu rút là 50,000 VNĐ');
      return;
    }

    if (user.coinBalance < withdrawAmount) {
      alert('Số dư coin không đủ');
      return;
    }

    try {
      await api.post('/payment/withdrawals', {
        amount: parseInt(withdrawAmount),
        method: withdrawMethod,
        bankAccount,
        bankName,
        accountName,
        phoneNumber
      });

      alert('Yêu cầu rút tiền đã được gửi. Chúng tôi sẽ xử lý trong vòng 24h.');
      setShowWithdrawForm(false);
      setWithdrawAmount('');
      setBankAccount('');
      setBankName('');
      setAccountName('');
      setPhoneNumber('');
      fetchWithdrawals();
    } catch (error) {
      console.error('Error creating withdrawal:', error);
      alert('Tạo yêu cầu rút tiền thất bại');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'pending':
        return 'Chờ xử lý';
      case 'failed':
        return 'Thất bại';
      case 'processing':
        return 'Đang xử lý';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý tài chính</h1>
          <p className="text-gray-600">Nạp tiền và rút tiền từ tài khoản của bạn</p>
        </div>

        {/* Balance Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Số dư hiện tại</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Wallet className="w-6 h-6 text-blue-600" />
                  <span className="text-3xl font-bold text-gray-900">
                    {user?.coinBalance?.toLocaleString() || 0} coin
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  ≈ {user?.coinBalance?.toLocaleString() || 0} VNĐ
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDepositForm(true)}
                className="btn btn-primary flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nạp tiền
              </button>
              <button
                onClick={() => setShowWithdrawForm(true)}
                className="btn btn-outline flex items-center"
              >
                <Minus className="w-4 h-4 mr-2" />
                Rút tiền
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('deposit')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'deposit'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Lịch sử nạp tiền
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'withdraw'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <TrendingDown className="w-4 h-4 inline mr-2" />
            Lịch sử rút tiền
          </button>
        </div>

        {/* Content */}
        {activeTab === 'deposit' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Lịch sử nạp tiền</h3>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="loading-spinner w-8 h-8 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Đang tải...</p>
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có giao dịch nạp tiền</h3>
                  <p className="text-gray-600">Bắt đầu nạp tiền để sử dụng các tính năng premium</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          paymentMethods.find(m => m.id === payment.method)?.color || 'bg-gray-500'
                        }`}>
                          {React.createElement(
                            paymentMethods.find(m => m.id === payment.method)?.icon || CreditCard,
                            { className: 'w-5 h-5 text-white' }
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {paymentMethods.find(m => m.id === payment.method)?.name || payment.method}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(payment.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          +{payment.coinAmount.toLocaleString()} coin
                        </p>
                        <p className="text-sm text-gray-500">
                          {payment.amount.toLocaleString()} VNĐ
                        </p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {getStatusText(payment.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Lịch sử rút tiền</h3>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="loading-spinner w-8 h-8 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Đang tải...</p>
                </div>
              ) : withdrawals.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có giao dịch rút tiền</h3>
                  <p className="text-gray-600">Rút tiền từ coin của bạn</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {withdrawals.map((withdrawal) => (
                    <div key={withdrawal.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                          <Banknote className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {withdrawMethods.find(m => m.id === withdrawal.method)?.name || withdrawal.method}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(withdrawal.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                          {withdrawal.bankAccount && (
                            <p className="text-xs text-gray-400">
                              TK: {withdrawal.bankAccount}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          -{withdrawal.coinAmount.toLocaleString()} coin
                        </p>
                        <p className="text-sm text-gray-500">
                          {withdrawal.amount.toLocaleString()} VNĐ
                        </p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                          {getStatusText(withdrawal.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Deposit Modal */}
        {showDepositForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Nạp tiền</h3>
              </div>
              <form onSubmit={handleDeposit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số tiền (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Nhập số tiền..."
                    min="10000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                    style={{ color: '#111827', fontWeight: '500' }}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Tối thiểu: 10,000 VNĐ</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phương thức thanh toán
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setDepositMethod(method.id)}
                        className={`p-3 border rounded-lg text-left transition-colors ${
                          depositMethod === method.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <method.icon className="w-5 h-5 mb-2" />
                        <p className="text-sm font-medium">{method.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 btn btn-primary"
                  >
                    Tiếp tục
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDepositForm(false)}
                    className="flex-1 btn btn-secondary"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Withdraw Modal */}
        {showWithdrawForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Rút tiền</h3>
              </div>
              <form onSubmit={handleWithdraw} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số tiền (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Nhập số tiền..."
                    min="50000"
                    max={user?.coinBalance || 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                    style={{ color: '#111827', fontWeight: '500' }}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tối thiểu: 50,000 VNĐ | Số dư: {user?.coinBalance?.toLocaleString() || 0} coin
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phương thức rút tiền
                  </label>
                  <select
                    value={withdrawMethod}
                    onChange={(e) => setWithdrawMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                    style={{ color: '#111827', fontWeight: '500' }}
                  >
                    {withdrawMethods.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.name}
                      </option>
                    ))}
                  </select>
                </div>

                {withdrawMethod === 'bank_transfer' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số tài khoản
                      </label>
                      <input
                        type="text"
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                        placeholder="Nhập số tài khoản..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                        style={{ color: '#111827', fontWeight: '500' }}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên ngân hàng
                      </label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="Nhập tên ngân hàng..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                        style={{ color: '#111827', fontWeight: '500' }}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên chủ tài khoản
                      </label>
                      <input
                        type="text"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="Nhập tên chủ tài khoản..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                        style={{ color: '#111827', fontWeight: '500' }}
                        required
                      />
                    </div>
                  </>
                )}

                {(withdrawMethod === 'momo' || withdrawMethod === 'zalopay') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Nhập số điện thoại..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                        style={{ color: '#111827', fontWeight: '500' }}
                        required
                      />
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 btn btn-primary"
                  >
                    Gửi yêu cầu
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWithdrawForm(false)}
                    className="flex-1 btn btn-secondary"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
