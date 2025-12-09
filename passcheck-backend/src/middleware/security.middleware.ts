import { Request, Response, NextFunction } from 'express';

// Track IP addresses for abuse detection
interface IPTracker {
  [ip: string]: {
    requestCount: number;
    lastRequest: number;
    suspiciousCount: number;
  };
}

const ipTracker: IPTracker = {};
const SUSPICIOUS_THRESHOLD = 50; // Requests per minute
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour

// Cleanup old IP entries periodically
setInterval(() => {
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);
  
  for (const ip in ipTracker) {
    if (ipTracker[ip].lastRequest < oneHourAgo) {
      delete ipTracker[ip];
    }
  }
}, CLEANUP_INTERVAL);

// Validate IP address format
function isValidIP(ip: string): boolean {
  // IPv4 pattern
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  // IPv6 pattern (simplified)
  const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
  
  if (!ip || typeof ip !== 'string') {
    return false;
  }
  
  // Check IPv4
  if (ipv4Pattern.test(ip)) {
    const parts = ip.split('.');
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }
  
  // Check IPv6 (simplified validation)
  if (ipv6Pattern.test(ip)) {
    return true;
  }
  
  return false;
}

// Get client IP address with validation
function getClientIP(req: Request): string {
  // Security: Validate IP addresses from headers to prevent spoofing
  // In production behind a trusted proxy, these headers are set by the proxy
  // But we still validate the format to prevent basic spoofing attempts
  
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    const ip = ips.trim();
    // Only use if it's a valid IP format
    if (isValidIP(ip)) {
      return ip;
    }
  }
  
  const realIP = req.headers['x-real-ip'];
  if (realIP) {
    const ip = Array.isArray(realIP) ? realIP[0] : realIP;
    if (isValidIP(ip)) {
      return ip;
    }
  }
  
  // Fallback to Express's trusted IP (requires trust proxy to be set)
  const expressIP = req.ip;
  if (expressIP && isValidIP(expressIP)) {
    return expressIP;
  }
  
  // Last resort: socket remote address
  const socketIP = req.socket.remoteAddress;
  if (socketIP && isValidIP(socketIP)) {
    return socketIP;
  }
  
  return 'unknown';
}

// Abuse detection middleware
export function detectAbuse(req: Request, res: Response, next: NextFunction): void {
  try {
    const clientIP = getClientIP(req);
    
    if (clientIP === 'unknown') {
      // If we can't determine IP, allow but log
      console.warn('Could not determine client IP');
      return next();
    }
    
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Initialize or get IP tracking data
    if (!ipTracker[clientIP]) {
      ipTracker[clientIP] = {
        requestCount: 0,
        lastRequest: now,
        suspiciousCount: 0
      };
    }
    
    const tracker = ipTracker[clientIP];
    
    // Reset count if last request was more than a minute ago
    if (tracker.lastRequest < oneMinuteAgo) {
      tracker.requestCount = 0;
      tracker.suspiciousCount = 0;
    }
    
    tracker.requestCount++;
    tracker.lastRequest = now;
    
    // Check for suspicious activity
    if (tracker.requestCount > SUSPICIOUS_THRESHOLD) {
      tracker.suspiciousCount++;
      
      // Log suspicious activity
      console.warn(`Suspicious activity detected from IP: ${clientIP} (${tracker.requestCount} requests/minute)`);
      
      // Block if too many suspicious activities
      if (tracker.suspiciousCount > 3) {
        console.error(`Blocking IP: ${clientIP} due to repeated suspicious activity`);
        res.status(429).json({ 
          error: 'Too many requests. Please try again later.',
          retryAfter: 60
        });
        return;
      }
      
      // Rate limit for suspicious IPs
      res.status(429).json({ 
        error: 'Too many requests. Please slow down.',
        retryAfter: 30
      });
      return;
    }
    
    next();
  } catch (error) {
    // If abuse detection fails, allow request but log error
    console.error('Error in abuse detection:', error);
    next();
  }
}

// Security headers middleware
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
}

