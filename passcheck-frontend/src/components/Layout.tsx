import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Lock, Key, AlertCircle, Home, Shield } from 'lucide-react';
import VisitorStats from './VisitorStats';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const navigation = [
    { name: 'Trang chủ', href: '/', icon: Home },
    { name: 'Kiểm tra mật khẩu', href: '/checker', icon: Lock },
    { name: 'Tạo mật khẩu', href: '/generator', icon: Key },
    { name: 'Kiểm tra rò rỉ', href: '/breach', icon: AlertCircle },
    { name: 'Cam kết bảo mật', href: '/security', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-[#232429] flex flex-col">
      {/* Visitor Stats */}
      <VisitorStats />
      
      {/* Header */}
      <header className="bg-[#2a2b30] backdrop-blur-md shadow-soft border-b border-[#10A37F]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center group">
              <img src="/logo.png" alt="PassCheck Logo" className="w-auto transition-opacity duration-300" style={{ height: '10rem' }} />
            </Link>
            
            <nav className="hidden md:flex space-x-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl transition-all duration-300 ${
                      isActive
                        ? 'bg-[#10A37F] text-white shadow-soft'
                        : 'text-white hover:bg-[#10A37F]/20 hover:text-[#10A37F]'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-[#2a2b30] backdrop-blur-md border-b border-[#10A37F]/30">
        <div className="flex overflow-x-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center justify-center min-w-fit px-6 py-3 transition-all duration-300 ${
                  isActive
                    ? 'text-[#10A37F] border-b-2 border-[#10A37F] bg-[#10A37F]/10'
                    : 'text-white hover:text-[#10A37F]'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#2a2b30] backdrop-blur-md border-t border-[#10A37F]/30 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-white">
            <p className="text-sm font-bold">
              © 2025 PassCheck - Created by CTex Team
            </p>
            <p className="text-xs mt-2 text-white/70">
              Bảo mật thông tin của bạn là ưu tiên hàng đầu
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
