import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;
let isConnected = false;

export const initializeRedis = async (): Promise<void> => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  redisClient = createClient({
    url: redisUrl,
    socket: {
      connectTimeout: 5000,
      reconnectStrategy: (retries: number) => {
        if (retries >= 10) {
          return new Error('Redis reconnect attempts exhausted');
        }
        return Math.min(retries * 100, 2000);
      },
    },
  });

  redisClient.on('error', (err) => {
    console.error('❌ Redis Client Error:', err.message);
    isConnected = false;
  });

  redisClient.on('connect', () => {
    console.log('🔴 Redis connected');
    isConnected = true;
  });

  redisClient.on('disconnect', () => {
    console.log('⚠️  Redis disconnected');
    isConnected = false;
  });

  try {
    await redisClient.connect();
  } catch (error) {
    console.error('❌ Redis connection failed:', (error as Error).message);
    console.log('⚠️  Server will start without cache — all reads hit DB directly');
  }
};

// ── Cache helpers ────────────────────────────────────────────────────────────

/**
 * Get cached value by key. Returns null on miss or if Redis is down.
 */
export const cacheGet = async <T = unknown>(key: string): Promise<T | null> => {
  if (!redisClient || !isConnected) return null;
  try {
    const raw = await redisClient.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

/**
 * Set a value in cache with TTL (seconds). Silently fails if Redis is down.
 */
export const cacheSet = async (key: string, value: unknown, ttlSeconds: number): Promise<void> => {
  if (!redisClient || !isConnected) return;
  try {
    await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // silent — non-critical
  }
};

/**
 * Invalidate a single key.
 */
export const cacheDel = async (key: string): Promise<void> => {
  if (!redisClient || !isConnected) return;
  try {
    await redisClient.del(key);
  } catch {
    // silent
  }
};

/**
 * Invalidate keys by pattern (e.g. "articles:*").
 * Uses SCAN to avoid blocking Redis.
 */
export const cacheInvalidatePattern = async (pattern: string): Promise<void> => {
  if (!isConnected) return;
  try {
    let cursor = 0;
    do {
      const result = await redisClient.scan(cursor, { MATCH: pattern, COUNT: 100 });
      cursor = result.cursor;
      if (result.keys.length > 0) {
        await redisClient.del(result.keys);
      }
    } while (cursor !== 0);
  } catch {
    // silent
  }
};

export const redisHealthCheck = async (): Promise<boolean> => {
  if (!redisClient || !isConnected) return false;
  try {
    await redisClient.ping();
    return true;
  } catch {
    return false;
  }
};

export const closeRedis = async (): Promise<void> => {
  if (!redisClient) return;
  try {
    await redisClient.quit();
  } catch (error) {
    console.warn('⚠️ Failed to close Redis client cleanly:', (error as Error).message);
  }
};

export { redisClient, isConnected };
