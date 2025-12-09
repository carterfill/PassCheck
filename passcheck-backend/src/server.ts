import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import { connectDB } from './config/database';
import passwordRoutes from './routes/password.routes';
import generatorRoutes from './routes/generator.routes';
import breachRoutes from './routes/breach.routes';
import visitorRoutes from './routes/visitor.routes';
import { securityHeaders, detectAbuse } from './middleware/security.middleware';
import { validateBodySize } from './middleware/validation.middleware';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Trust proxy - required for Railway and other reverse proxies
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Security headers
app.use(securityHeaders);

// CORS configuration - STRICT: no wildcard allowed
const corsOrigin = process.env.CORS_ORIGIN;
if (!corsOrigin) {
  console.error('CORS_ORIGIN environment variable is required!');
  console.error('Set CORS_ORIGIN to your frontend domain(s), e.g., https://yourdomain.com');
  process.exit(1);
}

// Parse CORS origins
const allowedOrigins = corsOrigin.split(',').map(o => o.trim()).filter(o => o.length > 0);

// Validate that no wildcard is used
if (allowedOrigins.includes('*')) {
  console.error('CORS wildcard (*) is not allowed for security reasons!');
  console.error('Please specify exact domain(s) in CORS_ORIGIN');
  process.exit(1);
}

console.log('CORS Configuration - Allowed origins:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.) - but be careful
    if (!origin) {
      // In production, you might want to block this
      if (process.env.NODE_ENV === 'production') {
        callback(new Error('Origin header is required'));
        return;
      }
      callback(null, true);
      return;
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked CORS request from: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  maxAge: 86400 // 24 hours
}));

// Strict rate limiting - multiple tiers (enhanced for DDoS protection)
// General API rate limit - balanced to prevent DDoS but allow normal usage
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Increased from 20 to 50 to allow normal usage (5 clicks is normal)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  // Use Cloudflare IP if available
  keyGenerator: (req) => {
    try {
      const cfIP = req.headers['cf-connecting-ip'];
      if (cfIP) {
        return Array.isArray(cfIP) ? cfIP[0] : cfIP;
      }
      return req.ip || req.socket.remoteAddress || 'unknown';
    } catch (error) {
      // Fallback if keyGenerator fails
      return req.ip || 'unknown';
    }
  },
  // Handler for rate limit errors
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: 15 * 60 // 15 minutes in seconds
    });
  }
});

// Strict rate limit for password checking (more resource intensive)
const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Increased from 15 to 30 to allow normal usage
  message: 'Too many password check requests. Please wait before trying again.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    try {
      const cfIP = req.headers['cf-connecting-ip'];
      if (cfIP) {
        return Array.isArray(cfIP) ? cfIP[0] : cfIP;
      }
      return req.ip || req.socket.remoteAddress || 'unknown';
    } catch (error) {
      return req.ip || 'unknown';
    }
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many password check requests. Please wait before trying again.',
      retryAfter: 15 * 60
    });
  }
});

// Strict rate limit for generator (can be abused)
const generatorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25, // Increased from 10 to 25 to allow normal usage
  message: 'Too many password generation requests. Please wait before trying again.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    try {
      const cfIP = req.headers['cf-connecting-ip'];
      if (cfIP) {
        return Array.isArray(cfIP) ? cfIP[0] : cfIP;
      }
      return req.ip || req.socket.remoteAddress || 'unknown';
    } catch (error) {
      return req.ip || 'unknown';
    }
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many password generation requests. Please wait before trying again.',
      retryAfter: 15 * 60
    });
  }
});

// Apply general limiter to all routes
app.use(generalLimiter);

// Abuse detection middleware
app.use(detectAbuse);

// Body size validation
app.use(validateBodySize);

// JSON parsing with size limits (stricter to prevent DoS)
app.use(express.json({ limit: '5kb' })); // Reduced from 10kb to 5kb
app.use(express.urlencoded({ extended: true, limit: '5kb' })); // Reduced from 10kb to 5kb

// Request timeout middleware to prevent hanging requests (increased timeout)
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Set timeout but don't kill the request immediately
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(408).json({ error: 'Request timeout' });
    }
  }, 30000); // 30 seconds instead of 10
  
  // Clear timeout when response is sent
  res.on('finish', () => {
    clearTimeout(timeout);
  });
  
  next();
});

// Root endpoint - API info
app.get('/', (req, res) => {
  res.json({
    name: 'PassCheck API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      password: {
        check: 'POST /api/password/check',
        analyze: 'POST /api/password/analyze'
      },
      generator: {
        random: 'POST /api/generator/random',
        memorable: 'POST /api/generator/memorable',
        passphrase: 'POST /api/generator/passphrase'
      },
      breach: {
        check: 'POST /api/breach/check',
        common: 'POST /api/breach/common'
      },
      visitor: {
        track: 'POST /api/visitor/track',
        stats: 'GET /api/visitor/stats'
      }
    },
    documentation: 'https://github.com/ntdovn/passcheck-backend'
  });
});

// Health check with rate limiting (stricter)
const healthCheckLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Reduced from 10 to 5 requests per minute for health checks
  message: 'Too many health check requests. Please wait before trying again.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const cfIP = req.headers['cf-connecting-ip'];
    if (cfIP) {
      return Array.isArray(cfIP) ? cfIP[0] : cfIP;
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
});

app.get('/api/health', healthCheckLimiter, (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes with specific rate limiters
app.use('/api/password', passwordLimiter, passwordRoutes);
app.use('/api/generator', generatorLimiter, generatorRoutes);
app.use('/api/breach', passwordLimiter, breachRoutes);
app.use('/api/visitor', visitorRoutes);

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware - SECURE: no information leakage
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Log full error details server-side only
  // Generate secure error ID using crypto
  const randomBytes = crypto.randomBytes(4).toString('hex');
  const errorId = Date.now().toString(36) + randomBytes;
  console.error(`[${errorId}] Error:`, {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });
  
  // Don't expose error details to client
  const statusCode = err.statusCode || err.status || 500;
  
  // Only show error message in development
  const response: any = {
    error: 'An error occurred while processing your request',
    errorId: errorId // For tracking in logs
  };
  
  // In development, include more details
  if (process.env.NODE_ENV === 'development') {
    response.message = err.message;
    response.stack = err.stack;
  }
  
  res.status(statusCode).json(response);
});

// Bind to 0.0.0.0 for Fly.io and other cloud platforms
const HOST = process.env.HOST || '0.0.0.0';

// Start server and connect to database
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    app.listen(PORT, HOST, () => {
      console.log(`Server is running on ${HOST}:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Global error handlers to prevent crashes
// NEVER exit in production - let process manager (Fly.io, PM2, etc.) handle restarts
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  // Log but don't exit - let the process manager handle it
  // This prevents server from crashing on unexpected errors
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  // Log but don't exit - let the process manager handle it
  // This prevents server from crashing on unhandled promise rejections
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();

export default app;
