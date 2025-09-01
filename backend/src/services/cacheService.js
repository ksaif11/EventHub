import redis from '../config/redis.js';

export const cacheGet = async (key) => {
  try {
    if (!redis) {
      console.log('⚠️ Redis not available, skipping cache get');
      return null;
    }
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

export const cacheSet = async (key, data, ttl = 300) => {
  try {
    if (!redis) {
      console.log('⚠️ Redis not available, skipping cache set');
      return;
    }
    await redis.setex(key, ttl, JSON.stringify(data));
  } catch (error) {
    console.error('Cache set error:', error);
  }
};

export const cacheDelete = async (key) => {
  try {
    if (!redis) {
      console.log('⚠️ Redis not available, skipping cache delete');
      return;
    }
    await redis.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
};

export const cacheInvalidatePattern = async (pattern) => {
  try {
    if (!redis) {
      console.log('⚠️ Redis not available, skipping cache invalidation');
      return;
    }
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`🗑️ Invalidated ${keys.length} cache keys: ${pattern}`);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
};

export const generateCacheKey = (prefix, params = {}) => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join(':');
  return `${prefix}:${sortedParams}`;
};
