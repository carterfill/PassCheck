import { useState } from 'react';
import { AlertCircle, Eye, EyeOff, ShieldAlert, ShieldCheck } from 'lucide-react';
import { breachApi } from '../services/api';
import toast from 'react-hot-toast';

const BreachChecker = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [breachResult, setBreachResult] = useState<{
    breached: boolean;
    count: number;
    message: string;
  } | null>(null);
  const [commonResult, setCommonResult] = useState<{
    isCommon: boolean;
    foundIn: string;
    message: string;
  } | null>(null);

  const handleCheck = async () => {
    if (!password) {
      toast.error('Vui lòng nhập mật khẩu');
      return;
    }

    setLoading(true);
    try {
      const [breach, common] = await Promise.all([
        breachApi.checkBreach(password),
        breachApi.checkCommon(password)
      ]);
      setBreachResult(breach);
      setCommonResult(common);
      
      if (breach.breached || common.isCommon) {
        toast.error('Mật khẩu không an toàn!');
      } else {
        toast.success('Mật khẩu an toàn!');
      }
    } catch (error) {
      console.error('Error checking breach:', error);
      toast.error('Không thể kiểm tra mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const isUnsafe = breachResult?.breached || commonResult?.isCommon;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <AlertCircle className="h-16 w-16 text-[#10A37F] mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-white mb-2">
          Kiểm tra rò rỉ mật khẩu
        </h1>
        <p className="text-white/80">
          Kiểm tra xem mật khẩu có bị lộ trong các vụ hack hay không
        </p>
      </div>

      {/* Input Section */}
      <div className="card mb-8">
        <label className="block text-sm font-medium text-white mb-2">
          Nhập mật khẩu cần kiểm tra
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCheck()}
            placeholder="Nhập mật khẩu của bạn..."
            className="input-field pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#232429] hover:text-[#10A37F]"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        <button
          onClick={handleCheck}
          disabled={loading}
          className="btn-primary w-full mt-4"
        >
          {loading ? 'Đang kiểm tra...' : 'Kiểm tra rò rỉ'}
        </button>
      </div>

      {/* Security Notice */}
      <div className="card border-[#10A37F]/50 mb-8">
        <div className="flex items-start space-x-3">
          <ShieldCheck className="h-5 w-5 text-[#10A37F] flex-shrink-0 mt-0.5" />
          <div className="text-sm text-white">
            <p className="font-semibold mb-1">Bảo mật và riêng tư</p>
            <p>
              Mật khẩu của bạn được băm (hash) trước khi kiểm tra. Chỉ 5 ký tự đầu của hash 
              được gửi đến API Have I Been Pwned. Mật khẩu gốc không bao giờ rời khỏi thiết bị của bạn.
            </p>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {(breachResult || commonResult) && (
        <div className="space-y-6 animate-slide-up">
          {/* Overall Status */}
          <div className={`card ${isUnsafe ? 'border-white/30' : 'border-[#10A37F]/50'}`}>
            <div className="flex items-center space-x-4">
              {isUnsafe ? (
                <ShieldAlert className="h-12 w-12 text-white" />
              ) : (
                <ShieldCheck className="h-12 w-12 text-[#10A37F]" />
              )}
              <div className="flex-1">
                <h2 className={`text-2xl font-bold ${isUnsafe ? 'text-white' : 'text-[#10A37F]'}`}>
                  {isUnsafe ? 'Mật khẩu không an toàn!' : 'Mật khẩu an toàn'}
                </h2>
                <p className={`text-sm ${isUnsafe ? 'text-white/80' : 'text-[#10A37F]/80'}`}>
                  {isUnsafe 
                    ? 'Không nên sử dụng mật khẩu này' 
                    : 'Mật khẩu này chưa bị phát hiện trong các vụ rò rỉ'}
                </p>
              </div>
            </div>
          </div>

          {/* Breach Check Result */}
          {breachResult && (
            <div className="card">
              <div className="flex items-start space-x-3 mb-4">
                <AlertCircle className={`h-6 w-6 flex-shrink-0 ${breachResult.breached ? 'text-white' : 'text-[#10A37F]'}`} />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">
                    Kiểm tra Have I Been Pwned
                  </h3>
                  <p className="text-white/80">{breachResult.message}</p>
                  {breachResult.breached && (
                    <div className="mt-4 p-4 bg-[#232429] rounded-lg border border-white/10">
                      <p className="text-white font-semibold mb-2">
                        Mật khẩu này đã xuất hiện trong {breachResult.count.toLocaleString()} vụ rò rỉ dữ liệu!
                      </p>
                      <p className="text-white/70 text-sm">
                        Điều này có nghĩa là hacker có thể đã có mật khẩu này trong danh sách của họ. 
                        Bạn nên đổi mật khẩu ngay lập tức.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Common Password Check Result */}
          {commonResult && (
            <div className="card">
              <div className="flex items-start space-x-3 mb-4">
                <AlertCircle className={`h-6 w-6 flex-shrink-0 ${commonResult.isCommon ? 'text-white' : 'text-[#10A37F]'}`} />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">
                    Kiểm tra mật khẩu phổ biến
                  </h3>
                  <p className="text-white/80">{commonResult.message}</p>
                  {commonResult.isCommon && (
                    <div className="mt-4 p-4 bg-[#232429] rounded-lg border border-white/10">
                      <p className="text-white font-semibold mb-2">
                        Mật khẩu này nằm trong danh sách mật khẩu phổ biến!
                      </p>
                      <p className="text-white/70 text-sm">
                        Mật khẩu phổ biến rất dễ bị đoán và là mục tiêu đầu tiên của các cuộc tấn công brute-force. 
                        Hãy sử dụng mật khẩu phức tạp và độc đáo hơn.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {isUnsafe && (
            <div className="card border-[#10A37F]/30">
              <h3 className="text-xl font-bold text-white mb-4">Đề xuất</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-2">
                  <span className="text-[#10A37F]">•</span>
                  <span className="text-white/80">Đổi mật khẩu này ngay lập tức trên tất cả các tài khoản đang sử dụng</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-[#10A37F]">•</span>
                  <span className="text-white/80">Sử dụng mật khẩu độc đáo cho mỗi tài khoản</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-[#10A37F]">•</span>
                  <span className="text-white/80">Bật xác thực hai yếu tố (2FA) trên các tài khoản quan trọng</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-[#10A37F]">•</span>
                  <span className="text-white/80">Sử dụng trình quản lý mật khẩu để tạo và lưu trữ mật khẩu mạnh</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-[#10A37F]">•</span>
                  <span className="text-white/80">Thường xuyên kiểm tra và cập nhật mật khẩu của bạn</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Info Section */}
      <div className="mt-8 card">
        <h3 className="text-lg font-bold text-white mb-3">Về Have I Been Pwned</h3>
        <p className="text-white/80 text-sm mb-3">
          Have I Been Pwned là một dịch vụ miễn phí cho phép người dùng kiểm tra xem thông tin 
          cá nhân của họ có bị lộ trong các vụ rò rỉ dữ liệu hay không. Dịch vụ được tạo bởi 
          chuyên gia bảo mật Troy Hunt.
        </p>
        <p className="text-white/80 text-sm">
          Database hiện tại chứa hơn 11 tỷ tài khoản từ hơn 600 vụ rò rỉ dữ liệu khác nhau.
        </p>
      </div>
    </div>
  );
};

export default BreachChecker;
