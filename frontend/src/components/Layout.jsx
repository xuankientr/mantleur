import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
  Search
} from 'lucide-react';

const Layout = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Trang chủ', href: '/', icon: Home },
  ];

  const userNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Settings },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-200">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
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
                    className={`nav-link ${isActive(item.href) ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {/* Search */}
                  <button className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all duration-200">
                    <Search className="w-5 h-5" />
                  </button>

                  {/* Notifications */}
                  <button className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all duration-200">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                  </button>

                  {/* Coin Balance */}
                  <div className="hidden sm:flex items-center space-x-2 bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-semibold text-slate-100">{user?.coinBalance || 0}</span>
                  </div>

                  {/* User Dropdown */}
                  <div className="relative group">
                    <button className="flex items-center space-x-3 p-2 hover:bg-slate-800 rounded-xl transition-all duration-200">
                      <img
                        src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=3b82f6&color=fff`}
                        alt={user?.username}
                        className="w-8 h-8 rounded-full border-2 border-slate-700"
                      />
                      <span className="hidden lg:block text-sm font-medium text-slate-700">{user?.username}</span>
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-56 bg-slate-900 rounded-2xl shadow-xl border border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-2">
                        <div className="px-4 py-3 border-b border-slate-800">
                          <p className="text-sm font-semibold text-slate-100">{user?.username}</p>
                          <p className="text-xs text-slate-400">{user?.email}</p>
                        </div>
                        {userNavigation.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.name}
                              to={item.href}
                              className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 transition-colors duration-150"
                            >
                              <Icon className="w-4 h-4" />
                              <span>{item.name}</span>
                            </Link>
                          );
                        })}
                        <button
                          onClick={logout}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-400 hover:bg-red-900/20 transition-colors duration-150"
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
          <div className="md:hidden bg-slate-900 border-t border-slate-700 shadow-lg">
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
                        ? 'bg-slate-800 text-white shadow-sm' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {isAuthenticated && (
                <>
                  <div className="border-t border-slate-700 pt-3 mt-3">
                    <div className="flex items-center space-x-3 px-4 py-3 bg-slate-800 rounded-xl">
                      <img
                        src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=3b82f6&color=fff`}
                        alt={user?.username}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-100">{user?.username}</p>
                        <p className="text-xs text-slate-400">{user?.coinBalance || 0} coin</p>
                      </div>
                    </div>
                    {userNavigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors duration-150"
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
                      className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-xl transition-colors duration-150"
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
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="footer bg-slate-950 border-t border-slate-800">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">Mantle UR</h3>
            <p className="text-slate-400 text-sm">Nền tảng livestream giải trí cho mọi người.</p>
          </div>
          <div className="footer-section">
            <h3 className="footer-title">Sản phẩm</h3>
            <div className="space-y-2">
              <a href="#" className="footer-link">Livestream</a>
              <a href="#" className="footer-link">Chat</a>
              <a href="#" className="footer-link">Donation</a>
            </div>
          </div>
          <div className="footer-section">
            <h3 className="footer-title">Hỗ trợ</h3>
            <div className="space-y-2">
              <a href="#" className="footer-link">Trung tâm trợ giúp</a>
              <a href="#" className="footer-link">Liên hệ</a>
              <a href="#" className="footer-link">Báo lỗi</a>
            </div>
          </div>
          <div className="footer-section">
            <h3 className="footer-title">Pháp lý</h3>
            <div className="space-y-2">
              <a href="#" className="footer-link">Điều khoản sử dụng</a>
              <a href="#" className="footer-link">Chính sách bảo mật</a>
              <a href="#" className="footer-link">Cookie</a>
            </div>
          </div>
        </div>
        <div className="container-modern border-t border-slate-800 pt-8 mt-8">
          <p className="text-center text-slate-400 text-sm">© 2024 Mantle UR. Tất cả quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;