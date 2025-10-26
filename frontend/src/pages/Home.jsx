import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { streamAPI } from '../utils/api';
import api from '../utils/api';
import StreamCard from '../components/StreamCard';
import ScheduledStreamCard from '../components/ScheduledStreamCard';
import { Video, Users, TrendingUp, Star, Zap, Heart, Calendar, Clock } from 'lucide-react';

const Home = () => {
  const [streams, setStreams] = useState([]);
  const [scheduledStreams, setScheduledStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduledLoading, setScheduledLoading] = useState(true);
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

  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';

  useEffect(() => {
    fetchStreams();
    fetchScheduledStreams();
  }, [category, q]);

  const fetchStreams = async () => {
    try {
      setLoading(true);
      const params = {};
      if (category && category !== 'Tất cả') {
        params.category = category;
      }
      if (q) {
        params.q = q;
        params.limit = 30;
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

  const fetchScheduledStreams = async () => {
    try {
      setScheduledLoading(true);
      const response = await api.get('/scheduled-streams?limit=6&status=scheduled');
      setScheduledStreams(response.data.scheduledStreams);
    } catch (err) {
      console.error('Error fetching scheduled streams:', err);
    } finally {
      setScheduledLoading(false);
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
      <section className="relative bg-white">
        {/* Animated blobs underneath the text for subtle depth */}
        <div aria-hidden="true" className="hero-3d">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>

        <div className="container-modern py-20 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900">
            Khám phá livestream trên <span className="text-blue-600">Mantle UR</span>
          </h1>
          <p className="text-slate-900 max-w-2xl mx-auto mt-6 mb-10 text-lg">
              Nơi bạn xem và kết nối với các streamer yêu thích. Giải trí mỗi ngày.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link to="/register" className="btn btn-primary btn-lg">
              Bắt đầu Livestream
            </Link>
            <Link to="/streams" className="btn btn-outline btn-lg">
              Xem Livestream
            </Link>
          </div>
            
            {/* Hero Features */}
            <div className="hero-features mt-12">
              <div className="hero-feature">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Video className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-slate-900">Livestream mượt</h3>
                  <p className="text-sm text-slate-900">Trải nghiệm ổn định, ít độ trễ</p>
                </div>
              </div>
              <div className="hero-feature">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-slate-900">Cộng đồng</h3>
                  <p className="text-sm text-slate-900">Kết nối với hàng nghìn người</p>
                </div>
              </div>
              <div className="hero-feature">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-slate-900">Donation</h3>
                  <p className="text-sm text-slate-900">Hỗ trợ streamer yêu thích</p>
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
                  : 'bg-white text-slate-900 border border-slate-300 hover:border-blue-600 hover:text-blue-700'
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
            Streams đang hoạt động
          </h2>
          <p className="text-slate-900 text-lg">
            Khám phá những livestream thú vị đang diễn ra ngay bây giờ
          </p>
        </div>

        {streams.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {q ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có livestream nào'}
            </h3>
            <p className="text-slate-900 mb-6">
              {q ? 'Thử tìm với từ khóa khác hoặc đổi danh mục.' : 'Hiện không có livestream nào đang hoạt động trong danh mục này.'}
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

      {/* Scheduled Streams Section */}
      <section className="container-modern">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Streams sắp diễn ra
          </h2>
          <p className="text-slate-900 text-lg">
            Xem trước những livestream thú vị sẽ diễn ra
          </p>
        </div>

        {scheduledLoading ? (
          <div className="text-center py-16">
            <div className="loading-spinner w-12 h-12 mx-auto"></div>
            <p className="mt-4 text-slate-400">Đang tải lịch stream...</p>
          </div>
        ) : scheduledStreams.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto max-w-3xl card p-10">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Chưa có stream nào được lên lịch</h3>
              <p className="text-slate-900 mb-8">Theo dõi các kênh yêu thích hoặc tạo lịch stream để người xem nhận thông báo trước.</p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Link to="/scheduled-streams" className="btn btn-primary btn-md rounded-full shadow-lg">
                  <Calendar className="w-5 h-5 mr-2" />
                  Xem tất cả lịch stream
                </Link>
                <Link to="/dashboard" className="btn btn-outline btn-md rounded-full">
                  Lên lịch stream của bạn
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-200 p-4 bg-white">
                  <div className="text-sm font-semibold text-slate-900 mb-1">Nhận thông báo</div>
                  <div className="text-sm text-slate-500">Bật chuông để không bỏ lỡ buổi phát sắp tới.</div>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 bg-white">
                  <div className="text-sm font-semibold text-slate-900 mb-1">Theo dõi streamer</div>
                  <div className="text-sm text-slate-500">Nhận cập nhật khi họ lên lịch hoặc bắt đầu phát.</div>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 bg-white">
                  <div className="text-sm font-semibold text-slate-900 mb-1">Khám phá thể loại</div>
                  <div className="text-sm text-slate-500">Tìm lịch stream theo chủ đề bạn quan tâm.</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {scheduledStreams.map((stream) => (
                <ScheduledStreamCard
                  key={stream.id}
                  scheduledStream={stream}
                  isOwner={false}
                />
              ))}
            </div>
            
            <div className="text-center">
              <Link to="/scheduled-streams" className="btn btn-primary btn-md rounded-full shadow-lg">
                <Calendar className="w-5 h-5 mr-2" />
                Xem tất cả lịch stream
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Features Section */}
      <section className="container-modern">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Tại sao chọn MantleUR?
          </h2>
          <p className="text-slate-900 text-lg">
            Những tính năng độc đáo làm nên sự khác biệt
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card card-hover p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Cộng đồng sôi động</h3>
            <p className="text-slate-900">
              Tham gia cộng đồng streamer và viewer sôi động với hàng nghìn người dùng hoạt động mỗi ngày.
            </p>
          </div>

          <div className="card card-hover p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Phát triển bền vững</h3>
            <p className="text-slate-900">
              Cơ hội phát triển kênh và kiếm thu nhập thông qua hệ thống donation và tương tác.
            </p>
          </div>

          <div className="card card-hover p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Trải nghiệm tuyệt vời</h3>
            <p className="text-slate-900">
              Giao diện hiện đại, mượt mà, tối ưu cho xem và phát livestream.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container-modern">
        <div className="card p-12 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">
            MantleUR trong số liệu
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">1,000+</div>
              <div className="text-slate-900">Streamer hoạt động</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">50,000+</div>
              <div className="text-slate-900">Viewer mỗi ngày</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">10,000+</div>
              <div className="text-slate-900">Giờ streaming</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">99.9%</div>
              <div className="text-slate-900">Uptime</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;