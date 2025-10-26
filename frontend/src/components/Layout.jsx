import React, { useEffect, useRef, useState } from 'react';
import api from '../utils/api';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import {
  Home,
  Video,
  User,
  LogOut,
  Settings,
  Coins,
  Menu,
  X,
  Bell,
  Search,
  Calendar,
  CreditCard
} from 'lucide-react';

const Layout = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef(null);
  const searchBoxRef = useRef(null);
  const { socket } = useSocket();
  const [liveNoti, setLiveNoti] = useState(null);
  const [notiCount, setNotiCount] = useState(0);
  const [toast, setToast] = useState(null);
  const { updateUser } = useAuth();

  useEffect(() => {
    const handler = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onLive = (data) => {
      // data: { streamerId, streamId, title, category }
      setLiveNoti({ ...data, ts: Date.now() });
      // Tự ẩn sau 6s
      setTimeout(() => setLiveNoti(null), 6000);
    };
    const onNotification = (payload) => {
      setNotiCount((c) => c + 1);
      try {
        if (payload?.type === 'donation') {
          const donor = payload?.donor?.username || 'Ẩn danh';
          const amount = payload?.amount ?? '';
          const message = payload?.message || '';
          setToast({
            id: Date.now(),
            title: 'Có donation mới',
            description: `${donor} đã donate ${amount} coin${message ? `: ${message}` : ''}`,
            ts: Date.now()
          });
          setTimeout(() => setToast(null), 5000);
        }
      } catch {}
    };
    const onCoinUpdate = (payload) => {
      if (payload?.balance !== undefined) {
        updateUser({ coinBalance: payload.balance });
      }
    };
    socket.on('streamer_live', onLive);
    socket.on('notification', onNotification);
    socket.on('coin-balance-update', onCoinUpdate);
    return () => {
      socket.off('streamer_live', onLive);
      socket.off('notification', onNotification);
      socket.off('coin-balance-update', onCoinUpdate);
    };
  }, [socket]);

  const navigation = [
    { name: 'Trang chủ', href: '/', icon: Home },
    { name: 'Lịch stream', href: '/scheduled-streams', icon: Calendar },
  ];

  const userNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Settings },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container-modern">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3 group">
                <img src="/logo.png" alt="Mantle UR" className="w-10 h-10 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105" />
                <span className="text-2xl font-bold">Mantle UR</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`nav-link ${isActive(item.href) ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Search Bar (desktop) */}
              <div className="relative hidden md:block" ref={searchBoxRef}>
                <div className="flex items-center bg-white rounded-xl border border-slate-300 px-3 py-2 w-72 focus-within:ring-2 focus-within:ring-blue-500/30">
                  <Search className="w-4 h-4 text-slate-500" />
                  <input
                    value={query}
                    onChange={(e) => {
                      const v = e.target.value;
                      setQuery(v);
                      setSearchOpen(!!v);
                      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
                      setSearchLoading(true);
                      searchTimeoutRef.current = setTimeout(async () => {
                        try {
                          if (!v) { setResults([]); setSearchLoading(false); return; }
                          const { data } = await api.get('/streams', {
                            params: { q: v, limit: 8, t: Date.now() }
                          });
                          setResults(Array.isArray(data.streams) ? data.streams : []);
                        } catch (e) {
                          setResults([]);
                        } finally {
                          setSearchLoading(false);
                        }
                      }, 300);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        // Keep dropdown; do not navigate on Enter
                        if (!results.length) {
                          setSearchOpen(false);
                        }
                      }
                    }}
                    onFocus={() => { if (query) setSearchOpen(true); }}
                    placeholder="Tìm stream, kênh, thể loại..."
                    className="ml-2 bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-500 w-full"
                  />
                </div>
                {searchOpen && (
                  <div className="absolute mt-2 w-[28rem] max-w-[28rem] bg-white border border-slate-200 rounded-xl shadow-2xl z-50">
                    <div className="p-2 max-h-80 overflow-auto">
                      {searchLoading ? (
                        <div className="px-3 py-2 text-slate-500 text-sm">Đang tìm kiếm...</div>
                      ) : results.length === 0 ? (
                        <div className="px-3 py-2 text-slate-500 text-sm">Không có kết quả</div>
                      ) : (
                        results.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => { setSearchOpen(false); setQuery(''); navigate(`/stream/${s.id}`); }}
                            className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-slate-100 rounded-lg text-left"
                          >
                            <img src={s.thumbnail || '/vite.svg'} alt={s.title} className="w-10 h-6 rounded object-cover" />
                            <div className="min-w-0">
                              <p className="text-sm text-slate-900 truncate">{s.title}</p>
                              <p className="text-xs text-slate-500 truncate">{s.streamer?.username} • {s.category}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              {isAuthenticated ? (
                <>
                  {/* Search (mobile icon) */}
                  <button className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200">
                    <Search className="w-5 h-5" />
                  </button>

                  {/* Notifications */}
                  <button className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200" onClick={() => setNotiCount(0)}>
                    <Bell className="w-5 h-5" />
                    {notiCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[0.75rem] h-3 px-1 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center">
                        {notiCount}
                      </span>
                    )}
                  </button>

                  {/* Coin Balance */}
                  <div className="hidden sm:flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                    <Coins className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-700">{user?.coinBalance || 0}</span>
                  </div>

                  {/* User Dropdown */}
                  <div className="relative group">
                    <button className="flex items-center space-x-3 p-2 hover:bg-slate-100 rounded-xl transition-all duration-200">
                      <img
                        src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=3b82f6&color=fff`}
                        alt={user?.username}
                        className="w-8 h-8 rounded-full border-2 border-slate-700"
                      />
                      <span className="hidden lg:block text-sm font-medium text-slate-900">{user?.username}</span>
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-2">
                        <div className="px-4 py-3 border-b border-slate-200">
                          <p className="text-sm font-semibold text-slate-900">{user?.username}</p>
                          <p className="text-xs text-slate-500">{user?.email}</p>
                        </div>
                        {userNavigation.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.name}
                              to={item.href}
                              className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-100 transition-colors duration-150"
                            >
                              <Icon className="w-4 h-4" />
                              <span>{item.name}</span>
                            </Link>
                          );
                        })}
                        <button
                          onClick={logout}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="btn btn-ghost btn-md"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-primary btn-md"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all duration-200"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                      isActive(item.href) 
                        ? 'bg-blue-50 text-blue-700 shadow-sm' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {isAuthenticated && (
                <>
                  <div className="border-t border-slate-200 pt-3 mt-3">
                    <div className="flex items-center space-x-3 px-4 py-3 bg-slate-100 rounded-xl">
                      <img
                        src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=3b82f6&color=fff`}
                        alt={user?.username}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{user?.username}</p>
                        <p className="text-xs text-slate-500">{user?.coinBalance || 0} coin</p>
                      </div>
                    </div>
                    {userNavigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors duration-150"
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-150"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container-modern section-padding">
        {toast && (
          <div className="mb-4">
            <div className="bg-blue-600 text-white px-4 py-3 rounded-xl shadow-lg">
              <p className="font-semibold">{toast.title}</p>
              <p className="text-sm opacity-90">{toast.description}</p>
            </div>
          </div>
        )}
        {liveNoti && (
          <div className="mb-4">
            <div className="bg-green-600 text-white px-4 py-3 rounded-xl flex items-center justify-between shadow-lg">
              <div>
                <p className="font-semibold">Streamer bạn theo dõi vừa live</p>
                <p className="text-sm opacity-90">{liveNoti.title}</p>
              </div>
              <Link to={`/stream/${liveNoti.streamId}`} className="bg-white text-green-700 px-3 py-1 rounded-lg font-semibold">
                Xem ngay
              </Link>
            </div>
          </div>
        )}
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="footer bg-white border-t border-slate-200">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title text-slate-900">Mantle UR</h3>
            <p className="text-slate-600 text-sm">Nền tảng livestream giải trí cho mọi người.</p>
          </div>
          <div className="footer-section">
            <h3 className="footer-title text-slate-900">Sản phẩm</h3>
            <div className="space-y-2">
              <a href="#" className="footer-link">Livestream</a>
              <a href="#" className="footer-link">Chat</a>
              <a href="#" className="footer-link">Donation</a>
            </div>
          </div>
          <div className="footer-section">
            <h3 className="footer-title text-slate-900">Hỗ trợ</h3>
            <div className="space-y-2">
              <a href="#" className="footer-link">Trung tâm trợ giúp</a>
              <a href="#" className="footer-link">Liên hệ</a>
              <a href="#" className="footer-link">Báo lỗi</a>
            </div>
          </div>
          <div className="footer-section">
            <h3 className="footer-title text-slate-900">Pháp lý</h3>
            <div className="space-y-2">
              <a href="#" className="footer-link">Điều khoản sử dụng</a>
              <a href="#" className="footer-link">Chính sách bảo mật</a>
              <a href="#" className="footer-link">Cookie</a>
            </div>
          </div>
        </div>
        <div className="container-modern border-t border-slate-200 pt-8 mt-8">
          <p className="text-center text-slate-600 text-sm">© 2024 Mantle UR. Tất cả quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;