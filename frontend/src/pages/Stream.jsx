import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { streamAPI, donationAPI, followAPI } from '../utils/api';
import { useWebRTC } from '../hooks/useWebRTC';
import Chat from '../components/Chat';
import { 
  Eye, 
  Heart, 
  Share2, 
  Coins, 
  User, 
  Play, 
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react';

const Stream = () => {
  const { streamId } = useParams();
  const { user, isAuthenticated, updateUser } = useAuth();
  const { socket } = useSocket();
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [donationAmount, setDonationAmount] = useState(10);
  const [donationMessage, setDonationMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [marqueeText, setMarqueeText] = useState('');
  const [marqueePos, setMarqueePos] = useState('top'); // 'top' | 'bottom'
  
  // Check if current user is the streamer
  const isStreamer = useMemo(() => {
    const result = user && stream && user.id === stream.streamerId;
    console.log('🔍 isStreamer calculation:', { 
      userId: user?.id, 
      streamerId: stream?.streamerId, 
      result,
      userExists: !!user,
      streamExists: !!stream
    });
    return result;
  }, [user?.id, stream?.streamerId]);

  // Use ref to stabilize isStreamer value
  const isStreamerRef = useRef(isStreamer);
  isStreamerRef.current = isStreamer;

  // Use ref to stabilize stream value
  const streamRef = useRef(stream);
  streamRef.current = stream;

  
  // Use ref to track if we've already joined the stream room
  const hasJoinedRoom = useRef(false);
  const currentStreamId = useRef(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const {
    stream: mediaStream,
    isConnected,
    error: webrtcError,
    localVideoRef,
    remoteVideoRef,
    startStream,
    stopStream,
    connectToStream,
    retryConnection,
    cleanup,
  } = useWebRTC();

  useEffect(() => {
    fetchStream();
    // Reset room joining state when stream changes
    hasJoinedRoom.current = false;
    currentStreamId.current = null;
  }, [streamId]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (socket && hasJoinedRoom.current && currentStreamId.current) {
        console.log('🔗 Component unmounting, leaving stream room:', { streamId: currentStreamId.current, isStreamer: isStreamer });
        socket.emit('leave-stream', { streamId: currentStreamId.current, isStreamer: isStreamer });
      }
    };
  }, [socket, isStreamer]);

  useEffect(() => {
    if (stream && stream.isLive) {
      // Kết nối với stream của streamer - dùng stream.id làm peerId
      console.log('Connecting to stream:', stream.id);
      connectToStream(stream.id);
    }
  }, [stream?.id, stream?.isLive]); // Chỉ depend vào stream.id và isLive

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Socket listeners for realtime updates - ULTIMATE FIX
  useEffect(() => {
    if (!socket || !stream) return;

    console.log('🔗 Setting up socket listeners for stream:', stream.id);

    // Join stream room only once per stream
    if (!hasJoinedRoom.current || currentStreamId.current !== stream.id) {
      console.log('🔗 Joining stream room:', { streamId: stream.id, isStreamer: isStreamerRef.current });
      socket.emit('join-stream', { streamId: stream.id, isStreamer: isStreamerRef.current });
      hasJoinedRoom.current = true;
      currentStreamId.current = stream.id;
      
      // Debug: Check if we're in the right room
      setTimeout(() => {
        console.log('🔗 Checking room membership after join...');
        console.log('🔗 Socket connected:', socket.connected);
        console.log('🔗 Socket ID:', socket.id);
      }, 1000);
    }

    // Listen for viewer count updates
    const handleViewerCountUpdate = (data) => {
      console.log('📊 Viewer count update received:', data);
      if (data.streamId === stream.id) {
        setStream(prev => prev ? { ...prev, viewerCount: data.count } : null);
      }
    };

    // Listen for marquee text updates
    const handleMarqueeUpdate = (data) => {
      console.log('📝 Marquee update received:', data);
      console.log('📝 Current stream ID:', stream.id);
      console.log('📝 Is streamer?', isStreamerRef.current);
      console.log('📝 User ID:', user?.id);
      console.log('📝 Streamer ID:', stream?.streamerId);
      console.log('📝 Data text:', data.text);
      console.log('📝 Data position:', data.position);
      console.log('📝 Socket connected:', socket.connected);
      console.log('📝 Socket ID:', socket.id);
      
      // Only update if we're not the streamer (to avoid overwriting our own changes)
      if (!isStreamerRef.current) {
        console.log('📝 Updating marquee for viewer...');
        setMarqueeText(data.text || '');
        setMarqueePos(data.position || 'top');
        console.log('📝 Marquee updated for viewer:', { text: data.text || '', position: data.position || 'top' });
      } else {
        console.log('📝 Skipping marquee update - we are the streamer');
      }
    };

    socket.on('viewer-count-update', handleViewerCountUpdate);
    socket.on('marquee-update', handleMarqueeUpdate);
    
    console.log('🔗 Socket listeners set up for stream:', stream.id);
    console.log('🔗 Socket connected:', socket.connected);
    console.log('🔗 Socket ID:', socket.id);
    
    // Test socket connection
    socket.emit('test-marquee-connection', { streamId: stream.id });
    console.log('🔗 Test marquee connection emitted');

    return () => {
      console.log('🔗 Cleaning up socket listeners for stream:', stream.id);
      socket.off('viewer-count-update', handleViewerCountUpdate);
      socket.off('marquee-update', handleMarqueeUpdate);
    };
  }, [socket, stream?.id]); // Remove isStreamer from dependency array

  // Emit marquee updates with debounce (only for streamer when stream is live)
  useEffect(() => {
    if (socket && stream && stream.isLive && isStreamerRef.current) {
      console.log('📤 Emitting marquee update:', { 
        streamId: stream.id, 
        text: marqueeText, 
        position: marqueePos,
        isStreamer: isStreamerRef.current 
      });
      
      const timeoutId = setTimeout(() => {
        console.log('📤 Actually emitting marquee update:', { streamId: stream.id, text: marqueeText, position: marqueePos });
        socket.emit('marquee-update', {
          streamId: stream.id,
          text: marqueeText,
          position: marqueePos
        });
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [socket, stream?.id, stream?.isLive, marqueeText, marqueePos]);

  // Cleanup khi rời trang stream
  useEffect(() => {
    return () => {
      try { cleanup(); } catch {}
    };
  }, [cleanup]);

  const fetchStream = async () => {
    try {
      setLoading(true);
      const response = await streamAPI.getStream(streamId);
      setStream(response.data.stream);
      // Kiểm tra follow
      try {
        if (isAuthenticated && response.data.stream?.streamer?.id) {
          const r = await followAPI.isFollowing(response.data.stream.streamer.id);
          setIsFollowing(!!r.data?.isFollowing);
        } else {
          setIsFollowing(false);
        }
      } catch {}
    } catch (err) {
      console.error('Error fetching stream:', err);
      setError('Không thể tải thông tin stream');
    } finally {
      setLoading(false);
    }
  };

  const handleDonation = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để donate');
      return;
    }

    if (donationAmount > user.coinBalance) {
      alert('Số coin không đủ');
      return;
    }

    try {
      const resp = await donationAPI.createDonation({
        streamId,
        amount: donationAmount,
        message: donationMessage,
      });
      
      alert('Donate thành công!');
      // Cập nhật số coin người dùng ngay lập tức
      if (resp?.data?.newBalance !== undefined) {
        updateUser({ coinBalance: resp.data.newBalance });
      }
      setDonationMessage('');
      // Gửi một notification local để streamer thấy rõ (nếu là streamer tự xem trang mình)
      try { socket?.emit?.('client-donation-created', { streamId, amount: donationAmount }); } catch {}
    } catch (err) {
      console.error('Donation error:', err);
      alert('Donate thất bại');
    }
  };

  const toggleMute = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const togglePlay = () => {
    if (remoteVideoRef.current) {
      if (isPlaying) {
        remoteVideoRef.current.pause();
      } else {
        remoteVideoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const onToggleFollow = async () => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để follow');
      return;
    }
    try {
      const streamerId = stream?.streamer?.id;
      if (!streamerId) return;
      if (isFollowing) {
        await followAPI.unfollow(streamerId);
        setIsFollowing(false);
      } else {
        await followAPI.follow(streamerId);
        setIsFollowing(true);
      }
    } catch (e) {
      console.error('toggle follow error:', e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải stream...</p>
        </div>
      </div>
    );
  }

  if (error || !stream) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          {error || 'Stream không tồn tại'}
        </div>
        <button
          onClick={fetchStream}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Stream Area */}
      <div className="lg:col-span-3">
        <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-lg">
          {/* Video Player */}
                <div className="relative aspect-video bg-slate-900">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onClick={() => {
                      if (remoteVideoRef.current) {
                        remoteVideoRef.current.muted = false;
                        remoteVideoRef.current.play().catch(e => console.log('Video play error:', e));
                      }
                    }}
                  />
                  {!isConnected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                      <div className="text-center text-white">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <p>Đang kết nối...</p>
                        {webrtcError && (
                          <div className="mt-4">
                            <p className="text-red-400 text-sm mb-2">{webrtcError}</p>
                            <button
                              onClick={() => retryConnection(stream.id)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                            >
                              Thử lại
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {isConnected && (
                    <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                      {isPlaying ? '🔊' : '🔇'} {isPlaying ? 'Đang phát' : 'Tạm dừng'}
                    </div>
                  )}

            {/* Marquee overlay */}
            {(marqueeText || (stream && stream.title)) && (
              <div className={`pointer-events-none absolute ${marqueePos === 'top' ? 'top-3' : 'bottom-3'} left-0 right-0 overflow-hidden z-20`}>
                <div className="whitespace-nowrap text-white/90 text-sm sm:text-base font-semibold marquee-animation drop-shadow">
                  {marqueeText
                    ? <span className="mx-6">{marqueeText}</span>
                    : <>
                        <span className="mx-6">{stream.title}</span>
                        <span className="mx-6">{stream.description || 'MantleUR livestream'}</span>
                        <span className="mx-6">{stream.category || 'Streaming'}</span>
                      </>}
                </div>
              </div>
            )}
            
            {/* Debug overlay removed */}

            {/* Video Controls */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="w-full flex items-center justify-between px-3 py-2 bg-black/40 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="flex items-center space-x-2">
                <button
                  onClick={togglePlay}
                  className="bg-white/10 text-white p-2 rounded-full hover:bg-white/20 transition"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button
                  onClick={toggleMute}
                  className="bg-white/10 text-white p-2 rounded-full hover:bg-white/20 transition"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                    LIVE
                  </span>
                  <div className="bg-white/10 text-white px-2 py-1 rounded-full text-xs flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    {stream.viewerCount}
                  </div>
                  <button onClick={onToggleFollow} className={`px-2 py-1 rounded-full text-xs font-medium transition ${isFollowing ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-white text-gray-800 hover:bg-slate-100'}`}>
                    {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stream Info */}
          <div className="p-4 bg-white">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{stream.title}</h1>
            {stream.description && (
              <p className="text-gray-600 mb-4">{stream.description}</p>
            )}

                {/* Marquee input (realtime) - Only for streamer when stream is live */}
                {isStreamer && stream?.isLive && (
                  <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chạy chữ trên video (realtime)</label>
                    <div className="sm:col-span-2 flex gap-3">
                      <input
                        type="text"
                        value={marqueeText}
                        onChange={(e) => setMarqueeText(e.target.value)}
                        placeholder="Nhập nội dung muốn chạy qua màn hình..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <select
                        value={marqueePos}
                        onChange={(e) => setMarqueePos(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="top">Trên</option>
                        <option value="bottom">Dưới</option>
                      </select>
                    </div>
                    <p className="text-xs text-gray-500 sm:col-span-3">Để trống để dùng tiêu đề/mô tả mặc định.</p>
                  </div>
                )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <img
                    src={stream.streamer.avatar || `https://ui-avatars.com/api/?name=${stream.streamer.username}&background=3b82f6&color=fff`}
                    alt={stream.streamer.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{stream.streamer.username}</p>
                    <p className="text-sm text-gray-600">Streamer</p>
                  </div>
                </div>
                
                {stream.category && (
                  <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                    {stream.category}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button className="flex items-center space-x-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200">
                  <Heart className="w-4 h-4" />
                  <span>Like</span>
                </button>
                <button className="flex items-center space-x-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200">
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Donation Form */}
        {isAuthenticated && (
          <div className="card p-5">
            <h3 className="text-slate-900 font-semibold mb-4 flex items-center">
              <Coins className="w-5 h-5 mr-2 text-yellow-500" />
              Donate
            </h3>
            
            <form onSubmit={handleDonation} className="space-y-4">
              <div>
                <label className="form-label">
                  Số coin
                </label>
                <input
                  type="number"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(parseInt(e.target.value) || 0)}
                  min="1"
                  max={user?.coinBalance || 0}
                  className="input"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Số coin hiện có: {user?.coinBalance || 0}
                </p>
              </div>
              
              <div>
                <label className="form-label">
                  Lời nhắn (tùy chọn)
                </label>
                <textarea
                  value={donationMessage}
                  onChange={(e) => setDonationMessage(e.target.value)}
                  placeholder="Nhập lời nhắn..."
                  rows="3"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>
              
              <button
                type="submit"
                className="btn btn-md w-full bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl"
              >
                Donate {donationAmount} coin
              </button>
            </form>
          </div>
        )}

        {/* Chat */}
        <Chat streamId={streamId} user={user} />
      </div>
    </div>
  );
};

export default Stream;

