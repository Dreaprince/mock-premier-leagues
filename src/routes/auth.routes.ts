import { Router } from 'express';
import { signup, login, getAllUsers } from '../controllers/auth.controller';
import { validate } from '../middlewares/validator';
import authMiddleware from '../middlewares/auth.middleware';
import rolesMiddleware from '../middlewares/roles.middleware';

const authRouter = Router();


authRouter.post('/signup', validate('signup'), async (req: any, res: any, next: any) => {
  try {
    await signup(req, res, next); 
  } catch (error) {
    next(error); 
  }
});



authRouter.post('/login',  validate('login'), async (req: any, res: any, next: any) => {
  try {
    await login(req, res, next); 
  } catch (error) {
    next(error); 
  }
});

// Get all users (Admin only)
authRouter.get('/users', authMiddleware, rolesMiddleware(['admin']), async (req, res, next) => {
  try {
    await getAllUsers(req, res, next);
  } catch (error) {
    next(error);
  }
});

export default authRouter;

