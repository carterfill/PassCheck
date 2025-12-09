import { useState } from 'react';
import { Key, Copy, RefreshCw, Sparkles, Hash } from 'lucide-react';
import { generatorApi } from '../services/api';
import toast from 'react-hot-toast';

type GeneratorMode = 'random' | 'memorable' | 'passphrase';

const PasswordGenerator = () => {
  const [mode, setMode] = useState<GeneratorMode>('random');
  const [loading, setLoading] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  // Random password options
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSpecial, setIncludeSpecial] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);

  // Memorable password options
  const [keywords, setKeywords] = useState<string[]>(['']);
  const [separator, setSeparator] = useState('-');
  const [addNumbers, setAddNumbers] = useState(true);
  const [addSpecial, setAddSpecial] = useState(false);
  const [capitalize, setCapitalize] = useState(true);

  // Passphrase options
  const [wordCount, setWordCount] = useState(4);

  const handleGenerateRandom = async () => {
    setLoading(true);
    try {
      const result = await generatorApi.generateRandom({
        length,
        includeUppercase,
        includeLowercase,
        includeNumbers,
        includeSpecial,
        excludeAmbiguous,
        quantity: 1
      });
      setGeneratedPassword(result.passwords[0]);
      toast.success('Đã tạo mật khẩu!');
    } catch (error) {
      console.error('Error generating password:', error);
      toast.error('Không thể tạo mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMemorable = async () => {
    const validKeywords = keywords.filter(k => k.trim() !== '');
    if (validKeywords.length === 0) {
      toast.error('Vui lòng nhập ít nhất 1 từ khóa');
      return;
    }

    setLoading(true);
    try {
      const result = await generatorApi.generateMemorable({
        keywords: validKeywords,
        separator,
        addNumbers,
        addSpecial,
        capitalize
      });
      setGeneratedPassword(result.password);
      toast.success('Đã tạo mật khẩu!');
    } catch (error) {
      console.error('Error generating password:', error);
      toast.error('Không thể tạo mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePassphrase = async () => {
    setLoading(true);
    try {
      const result = await generatorApi.generatePassphrase({
        wordCount,
        separator,
        addNumbers,
        capitalize
      });
      setGeneratedPassword(result.passphrase);
      toast.success('Đã tạo passphrase!');
    } catch (error) {
      console.error('Error generating passphrase:', error);
      toast.error('Không thể tạo passphrase');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    if (mode === 'random') handleGenerateRandom();
    else if (mode === 'memorable') handleGenerateMemorable();
    else handleGeneratePassphrase();
  };

  const copyToClipboard = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      toast.success('Đã copy vào clipboard!');
    }
  };

  const addKeyword = () => {
    if (keywords.length < 10) {
      setKeywords([...keywords, '']);
    }
  };

  const updateKeyword = (index: number, value: string) => {
    const newKeywords = [...keywords];
    newKeywords[index] = value;
    setKeywords(newKeywords);
  };

  const removeKeyword = (index: number) => {
    if (keywords.length > 1) {
      setKeywords(keywords.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <Key className="h-16 w-16 text-[#10A37F] mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-white mb-2">
          Tạo mật khẩu
        </h1>
        <p className="text-white/80">
          Tạo mật khẩu mạnh và an toàn theo nhiều cách khác nhau
        </p>
      </div>

      {/* Mode Selector */}
      <div className="card mb-8">
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={() => setMode('random')}
            className={`p-4 rounded-lg border-2 transition-all ${
              mode === 'random'
                ? 'border-[#10A37F] bg-[#10A37F]/20'
                : 'border-white/20 hover:border-[#10A37F]/50'
            }`}
          >
            <Hash className="h-8 w-8 mx-auto mb-2 text-[#10A37F]" />
            <div className="font-semibold text-white">Ngẫu nhiên</div>
            <div className="text-sm text-white/70">Mật khẩu hoàn toàn random</div>
          </button>
          <button
            onClick={() => setMode('memorable')}
            className={`p-4 rounded-lg border-2 transition-all ${
              mode === 'memorable'
                ? 'border-[#10A37F] bg-[#10A37F]/20'
                : 'border-white/20 hover:border-[#10A37F]/50'
            }`}
          >
            <Sparkles className="h-8 w-8 mx-auto mb-2 text-[#10A37F]" />
            <div className="font-semibold text-white">Dễ nhớ</div>
            <div className="text-sm text-white/70">Từ các từ khóa của bạn</div>
          </button>
          <button
            onClick={() => setMode('passphrase')}
            className={`p-4 rounded-lg border-2 transition-all ${
              mode === 'passphrase'
                ? 'border-[#10A37F] bg-[#10A37F]/20'
                : 'border-white/20 hover:border-[#10A37F]/50'
            }`}
          >
            <Key className="h-8 w-8 mx-auto mb-2 text-[#10A37F]" />
            <div className="font-semibold text-white">Passphrase</div>
            <div className="text-sm text-white/70">Chuỗi từ ngẫu nhiên</div>
          </button>
        </div>
      </div>

      {/* Options */}
      <div className="card mb-8">
        <h3 className="text-xl font-bold text-white mb-4">Tùy chọn</h3>

        {mode === 'random' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Độ dài: {length}
              </label>
              <input
                type="range"
                min="8"
                max="64"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeUppercase}
                  onChange={(e) => setIncludeUppercase(e.target.checked)}
                  className="w-4 h-4 text-[#10A37F]"
                />
                <span className="text-white">Chữ in hoa (A-Z)</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLowercase}
                  onChange={(e) => setIncludeLowercase(e.target.checked)}
                  className="w-4 h-4 text-[#10A37F]"
                />
                <span className="text-white">Chữ thường (a-z)</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  className="w-4 h-4 text-[#10A37F]"
                />
                <span className="text-white">Chữ số (0-9)</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSpecial}
                  onChange={(e) => setIncludeSpecial(e.target.checked)}
                  className="w-4 h-4 text-[#10A37F]"
                />
                <span className="text-white">Ký tự đặc biệt (!@#$...)</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer md:col-span-2">
                <input
                  type="checkbox"
                  checked={excludeAmbiguous}
                  onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                  className="w-4 h-4 text-[#10A37F]"
                />
                <span className="text-white">Loại bỏ ký tự dễ nhầm (il1Lo0O)</span>
              </label>
            </div>
          </div>
        )}

        {mode === 'memorable' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Từ khóa của bạn
              </label>
              {keywords.map((keyword, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => updateKeyword(index, e.target.value)}
                    placeholder={`Từ khóa ${index + 1}`}
                    className="input-field"
                  />
                  {keywords.length > 1 && (
                    <button
                      onClick={() => removeKeyword(index)}
                      className="btn-secondary"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              ))}
              {keywords.length < 10 && (
                <button onClick={addKeyword} className="btn-secondary mt-2">
                  + Thêm từ khóa
                </button>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Ký tự phân cách
              </label>
              <input
                type="text"
                value={separator}
                onChange={(e) => setSeparator(e.target.value)}
                maxLength={1}
                className="input-field"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={capitalize}
                  onChange={(e) => setCapitalize(e.target.checked)}
                  className="w-4 h-4 text-[#10A37F]"
                />
                <span className="text-white">Viết hoa chữ cái đầu</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addNumbers}
                  onChange={(e) => setAddNumbers(e.target.checked)}
                  className="w-4 h-4 text-[#10A37F]"
                />
                <span className="text-white">Thêm số</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addSpecial}
                  onChange={(e) => setAddSpecial(e.target.checked)}
                  className="w-4 h-4 text-[#10A37F]"
                />
                <span className="text-white">Thêm ký tự đặc biệt</span>
              </label>
            </div>
          </div>
        )}

        {mode === 'passphrase' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Số từ: {wordCount}
              </label>
              <input
                type="range"
                min="3"
                max="10"
                value={wordCount}
                onChange={(e) => setWordCount(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Ký tự phân cách
              </label>
              <input
                type="text"
                value={separator}
                onChange={(e) => setSeparator(e.target.value)}
                maxLength={1}
                className="input-field"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={capitalize}
                  onChange={(e) => setCapitalize(e.target.checked)}
                  className="w-4 h-4 text-[#10A37F]"
                />
                <span className="text-white">Viết hoa chữ cái đầu</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addNumbers}
                  onChange={(e) => setAddNumbers(e.target.checked)}
                  className="w-4 h-4 text-[#10A37F]"
                />
                <span className="text-white">Thêm số</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <div className="card mb-8">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Đang tạo...' : 'Tạo mật khẩu'}</span>
        </button>
      </div>

      {/* Result */}
      {generatedPassword && (
        <div className="card animate-slide-up">
          <h3 className="text-xl font-bold text-white mb-4">Mật khẩu đã tạo</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={generatedPassword}
              readOnly
              className="input-field flex-1 font-mono text-lg"
            />
            <button
              onClick={copyToClipboard}
              className="btn-secondary flex items-center space-x-2"
            >
              <Copy className="h-5 w-5" />
              <span>Copy</span>
            </button>
          </div>
          <p className="text-sm text-white/80 mt-2">
            Độ dài: {generatedPassword.length} ký tự
          </p>
        </div>
      )}
    </div>
  );
};

export default PasswordGenerator;
