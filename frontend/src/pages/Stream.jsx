import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { streamAPI, donationAPI } from '../utils/api';
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
  const { user, isAuthenticated } = useAuth();
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [donationAmount, setDonationAmount] = useState(10);
  const [donationMessage, setDonationMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

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
  }, [streamId]);

  useEffect(() => {
    if (stream && stream.isLive) {
      // Kết nối với stream của streamer - dùng stream.id làm peerId
      console.log('Connecting to stream:', stream.id);
      connectToStream(stream.id);
      
      // Retry connection sau 5 giây nếu không kết nối được
      const retryTimer = setTimeout(() => {
        if (!isConnected && !webrtcError) {
          console.log('Retrying connection...');
          connectToStream(stream.id);
        }
      }, 5000);
      
      return () => clearTimeout(retryTimer);
    }
  }, [stream]);

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
      await donationAPI.createDonation({
        streamId,
        amount: donationAmount,
        message: donationMessage,
      });
      
      alert('Donate thành công!');
      setDonationMessage('');
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
        <div className="bg-black rounded-lg overflow-hidden">
          {/* Video Player */}
          <div className="relative aspect-video bg-gray-900">
            {isConnected ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
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

            {/* Video Controls */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={togglePlay}
                  className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button
                  onClick={toggleMute}
                  className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                  LIVE
                </span>
                <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs flex items-center">
                  <Eye className="w-3 h-3 mr-1" />
                  {stream.viewerCount}
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
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Coins className="w-5 h-5 mr-2 text-yellow-500" />
              Donate
            </h3>
            
            <form onSubmit={handleDonation} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số coin
                </label>
                <input
                  type="number"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(parseInt(e.target.value) || 0)}
                  min="1"
                  max={user?.coinBalance || 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Số coin hiện có: {user?.coinBalance || 0}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lời nhắn (tùy chọn)
                </label>
                <textarea
                  value={donationMessage}
                  onChange={(e) => setDonationMessage(e.target.value)}
                  placeholder="Nhập lời nhắn..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600 font-medium"
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

