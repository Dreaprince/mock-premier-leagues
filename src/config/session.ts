import session from 'express-session';
import connectRedis from 'connect-redis';
import { createClient } from 'redis';

// Initialize Redis client using the correct API
const redisClient = createClient({
  url: 'redis://localhost:6379', // Use the correct Redis URL format
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Make sure the Redis client is connected
redisClient.connect();

// Initialize Redis store
const RedisStore = connectRedis(session); // Properly connect Redis with express-session

// Session middleware using Redis for session storage
export const sessionMiddleware = session({
  store: new RedisStore({ client: redisClient }), // Use 'new' with RedisStore
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if you're using HTTPS
    maxAge: 60000, // 1-minute session expiration for example
  },
});
