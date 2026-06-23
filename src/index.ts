// IMPORTANT: dotenv must load BEFORE any other import that reads process.env
import dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import appRouter from './routes';

const app: Application = express();

// Connect to MongoDB — cache the promise so concurrent requests/serverless
// invocations reuse a single connection attempt instead of racing.
let connPromise: Promise<typeof mongoose> | null = null;
const connectDB = async (): Promise<void> => {
  // 1 = connected. Already good, nothing to do.
  if (mongoose.connection.readyState === 1) return;
  if (!connPromise) {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    connPromise = mongoose
      .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      })
      .then((m) => {
        console.log('Connected to MongoDB');
        return m;
      })
      .catch((err) => {
        // Reset so the next request can retry instead of being stuck on a
        // permanently-rejected promise.
        connPromise = null;
        throw err;
      });
  }
  await connPromise;
};

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Capture the raw request body so the Razorpay webhook can verify the
// X-Razorpay-Signature HMAC against the exact bytes that were sent.
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// Ensure the DB is connected before any API request runs. This prevents
// Mongoose from buffering queries (and the "buffering timed out" error) when
// a request arrives before the initial connection has been established.
app.use('/api', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (err: any) {
    res.status(503).json({
      success: false,
      message: 'Database connection failed',
      error: err.message,
    });
  }
});

// Routes
app.use('/api', appRouter);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to Parampara API',
    health: '/health',
    api: '/api'
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: `Invalid ${err.path}: ${err.value}` });
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e: any) => e.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return res.status(400).json({ success: false, message: `${field} already exists` });
  }

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'staging' ? err.message : {}
  });
});

// Start HTTP server only outside Vercel (Vercel sets VERCEL=1 automatically).
// Kick off the connection eagerly so the cluster is warm before the first
// request, but don't crash if it isn't ready yet — the /api gate will await it.
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5001;
  connectDB().catch((err) => console.error('MongoDB connection error:', err.message));
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
