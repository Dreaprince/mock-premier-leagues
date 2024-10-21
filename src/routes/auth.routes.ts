import { Router } from 'express';
import { signup, login } from '../controllers/auth.controller';
import { validate } from '../middlewares/validator';

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

export default authRouter;

