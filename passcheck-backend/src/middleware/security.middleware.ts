import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Track browser sessions for abuse detection (instead of IP)
interface SessionTracker {
  [sessionId: string]: {
    requestCount: number;
    lastRequest: number;
    suspiciousCount: number;
    blockedUntil?: number; // Timestamp when block expires
    rapidClicks: number[]; // Timestamps of recent rapid clicks
    rapidClickBlockedUntil?: number; // Timestamp when rapid click block expires
  };
}

const sessionTracker: SessionTracker = {};
const SUSPICIOUS_THRESHOLD = 100; // Increased from 30 to 100 requests per minute (allow bursts)
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
const MAX_BLOCK_DURATION = 60 * 60 * 1000; // 1 hour block duration

// Rapid click detection: 3 clicks within 5 seconds
const RAPID_CLICK_THRESHOLD = 3; // Number of clicks
const RAPID_CLICK_WINDOW = 5000; // 5 seconds in milliseconds
const RAPID_CLICK_BLOCK_DURATION = 30000; // 30 seconds block for rapid clicks

// Cleanup old session entries periodically
setInterval(() => {
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);
  
  for (const sessionId in sessionTracker) {
    if (sessionTracker[sessionId].lastRequest < oneHourAgo) {
      delete sessionTracker[sessionId];
    }
  }
}, CLEANUP_INTERVAL);

const COOKIE_NAME = 'passcheck_session_id';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 * 1000; // 1 year

// Get or create browser session ID
// Uses cookie to track individual browsers instead of IP addresses
export function getBrowserSessionId(req: Request, res?: Response): string {
  // Try to get existing session ID from cookie
  let sessionId = req.cookies?.[COOKIE_NAME];
  
  // Validate session ID format (should be alphanumeric, 32 chars)
  if (sessionId && typeof sessionId === 'string' && /^[a-zA-Z0-9]{32}$/.test(sessionId)) {
    return sessionId;
  }
  
  // Generate new session ID if not exists or invalid
  sessionId = crypto.randomBytes(16).toString('hex');
  
  // Set cookie with session ID if response object is provided
  if (res) {
    res.cookie(COOKIE_NAME, sessionId, {
      httpOnly: true, // Prevent XSS attacks
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict', // CSRF protection
      maxAge: COOKIE_MAX_AGE,
      path: '/'
    });
  }
  
  return sessionId;
}

// Middleware to ensure session ID cookie is set (runs before rate limiters)
export function ensureSessionId(req: Request, res: Response, next: NextFunction): void {
  try {
    getBrowserSessionId(req, res);
    next();
  } catch (error) {
    // If session ID creation fails, continue anyway
    next();
  }
}

// Abuse detection middleware - tracks by browser session instead of IP
export function detectAbuse(req: Request, res: Response, next: NextFunction): void {
  try {
    // Get or create browser session ID
    const sessionId = getBrowserSessionId(req, res);
    
    if (!sessionId) {
      // If we can't create session ID, allow but log
      console.warn('Could not create browser session ID');
      return next();
    }
    
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Initialize or get session tracking data
    if (!sessionTracker[sessionId]) {
      sessionTracker[sessionId] = {
        requestCount: 0,
        lastRequest: now,
        suspiciousCount: 0,
        rapidClicks: []
      };
    }
    
    const tracker = sessionTracker[sessionId];
    
    // Check if browser session is currently blocked (general abuse block)
    if (tracker.blockedUntil && now < tracker.blockedUntil) {
      const remainingSeconds = Math.ceil((tracker.blockedUntil - now) / 1000);
      res.status(429).json({ 
        error: 'Tài khoản tạm thời bị chặn do lạm dụng. Vui lòng thử lại sau.',
        message: 'Account temporarily blocked due to abuse. Please try again later.',
        retryAfter: remainingSeconds
      });
      return;
    }
    
    // Check if browser session is blocked due to rapid clicks
    if (tracker.rapidClickBlockedUntil && now < tracker.rapidClickBlockedUntil) {
      const remainingSeconds = Math.ceil((tracker.rapidClickBlockedUntil - now) / 1000);
      res.status(429).json({ 
        error: 'Vui lòng không nhấn liên tục. Hãy đợi một chút trước khi thử lại.',
        message: 'Please do not click continuously. Please wait a moment before trying again.',
        retryAfter: remainingSeconds
      });
      return;
    }
    
    // Clear rapid click block if expired
    if (tracker.rapidClickBlockedUntil && now >= tracker.rapidClickBlockedUntil) {
      tracker.rapidClickBlockedUntil = undefined;
      tracker.rapidClicks = [];
    }
    
    // Clear general block if expired
    if (tracker.blockedUntil && now >= tracker.blockedUntil) {
      tracker.blockedUntil = undefined;
      tracker.suspiciousCount = 0;
    }
    
    // Rapid click detection: Check if 3 clicks within 5 seconds
    // Remove clicks older than the window
    tracker.rapidClicks = tracker.rapidClicks.filter(timestamp => now - timestamp < RAPID_CLICK_WINDOW);
    
    // Add current click timestamp
    tracker.rapidClicks.push(now);
    
    // If 3 or more clicks in the window, block
    if (tracker.rapidClicks.length >= RAPID_CLICK_THRESHOLD) {
      tracker.rapidClickBlockedUntil = now + RAPID_CLICK_BLOCK_DURATION;
      console.warn(`Rapid click detected from browser session: ${sessionId.substring(0, 8)}... (${tracker.rapidClicks.length} clicks in ${RAPID_CLICK_WINDOW}ms)`);
      res.status(429).json({ 
        error: 'Vui lòng không nhấn liên tục. Hãy đợi một chút trước khi thử lại.',
        message: 'Please do not click continuously. Please wait a moment before trying again.',
        retryAfter: Math.ceil(RAPID_CLICK_BLOCK_DURATION / 1000)
      });
      return;
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
      console.warn(`Suspicious activity detected from browser session: ${sessionId.substring(0, 8)}... (${tracker.requestCount} requests/minute)${rayInfo}`);
      
      // Block if too many suspicious activities (stricter: block after 2 violations)
      if (tracker.suspiciousCount >= 2) {
        tracker.blockedUntil = now + MAX_BLOCK_DURATION;
        console.error(`Blocking browser session: ${sessionId.substring(0, 8)}... for ${MAX_BLOCK_DURATION / 1000 / 60} minutes due to repeated suspicious activity`);
        res.status(429).json({ 
          error: 'Tài khoản tạm thời bị chặn do lạm dụng. Vui lòng thử lại sau.',
          message: 'Account temporarily blocked due to abuse. Please try again later.',
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

