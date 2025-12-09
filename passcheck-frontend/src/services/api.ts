import axios from 'axios';

// API URL từ environment variable hoặc fallback cho development
// Đảm bảo URL luôn kết thúc bằng /api
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    // Loại bỏ trailing slash nếu có
    let cleanUrl = envUrl.trim().replace(/\/+$/, '');
    // Nếu URL chưa kết thúc bằng /api, thêm /api
    if (!cleanUrl.endsWith('/api')) {
      cleanUrl = `${cleanUrl}/api`;
    }
    return cleanUrl;
  }
  return '/api';
};

const API_URL = getApiUrl();

// Debug log - chỉ log trong development
if (import.meta.env.DEV) {
  console.log('API Base URL:', API_URL);
  console.log('VITE_API_URL env:', import.meta.env.VITE_API_URL);
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
  withCredentials: false, // CORS requests
});

export interface PasswordAnalysis {
  score: number;
  strength: 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong';
  length: number;
  entropy: number;
  characteristics: {
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumbers: boolean;
    hasSpecialChars: boolean;
    charDiversity: number;
  };
  crackTime: {
    onlineThrottling: string;
    onlineNoThrottling: string;
    offlineSlowHashing: string;
    offlineFastHashing: string;
  };
  feedback: {
    warning: string;
    suggestions: string[];
  };
}

export interface GeneratorOptions {
  length?: number;
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSpecial?: boolean;
  excludeAmbiguous?: boolean;
  quantity?: number;
}

export interface MemorablePasswordOptions {
  keywords: string[];
  separator?: string;
  addNumbers?: boolean;
  addSpecial?: boolean;
  capitalize?: boolean;
}

export interface BreachResult {
  breached: boolean;
  count: number;
  message: string;
}

export interface VisitorStats {
  totalVisits: number;
  todayVisits: number;
  uniqueVisitors: number;
}

export interface TrackVisitorResponse {
  success: boolean;
  isNewVisitor: boolean;
  stats: {
    totalVisits: number;
    todayVisits: number;
  };
}

export const passwordApi = {
  checkStrength: async (password: string): Promise<PasswordAnalysis> => {
    // Password analysis doesn't need encryption - only analyzes locally
    const response = await api.post('/password/check', { password });
    return response.data;
  },

  analyzePassword: async (password: string) => {
    // Password analysis doesn't need encryption - only analyzes locally
    const response = await api.post('/password/analyze', { password });
    return response.data;
  },
};

export const generatorApi = {
  generateRandom: async (options: GeneratorOptions): Promise<{ passwords: string[] }> => {
    const response = await api.post('/generator/random', options);
    return response.data;
  },

  generateMemorable: async (options: MemorablePasswordOptions): Promise<{ password: string }> => {
    const response = await api.post('/generator/memorable', options);
    return response.data;
  },

  generatePassphrase: async (options: {
    wordCount?: number;
    separator?: string;
    addNumbers?: boolean;
    capitalize?: boolean;
  }): Promise<{ passphrase: string }> => {
    const response = await api.post('/generator/passphrase', options);
    return response.data;
  },
};

export const breachApi = {
  checkBreach: async (password: string): Promise<BreachResult> => {
    // Breach check doesn't need encryption - only uses SHA-1 hash
    const response = await api.post('/breach/check', { password });
    return response.data;
  },

  checkCommon: async (password: string) => {
    // Common check doesn't need encryption - only compares strings
    const response = await api.post('/breach/common', { password });
    return response.data;
  },
};

export const visitorApi = {
  trackVisitor: async (visitorId: string): Promise<TrackVisitorResponse> => {
    const response = await api.post('/visitor/track', { visitorId });
    return response.data;
  },

  getStats: async (): Promise<VisitorStats> => {
    const response = await api.get('/visitor/stats');
    return response.data;
  },
};

export default api;
