import { Router } from 'express';
import { addFixture, removeFixture, editFixture, viewFixture, viewFixturesByStatus, searchFixtures, fetchAllFixtures, updateFixtureScore } from '../controllers/fixture.controller';
import authMiddleware from '../middlewares/auth.middleware';
import rolesMiddleware from '../middlewares/roles.middleware';
import { validate } from '../middlewares/validator';

const router = Router();

// Admin routes

// Add a fixture
router.post('/', validate("addFixture"), authMiddleware, rolesMiddleware(['admin']), async (req: any, res: any, next: any) => {
    try {
        await addFixture(req, res, next);
    } catch (error) {
        next(error); // Pass error to error-handling middleware
    }
});

// Remove a fixture
router.delete('/:id', authMiddleware, rolesMiddleware(['admin']), async (req, res, next) => {
    try {
        await removeFixture(req, res, next);
    } catch (error) {
        next(error); // Pass error to error-handling middleware
    }
});

// Edit/update a fixture
router.put('/:id', validate("editFixture"), authMiddleware, rolesMiddleware(['admin']), async (req: any, res: any, next: any) => {
    try {
        await editFixture(req, res, next);
    } catch (error) {
        next(error); // Pass error to error-handling middleware
    }
});

// User & Admin routes

// View a specific fixture
router.get('/one/:id', authMiddleware, async (req, res, next) => {
    try {
        await viewFixture(req, res, next);
    } catch (error) {
        next(error); // Pass error to error-handling middleware
    }
});

// View completed or pending fixtures
router.get('/status', validate("searchFixtures"), authMiddleware, async (req: any, res: any, next: any) => {
    try {
        await viewFixturesByStatus(req, res, next);
    } catch (error) {
        next(error); // Pass error to error-handling middleware
    }
});

// Fetch all fixtures
router.get('/all', authMiddleware, async (req, res, next) => {
    try {
        await fetchAllFixtures(req, res, next);
    } catch (error) {
        next(error);
    }
});

router.put('/score/:id', authMiddleware, rolesMiddleware(['admin']), validate('updateFixtureScore'), async (req: any, res: any, next: any) => {
    try {
        await updateFixtureScore(req, res, next);
    } catch (error) {
        next(error);
    }
});

// Search fixtures/teams
router.get('/search', authMiddleware, async (req, res, next) => {
    try {
        await searchFixtures(req, res, next);
    } catch (error) {
        next(error); // Pass error to error-handling middleware
    }
});

export default router;

