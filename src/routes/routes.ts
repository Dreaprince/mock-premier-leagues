import express from 'express';
import teamRoutes from './team.routes'; // Import team routes
import authRouter from './auth.routes';

const router = express.Router();

// Register team routes
router.use('/teams', teamRoutes);
router.use('/auth', authRouter)

export default router; // Use ES6 export

