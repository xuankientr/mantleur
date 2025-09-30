import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { streamAPI } from '../utils/api';
import StreamCard from '../components/StreamCard';
import { Video, Users, TrendingUp, Star, Zap, Heart } from 'lucide-react';

const Home = () => {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('');

  const categories = [
    'Tất cả',
    'Gaming',
    'Music',
    'Talk',
    'Sports',
    'Education',
    'Entertainment'
  ];

  useEffect(() => {
    fetchStreams();
  }, [category]);

  const fetchStreams = async () => {
    try {
      setLoading(true);
      const params = {};
      if (category && category !== 'Tất cả') {
        params.category = category;
      }
      
      const response = await streamAPI.getStreams(params);
      setStreams(response.data.streams);
    } catch (err) {
      console.error('Error fetching streams:', err);
      setError('Không thể tải danh sách livestream');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-12 h-12 mx-auto"></div>
          <p className="mt-4 text-slate-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchStreams} className="btn btn-primary">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container-modern py-20">
          <div className="hero-content">
            <h1 className="hero-title">
              Chào mừng đến với{' '}
              <span className="text-gradient">MantleUR</span>
            </h1>
            <p className="hero-subtitle">
              Nền tảng livestream thế hệ mới với công nghệ WebRTC tiên tiến
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn btn-primary btn-lg">
                <Zap className="w-5 h-5 mr-2" />
                Bắt đầu Livestream
              </Link>
              <Link to="/streams" className="btn btn-outline btn-lg">
                <Video className="w-5 h-5 mr-2" />
                Xem Livestream
              </Link>
            </div>
            
            {/* Hero Features */}
            <div className="hero-features mt-12">
              <div className="hero-feature">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">WebRTC</h3>
                  <p className="text-sm opacity-80">Công nghệ streaming tiên tiến</p>
                </div>
              </div>
              <div className="hero-feature">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Cộng đồng</h3>
                  <p className="text-sm opacity-80">Kết nối với hàng nghìn người</p>
                </div>
              </div>
              <div className="hero-feature">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Donation</h3>
                  <p className="text-sm opacity-80">Hỗ trợ streamer yêu thích</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="container-modern">
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                category === cat
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Live Streams Section */}
      <section className="container-modern">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            <Video className="w-8 h-8 inline-block mr-3 text-blue-600" />
            Streams đang hoạt động
          </h2>
          <p className="text-slate-600 text-lg">
            Khám phá những livestream thú vị đang diễn ra ngay bây giờ
          </p>
        </div>

        {streams.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Video className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Chưa có livestream nào
            </h3>
            <p className="text-slate-600 mb-6">
              Hiện không có livestream nào đang hoạt động trong danh mục này.
            </p>
            <Link to="/register" className="btn btn-primary">
              Tạo stream đầu tiên
            </Link>
          </div>
        ) : (
          <div className="grid-streams">
            {streams.map((stream) => (
              <StreamCard key={stream.id} stream={stream} />
            ))}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="container-modern">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Tại sao chọn MantleUR?
          </h2>
          <p className="text-slate-600 text-lg">
            Những tính năng độc đáo làm nên sự khác biệt
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card card-hover p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Cộng đồng sôi động</h3>
            <p className="text-slate-600">
              Tham gia cộng đồng streamer và viewer sôi động với hàng nghìn người dùng hoạt động mỗi ngày.
            </p>
          </div>

          <div className="card card-hover p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Phát triển bền vững</h3>
            <p className="text-slate-600">
              Cơ hội phát triển kênh và kiếm thu nhập thông qua hệ thống donation và tương tác.
            </p>
          </div>

          <div className="card card-hover p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Trải nghiệm tuyệt vời</h3>
            <p className="text-slate-600">
              Giao diện hiện đại, mượt mà với công nghệ WebRTC cho chất lượng streaming cao nhất.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container-modern">
        <div className="card card-glass p-12 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">
            MantleUR trong số liệu
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">1,000+</div>
              <div className="text-slate-600">Streamer hoạt động</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">50,000+</div>
              <div className="text-slate-600">Viewer mỗi ngày</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">10,000+</div>
              <div className="text-slate-600">Giờ streaming</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">99.9%</div>
              <div className="text-slate-600">Uptime</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;