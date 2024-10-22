import express from 'express';
import teamRoutes from './team.routes'; 
import authRouter from './auth.routes';
import fixtureRouter from './fixture.routes'

const router = express.Router();

// Register team routes
router.use('/teams', teamRoutes);
router.use('/auth', authRouter)
router.use('/fixtures', fixtureRouter)

export default router; // Use ES6 export

