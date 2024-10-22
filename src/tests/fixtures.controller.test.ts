import { addFixture, removeFixture, editFixture, viewFixture, viewFixturesByStatus, fetchAllFixtures, updateFixtureScore } from '../controllers/fixture.controller';
import { FixtureModel } from '../models/fixture.model';
import { TeamModel } from '../models/team.model';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';

jest.mock('../models/fixture.model'); // Mock FixtureModel
jest.mock('../models/team.model'); // Mock TeamModel
jest.mock('express-validator');
jest.mock('mongoose');

describe('Fixture Controller', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {
            body: { homeTeamId: 'homeTeamId', awayTeamId: 'awayTeamId', date: '2024-10-24T09:30:00', status: 'pending' },
            params: { id: 'fixtureId' },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('addFixture', () => {
        it('should return validation errors if validation fails', async () => {
            (validationResult as unknown as jest.Mock).mockReturnValue({
                isEmpty: () => false,
                array: () => [{ msg: 'Invalid data' }]
            });

            await addFixture(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ errors: [{ msg: 'Invalid data' }] });
        });

        it('should return an error if home or away team does not exist', async () => {
            (validationResult as unknown as jest.Mock).mockReturnValue({
                isEmpty: () => true,
            });

            (TeamModel.findById as jest.Mock).mockResolvedValueOnce(null); // Mock homeTeam not found

            await addFixture(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid home or away team' });
        });

        it('should create a fixture successfully', async () => {
            (validationResult as unknown as jest.Mock).mockReturnValue({
                isEmpty: () => true,
            });

            (TeamModel.findById as jest.Mock).mockResolvedValue({ _id: 'teamId' });
            (FixtureModel.prototype.save as jest.Mock).mockResolvedValue({
                _id: 'fixtureId',
                homeTeam: 'teamId',
                awayTeam: 'teamId',
                date: '2024-10-24T09:30:00',
                status: 'pending',
                link: 'fixture-link'
            });

            await addFixture(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Fixture created successfully',
                data: {
                    _id: 'fixtureId',
                    homeTeam: 'teamId',
                    awayTeam: 'teamId',
                    date: '2024-10-24T09:30:00',
                    status: 'pending',
                    link: 'fixture-link'
                }
            });
        });
    });

    describe('removeFixture', () => {
        it('should return 400 for invalid fixture ID', async () => {
            req.params = { id: 'invalidId' };
            (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(false);

            await removeFixture(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid fixture ID' });
        });

        it('should return 404 if fixture is not found', async () => {
            (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
            (FixtureModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

            await removeFixture(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Fixture not found' });
        });

        it('should remove the fixture successfully', async () => {
            (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
            (FixtureModel.findByIdAndDelete as jest.Mock).mockResolvedValue({ _id: 'fixtureId' });

            await removeFixture(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Fixture deleted successfully' });
        });
    });

    describe('editFixture', () => {
        it('should return 400 if fixture ID is invalid', async () => {
            req.params = { id: 'invalidId' };
            (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(false);

            await editFixture(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid fixture ID' });
        });

        it('should return 404 if fixture is not found for editing', async () => {
            (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
            (FixtureModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

            await editFixture(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Fixture not found' });
        });

        it('should edit the fixture successfully', async () => {
            (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
            (FixtureModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({
                _id: 'fixtureId',
                homeTeam: 'teamId',
                awayTeam: 'teamId',
                date: '2024-10-24T09:30:00',
                status: 'ongoing'
            });

            await editFixture(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Fixture updated successfully',
                data: {
                    _id: 'fixtureId',
                    homeTeam: 'teamId',
                    awayTeam: 'teamId',
                    date: '2024-10-24T09:30:00',
                    status: 'ongoing'
                }
            });
        });
    });

    describe('updateFixtureScore', () => {
        it('should return 404 if fixture not found', async () => {
            (FixtureModel.findById as jest.Mock).mockResolvedValue(null);

            await updateFixtureScore(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Fixture not found' });
        });

        it('should return 400 if trying to update score for non-ongoing/completed fixture', async () => {
            (FixtureModel.findById as jest.Mock).mockResolvedValue({
                _id: 'fixtureId',
                status: 'pending'
            });

            await updateFixtureScore(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Score can only be updated when the fixture is ongoing or completed' });
        });

        it('should update the score successfully', async () => {
            (FixtureModel.findById as jest.Mock).mockResolvedValue({
                _id: 'fixtureId',
                status: 'ongoing',
                save: jest.fn().mockResolvedValue({
                    _id: 'fixtureId',
                    homeTeam: 'teamId',
                    awayTeam: 'teamId',
                    date: '2024-10-24T09:30:00',
                    score: '3 : 1',
                    status: 'ongoing'
                })
            });

            req.body = { score: '3 : 1' };

            await updateFixtureScore(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Fixture score updated successfully',
                data: {
                    _id: 'fixtureId',
                    homeTeam: 'teamId',
                    awayTeam: 'teamId',
                    date: '2024-10-24T09:30:00',
                    score: '3 : 1',
                    status: 'ongoing'
                }
            });
        });
    });

    describe('Fixture Controller', () => {
        let req: Partial<Request>;
        let res: Partial<Response>;
        let next: NextFunction;
    
        beforeEach(() => {
            req = {
                query: {},
                params: { id: 'fixtureId' },
            };
            res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            next = jest.fn();
        });
    
        afterEach(() => {
            jest.clearAllMocks();
        });
    
        // Test for viewFixturesByStatus
        describe('viewFixturesByStatus', () => {
            it('should return 400 for invalid status query parameter', async () => {
                req.query = { status: 'invalidStatus' };
    
                await viewFixturesByStatus(req as Request, res as Response, next);
    
                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({ message: 'Invalid status query parameter' });
            });
    
            it('should retrieve pending fixtures', async () => {
                req.query = { status: 'pending' };
                (FixtureModel.find as jest.Mock).mockResolvedValue([
                    { _id: 'fixtureId1', homeTeam: 'team1', awayTeam: 'team2', status: 'pending' }
                ]);
    
                await viewFixturesByStatus(req as Request, res as Response, next);
    
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.json).toHaveBeenCalledWith({
                    message: 'Fixtures with status pending retrieved successfully',
                    data: [{ _id: 'fixtureId1', homeTeam: 'team1', awayTeam: 'team2', status: 'pending' }],
                });
            });
        });
    
        // Test for fetchAllFixtures
        describe('fetchAllFixtures', () => {
            it('should return 404 if no fixtures are found', async () => {
                (FixtureModel.find as jest.Mock).mockResolvedValue([]);
    
                await fetchAllFixtures(req as Request, res as Response, next);
    
                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.json).toHaveBeenCalledWith({
                    message: 'No fixtures found',
                });
            });
    
            it('should retrieve all fixtures successfully', async () => {
                (FixtureModel.find as jest.Mock).mockResolvedValue([
                    { _id: 'fixtureId1', homeTeam: 'team1', awayTeam: 'team2', status: 'pending' }
                ]);
    
                await fetchAllFixtures(req as Request, res as Response, next);
    
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.json).toHaveBeenCalledWith({
                    message: 'Fixtures retrieved successfully',
                    data: [{ _id: 'fixtureId1', homeTeam: 'team1', awayTeam: 'team2', status: 'pending' }]
                });
            });
        });
    
        // Test for viewFixture
        // describe('viewFixture', () => {
        //     it('should return 400 for invalid fixture ID', async () => {
        //         req.params.id = 'invalidId';
        //         (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(false);
    
        //         await viewFixture(req as Request, res as Response, next);
    
        //         expect(res.status).toHaveBeenCalledWith(400);
        //         expect(res.json).toHaveBeenCalledWith({ message: 'Invalid team ID' });
        //     });
    
        //     it('should return 404 if fixture not found', async () => {
        //         (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
        //         (FixtureModel.findById as jest.Mock).mockResolvedValue(null);
    
        //         await viewFixture(req as Request, res as Response, next);
    
        //         expect(res.status).toHaveBeenCalledWith(404);
        //         expect(res.json).toHaveBeenCalledWith({ message: 'Fixture not found' });
        //     });
        // });
    });
});
