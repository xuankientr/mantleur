import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Users, Clock, Play } from 'lucide-react';

const StreamCard = ({ stream }) => {
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
    <Link to={`/stream/${stream.id}`} className="stream-card group">
      {/* Thumbnail */}
      <div className="stream-thumbnail">
        <img
          src={stream.thumbnail || `https://picsum.photos/640/360?random=${stream.id}`}
          alt={stream.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
          <span>{formatViewerCount(stream.viewerCount)}</span>
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
      <div className="p-6">
        {/* Streamer Info */}
        <div className="flex items-center space-x-3 mb-3">
          <img
            src={stream.streamer?.avatar || `https://ui-avatars.com/api/?name=${stream.streamer?.username}&background=3b82f6&color=fff`}
            alt={stream.streamer?.username}
            className="w-8 h-8 rounded-full border-2 border-white shadow-md"
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
        <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
          {stream.title}
        </h3>
        
        {/* Description */}
        {stream.description && (
          <p className="text-slate-600 text-sm line-clamp-2 mb-4">
            {stream.description}
          </p>
        )}
        
        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{formatViewerCount(stream.viewerCount)} viewers</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatDuration(stream.createdAt)}</span>
            </div>
          </div>
          
          {/* Status */}
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            stream.isLive 
              ? 'bg-red-100 text-red-700' 
              : 'bg-slate-100 text-slate-600'
          }`}>
            {stream.isLive ? 'Đang phát' : 'Offline'}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default StreamCard;