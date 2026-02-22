// IMPORTANT: dotenv must load BEFORE any other import that reads process.env
import dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import appRouter from './routes';

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:8080', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve locally uploaded product images
import path from 'path';
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api', appRouter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Root endpoint for deployment verification
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ 
    message: 'Welcome to Parampara API',
    health: '/health',
    api: '/api'
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Connect to MongoDB and start the server
const startServer = async () => {
  const tryConnect = async (retries = 5, delay = 5000) => {
    try {
      if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined in the environment variables');
      }
      
      // Aggressive connection settings for unstable/restricted networks
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000, // Keep trying to find a server
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        tlsAllowInvalidCertificates: true, // Allow self-signed certs (proxies)
      } as mongoose.ConnectOptions);
      console.log('Connected to MongoDB');
      
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    } catch (error: any) {
      console.error('❌ Failed to connect to MongoDB');
      console.error('Error:', error.message);
      if (error.reason) console.error('Reason:', error.reason);
      
      if (retries > 0) {
        console.log(`Retrying connection in ${delay/1000} seconds... (${retries} attempts left)`);
        setTimeout(() => tryConnect(retries - 1, delay), delay);
      } else {
        console.error('Could not connect to MongoDB after multiple attempts. Server will remain active but database operations will fail.');
      }
    }
  };

  tryConnect();
};

startServer();

export default app;
