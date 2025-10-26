import React from 'react';
import { Calendar, Clock, User, Play } from 'lucide-react';

const ScheduledStreamCard = ({ scheduledStream, onStartStream, onEdit, onDelete, isOwner = false }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const canStartStream = () => {
    const now = new Date();
    const scheduledTime = new Date(scheduledStream.scheduledAt);
    const timeDiff = scheduledTime - now;
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    return scheduledStream.status === 'scheduled' && hoursDiff <= 1; // Có thể bắt đầu 1 giờ trước
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Thumbnail */}
      <div className="relative h-48 bg-gray-200">
        {scheduledStream.thumbnail ? (
          <img 
            src={scheduledStream.thumbnail} 
            alt={scheduledStream.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400">
            <Play className="w-12 h-12 text-white" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(scheduledStream.status)}`}>
            {getStatusText(scheduledStream.status)}
          </span>
        </div>

        {/* Category Badge */}
        {scheduledStream.category && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
              {scheduledStream.category}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
          {scheduledStream.title}
        </h3>
        
        {scheduledStream.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {scheduledStream.description}
          </p>
        )}

        {/* Streamer Info */}
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
            {scheduledStream.streamer?.avatar ? (
              <img 
                src={scheduledStream.streamer.avatar} 
                alt={scheduledStream.streamer.username}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <User className="w-4 h-4 text-gray-600" />
            )}
          </div>
          <span className="text-sm text-gray-700 font-medium">
            {scheduledStream.streamer?.username}
          </span>
        </div>

        {/* Schedule Info */}
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <Calendar className="w-4 h-4 mr-1" />
          <span>{formatDate(scheduledStream.scheduledAt)}</span>
        </div>

        {scheduledStream.duration && (
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <Clock className="w-4 h-4 mr-1" />
            <span>{scheduledStream.duration} phút</span>
          </div>
        )}

        {/* Action Buttons */}
        {isOwner && (
          <div className="flex space-x-2">
            {canStartStream() && (
              <button
                onClick={() => onStartStream(scheduledStream.id)}
                className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Bắt đầu Stream
              </button>
            )}
            
            {scheduledStream.status === 'scheduled' && (
              <>
                <button
                  onClick={() => onEdit(scheduledStream.id)}
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Sửa
                </button>
                <button
                  onClick={() => onDelete(scheduledStream.id)}
                  className="px-3 py-2 border border-red-300 text-red-700 rounded-md text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  Hủy
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduledStreamCard;









