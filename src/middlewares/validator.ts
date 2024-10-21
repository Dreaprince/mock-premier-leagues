import { body, query } from 'express-validator';
import { TeamModel } from '../models/team.model';
import { UserModel } from '../models/user.model';


export const validate = (method: string) => {
    switch (method) {
        // Team-related validations
        case 'addTeam': {
            return [
                body('name', 'Team name is required').exists().isString().withMessage('Team name must be a string'),
                body('name', 'Team name should be at least 3 characters long').isLength({ min: 3 }),
            ];
        }
        case 'editTeam': {
            return [
                body('name', 'Team name is required').exists().isString().withMessage('Team name must be a string'),
                body('name', 'Team name should be at least 3 characters long').isLength({ min: 3 }),
            ];
        }

        // Auth-related validations
        case 'signup': {
            return [
                body('fullName', 'Full name is required').exists().isString(),
                body('email', 'Invalid email address').exists().isEmail().custom(async (value) => {
                    const user = await UserModel.findOne({ email: value });
                    if (user) {
                        throw new Error('Email already in use');
                    }
                }),
                body('password', 'Password must be at least 6 characters long').exists().isLength({ min: 6 }),
            ];
        }
        case 'login': {
            return [
                body('email', 'Invalid email address').exists().isEmail(),
                body('password', 'Password is required').exists().isString(),
            ];
        }

        // Fixture-related validations
        case 'addFixture': {
            return [
                body('homeTeam', 'Home team is required').exists().isMongoId().custom(async (value) => {
                    const team = await TeamModel.findById(value);
                    if (!team) {
                        throw new Error('Invalid home team');
                    }
                }),
                body('awayTeam', 'Away team is required').exists().isMongoId().custom(async (value) => {
                    const team = await TeamModel.findById(value);
                    if (!team) {
                        throw new Error('Invalid away team');
                    }
                }),
                body('date', 'Date is required and must be a valid date').exists().isISO8601(),
                body('status', 'Status must be either pending or completed').optional().isIn(['pending', 'completed']),
            ];
        }
        case 'editFixture': {
            return [
                body('homeTeam', 'Home team is required').exists().isMongoId().custom(async (value) => {
                    const team = await TeamModel.findById(value);
                    if (!team) {
                        throw new Error('Invalid home team');
                    }
                }),
                body('awayTeam', 'Away team is required').exists().isMongoId().custom(async (value) => {
                    const team = await TeamModel.findById(value);
                    if (!team) {
                        throw new Error('Invalid away team');
                    }
                }),
                body('date', 'Date is required and must be a valid date').exists().isISO8601(),
                body('status', 'Status must be either pending or completed').optional().isIn(['pending', 'completed']),
            ];
        }
        case 'searchFixtures': {
            return [
                query('search', 'Search query is required').optional().isString(),
            ];
        }

        default:
            return [];
    }
};
