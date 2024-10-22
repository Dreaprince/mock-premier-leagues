import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator'; // Import validation result to handle errors
import { TeamModel } from '../models/team.model';
import mongoose from 'mongoose';

// Add a new team
export const addTeam = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name } = req.body;
        const existingTeam = await TeamModel.findOne({ name });
        if (existingTeam) {
            return res.status(409).json({
                responseCode: 409,
                status: false,
                message: 'Team name already exists',
            });
        }

        const newTeam = new TeamModel(req.body);
        await newTeam.save();

        return res.status(201).json({
            responseCode: 201,
            status: true,
            message: 'Team created successfully',
            data: newTeam,
        });
    } catch (err) {
        next(err); // Pass the error to the error handler
    }
};

// Get all teams
export const getTeams = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const teams = await TeamModel.find();
        return res.status(200).json(teams);
    } catch (err) {
        next(err); // Pass the error to the error handler
    }
};

// Get a specific team by ID
export const getTeamById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }


        // Validate if the ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid team ID' });
        }

        const team = await TeamModel.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }
        return res.status(200).json(team);
    } catch (err) {
        next(err); // Pass the error to the error handler
    }
};

// Edit/update an existing team
export const editTeam = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }


        // Validate if the ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid team ID' });
        }

        const updatedTeam = await TeamModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedTeam) {
            return res.status(404).json({ message: 'Team not found' });
        }
        return res.status(200).json(updatedTeam);
    } catch (err) {
        next(err); // Pass the error to the error handler
    }
};

// Remove/delete a team
export const removeTeam = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid team ID' });
        }

        const deletedTeam = await TeamModel.findByIdAndDelete(req.params.id);
        if (!deletedTeam) {
            return res.status(404).json({ message: 'Team not found' });
        }
        return res.status(200).json({ message: 'Team deleted successfully' });
    } catch (err) {
        next(err); // Pass the error to the error handler
    }
};
