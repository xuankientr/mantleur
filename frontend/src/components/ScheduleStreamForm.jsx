import React, { useState } from 'react';
import { X, Calendar, Clock, Tag, Image, FileText } from 'lucide-react';

const ScheduleStreamForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null, 
  isEditing = false 
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    thumbnail: initialData?.thumbnail || '',
    scheduledAt: initialData?.scheduledAt ? 
      new Date(initialData.scheduledAt).toISOString().slice(0, 16) : '',
    duration: initialData?.duration || ''
  });

  const [errors, setErrors] = useState({});

  const categories = [
    'Gaming',
    'Music',
    'Talk Show',
    'Education',
    'Entertainment',
    'Sports',
    'Technology',
    'Art',
    'Cooking',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề là bắt buộc';
    }

    if (!formData.scheduledAt) {
      newErrors.scheduledAt = 'Thời gian lên lịch là bắt buộc';
    } else {
      const scheduledDate = new Date(formData.scheduledAt);
      const now = new Date();
      if (scheduledDate <= now) {
        newErrors.scheduledAt = 'Thời gian lên lịch phải trong tương lai';
      }
    }

    if (formData.duration && (isNaN(formData.duration) || formData.duration < 1)) {
      newErrors.duration = 'Thời lượng phải là số dương';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      duration: formData.duration ? parseInt(formData.duration) : null
    };

    onSubmit(submitData);
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      thumbnail: '',
      scheduledAt: '',
      duration: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Chỉnh sửa lịch stream' : 'Lên lịch stream mới'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiêu đề stream *
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          style={{ color: '#111827', fontWeight: '500' }}
          placeholder="Nhập tiêu đề stream"
        />
            </div>
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mô tả về stream của bạn..."
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thể loại
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn thể loại</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Scheduled Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thời gian lên lịch *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="datetime-local"
          name="scheduledAt"
          value={formData.scheduledAt}
          onChange={handleChange}
          className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium ${
            errors.scheduledAt ? 'border-red-500' : 'border-gray-300'
          }`}
          style={{ color: '#111827', fontWeight: '500' }}
        />
            </div>
            {errors.scheduledAt && (
              <p className="mt-1 text-sm text-red-600">{errors.scheduledAt}</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thời lượng dự kiến (phút)
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="number"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          min="1"
          className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium ${
            errors.duration ? 'border-red-500' : 'border-gray-300'
          }`}
          style={{ color: '#111827', fontWeight: '500' }}
          placeholder="Ví dụ: 120"
        />
            </div>
            {errors.duration && (
              <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
            )}
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thumbnail URL
            </label>
            <div className="relative">
              <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="url"
          name="thumbnail"
          value={formData.thumbnail}
          onChange={handleChange}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
          style={{ color: '#111827', fontWeight: '500' }}
          placeholder="https://example.com/thumbnail.jpg"
        />
            </div>
          </div>

          {/* Preview */}
          {formData.thumbnail && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preview
              </label>
              <img
                src={formData.thumbnail}
                alt="Thumbnail preview"
                className="w-full h-32 object-cover rounded-md border"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Cập nhật' : 'Lên lịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleStreamForm;



