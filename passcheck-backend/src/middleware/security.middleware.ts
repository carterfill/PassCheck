import { Request, Response, NextFunction } from 'express';

// Track IP addresses for abuse detection
interface IPTracker {
  [ip: string]: {
    requestCount: number;
    lastRequest: number;
    suspiciousCount: number;
    blockedUntil?: number; // Timestamp when block expires
  };
}

const ipTracker: IPTracker = {};
const SUSPICIOUS_THRESHOLD = 30; // Reduced from 50 to 30 requests per minute (stricter)
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
const MAX_BLOCK_DURATION = 60 * 60 * 1000; // 1 hour block duration

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
// Priority: Cloudflare CF-Connecting-IP > X-Forwarded-For > X-Real-IP > Express IP
function getClientIP(req: Request): string {
  // Security: Validate IP addresses from headers to prevent spoofing
  // In production behind Cloudflare, CF-Connecting-IP is the most reliable
  
  // Priority 1: Cloudflare CF-Connecting-IP (most reliable when behind Cloudflare)
  const cfIP = req.headers['cf-connecting-ip'];
  if (cfIP) {
    const ip = Array.isArray(cfIP) ? cfIP[0] : cfIP;
    if (isValidIP(ip)) {
      return ip;
    }
  }
  
  // Priority 2: X-Forwarded-For (may contain multiple IPs, take first)
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    const ip = ips.trim();
    // Only use if it's a valid IP format
    if (isValidIP(ip)) {
      return ip;
    }
  }
  
  // Priority 3: X-Real-IP
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

// Abuse detection middleware with Cloudflare support
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
    
    // Check if IP is currently blocked
    if (tracker.blockedUntil && now < tracker.blockedUntil) {
      const remainingSeconds = Math.ceil((tracker.blockedUntil - now) / 1000);
      res.status(429).json({ 
        error: 'IP temporarily blocked due to abuse. Please try again later.',
        retryAfter: remainingSeconds
      });
      return;
    }
    
    // Clear block if expired
    if (tracker.blockedUntil && now >= tracker.blockedUntil) {
      tracker.blockedUntil = undefined;
      tracker.suspiciousCount = 0;
    }
    
    // Reset count if last request was more than a minute ago
    if (tracker.lastRequest < oneMinuteAgo) {
      tracker.requestCount = 0;
      // Don't reset suspiciousCount immediately, keep it for tracking
    }
    
    tracker.requestCount++;
    tracker.lastRequest = now;
    
    // Check for suspicious activity (stricter threshold)
    if (tracker.requestCount > SUSPICIOUS_THRESHOLD) {
      tracker.suspiciousCount++;
      
      // Log suspicious activity with Cloudflare Ray ID if available
      const cfRay = req.headers['cf-ray'];
      const rayInfo = cfRay ? ` CF-Ray: ${cfRay}` : '';
      console.warn(`Suspicious activity detected from IP: ${clientIP} (${tracker.requestCount} requests/minute)${rayInfo}`);
      
      // Block if too many suspicious activities (stricter: block after 2 violations)
      if (tracker.suspiciousCount >= 2) {
        tracker.blockedUntil = now + MAX_BLOCK_DURATION;
        console.error(`Blocking IP: ${clientIP} for ${MAX_BLOCK_DURATION / 1000 / 60} minutes due to repeated suspicious activity`);
        res.status(429).json({ 
          error: 'IP temporarily blocked due to abuse. Please try again later.',
          retryAfter: Math.ceil(MAX_BLOCK_DURATION / 1000)
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

