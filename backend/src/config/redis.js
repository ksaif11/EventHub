import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

let redis = null;

try {
  if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      connectTimeout: 5000, // 5 second timeout
      lazyConnect: true,
    });

    redis.ping()
      .then(result => {
        console.log('✅ Redis ping response:', result);
      })
      .catch(err => {
        console.error('❌ Redis ping failed:', err);
        console.log('⚠️ Continuing without Redis cache...');
        redis = null;
      });

    redis.on('connect', () => {
      console.log('✅ Redis connected');
    });

    redis.on('error', (err) => {
      console.error('❌ Redis connection error:', err);
      console.log('⚠️ Continuing without Redis cache...');
      redis = null;
    });
  } else {
    console.log('⚠️ No REDIS_URL provided, running without Redis cache...');
  }
} catch (error) {
  console.error('❌ Redis initialization error:', error);
  console.log('⚠️ Continuing without Redis cache...');
  redis = null;
}

export default redis;
