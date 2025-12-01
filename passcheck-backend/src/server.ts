import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/database';
import passwordRoutes from './routes/password.routes';
import generatorRoutes from './routes/generator.routes';
import breachRoutes from './routes/breach.routes';
import visitorRoutes from './routes/visitor.routes';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Trust proxy - required for Railway and other reverse proxies
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration - support multiple origins
const corsOrigin = process.env.CORS_ORIGIN 
  ? (process.env.CORS_ORIGIN === '*' ? '*' : process.env.CORS_ORIGIN.split(',').map(o => o.trim()))
  : '*'; // Allow all origins by default

console.log('🔐 CORS Configuration:', corsOrigin);

app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/password', passwordRoutes);
app.use('/api/generator', generatorRoutes);
app.use('/api/breach', breachRoutes);
app.use('/api/visitor', visitorRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Bind to 0.0.0.0 for Fly.io and other cloud platforms
const HOST = process.env.HOST || '0.0.0.0';

// Start server and connect to database
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server is running on ${HOST}:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
