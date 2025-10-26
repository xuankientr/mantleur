import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { streamAPI } from '../utils/api';
import api from '../utils/api';
import { useWebRTC } from '../hooks/useWebRTC';
import Chat from '../components/Chat';
import { 
  Video, 
  Play, 
  Square, 
  Settings, 
  Eye, 
  Users,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Monitor
} from 'lucide-react';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const [streams, setStreams] = useState([]);
  const [scheduledStreams, setScheduledStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduledLoading, setScheduledLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingStream, setEditingStream] = useState(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [streamType, setStreamType] = useState('live'); // 'live' or 'scheduled'
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [previewMarquee, setPreviewMarquee] = useState('');
  const [previewMarqueePos, setPreviewMarqueePos] = useState('top');
  const [presentationMode, setPresentationMode] = useState({}); // Track presentation mode for each stream

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

  // Force refresh video preview
  const refreshVideoPreview = useCallback(() => {
    if (mediaStream && localVideoRef.current) {
      localVideoRef.current.srcObject = mediaStream;
      localVideoRef.current.play().catch(e => {});
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

  // Listen for realtime viewer count updates to keep Dashboard in sync
  useEffect(() => {
    if (!socket) return;

    const onViewerCountUpdate = (data) => {
      // Update the matching stream's viewerCount
      setStreams((prev) => prev.map(s => s.id === data.streamId ? { ...s, viewerCount: data.count } : s));
    };

    socket.on('viewer-count-update', onViewerCountUpdate);

    return () => {
      socket.off('viewer-count-update', onViewerCountUpdate);
    };
  }, [socket]);

  // Fetch scheduled streams
  const fetchScheduledStreams = useCallback(async () => {
    try {
      setScheduledLoading(true);
      const response = await api.get('/scheduled-streams/user/my-schedules');
      setScheduledStreams(response.data);
    } catch (err) {
      console.error('Error fetching scheduled streams:', err);
    } finally {
      setScheduledLoading(false);
    }
  }, []);


  // Watch for mediaStream changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchStreams();
      fetchScheduledStreams();
    }
  }, [isAuthenticated, fetchStreams, fetchScheduledStreams]);


  useEffect(() => {
    if (mediaStream) {
      refreshVideoPreview();
    }
  }, [mediaStream, refreshVideoPreview]);

  // Early return for debugging - MOVED AFTER ALL HOOKS
  if (!isAuthenticated) {
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
      if (streamType === 'live') {
        // Tạo live stream như cũ
        const response = await streamAPI.createStream({
          title: title.trim(),
          description: description.trim(),
          category: category || null,
        });

        setStreams(prev => [response.data.stream, ...prev]);
      } else {
        // Tạo scheduled stream
        const response = await api.post('/scheduled-streams', {
          title: title.trim(),
          description: description.trim(),
          category: category || null,
          scheduledAt: scheduledAt,
          duration: duration ? parseInt(duration) : null,
          thumbnail: thumbnail || null,
        });

        // Refresh scheduled streams list
        fetchScheduledStreams();
      }

      // Reset form
      setTitle('');
      setDescription('');
      setCategory('');
      setScheduledAt('');
      setDuration('');
      setThumbnail('');
      setStreamType('live');
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
    try {
      // Bắt đầu media stream
      // Dùng stream.id làm peerId cho streamer
      const mediaStream = await startStream(stream.id);
      
      // Cập nhật stream status
      await handleUpdateStream(stream.id, { isLive: true });
      
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

  const handleStartScheduledStream = async (scheduledStreamId) => {
    try {
      const response = await api.post(`/scheduled-streams/${scheduledStreamId}/start`);
      // Redirect to stream page
      window.location.href = `/stream/${response.data.stream.id}`;
    } catch (err) {
      console.error('Error starting scheduled stream:', err);
      alert('Không thể bắt đầu stream từ lịch đã lên');
    }
  };

  const handleDeleteScheduledStream = async (scheduledStreamId) => {
    if (!confirm('Bạn có chắc muốn xóa lịch stream này?')) return;

    try {
      await api.delete(`/scheduled-streams/${scheduledStreamId}`);
      fetchScheduledStreams();
    } catch (err) {
      console.error('Error deleting scheduled stream:', err);
      alert('Xóa lịch stream thất bại');
    }
  };

  const togglePresentationMode = (streamId) => {
    setPresentationMode(prev => ({
      ...prev,
      [streamId]: !prev[streamId]
    }));
  };

  // Emit marquee updates when presentation mode is enabled
  useEffect(() => {
    if (socket && previewMarquee) {
      const liveStreams = streams.filter(s => s.isLive && presentationMode[s.id]);
      
      liveStreams.forEach(stream => {
        console.log('📤 Dashboard emitting marquee update:', { 
          streamId: stream.id, 
          text: previewMarquee, 
          position: previewMarqueePos 
        });
        
        socket.emit('marquee-update', {
          streamId: stream.id,
          text: previewMarquee,
          position: previewMarqueePos
        });
      });
    }
  }, [socket, previewMarquee, previewMarqueePos, streams, presentationMode]);

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
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Tạo Stream Mới</h3>
            
            <form onSubmit={handleCreateStream} className="space-y-4">
              {/* Stream Type Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại Stream
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="live"
                      checked={streamType === 'live'}
                      onChange={(e) => setStreamType(e.target.value)}
                      className="mr-2"
                    />
                    <span className="flex items-center">
                      <Play className="w-4 h-4 mr-1" />
                      Stream ngay
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="scheduled"
                      checked={streamType === 'scheduled'}
                      onChange={(e) => setStreamType(e.target.value)}
                      className="mr-2"
                    />
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Lên lịch stream
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nhập tiêu đề stream..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 font-medium"
                  style={{ color: '#111827', fontWeight: '500' }}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 font-medium"
                  style={{ color: '#111827', fontWeight: '500' }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh mục
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 font-medium"
                  style={{ color: '#111827', fontWeight: '500' }}
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Scheduled Stream Fields */}
              {streamType === 'scheduled' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thời gian lên lịch *
                    </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 font-medium"
                  style={{ color: '#111827', fontWeight: '500' }}
                  required={streamType === 'scheduled'}
                />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thời lượng dự kiến (phút)
                    </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Ví dụ: 120"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 font-medium"
                  style={{ color: '#111827', fontWeight: '500' }}
                />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thumbnail URL
                    </label>
                <input
                  type="url"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="https://example.com/thumbnail.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 font-medium"
                  style={{ color: '#111827', fontWeight: '500' }}
                />
                  </div>
                </>
              )}
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700"
                >
                  {streamType === 'live' ? 'Tạo Stream' : 'Lên lịch Stream'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setStreamType('live');
                    setTitle('');
                    setDescription('');
                    setCategory('');
                    setScheduledAt('');
                    setDuration('');
                    setThumbnail('');
                  }}
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
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <label className="block text-sm font-medium text-gray-700 mb-1">Chạy chữ trên preview (realtime)</label>
              <div className="sm:col-span-2 flex gap-3">
                <input
                  type="text"
                  value={previewMarquee}
                  onChange={(e) => setPreviewMarquee(e.target.value)}
                  placeholder="Nhập nội dung muốn chạy qua preview video..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <select
                  value={previewMarqueePos}
                  onChange={(e) => setPreviewMarqueePos(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="top">Trên</option>
                  <option value="bottom">Dưới</option>
                </select>
                {/* Nút Trình chiếu - chỉ hiển thị khi có stream đang live */}
                {streams.some(s => s.isLive) && (
                  <button
                    onClick={() => {
                      const liveStream = streams.find(s => s.isLive);
                      if (liveStream) togglePresentationMode(liveStream.id);
                    }}
                    className={`px-4 py-2 rounded-md flex items-center text-sm ${
                      streams.some(s => s.isLive && presentationMode[s.id])
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    <Monitor className="w-4 h-4 mr-2" />
                    {streams.some(s => s.isLive && presentationMode[s.id]) ? 'Tắt' : 'Bật'}
                  </button>
                )}
              </div>
            </div>
            {mediaStream ? (
            <div className="relative w-full max-w-md mx-auto">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full rounded-lg shadow-lg"
              onLoadedMetadata={() => {}}
              onCanPlay={() => {}}
              onPlay={() => {}}
              onError={(e) => console.error('Video error:', e)}
            />
            {previewMarquee && streams.some(s => s.isLive && presentationMode[s.id]) && (
              <div className={`pointer-events-none absolute ${previewMarqueePos === 'top' ? 'top-2' : 'bottom-2'} left-0 right-0 overflow-hidden z-10`}>
                <div className="whitespace-nowrap text-black/90 text-sm font-semibold marquee-animation">
                  <span className="mx-4 bg-white/80 px-2 py-0.5 rounded">{previewMarquee}</span>
                </div>
              </div>
            )}
            </div>
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
          {/* Removed test buttons for production UI */}
        </div>
      </div>

      {/* Streamer Chat (hiển thị khi có stream đang LIVE) */}
      {streams.some(s => s.isLive) && (
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Chat</h2>
            <p className="text-gray-600 text-sm">Tin nhắn từ viewers cho stream hiện tại</p>
          </div>
          <div className="p-6">
            <Chat streamId={streams.find(s => s.isLive)?.id} user={user} />
          </div>
        </div>
      )}

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

      {/* Scheduled Streams List */}
      <div className="bg-white rounded-lg shadow-sm mt-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Lịch Stream của bạn</h2>
          <p className="text-gray-600 text-sm">Các stream đã được lên lịch</p>
        </div>
        
        {scheduledLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải lịch stream...</p>
          </div>
        ) : scheduledStreams.length === 0 ? (
          <div className="p-6 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có lịch stream nào
            </h3>
            <p className="text-gray-600 mb-4">
              Tạo lịch stream đầu tiên của bạn!
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
            >
              Lên lịch Stream
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {scheduledStreams.map((scheduledStream) => {
              const canStart = () => {
                const now = new Date();
                const scheduledTime = new Date(scheduledStream.scheduledAt);
                const timeDiff = scheduledTime - now;
                const hoursDiff = timeDiff / (1000 * 60 * 60);
                
                return scheduledStream.status === 'scheduled' && hoursDiff <= 1;
              };

              const getStatusColor = (status) => {
                switch (status) {
                  case 'scheduled':
                    return 'bg-blue-100 text-blue-800';
                  case 'live':
                    return 'bg-green-100 text-green-800';
                  case 'completed':
                    return 'bg-gray-100 text-gray-800';
                  case 'cancelled':
                    return 'bg-red-100 text-red-800';
                  default:
                    return 'bg-gray-100 text-gray-800';
                }
              };

              const getStatusText = (status) => {
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
                    return status;
                }
              };

              return (
                <div key={scheduledStream.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {scheduledStream.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(scheduledStream.status)}`}>
                          {getStatusText(scheduledStream.status)}
                        </span>
                      </div>
                      
                      {scheduledStream.description && (
                        <p className="text-gray-600 mt-1">{scheduledStream.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        {scheduledStream.category && (
                          <span className="bg-gray-100 px-2 py-1 rounded-full">
                            {scheduledStream.category}
                          </span>
                        )}
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(scheduledStream.scheduledAt).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {scheduledStream.duration && (
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {scheduledStream.duration} phút
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {canStart() && (
                        <button
                          onClick={() => handleStartScheduledStream(scheduledStream.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Bắt đầu
                        </button>
                      )}
                      
                      {scheduledStream.status === 'scheduled' && (
                        <button
                          onClick={() => handleDeleteScheduledStream(scheduledStream.id)}
                          className="bg-red-100 text-red-700 px-3 py-2 rounded-md hover:bg-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

