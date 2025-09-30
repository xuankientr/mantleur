import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { streamAPI } from '../utils/api';
import { useWebRTC } from '../hooks/useWebRTC';
import { 
  Video, 
  Play, 
  Square, 
  Settings, 
  Eye, 
  Users,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

const Dashboard = () => {
  console.log('Dashboard component rendering...');
  const { user, isAuthenticated } = useAuth();
  console.log('Dashboard - user:', user, 'isAuthenticated:', isAuthenticated);
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingStream, setEditingStream] = useState(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const {
    stream: mediaStream,
    isConnected,
    error: webrtcError,
    localVideoRef,
    startStream,
    stopStream,
    testMediaAccess,
  } = useWebRTC();

  const categories = [
    'Gaming',
    'Music',
    'Talk',
    'Sports',
    'Education',
    'Entertainment'
  ];

  // Debug: Check if component is rendering
  console.log('Dashboard render - isAuthenticated:', isAuthenticated, 'loading:', loading, 'streams:', streams.length);

  // Force refresh video preview
  const refreshVideoPreview = useCallback(() => {
    if (mediaStream && localVideoRef.current) {
      console.log('Refreshing video preview...');
      localVideoRef.current.srcObject = mediaStream;
      localVideoRef.current.play().catch(e => console.log('Video play error:', e));
    }
  }, [mediaStream]);

  // Define fetchStreams first
  const fetchStreams = useCallback(async () => {
    try {
      setLoading(true);
      const response = await streamAPI.getUserStreams();
      setStreams(response.data.streams);
    } catch (err) {
      console.error('Error fetching streams:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Watch for mediaStream changes
  useEffect(() => {
    console.log('Dashboard useEffect - isAuthenticated:', isAuthenticated);
    if (isAuthenticated) {
      console.log('Fetching streams...');
      fetchStreams();
    }
  }, [isAuthenticated, fetchStreams]);

  useEffect(() => {
    if (mediaStream) {
      console.log('Media stream changed, refreshing video preview...');
      refreshVideoPreview();
    }
  }, [mediaStream, refreshVideoPreview]);

  // Early return for debugging - MOVED AFTER ALL HOOKS
  if (!isAuthenticated) {
    console.log('Dashboard: User not authenticated, redirecting...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Chưa đăng nhập</h1>
          <p className="text-gray-600">Vui lòng đăng nhập để truy cập Dashboard</p>
        </div>
      </div>
    );
  }

  const handleCreateStream = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const response = await streamAPI.createStream({
        title: title.trim(),
        description: description.trim(),
        category: category || null,
      });

      setStreams(prev => [response.data.stream, ...prev]);
      setTitle('');
      setDescription('');
      setCategory('');
      setShowCreateForm(false);
    } catch (err) {
      console.error('Error creating stream:', err);
      alert('Tạo stream thất bại');
    }
  };

  const handleUpdateStream = async (streamId, data) => {
    try {
      const response = await streamAPI.updateStream(streamId, data);
      setStreams(prev => 
        prev.map(stream => 
          stream.id === streamId ? response.data.stream : stream
        )
      );
    } catch (err) {
      console.error('Error updating stream:', err);
      alert('Cập nhật stream thất bại');
    }
  };

  const handleDeleteStream = async (streamId) => {
    if (!confirm('Bạn có chắc muốn xóa stream này?')) return;

    try {
      await streamAPI.deleteStream(streamId);
      setStreams(prev => prev.filter(stream => stream.id !== streamId));
    } catch (err) {
      console.error('Error deleting stream:', err);
      alert('Xóa stream thất bại');
    }
  };

  const handleStartStream = async (stream) => {
    console.log('Starting stream:', stream);
    try {
      // Bắt đầu media stream
      console.log('Calling startStream...');
      // Dùng stream.id làm peerId cho streamer
      const mediaStream = await startStream(stream.id);
      console.log('Media stream started successfully:', mediaStream);
      
      // Cập nhật stream status
      console.log('Updating stream status...');
      await handleUpdateStream(stream.id, { isLive: true });
      console.log('Stream status updated successfully');
      
      // Refresh streams list
      fetchStreams();
    } catch (err) {
      console.error('Error starting stream:', err);
      alert('Không thể bắt đầu stream: ' + err.message);
    }
  };

  const handleStopStream = async (stream) => {
    try {
      // Dừng media stream
      stopStream();
      
      // Cập nhật stream status
      await handleUpdateStream(stream.id, { isLive: false, viewerCount: 0 });
    } catch (err) {
      console.error('Error stopping stream:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Vui lòng đăng nhập
        </h2>
        <p className="text-gray-600">
          Bạn cần đăng nhập để truy cập dashboard.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Quản lý streams và bắt đầu livestream
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Tạo Stream
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Video className="w-8 h-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng Streams</p>
              <p className="text-2xl font-bold text-gray-900">{streams.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Eye className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đang Live</p>
              <p className="text-2xl font-bold text-gray-900">
                {streams.filter(s => s.isLive).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng Viewers</p>
              <p className="text-2xl font-bold text-gray-900">
                {streams.reduce((sum, s) => sum + s.viewerCount, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Stream Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Tạo Stream Mới</h3>
            
            <form onSubmit={handleCreateStream} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nhập tiêu đề stream..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả về stream..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh mục
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700"
                >
                  Tạo Stream
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WebRTC Video Preview */}
      <div className="bg-white rounded-lg shadow-sm mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Video Preview</h2>
        </div>
        <div className="p-6">
          {mediaStream ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full max-w-md mx-auto rounded-lg shadow-lg"
              onLoadedMetadata={() => console.log('Video metadata loaded')}
              onCanPlay={() => console.log('Video can play')}
              onPlay={() => console.log('Video playing')}
              onError={(e) => console.error('Video error:', e)}
            />
          ) : (
            <div className="w-full max-w-md mx-auto bg-gray-100 rounded-lg shadow-lg aspect-video flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Video className="w-12 h-12 mx-auto mb-2" />
                <p>Chưa có video stream</p>
                <p className="text-sm">Bắt đầu stream để xem preview</p>
              </div>
            </div>
          )}
          {webrtcError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{webrtcError}</p>
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <button
              onClick={async () => {
                try {
                  console.log('Testing startStream...');
                  await startStream();
                  console.log('startStream completed');
                } catch (err) {
                  console.error('startStream error:', err);
                }
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
            >
              Test Start Stream
            </button>
            <button
              onClick={async () => {
                try {
                  console.log('Testing media access...');
                  const success = await testMediaAccess();
                  if (success) {
                    alert('Camera/microphone access OK!');
                  } else {
                    alert('Camera/microphone access failed!');
                  }
                } catch (err) {
                  console.error('Test failed:', err);
                  alert('Test failed: ' + err.message);
                }
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
            >
              Test Camera
            </button>
            <button
              onClick={refreshVideoPreview}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 text-sm"
            >
              Refresh Video
            </button>
            <button
              onClick={() => {
                console.log('Media stream:', mediaStream);
                console.log('Is connected:', isConnected);
                console.log('WebRTC error:', webrtcError);
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm"
            >
              Debug Info
            </button>
          </div>
        </div>
      </div>

      {/* Streams List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Streams của bạn</h2>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        ) : streams.length === 0 ? (
          <div className="p-6 text-center">
            <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có stream nào
            </h3>
            <p className="text-gray-600 mb-4">
              Tạo stream đầu tiên của bạn để bắt đầu livestream!
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
            >
              Tạo Stream
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {streams.map((stream) => (
              <div key={stream.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {stream.title}
                      </h3>
                      {stream.isLive && (
                        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          LIVE
                        </span>
                      )}
                    </div>
                    
                    {stream.description && (
                      <p className="text-gray-600 mt-1">{stream.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      {stream.category && (
                        <span className="bg-gray-100 px-2 py-1 rounded-full">
                          {stream.category}
                        </span>
                      )}
                      <span className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {stream.viewerCount} viewers
                      </span>
                      <span>
                        Tạo lúc: {new Date(stream.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {stream.isLive ? (
                      <button
                        onClick={() => handleStopStream(stream)}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center"
                      >
                        <Square className="w-4 h-4 mr-2" />
                        Dừng Stream
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartStream(stream)}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Bắt đầu
                      </button>
                    )}
                    
                    <button
                      onClick={() => setEditingStream(stream)}
                      className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteStream(stream.id)}
                      className="bg-red-100 text-red-700 px-3 py-2 rounded-md hover:bg-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

