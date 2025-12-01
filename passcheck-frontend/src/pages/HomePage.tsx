import { Link } from 'react-router-dom';
import { Lock, Key, AlertCircle, Zap, CheckCircle, Database, AlertTriangle } from 'lucide-react';

const HomePage = () => {
  const benefits = [
    'Kiểm tra độ mạnh yếu theo nhiều tiêu chí',
    'Tính toán entropy và thời gian crack',
    'Kiểm tra rò rỉ qua Have I Been Pwned',
    'Tạo mật khẩu ngẫu nhiên an toàn',
    'Tạo mật khẩu từ từ khóa dễ nhớ',
    'Tạo passphrase từ các từ phổ biến',
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-8 md:mb-16">
        <div className="flex justify-center mb-4 md:mb-6 animate-float">
            <img src="/logo.png" alt="PassCheck Logo" className="w-auto transition-opacity duration-300" style={{ height: '10rem' }} />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 animate-fade-in px-4">
          PassCheck
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-white/80 mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
          Công cụ toàn diện để kiểm tra độ an toàn và tạo mật khẩu mạnh mẽ
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 md:gap-4 px-4">
          <Link to="/checker" className="btn-primary inline-flex items-center justify-center space-x-2 group w-full sm:w-auto">
            <Lock className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span>Kiểm tra ngay</span>
          </Link>
          <Link to="/generator" className="btn-secondary inline-flex items-center justify-center space-x-2 group w-full sm:w-auto">
            <Key className="h-5 w-5 group-hover:rotate-12 transition-transform" />
            <span>Tạo mật khẩu</span>
          </Link>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="card-soft">
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-block p-3 bg-[#10A37F] rounded-2xl shadow-soft mb-4">
            <Zap className="h-10 w-10 md:h-12 md:w-12 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 px-4">
            Tính năng nổi bật
          </h2>
          <p className="text-white/80 px-4">
            PassCheck cung cấp đầy đủ công cụ để bảo vệ tài khoản của bạn
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 rounded-2xl hover:bg-[#10A37F]/10 transition-all duration-300">
              <CheckCircle className="h-6 w-6 text-[#10A37F] flex-shrink-0 mt-0.5" />
              <span className="text-white">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Data Breaches Section */}
      <div className="mt-8 md:mt-16 mb-8 md:mb-12">
        <div className="text-center mb-6 md:mb-8">
          <AlertTriangle className="w-10 h-10 md:w-12 md:h-12 text-[#10A37F] mx-auto mb-4 animate-bounce-soft" />
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 px-4">
            Các Vụ Rò Rỉ Dữ Liệu Nổi Bật
          </h2>
          <p className="text-white/80 px-4">Cập nhật thông tin về các vụ rò rỉ mật khẩu lớn nhất</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Breach Card 1 - LinkedIn */}
          <div className="card-soft hover:shadow-glow transition-all duration-300">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#10A37F] rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white mb-1">LinkedIn</h3>
                <p className="text-2xl font-bold text-[#10A37F] mb-2">165M+</p>
                <p className="text-sm text-white/70 mb-2">Năm 2012, 2016</p>
                <p className="text-xs text-white/60">Email, mật khẩu đã mã hóa SHA-1</p>
              </div>
            </div>
          </div>

          {/* Breach Card 2 - Yahoo */}
          <div className="card-soft hover:shadow-glow transition-all duration-300">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#10A37F] rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white mb-1">Yahoo</h3>
                <p className="text-2xl font-bold text-[#10A37F] mb-2">3B+</p>
                <p className="text-sm text-white/70 mb-2">Năm 2013-2014</p>
                <p className="text-xs text-white/60">Tên, email, số điện thoại, mật khẩu</p>
              </div>
            </div>
          </div>

          {/* Breach Card 3 - Facebook */}
          <div className="card-soft hover:shadow-glow transition-all duration-300">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#10A37F] rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white mb-1">Facebook</h3>
                <p className="text-2xl font-bold text-[#10A37F] mb-2">533M+</p>
                <p className="text-sm text-white/70 mb-2">Năm 2019</p>
                <p className="text-xs text-white/60">Số điện thoại, tên, địa chỉ, email</p>
              </div>
            </div>
          </div>

          {/* Breach Card 4 - Adobe */}
          <div className="card-soft hover:shadow-glow transition-all duration-300">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#10A37F] rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white mb-1">Adobe</h3>
                <p className="text-2xl font-bold text-[#10A37F] mb-2">153M+</p>
                <p className="text-sm text-white/70 mb-2">Năm 2013</p>
                <p className="text-xs text-white/60">Email, mật khẩu, câu hỏi bảo mật</p>
              </div>
            </div>
          </div>

          {/* Breach Card 5 - MySpace */}
          <div className="card-soft hover:shadow-glow transition-all duration-300">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#10A37F] rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white mb-1">MySpace</h3>
                <p className="text-2xl font-bold text-[#10A37F] mb-2">360M+</p>
                <p className="text-sm text-white/70 mb-2">Năm 2013</p>
                <p className="text-xs text-white/60">Email, username, mật khẩu</p>
              </div>
            </div>
          </div>

          {/* Breach Card 6 - Dropbox */}
          <div className="card-soft hover:shadow-glow transition-all duration-300">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#10A37F] rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white mb-1">Dropbox</h3>
                <p className="text-2xl font-bold text-[#10A37F] mb-2">68M+</p>
                <p className="text-sm text-white/70 mb-2">Năm 2012</p>
                <p className="text-xs text-white/60">Email và mật khẩu đã băm</p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 card-soft">
            <p className="text-3xl font-bold text-[#10A37F] mb-2">4B+</p>
            <p className="text-sm text-white/80">Tổng số tài khoản bị rò rỉ</p>
          </div>
          <div className="text-center p-6 card-soft">
            <p className="text-3xl font-bold text-[#10A37F] mb-2">500+</p>
            <p className="text-sm text-white/80">Vụ rò rỉ dữ liệu lớn</p>
          </div>
          <div className="text-center p-6 card-soft">
            <p className="text-3xl font-bold text-[#10A37F] mb-2">60%</p>
            <p className="text-sm text-white/80">Người dùng tái sử dụng mật khẩu</p>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-12 bg-[#2a2b30] border-2 border-[#10A37F]/30 rounded-3xl p-6 shadow-soft">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-6 w-6 text-[#10A37F] flex-shrink-0 animate-pulse" />
          <div>
            <h3 className="font-semibold text-white mb-2">
              Lưu ý bảo mật
            </h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Tất cả các kiểm tra mật khẩu được thực hiện an toàn. Chúng tôi không lưu trữ 
              bất kỳ mật khẩu nào bạn nhập vào hệ thống. Khi kiểm tra rò rỉ, chỉ có hash 
              của mật khẩu được gửi đến API bên ngoài.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
