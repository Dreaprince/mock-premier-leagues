import { body, query } from 'express-validator';
import { TeamModel } from '../models/team.model';
import { UserModel } from '../models/user.model';

export const validate = (method: string) => {
    switch (method) {
        // Team-related validations
        case 'addTeam': {
            return [
                body('name')
                    .exists({ checkFalsy: true }).withMessage('Team name is required')
                    .isString().withMessage('Team name must be a string')
                    .isLength({ min: 3 }).withMessage('Team name should be at least 3 characters long'),
            ];
        }
        case 'editTeam': {
            return [
                body('name')
                    .exists({ checkFalsy: true }).withMessage('Team name is required')
                    .isString().withMessage('Team name must be a string')
                    .isLength({ min: 3 }).withMessage('Team name should be at least 3 characters long'),
            ];
        }
        // Auth-related validations
        case 'signup': {
            return [
                // Validate fullName
                body('fullname')
                    .exists({ checkFalsy: true }).withMessage('Full name is required')
                    .isString().withMessage('Full name must be a string'),

                // Validate email
                body('email')
                    .exists({ checkFalsy: true }).withMessage('Email is required')
                    .isEmail().withMessage('Invalid email address')
                    .custom(async (value) => {
                        const user = await UserModel.findOne({ email: value });
                        if (user) {
                            throw new Error('Email already in use');
                        }
                    }),

                // Validate password
                body('password')
                    .exists({ checkFalsy: true }).withMessage('Password is required')
                    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

                // Validate role
                body('role')
                    .exists({ checkFalsy: true }).withMessage('Role is required')
                    .isString().withMessage('Role must be a string')
                    .isIn(['admin', 'user']).withMessage('Role must be either "admin" or "user"'),
            ];
        }
        case 'login': {
            return [
                // Validate email
                body('email')
                    .exists({ checkFalsy: true }).withMessage('Email is required')
                    .isEmail().withMessage('Invalid email address'),

                // Validate password
                body('password')
                    .exists({ checkFalsy: true }).withMessage('Password is required')
                    .isString().withMessage('Password must be a string'),
            ];
        }
        // Fixture-related validations
        case 'addFixture': {
            return [
                // Validate homeTeam (must exist and be a valid MongoDB ID)
                body('homeTeamId')
                    .exists({ checkFalsy: true }).withMessage('Home team is required')
                    .isMongoId().withMessage('Invalid home team ID')
                    .custom(async (value) => {
                        const team = await TeamModel.findById(value);
                        if (!team) {
                            throw new Error('Invalid home team');
                        }
                    }),

                // Validate awayTeam (must exist and be a valid MongoDB ID)
                body('awayTeamId')
                    .exists({ checkFalsy: true }).withMessage('Away team is required')
                    .isMongoId().withMessage('Invalid away team ID')
                    .custom(async (value) => {
                        const team = await TeamModel.findById(value);
                        if (!team) {
                            throw new Error('Invalid away team');
                        }
                    }),

                // Validate date (must be a valid ISO 8601 date)
                body('date')
                    .exists({ checkFalsy: true })
                    .withMessage('Date is required')
                    .isISO8601({ strict: true, strictSeparator: true })
                    .withMessage('Date must be in ISO 8601 format, including both date and time. For example: "2024-10-23T11:30:00".')
                    .custom((value) => {
                        const inputDate = new Date(value);
                        const now = new Date();
                        if (inputDate <= now) {
                            throw new Error('Date must be in the future');
                        }
                        return true; // Continue if date is valid
                    }),


                // Validate status (must be either 'pending' or 'completed', optional)
                body('status')
                    .optional()
                    .isIn(['pending', 'ongoing', 'completed']).withMessage('Status must be either pending or completed'),
            ];
        }
        case 'editFixture': {
            return [
                // Validate homeTeam (must exist and be a valid MongoDB ID)
                body('homeTeamId')
                    .exists({ checkFalsy: true }).withMessage('Home team is required')
                    .isMongoId().withMessage('Invalid home team ID')
                    .custom(async (value) => {
                        const team = await TeamModel.findById(value);
                        if (!team) {
                            throw new Error('Invalid home team');
                        }
                    }),

                // Validate awayTeam (must exist and be a valid MongoDB ID)
                body('awayTeamId')
                    .exists({ checkFalsy: true }).withMessage('Away team is required')
                    .isMongoId().withMessage('Invalid away team ID')
                    .custom(async (value) => {
                        const team = await TeamModel.findById(value);
                        if (!team) {
                            throw new Error('Invalid away team');
                        }
                    }),

                // Validate date (must be a valid ISO 8601 date)
                body('date')
                    .exists({ checkFalsy: true })
                    .withMessage('Date is required')
                    .isISO8601({ strict: true, strictSeparator: true })
                    .withMessage('Date must be in ISO 8601 format, including both date and time. For example: "2024-10-23T11:30:00".')
                    .custom((value) => {
                        const inputDate = new Date(value);
                        const now = new Date();
                        if (inputDate <= now) {
                            throw new Error('Date must be in the future');
                        }
                        return true; // Continue if date is valid
                    }),


                // Validate status (must be either 'pending' or 'completed', optional)
                // body('status')
                //     .optional()
                //     .isIn(['pending', 'ongoing', 'completed']).withMessage('Status must be either pending or completed'),
            ];
        }
        case 'updateFixtureScore': {
            return [
                body('score', 'Score is required')
                    .exists()
                    .matches(/^\d+ \: \d+$/)
                    .withMessage('Score format is invalid. Expected format: "4 : 2"'),
            ];
        }
        case 'searchFixtures': {
            return [
                // Validate that search is optional, but if provided, it must be a string
                query('search')
                    .optional()
                    .isString().withMessage('Search query must be a string'),
            ];
        }
        default:
            return [];
    }
};
