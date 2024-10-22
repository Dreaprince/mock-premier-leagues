import express from 'express';
import teamRoutes from './team.routes'; 
import authRouter from './auth.routes';
import fixtureRouter from './fixture.routes';
import { apiRateLimiter } from '../middlewares/rateLimiter';


const router = express.Router();

// Apply the rate limiter to all routes
router.use(apiRateLimiter);

// Register team, auth, and fixture routes
router.use('/teams', teamRoutes);
router.use('/auth', authRouter);
router.use('/fixtures', fixtureRouter);

export default router; // Use ES6 export


