// src/config/redis.ts
import Redis from 'ioredis';

// Create a Redis instance
const redisClient = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
});

redisClient.on('connect', () => {
  console.log('Connected to Redis...');
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

export default redisClient;
