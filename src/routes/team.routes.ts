import { Router } from 'express';
import { addTeam, getTeams, getTeamById, editTeam, removeTeam } from '../controllers/team.controller';
import authMiddleware from '../middlewares/auth.middleware';
import rolesMiddleware from '../middlewares/roles.middleware';
import { validate } from '../middlewares/validator';

const router = Router();

router.post('/', validate("addTeam"), authMiddleware, rolesMiddleware(['admin']), async (req: any, res: any, next: any) => {
  try {
    await addTeam(req, res, next);
  } catch (error) {
    next(error); 
  }
});


router.get('/', authMiddleware, async (req, res, next) => {
  try {
    await getTeams(req, res, next);
  } catch (error) {
    next(error); 
  }
});


router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    await getTeamById(req, res, next);
  } catch (error) {
    next(error); 
  }
});


router.put('/:id', validate("editTeam"), authMiddleware, rolesMiddleware(['admin']), async (req: any, res: any, next: any) => {
  try {
    await editTeam(req, res, next);
  } catch (error) {
    next(error); 
  }
});


router.delete('/:id', authMiddleware, rolesMiddleware(['admin']), async (req, res, next) => {
  try {
    await removeTeam(req, res, next);
  } catch (error) {
    next(error);
  }
});

export default router;
