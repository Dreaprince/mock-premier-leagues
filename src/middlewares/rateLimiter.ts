// src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

// Set up rate limiting: Max 100 requests per 15 minutes
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  headers: true, // Adds rate limit headers to the response
});
