import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;

let redis: Redis | null = null;
let redisEnabled = false;

if (redisUrl && redisUrl.startsWith('redis')) {
  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) {
          console.warn('⚠️ Redis max retries reached, disabling Redis cache');
          redisEnabled = false;
          return null; // Stop retrying
        }
        const delay = Math.min(times * 500, 2000);
        console.log(`⏳ Redis retry attempt ${times}, waiting ${delay}ms...`);
        return delay;
      },
      lazyConnect: true,
    });

    redis.on('connect', () => {
      console.log('🔗 Connecting to Redis...');
    });

    redis.on('ready', () => {
      console.log('✅ Redis connected and ready');
      redisEnabled = true;
    });

    redis.on('error', (err) => {
      console.error('❌ Redis connection error:', err.message);
      redisEnabled = false;
    });

    redis.on('close', () => {
      console.warn('⚠️ Redis connection closed');
      redisEnabled = false;
    });

    // Try to connect
    redis.connect().catch(() => {
      console.warn('⚠️ Redis not available, running without cache');
      redisEnabled = false;
    });
  } catch (error) {
    console.warn('⚠️ Redis initialization failed, running without cache');
    redis = null;
    redisEnabled = false;
  }
} else {
  console.log('ℹ️ REDIS_URL not configured, running without Redis cache');
}

// Export a safe getter
export const getRedis = () => (redisEnabled ? redis : null);
export const isRedisEnabled = () => redisEnabled;

// Graceful shutdown
const shutdownRedis = async (signal: string) => {
  if (redis && redisEnabled) {
    console.log(`\n📴 ${signal} received. Closing Redis connection...`);
    try {
      await redis.quit();
      console.log('✅ Redis connection closed successfully');
    } catch (error) {
      console.error('❌ Error closing Redis:', error);
    }
  }
};

process.on('SIGINT', () => shutdownRedis('SIGINT'));
process.on('SIGTERM', () => shutdownRedis('SIGTERM'));

export { redis };
