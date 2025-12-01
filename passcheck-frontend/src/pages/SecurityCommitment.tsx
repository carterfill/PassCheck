import { Shield, CheckCircle, Lock, Eye, Globe, FileCheck, X } from 'lucide-react';
import { useState } from 'react';

const SecurityCommitment = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const securityProofs = [
    {
      title: 'VirusTotal',
      description: 'Quét bảo mật toàn diện từ 70+ công cụ antivirus hàng đầu',
      image: '/VirusTotal.png',
      status: 'Sạch 100%',
      link: 'https://www.virustotal.com',
      icon: Shield,
      color: 'text-blue-400'
    },
    {
      title: 'Sucuri SiteCheck',
      description: 'Kiểm tra malware, blacklist và các mối đe dọa bảo mật',
      image: '/Sucuri SiteCheck.png',
      status: 'Không phát hiện mối đe dọa',
      link: 'https://sitecheck.sucuri.net',
      icon: FileCheck,
      color: 'text-green-400'
    },
    {
      title: 'Google Transparency Report',
      description: 'Báo cáo minh bạch từ Google về trạng thái bảo mật website',
      image: '/Google Transparency Report.png',
      status: 'An toàn',
      link: 'https://transparencyreport.google.com',
      icon: Globe,
      color: 'text-yellow-400'
    },
    {
      title: 'Blacklight Privacy Inspector',
      description: 'Kiểm tra theo dõi người dùng và quyền riêng tư',
      image: '/Blacklight.png',
      status: 'Không theo dõi người dùng',
      link: 'https://themarkup.org/blacklight',
      icon: Eye,
      color: 'text-purple-400'
    }
  ];

  const commitments = [
    {
      icon: Lock,
      title: 'Không lưu trữ mật khẩu',
      description: 'Mật khẩu của bạn được xử lý hoàn toàn trên trình duyệt. Chúng tôi không bao giờ lưu trữ hoặc gửi mật khẩu của bạn lên server.',
      color: 'bg-[#10A37F]'
    },
    {
      icon: Shield,
      title: 'Mã nguồn mở',
      description: 'Toàn bộ source code được công khai trên GitHub để mọi người có thể kiểm tra và đảm bảo tính minh bạch.',
      color: 'bg-blue-500'
    },
    {
      icon: CheckCircle,
      title: 'Không thu thập dữ liệu',
      description: 'Chúng tôi chỉ thu thập số lượng truy cập ẩn danh. Không có thông tin cá nhân hoặc dữ liệu nhạy cảm nào được thu thập.',
      color: 'bg-green-500'
    },
    {
      icon: Eye,
      title: 'Không quảng cáo',
      description: 'Website hoàn toàn miễn phí, không có quảng cáo hay tracking script từ bên thứ ba.',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-[#10A37F]/20 rounded-3xl">
            <Shield className="h-16 w-16 text-[#10A37F]" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white">
          Cam kết bảo mật
        </h1>
        <p className="text-xl text-white/70 max-w-3xl mx-auto">
          PassCheck cam kết bảo vệ quyền riêng tư và dữ liệu của bạn với các tiêu chuẩn bảo mật cao nhất
        </p>
      </div>

      {/* Process Flow */}
      <div className="bg-[#2a2b30] rounded-3xl p-8 border border-[#10A37F]/30 shadow-soft-lg">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Lock className="h-6 w-6 text-[#10A37F]" />
          Quy trình xử lý mật khẩu
        </h2>
        <div className="flex justify-center">
          <img 
            src="/quytrinhxulymatkhau.png" 
            alt="Quy trình xử lý mật khẩu an toàn" 
            className="rounded-2xl max-w-full h-auto shadow-lg border border-[#10A37F]/20"
          />
        </div>
        <p className="text-white/70 text-center mt-6">
          Mọi thao tác kiểm tra mật khẩu được thực hiện hoàn toàn trên trình duyệt của bạn
        </p>
      </div>

      {/* Commitments Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {commitments.map((commitment, index) => {
          const Icon = commitment.icon;
          return (
            <div
              key={index}
              className="bg-[#2a2b30] rounded-3xl p-6 border border-[#10A37F]/30 shadow-soft-lg hover:shadow-soft-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 ${commitment.color} rounded-2xl flex-shrink-0`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {commitment.title}
                  </h3>
                  <p className="text-white/70">
                    {commitment.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Security Proofs */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-3">
            Bằng chứng bảo mật
          </h2>
          <p className="text-white/70">
            Website được kiểm tra bởi các công cụ bảo mật hàng đầu thế giới
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {securityProofs.map((proof, index) => {
            const Icon = proof.icon;
            return (
              <div
                key={index}
                className="bg-[#2a2b30] rounded-3xl overflow-hidden border border-[#10A37F]/30 shadow-soft-lg hover:shadow-soft-xl transition-all duration-300 hover:scale-[1.02] group"
              >
                <div className="aspect-video bg-[#1a1b1e] relative overflow-hidden">
                  <img
                    src={proof.image}
                    alt={proof.title}
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 bg-[#10A37F]/20 rounded-xl`}>
                      <Icon className={`h-5 w-5 ${proof.color}`} />
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      {proof.title}
                    </h3>
                  </div>
                  <p className="text-white/70 mb-3">
                    {proof.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[#10A37F] font-semibold flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      {proof.status}
                    </span>
                    <button
                      onClick={() => setSelectedImage(proof.image)}
                      className="text-white/60 hover:text-[#10A37F] transition-colors text-sm cursor-pointer"
                    >
                      Xem chi tiết →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* GitHub Link */}
      <div className="bg-gradient-to-r from-[#10A37F]/20 to-blue-500/20 rounded-3xl p-8 border border-[#10A37F]/30 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">
          Mã nguồn mở & Minh bạch
        </h2>
        <p className="text-white/70 mb-6 max-w-2xl mx-auto">
          Toàn bộ source code của PassCheck được công khai trên GitHub. 
          Bạn có thể tự do kiểm tra, đóng góp hoặc tự host riêng cho mình.
        </p>
        <a
          href="https://github.com/ntdovn/PassCheck"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-[#10A37F] text-white px-8 py-4 rounded-2xl font-semibold hover:bg-[#0d8c6c] transition-colors shadow-soft text-lg"
        >
          🔓 Xem mã nguồn trên GitHub
        </a>
      </div>

      {/* Final Message */}
      <div className="bg-[#2a2b30] rounded-3xl p-8 border border-[#10A37F]/30 text-center">
        <p className="text-white/90 text-lg">
          Nếu bạn có bất kỳ câu hỏi nào về bảo mật, vui lòng liên hệ với chúng tôi qua{' '}
          <a href="https://github.com/ntdovn" className="text-[#10A37F] hover:underline font-semibold">
            GitHub
          </a>
        </p>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Đóng"
          >
            <X className="h-6 w-6 text-white" />
          </button>
          <div className="max-w-6xl w-full max-h-[90vh] overflow-auto">
            <img
              src={selectedImage}
              alt="Chi tiết bằng chứng bảo mật"
              className="w-full h-auto rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityCommitment;
