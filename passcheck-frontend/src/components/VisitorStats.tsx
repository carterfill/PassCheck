import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { visitorApi } from '../services/api';

const VisitorStats = () => {
  const [totalVisits, setTotalVisits] = useState(0);
  const [todayVisits, setTodayVisits] = useState(0);
  const [loading, setLoading] = useState(true);

  // Hàm set cookie
  const setCookie = (name: string, value: string, days: number) => {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    
    // Thêm SameSite=Lax để cookie hoạt động trên modern browsers
    // Secure chỉ dùng khi có HTTPS (production)
    const isSecure = window.location.protocol === 'https:';
    const secureFlag = isSecure ? ';Secure' : '';
    
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax${secureFlag}`;
    
    // Log để debug
    if (import.meta.env.DEV) {
      console.log('Cookie set:', name, value, 'Secure:', isSecure);
    }
  };

  // Hàm get cookie
  const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  // Hàm tạo visitor ID ngẫu nhiên
  const generateVisitorId = (): string => {
    return 'visitor_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  useEffect(() => {
    const COOKIE_NAME = 'passcheck_visitor_id';
    const COOKIE_EXPIRY_DAYS = 30;
    
    const initVisitorTracking = async () => {
      try {
        // Kiểm tra cookie
        let visitorId = getCookie(COOKIE_NAME);
        let isNewVisitor = false;

        if (import.meta.env.DEV) {
          console.log('Current cookies:', document.cookie);
          console.log('Visitor ID from cookie:', visitorId);
        }

        // Nếu không có cookie hoặc cookie hết hạn
        if (!visitorId) {
          isNewVisitor = true;
          visitorId = generateVisitorId();
          setCookie(COOKIE_NAME, visitorId, COOKIE_EXPIRY_DAYS);
          
          if (import.meta.env.DEV) {
            console.log('New visitor created with ID:', visitorId);
            console.log('Cookie after setting:', document.cookie);
          }
        }

        // Gọi API để track visitor và lấy stats từ backend
        try {
          const result = await visitorApi.trackVisitor(visitorId);
          
          if (import.meta.env.DEV) {
            console.log('Backend response:', result);
          }

          setTotalVisits(result.stats.totalVisits);
          setTodayVisits(result.stats.todayVisits);
        } catch (apiError) {
          console.error('Error calling visitor API:', apiError);
          
          // Fallback to localStorage if API fails
          const storedTotal = localStorage.getItem('totalVisits');
          const storedToday = localStorage.getItem('todayVisits');
          const lastVisitDate = localStorage.getItem('lastVisitDate');
          const today = new Date().toDateString();

          let total = storedTotal ? parseInt(storedTotal) : 0;
          let todayCount = storedToday ? parseInt(storedToday) : 0;

          // Reset số lượt hôm nay nếu qua ngày mới
          if (lastVisitDate !== today) {
            todayCount = 0;
            localStorage.setItem('lastVisitDate', today);
          }

          // Chỉ tăng số lượt truy cập nếu là visitor mới
          if (isNewVisitor) {
            total += 1;
            todayCount += 1;
            
            localStorage.setItem('totalVisits', total.toString());
            localStorage.setItem('todayVisits', todayCount.toString());
          }

          setTotalVisits(total);
          setTodayVisits(todayCount);
        }
      } catch (error) {
        console.error('Error in visitor tracking:', error);
      } finally {
        setLoading(false);
      }
    };

    initVisitorTracking();
  }, []);

  const formatNumber = (num: number) => {
    return num.toLocaleString('vi-VN');
  };

  return (
    <div className="fixed top-20 left-4 z-50 animate-fade-in">
      <div className="bg-[#2a2b30] border border-[#10A37F]/30 rounded-2xl p-4 shadow-soft-lg backdrop-blur-md">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-[#10A37F]/20 rounded-lg">
            <Users className="h-5 w-5 text-[#10A37F]" />
          </div>
          <h3 className="text-sm font-semibold text-white">Lượt truy cập</h3>
        </div>
        
        {loading ? (
          <div className="space-y-2">
            <div className="h-5 bg-white/10 rounded animate-pulse"></div>
            <div className="h-px bg-white/10"></div>
            <div className="h-5 bg-white/10 rounded animate-pulse"></div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-4">
              <span className="text-xs text-white/60">Hôm nay:</span>
              <span className="text-sm font-bold text-[#10A37F]">{formatNumber(todayVisits)}</span>
            </div>
            <div className="h-px bg-white/10"></div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-xs text-white/60">Tổng cộng:</span>
              <span className="text-sm font-bold text-white">{formatNumber(totalVisits)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitorStats;
