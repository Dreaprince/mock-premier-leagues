import { addTeam, getTeams, getTeamById, editTeam, removeTeam } from '../controllers/team.controller';
import { TeamModel } from '../models/team.model';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';

jest.mock('../models/team.model'); // Mock the team model
jest.mock('express-validator'); // Mock express-validator for validation
jest.mock('mongoose'); // Mock mongoose

describe('Team Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      body: { name: 'Test Team' },
      params: { id: 'teamId' }, // Ensure req.params is set for tests that need it
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks between tests
  });

  describe('addTeam', () => {
    it('should return 409 if team already exists', async () => {
      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: () => true,
      });
      (TeamModel.findOne as jest.Mock).mockResolvedValue({ name: 'Test Team' });

      await addTeam(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        responseCode: 409,
        status: false,
        message: 'Team name already exists',
      });
    });

    it('should create a new team successfully', async () => {
      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: () => true,
      });
      (TeamModel.findOne as jest.Mock).mockResolvedValue(null); // Team does not exist
      (TeamModel.prototype.save as jest.Mock).mockResolvedValue({
        _id: 'teamId',
        name: 'Test Team',
      });

      await addTeam(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        responseCode: 201,
        status: true,
        message: 'Team created successfully',
        data: { _id: 'teamId', name: 'Test Team' },
      });
    });
  });

  describe('getTeams', () => {
    it('should retrieve all teams successfully', async () => {
      (TeamModel.find as jest.Mock).mockResolvedValue([
        { _id: 'teamId1', name: 'Team 1' },
        { _id: 'teamId2', name: 'Team 2' },
      ]);

      await getTeams(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        { _id: 'teamId1', name: 'Team 1' },
        { _id: 'teamId2', name: 'Team 2' },
      ]);
    });
  });

  describe('getTeamById', () => {
    it('should return validation errors if ID is invalid', async () => {
      req.params = { id: 'invalidId' };
      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid team ID' }],
      });
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(false);

      await getTeamById(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        errors: [{ msg: 'Invalid team ID' }],
      });
    });

    it('should return 404 if team not found', async () => {
      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: () => true,
      });
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      (TeamModel.findById as jest.Mock).mockResolvedValue(null);

      await getTeamById(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Team not found' });
    });

    it('should return the team if found', async () => {
      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: () => true,
      });
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      (TeamModel.findById as jest.Mock).mockResolvedValue({ _id: 'teamId', name: 'Test Team' });

      await getTeamById(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ _id: 'teamId', name: 'Test Team' });
    });
  });

  describe('editTeam', () => {
    it('should return 404 if team not found for editing', async () => {
      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: () => true,
      });
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      (TeamModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      await editTeam(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Team not found' });
    });

    it('should edit the team successfully', async () => {
      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: () => true,
      });
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      (TeamModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        _id: 'teamId',
        name: 'Updated Team',
      });

      await editTeam(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ _id: 'teamId', name: 'Updated Team' });
    });
  });

  describe('removeTeam', () => {
    it('should return 404 if team not found for removal', async () => {
      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: () => true,
      });
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      (TeamModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      await removeTeam(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Team not found' });
    });

    it('should remove the team successfully', async () => {
      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: () => true,
      });
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      (TeamModel.findByIdAndDelete as jest.Mock).mockResolvedValue({ _id: 'teamId', name: 'Test Team' });

      await removeTeam(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Team deleted successfully' });
    });
  });
});
