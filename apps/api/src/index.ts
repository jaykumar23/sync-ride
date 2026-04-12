import 'dotenv/config';
import { app, httpServer, io } from './server';
import { connectDB } from './db';
import { redis } from './cache';
import express from 'express';
import cors from 'cors';
import tripsRouter from './routes/trips';
import privacyRouter from './routes/privacy';
import analyticsRouter from './routes/analytics';
import { cacheLocation, deleteRiderLocation, getTripLocations } from './services/locationCache';

const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/trips', tripsRouter);
app.use('/api/privacy', privacyRouter);
app.use('/api/analytics', analyticsRouter);

app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'SyncRide API'
  });
});

app.get('/', (_req, res) => {
  res.json({ 
    message: 'SyncRide API Server',
    version: '0.0.0'
  });
});

io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);
  
  // Handle trip join
  socket.on('trip:join', async ({ tripCode, riderId, displayName }) => {
    console.log(`📍 ${displayName || riderId} joined trip ${tripCode}`);
    socket.join(`trip:${tripCode}`);
    
    // Send cached locations of existing riders to the new joiner
    try {
      const cachedLocations = await getTripLocations(tripCode);
      if (cachedLocations.length > 0) {
        console.log(`📍 Sending ${cachedLocations.length} cached locations to new rider`);
        for (const loc of cachedLocations) {
          if (loc.riderId !== riderId) {
            socket.emit('location:broadcast', {
              riderId: loc.riderId,
              displayName: loc.displayName,
              location: loc.coordinates
            });
          }
        }
      }
    } catch (error) {
      console.warn('Failed to send cached locations:', error);
    }
    
    // Broadcast to all in trip with rider info
    socket.to(`trip:${tripCode}`).emit('rider:joined', { 
      riderId, 
      displayName: displayName || 'Unknown',
      socketId: socket.id 
    });
  });
  
  // Handle location updates
  socket.on('location:update', async ({ tripCode, riderId, displayName, location }) => {
    console.log(`📍 Location update from ${displayName || riderId}`);
    
    // Cache location with 30-second TTL for privacy compliance
    await cacheLocation(tripCode, riderId, displayName || 'Unknown', location);
    
    // Broadcast to all other riders in trip with displayName
    socket.to(`trip:${tripCode}`).emit('location:broadcast', { 
      riderId, 
      displayName: displayName || 'Unknown',
      location 
    });
  });
  
  // Handle SOS broadcast
  socket.on('sos:send', ({ tripCode, riderId, displayName, coordinates }) => {
    console.log(`🚨 SOS from ${displayName} (${riderId}) in trip ${tripCode}`);
    // Broadcast to ALL riders in trip including sender
    io.to(`trip:${tripCode}`).emit('sos:broadcast', {
      riderId,
      displayName,
      coordinates,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle SOS cancel
  socket.on('sos:cancel', ({ tripCode, riderId }) => {
    console.log(`✅ SOS cancelled by ${riderId} in trip ${tripCode}`);
    io.to(`trip:${tripCode}`).emit('sos:cancelled', { riderId });
  });
  
  // Handle status updates
  socket.on('status:send', ({ tripCode, riderId, displayName, status }) => {
    console.log(`📢 Status from ${displayName}: ${status}`);
    io.to(`trip:${tripCode}`).emit('status:broadcast', {
      riderId,
      displayName,
      status,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle trip end (host only - authorization done in API)
  socket.on('trip:end', ({ tripCode }) => {
    console.log(`🛑 Trip ${tripCode} ended by host`);
    // Get all sockets in the room to verify broadcast
    const room = io.sockets.adapter.rooms.get(`trip:${tripCode}`);
    console.log(`📢 Broadcasting trip:ended to ${room?.size || 0} clients in room trip:${tripCode}`);
    io.to(`trip:${tripCode}`).emit('trip:ended', {
      tripCode,
      timestamp: new Date().toISOString()
    });
    console.log(`✅ trip:ended broadcast complete for ${tripCode}`);
  });
  
  // Handle rider leaving
  socket.on('trip:leave', async ({ tripCode, riderId, displayName }) => {
    console.log(`👋 ${displayName} left trip ${tripCode}`);
    socket.leave(`trip:${tripCode}`);
    
    // Delete rider's cached location for privacy
    await deleteRiderLocation(tripCode, riderId);
    
    socket.to(`trip:${tripCode}`).emit('rider:left', {
      riderId,
      displayName,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle rider kick (host only - authorization done in API)
  socket.on('trip:kick', ({ tripCode, targetRiderId, displayName }) => {
    console.log(`🚫 ${displayName} kicked from trip ${tripCode}`);
    io.to(`trip:${tripCode}`).emit('rider:kicked', {
      riderId: targetRiderId,
      displayName,
      timestamp: new Date().toISOString()
    });
  });

  // Handle rider reconnection with buffered trail
  socket.on('rider:reconnect', ({ tripCode, riderId, displayName, bufferedPath }) => {
    console.log(`🔄 ${displayName} reconnected with ${bufferedPath?.length || 0} buffered locations`);
    socket.to(`trip:${tripCode}`).emit('rider:reconnected', {
      riderId,
      displayName,
      bufferedPath: bufferedPath || [],
      timestamp: new Date().toISOString()
    });
  });
  
  socket.on('disconnect', (reason) => {
    console.log(`❌ Client disconnected: ${socket.id} (${reason})`);
  });
});


const startServer = async () => {
  try {
    // Connect to MongoDB before starting HTTP server
    await connectDB();
    
    // Try to connect to Redis, but don't fail if unavailable
    try {
      if (redis.status !== 'ready') {
        console.log('⏳ Waiting for Redis to be ready...');
        await Promise.race([
          new Promise((resolve) => redis.once('ready', resolve)),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Redis connection timeout')), 5000))
        ]);
      }
      console.log('✅ Redis ready for operations');
      
      // Test Redis connection
      await redis.set('test:startup', 'ok', 'EX', 10);
      const testVal = await redis.get('test:startup');
      console.log(`🧪 Redis test: ${testVal === 'ok' ? '✅ PASS' : '❌ FAIL'}`);
    } catch (redisError) {
      console.warn('⚠️ Redis connection failed - server will start without caching');
      console.warn('   To enable Redis: Install locally or configure REDIS_URL');
      console.warn('   Local Redis: redis://localhost:6379');
      console.warn('   Redis error:', redisError instanceof Error ? redisError.message : 'Unknown error');
    }
    
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🔌 WebSocket server ready`);
      console.log(`🌍 Accepting connections from ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
