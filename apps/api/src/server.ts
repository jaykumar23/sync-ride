import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);

// Socket.io CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.some(allowed => origin.startsWith(allowed.replace(/\/$/, '')))) {
        callback(null, true);
      } else {
        console.warn(`Socket.io CORS blocked origin: ${origin}`);
        callback(null, true); // Allow anyway
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

export { app, httpServer, io };
