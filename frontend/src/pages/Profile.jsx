import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, donationAPI, followAPI } from '../utils/api';
import PaymentModal from '../components/PaymentModal';
import { 
  User, 
  Mail, 
  Coins, 
  Video, 
  Heart, 
  Edit3,
  Save,
  X,
  Camera
} from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [donations, setDonations] = useState([]);
  const [receivedDonations, setReceivedDonations] = useState([]);
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalReceived: 0,
    totalStreams: 0,
  });
  const [followings, setFollowings] = useState([]);

  const [editData, setEditData] = useState({
    username: user?.username || '',
    avatar: user?.avatar || '',
  });

  useEffect(() => {
    if (user) {
      fetchDonations();
      fetchStats();
      fetchFollowings();
    }
  }, [user]);

  const fetchDonations = async () => {
    try {
      const [donationsRes, receivedRes] = await Promise.all([
        donationAPI.getUserDonations(),
        donationAPI.getReceivedDonations(),
      ]);
      
      setDonations(donationsRes.data.donations);
      setReceivedDonations(receivedRes.data.donations);
    } catch (err) {
      console.error('Error fetching donations:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const [donationsRes, receivedRes, streamsRes] = await Promise.all([
        donationAPI.getUserDonations(),
        donationAPI.getReceivedDonations(),
        userAPI.getUserStreams(user.id),
      ]);

      const totalDonated = donationsRes.data.donations.reduce(
        (sum, donation) => sum + donation.amount, 0
      );
      const totalReceived = receivedRes.data.donations.reduce(
        (sum, donation) => sum + donation.amount, 0
      );

      setStats({
        totalDonations: totalDonated,
        totalReceived: totalReceived,
        totalStreams: streamsRes.data.streams.length,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleEdit = () => {
    setEditData({
      username: user.username,
      avatar: user.avatar || '',
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await userAPI.updateProfile(editData);
      updateUser(response.data.user);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Cập nhật profile thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      username: user.username,
      avatar: user.avatar || '',
    });
    setIsEditing(false);
  };

  const fetchFollowings = async () => {
    try {
      const r = await followAPI.listFollowings();
      setFollowings(Array.isArray(r.data?.followings) ? r.data.followings : []);
    } catch (e) {
      setFollowings([]);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Vui lòng đăng nhập
        </h2>
        <p className="text-gray-600">
          Bạn cần đăng nhập để xem profile.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=3b82f6&color=fff`}
              alt={user.username}
              className="w-20 h-20 rounded-full"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.username}
              </h1>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center mt-2 text-yellow-600">
                <Coins className="w-4 h-4 mr-1" />
                <span className="font-medium">{user.coinBalance} coin</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowPaymentModal(true)}
              className="btn btn-primary btn-md"
            >
              Nạp/Rút coin
            </button>
            <button
              onClick={handleEdit}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </button>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Chỉnh sửa thông tin
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên người dùng
              </label>
                <input
                  type="text"
                  value={editData.username}
                  onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 font-medium"
                  style={{ color: '#111827', fontWeight: '500' }}
                />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Avatar URL
              </label>
                <input
                  type="url"
                  value={editData.avatar}
                  onChange={(e) => setEditData({ ...editData, avatar: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 font-medium"
                  style={{ color: '#111827', fontWeight: '500' }}
                />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Đang lưu...' : 'Lưu'}
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Video className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng Streams</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStreams}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Coins className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đã Donate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDonations}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Heart className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Nhận Được</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalReceived}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Donations History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donations Made */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Donations đã gửi
            </h3>
          </div>
          <div className="p-6">
            {donations.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Chưa có donation nào
              </p>
            ) : (
              <div className="space-y-3">
                {donations.slice(0, 5).map((donation) => (
                  <div key={donation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <p className="font-medium text-gray-900">
                        {donation.amount} coin
                      </p>
                      <p className="text-sm text-gray-600">
                        cho {donation.streamer.username}
                      </p>
                      {donation.message && (
                        <p className="text-xs text-gray-500 mt-1">
                          "{donation.message}"
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Donations Received */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Donations nhận được
            </h3>
          </div>
          <div className="p-6">
            {receivedDonations.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Chưa nhận donation nào
              </p>
            ) : (
              <div className="space-y-3">
                {receivedDonations.slice(0, 5).map((donation) => (
                  <div key={donation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <p className="font-medium text-gray-900">
                        {donation.amount} coin
                      </p>
                      <p className="text-sm text-gray-600">
                        từ {donation.donor.username}
                      </p>
                      {donation.message && (
                        <p className="text-xs text-gray-500 mt-1">
                          "{donation.message}"
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Followings */}
      <div className="mt-6 bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Đang theo dõi</h3>
        </div>
        <div className="p-6">
          {followings.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Bạn chưa theo dõi streamer nào</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {followings.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <img
                      src={s.avatar || `https://ui-avatars.com/api/?name=${s.username}&background=3b82f6&color=fff`}
                      alt={s.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{s.username}</p>
                      <p className="text-xs text-gray-600">Streamer</p>
                    </div>
                  </div>
                  <a href={`/streamer/${s.id}`} className="text-sm text-blue-600 hover:underline">Xem kênh</a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
      />
    </div>
  );
};

export default Profile;




















