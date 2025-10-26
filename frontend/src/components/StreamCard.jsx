import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Users, Clock, Play } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';

const StreamCard = ({ stream }) => {
  const { socket } = useSocket();
  const [viewerCount, setViewerCount] = useState(stream.viewerCount);

  // Update viewer count when stream prop changes
  useEffect(() => {
    setViewerCount(stream.viewerCount);
  }, [stream.viewerCount]);

  // Listen for realtime viewer count updates
  useEffect(() => {
    if (!socket) return;

    const handleViewerCountUpdate = (data) => {
      // Only update if this is for our specific stream
      if (data.streamId === stream.id) {
        setViewerCount(data.count);
      }
    };

    socket.on('viewer-count-update', handleViewerCountUpdate);

    return () => {
      socket.off('viewer-count-update', handleViewerCountUpdate);
    };
  }, [socket, stream.id]);

  // Curated Unsplash CDN images (direct URLs avoid redirects/CORS issues)
  const gamingCdnImages = [
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1280&q=80',
    'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1280&q=80',
    'https://images.unsplash.com/photo-1603484477859-abe6a73f9363?auto=format&fit=crop&w=1280&q=80',
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1280&q=80',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1280&q=80',
    'https://images.unsplash.com/photo-1542326237-94b1c5a538d9?auto=format&fit=crop&w=1280&q=80',
    'https://images.unsplash.com/photo-1546447147-3fc2b8181a77?auto=format&fit=crop&w=1280&q=80',
    'https://images.unsplash.com/photo-1511512578047-338a4d4834b0?auto=format&fit=crop&w=1280&q=80',
    'https://images.unsplash.com/photo-1585079542156-2755d9b2a662?auto=format&fit=crop&w=1280&q=80',
    'https://images.unsplash.com/photo-1585079542118-2282d9627b68?auto=format&fit=crop&w=1280&q=80'
  ];

  const pickGamingThumb = (key) => {
    const str = String(key ?? 'seed');
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    return gamingCdnImages[hash % gamingCdnImages.length];
  };

  // Build candidate list and auto-fallback on error
  const imageCandidates = useMemo(() => {
    const picked = pickGamingThumb(stream.id);
    return [
      stream.thumbnail,
      picked,
      'https://images.unsplash.com/photo-1619682817761-4a90a5535480?auto=format&fit=crop&w=1280&q=80', // gaming room
      'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1280&q=80', // controller
      `https://picsum.photos/seed/${stream.id}/1280/720`
    ].filter(Boolean);
  }, [stream.id, stream.thumbnail]);

  const [imgIndex, setImgIndex] = useState(0);
  const currentImgSrc = imageCandidates[imgIndex] || `https://picsum.photos/seed/${stream.id}-fallback/1280/720`;

  const formatViewerCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatDuration = (date) => {
    const now = new Date();
    const streamDate = new Date(date);
    const diffInHours = Math.floor((now - streamDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Vừa bắt đầu';
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days} ngày`;
    }
  };

  return (
    <Link to={`/stream/${stream.id}`} className="stream-card group h-full flex flex-col">
      {/* Thumbnail */}
      <div className="stream-thumbnail">
        <img
          src={currentImgSrc}
          alt={stream.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImgIndex((i) => (i + 1))}
        />
        
        {/* Overlay */}
        <div className="stream-overlay"></div>
        
        {/* Live Badge */}
        {stream.isLive && (
          <div className="stream-badge">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>LIVE</span>
          </div>
        )}
        
        {/* Viewer Count */}
        <div className="stream-viewers">
          <Eye className="w-3 h-3" />
          <span>{formatViewerCount(viewerCount)}</span>
        </div>
        
        {/* Category */}
        {stream.category && (
          <div className="stream-category">
            {stream.category}
          </div>
        )}
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
            <Play className="w-6 h-6 text-slate-900 ml-1" />
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Streamer Info */}
        <div className="flex items-center space-x-3 mb-3">
          <img
            src={stream.streamer?.avatar || `https://ui-avatars.com/api/?name=${stream.streamer?.username}&background=3b82f6&color=fff`}
            alt={stream.streamer?.username}
            className="w-8 h-8 rounded-full border-2 border-white/20 shadow-md"
          />
          <div>
            <h4 className="font-semibold text-slate-900 text-sm">
              {stream.streamer?.username}
            </h4>
            <p className="text-xs text-slate-500">
              {formatDuration(stream.createdAt)}
            </p>
          </div>
        </div>
        
        {/* Title */}
        <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors duration-200">
          {stream.title}
        </h3>
        
        {/* Description */}
        {stream.description && (
          <p className="text-slate-700 text-sm line-clamp-2 mb-4">
            {stream.description}
          </p>
        )}
        
        {/* Stats */}
        <div className="mt-auto flex items-center justify-between text-xs text-slate-600 pt-3">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{formatViewerCount(viewerCount)} viewers</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatDuration(stream.createdAt)}</span>
            </div>
          </div>
          
          {/* Status */}
          <div className={`px-3 py-1 rounded-full text-xs font-medium border shrink-0 whitespace-nowrap ${
            stream.isLive 
              ? 'bg-rose-100 text-rose-700 border-rose-200' 
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            {stream.isLive ? 'Đang phát' : 'Offline'}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default StreamCard;