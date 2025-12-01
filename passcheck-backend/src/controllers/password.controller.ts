import { Request, Response } from 'express';
import zxcvbn from 'zxcvbn';
import { PasswordAnalysis } from '../types';

// Translate time strings to Vietnamese
function translateTime(timeStr: string | number): string {
  const timeString = typeof timeStr === 'number' ? timeStr.toString() : timeStr;
  const translations: { [key: string]: string } = {
    'less than a second': 'dưới 1 giây',
    'second': 'giây',
    'seconds': 'giây',
    'minute': 'phút',
    'minutes': 'phút',
    'hour': 'giờ',
    'hours': 'giờ',
    'day': 'ngày',
    'days': 'ngày',
    'month': 'tháng',
    'months': 'tháng',
    'year': 'năm',
    'years': 'năm',
    'centuries': 'thế kỷ'
  };

  let translated = timeString;
  for (const [eng, vie] of Object.entries(translations)) {
    translated = translated.replace(new RegExp(eng, 'gi'), vie);
  }
  return translated;
}

// Translate warning messages to Vietnamese
function translateWarning(warning: string): string {
  const warnings: { [key: string]: string } = {
    'This is a top-10 common password': 'Đây là mật khẩu phổ biến trong top 10',
    'This is a top-100 common password': 'Đây là mật khẩu phổ biến trong top 100',
    'This is a very common password': 'Đây là mật khẩu rất phổ biến',
    'This is similar to a commonly used password': 'Mật khẩu này tương tự mật khẩu thường dùng',
    'A word by itself is easy to guess': 'Một từ đơn lẻ dễ đoán',
    'Names and surnames by themselves are easy to guess': 'Tên và họ đơn lẻ rất dễ đoán',
    'Common names and surnames are easy to guess': 'Tên và họ phổ biến rất dễ đoán',
    'Straight rows of keys are easy to guess': 'Các phím liên tiếp dễ đoán',
    'Short keyboard patterns are easy to guess': 'Mẫu bàn phím ngắn dễ đoán',
    'Repeats like "aaa" are easy to guess': 'Lặp lại như "aaa" rất dễ đoán',
    'Repeats like "abcabcabc" are only slightly harder to guess than "abc"': 'Lặp lại như "abcabcabc" chỉ khó đoán hơn "abc" một chút',
    'Sequences like "abc" or "6543" are easy to guess': 'Chuỗi như "abc" hay "6543" dễ đoán',
    'Recent years are easy to guess': 'Năm gần đây dễ đoán',
    'Dates are often easy to guess': 'Ngày tháng thường dễ đoán'
  };

  return warnings[warning] || warning;
}

// Translate suggestion messages to Vietnamese
function translateSuggestions(suggestions: string[]): string[] {
  const suggestionMap: { [key: string]: string } = {
    'Use a few words, avoid common phrases': 'Dùng vài từ, tránh cụm từ phổ biến',
    'No need for symbols, digits, or uppercase letters': 'Không cần ký tự đặc biệt, số hay chữ hoa',
    'Add another word or two. Uncommon words are better.': 'Thêm một hoặc hai từ nữa. Các từ không phổ biến sẽ tốt hơn.',
    'Use a longer keyboard pattern with more turns': 'Dùng mẫu bàn phím dài hơn với nhiều lượt hơn',
    'Avoid repeated words and characters': 'Tránh lặp từ và ký tự',
    'Avoid sequences': 'Tránh chuỗi liên tiếp',
    'Avoid recent years': 'Tránh các năm gần đây',
    'Avoid years that are associated with you': 'Tránh các năm liên quan đến bạn',
    'Avoid dates and years that are associated with you': 'Tránh ngày tháng và năm liên quan đến bạn',
    'Capitalization doesn\'t help very much': 'Viết hoa không giúp ích nhiều',
    'All-uppercase is almost as easy to guess as all-lowercase': 'Toàn chữ hoa gần như dễ đoán bằng toàn chữ thường',
    'Reversed words aren\'t much harder to guess': 'Từ đảo ngược không khó đoán hơn nhiều',
    'Predictable substitutions like \'@\' instead of \'a\' don\'t help very much': 'Thay thế dễ đoán như \'@\' thay \'a\' không hiệu quả'
  };

  return suggestions.map(s => suggestionMap[s] || s);
}

// Check password strength using multiple algorithms
export const checkPasswordStrength = async (req: Request, res: Response) => {
  try {
    const { password } = req.body;

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Use zxcvbn for advanced password strength analysis
    const result = zxcvbn(password);

    // Calculate additional metrics
    const length = password.length;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChars = /[^A-Za-z0-9]/.test(password);
    
    // Calculate character diversity
    const uniqueChars = new Set(password).size;
    const charDiversity = (uniqueChars / length) * 100;

    // Calculate entropy
    const entropy = calculateEntropy(password);

    // Determine overall strength
    let strength: 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong';
    let score = result.score;

    if (length < 8) {
      strength = 'very-weak';
      score = 0;
    } else if (score === 0 || score === 1) {
      strength = 'weak';
    } else if (score === 2) {
      strength = 'medium';
    } else if (score === 3) {
      strength = 'strong';
    } else {
      strength = 'very-strong';
    }

    const analysis: PasswordAnalysis = {
      score,
      strength,
      length,
      entropy: Math.round(entropy * 100) / 100,
      characteristics: {
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChars,
        charDiversity: Math.round(charDiversity)
      },
      crackTime: {
        onlineThrottling: translateTime(result.crack_times_display.online_throttling_100_per_hour),
        onlineNoThrottling: translateTime(result.crack_times_display.online_no_throttling_10_per_second),
        offlineSlowHashing: translateTime(result.crack_times_display.offline_slow_hashing_1e4_per_second),
        offlineFastHashing: translateTime(result.crack_times_display.offline_fast_hashing_1e10_per_second)
      },
      feedback: {
        warning: translateWarning(result.feedback.warning || ''),
        suggestions: translateSuggestions(result.feedback.suggestions || [])
      }
    };

    res.json(analysis);
  } catch (error) {
    console.error('Error checking password strength:', error);
    res.status(500).json({ error: 'Failed to check password strength' });
  }
};

// Detailed password analysis
export const analyzePassword = async (req: Request, res: Response) => {
  try {
    const { password } = req.body;

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password is required' });
    }

    const analysis = {
      length: password.length,
      composition: {
        uppercase: (password.match(/[A-Z]/g) || []).length,
        lowercase: (password.match(/[a-z]/g) || []).length,
        numbers: (password.match(/[0-9]/g) || []).length,
        special: (password.match(/[^A-Za-z0-9]/g) || []).length
      },
      patterns: {
        hasSequentialChars: /abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789/i.test(password),
        hasRepeatingChars: /(.)\1{2,}/.test(password),
        hasCommonPatterns: /password|123456|qwerty|admin|letmein|welcome/i.test(password),
        hasKeyboardPatterns: /qwer|asdf|zxcv|1qaz|2wsx|3edc/i.test(password)
      },
      entropy: calculateEntropy(password),
      estimatedCrackTime: estimateCrackTime(password)
    };

    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing password:', error);
    res.status(500).json({ error: 'Failed to analyze password' });
  }
};

// Calculate password entropy
function calculateEntropy(password: string): number {
  let charsetSize = 0;
  
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^A-Za-z0-9]/.test(password)) charsetSize += 32;

  return password.length * Math.log2(charsetSize);
}

// Estimate crack time
function estimateCrackTime(password: string): string {
  const entropy = calculateEntropy(password);
  const guessesPerSecond = 1e10; // 10 billion guesses per second
  const possibleCombinations = Math.pow(2, entropy);
  const seconds = possibleCombinations / (2 * guessesPerSecond);

  if (seconds < 1) return 'Tức thì';
  if (seconds < 60) return `${Math.round(seconds)} giây`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} phút`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} giờ`;
  if (seconds < 2592000) return `${Math.round(seconds / 86400)} ngày`;
  if (seconds < 31536000) return `${Math.round(seconds / 2592000)} tháng`;
  return `${Math.round(seconds / 31536000)} năm`;
}
