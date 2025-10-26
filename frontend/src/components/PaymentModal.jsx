import React, { useState } from 'react';
import { X, Wallet, ArrowUpDown, DollarSign } from 'lucide-react';
import { usePayment } from '../contexts/PaymentContext';
import { useAuth } from '../contexts/AuthContext';

const PaymentModal = ({ isOpen, onClose }) => {
  const { 
    topUpCoins, 
    withdrawUSDC, 
    isLoading 
  } = usePayment();
  
  const { user, updateUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('topup');
  const [vndAmount, setVndAmount] = useState('');
  const [coinsAmount, setCoinsAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');

  const handleTopUp = async () => {
    try {
      if (!vndAmount || parseFloat(vndAmount) <= 0) {
        alert('Vui lòng nhập số tiền hợp lệ');
        return;
      }

      if (parseFloat(vndAmount) < 10000) {
        alert('Số tiền tối thiểu là 10,000 VNĐ');
        return;
      }

      if (parseFloat(vndAmount) > 50000000) {
        alert('Số tiền tối đa là 50,000,000 VNĐ');
        return;
      }

      const result = await topUpCoins(vndAmount);
      
      alert(`Chuyển đến VNPay để thanh toán ${result.vndAmount} VNĐ và nhận ${result.coinsAmount} coins!`);
      setVndAmount('');
    } catch (error) {
      console.error('Top-up error:', error);
      alert(`Lỗi: ${error.message}`);
    }
  };

  const handleWithdraw = async () => {
    try {
      if (!coinsAmount || parseInt(coinsAmount) <= 0) {
        alert('Vui lòng nhập số coins hợp lệ');
        return;
      }

      if (parseInt(coinsAmount) > user.coinBalance) {
        alert('Số dư coins không đủ');
        return;
      }

      if (!bankAccount || !bankName || !accountName) {
        alert('Vui lòng điền đầy đủ thông tin ngân hàng');
        return;
      }

      const result = await withdrawUSDC(coinsAmount, {
        bankAccount,
        bankName,
        accountName
      });
      
      alert(`Yêu cầu rút ${result.vndAmount} VNĐ đã được gửi! Admin sẽ xử lý trong thời gian sớm nhất.`);
      setCoinsAmount('');
      setBankAccount('');
      setBankName('');
      setAccountName('');
    } catch (error) {
      console.error('Withdraw error:', error);
      alert(`Error: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Payment Center</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="text-center py-8">
          <Wallet size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">VNPay Payment</h3>
          <p className="text-gray-600 mb-6">
            Use VNPay to manage your payments
          </p>
        </div>
        <div>
          {/* Payment Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Payment Method</span>
              <span className="text-sm text-green-600">VNPay</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Coins Balance</span>
              <span className="font-medium">{user?.coinBalance || 0} Coins</span>
            </div>
          </div>

            {/* Tabs */}
            <div className="flex mb-6">
              <button
                onClick={() => setActiveTab('topup')}
                className={`flex-1 py-2 px-4 text-center rounded-l-lg ${
                  activeTab === 'topup'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                <ArrowUpDown size={16} className="inline mr-2" />
                Top Up
              </button>
              <button
                onClick={() => setActiveTab('withdraw')}
                className={`flex-1 py-2 px-4 text-center rounded-r-lg ${
                  activeTab === 'withdraw'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                <DollarSign size={16} className="inline mr-2" />
                Withdraw
              </button>
            </div>

            {/* Top Up Tab */}
            {activeTab === 'topup' && (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số tiền (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={vndAmount}
                    onChange={(e) => setVndAmount(e.target.value)}
                    placeholder="Nhập số tiền VNĐ"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="1000"
                    min="10000"
                    max="50000000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tỷ giá: 100 VNĐ = 1 Coin
                  </p>
                </div>
                <button
                  onClick={handleTopUp}
                  disabled={isLoading || !vndAmount}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isLoading ? 'Đang xử lý...' : 'Nạp tiền'}
                </button>
              </div>
            )}

            {/* Withdraw Tab */}
            {activeTab === 'withdraw' && (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số Coins (quy đổi ra VNĐ)
                  </label>
                  <input
                    type="number"
                    value={coinsAmount}
                    onChange={(e) => setCoinsAmount(e.target.value)}
                    placeholder="Nhập số coins"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tỷ giá: 1 Coin = 100 VNĐ
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thông tin ngân hàng
                  </label>
                  <div className="space-y-3">
                    <div>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="Tên ngân hàng (VD: Vietcombank, Techcombank...)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                        placeholder="Số tài khoản"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="Tên chủ tài khoản"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Thông tin này sẽ được gửi cho admin để xử lý rút tiền
                  </p>
                </div>

                <button
                  onClick={handleWithdraw}
                  disabled={isLoading || !coinsAmount || !bankAccount || !bankName || !accountName}
                  className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  {isLoading ? 'Đang xử lý...' : 'Rút tiền'}
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;




