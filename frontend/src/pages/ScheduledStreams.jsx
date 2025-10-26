import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import ScheduledStreamCard from '../components/ScheduledStreamCard';
import ScheduleStreamForm from '../components/ScheduleStreamForm';

const ScheduledStreams = () => {
  const { user } = useAuth();
  const [scheduledStreams, setScheduledStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingStream, setEditingStream] = useState(null);
  const [filter, setFilter] = useState('scheduled');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  const fetchScheduledStreams = async (page = 1, status = 'scheduled') => {
    try {
      setLoading(true);
      const response = await api.get(`/scheduled-streams?page=${page}&limit=${pagination.limit}&status=${status}`);
      setScheduledStreams(response.data.scheduledStreams);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      console.error('Error fetching scheduled streams:', err);
      setError('Không thể tải danh sách stream đã lên lịch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduledStreams(1, filter);
  }, [filter]);

  const handleCreateStream = async (formData) => {
    try {
      const response = await api.post('/scheduled-streams', formData);
      setScheduledStreams(prev => [response.data, ...prev]);
      setShowForm(false);
    } catch (err) {
      console.error('Error creating scheduled stream:', err);
      alert('Không thể tạo lịch stream');
    }
  };

  const handleUpdateStream = async (formData) => {
    try {
      const response = await api.put(`/scheduled-streams/${editingStream}`, formData);
      setScheduledStreams(prev => 
        prev.map(stream => 
          stream.id === editingStream ? response.data : stream
        )
      );
      setEditingStream(null);
    } catch (err) {
      console.error('Error updating scheduled stream:', err);
      alert('Không thể cập nhật lịch stream');
    }
  };

  const handleDeleteStream = async (streamId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lịch stream này?')) {
      return;
    }

    try {
      await api.delete(`/scheduled-streams/${streamId}`);
      setScheduledStreams(prev => prev.filter(stream => stream.id !== streamId));
    } catch (err) {
      console.error('Error deleting scheduled stream:', err);
      alert('Không thể xóa lịch stream');
    }
  };

  const handleStartStream = async (streamId) => {
    try {
      const response = await api.post(`/scheduled-streams/${streamId}/start`);
      // Redirect to stream page
      window.location.href = `/stream/${response.data.stream.id}`;
    } catch (err) {
      console.error('Error starting stream:', err);
      alert('Không thể bắt đầu stream');
    }
  };

  const handleEditStream = (streamId) => {
    setEditingStream(streamId);
  };

  const handlePageChange = (newPage) => {
    fetchScheduledStreams(newPage, filter);
  };

  const getFilterText = (status) => {
    switch (status) {
      case 'scheduled':
        return 'Đã lên lịch';
      case 'live':
        return 'Đang live';
      case 'completed':
        return 'Đã hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Tất cả';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Stream đã lên lịch</h1>
            <p className="mt-2 text-gray-600">
              Xem và quản lý các stream đã được lên lịch
            </p>
          </div>
          
          {user && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Lên lịch stream
            </button>
          )}
        </div>

        {/* Filter */}
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Lọc theo:</span>
            <div className="flex space-x-2">
              {['scheduled', 'live', 'completed', 'cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {getFilterText(status)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Streams Grid */}
        {scheduledStreams.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có stream nào được lên lịch
            </h3>
            <p className="text-gray-600 mb-4">
              {user ? 'Hãy tạo lịch stream đầu tiên của bạn!' : 'Đăng nhập để tạo lịch stream'}
            </p>
            {user && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Lên lịch stream
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {scheduledStreams.map(stream => (
                <ScheduledStreamCard
                  key={stream.id}
                  scheduledStream={stream}
                  isOwner={user && user.id === stream.streamerId}
                  onStartStream={handleStartStream}
                  onEdit={handleEditStream}
                  onDelete={handleDeleteStream}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 border rounded-md text-sm font-medium ${
                        page === pagination.page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Schedule Form Modal */}
        <ScheduleStreamForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSubmit={handleCreateStream}
        />

        {/* Edit Form Modal */}
        {editingStream && (
          <ScheduleStreamForm
            isOpen={!!editingStream}
            onClose={() => setEditingStream(null)}
            onSubmit={handleUpdateStream}
            initialData={scheduledStreams.find(s => s.id === editingStream)}
            isEditing={true}
          />
        )}
      </div>
    </div>
  );
};

export default ScheduledStreams;
