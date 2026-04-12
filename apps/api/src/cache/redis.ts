import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    console.log(`⏳ Redis retry attempt ${times}, waiting ${delay}ms...`);
    return delay;
  },
  lazyConnect: false,
});

redis.on('connect', () => {
  console.log('🔗 Connecting to Redis...');
});

redis.on('ready', () => {
  console.log('✅ Redis connected and ready');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

redis.on('close', () => {
  console.warn('⚠️ Redis connection closed');
});

redis.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...');
});

// Graceful shutdown
const shutdownRedis = async (signal: string) => {
  console.log(`\n📴 ${signal} received. Closing Redis connection...`);
  try {
    await redis.quit();
    console.log('✅ Redis connection closed successfully');
  } catch (error) {
    console.error('❌ Error closing Redis:', error);
  }
};

process.on('SIGINT', () => shutdownRedis('SIGINT'));
process.on('SIGTERM', () => shutdownRedis('SIGTERM'));
