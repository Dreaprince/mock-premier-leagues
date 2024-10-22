import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator'; // Import validation result to handle errors
import { FixtureModel } from '../models/fixture.model';
import { TeamModel } from '../models/team.model';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

// Add a new fixture (Admin only)
export const addFixture = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { homeTeamId, awayTeamId, date, status } = req.body;

        // if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        //     return res.status(400).json({ message: 'Invalid team ID' });
        // }

        // Validate that both home and away teams exist
        const homeTeam = await TeamModel.findById(homeTeamId);
        const awayTeam = await TeamModel.findById(awayTeamId);

        if (!homeTeam || !awayTeam) {
            return res.status(400).json({ message: 'Invalid home or away team' });
        }

        // Generate a unique link for the fixture
        const link = `fixture-${uuidv4()}`;

        const newFixture = new FixtureModel({
            homeTeam: homeTeam._id,
            awayTeam: awayTeam._id,
            date,
            status,
            link,
        });

        await newFixture.save();

        return res.status(201).json({
            message: 'Fixture created successfully',
            data: newFixture,
        });
    } catch (error) {
        return next(error);
    }
};

// Remove a fixture (Admin only)
export const removeFixture = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid team ID' });
        }

        const fixtureId = req.params.id;
        const fixture = await FixtureModel.findByIdAndDelete(fixtureId);

        if (!fixture) {
            return res.status(404).json({ message: 'Fixture not found' });
        }

        return res.status(200).json({ message: 'Fixture deleted successfully' });
    } catch (error) {
        return next(error);
    }
};

// Edit/update a fixture (Admin only)
export const editFixture = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid team ID' });
        }

        const fixtureId = req.params.id;
        const updatedData = req.body;

        const updatedFixture = await FixtureModel.findByIdAndUpdate(fixtureId, updatedData, { new: true });

        if (!updatedFixture) {
            return res.status(404).json({ message: 'Fixture not found' });
        }

        return res.status(200).json({
            message: 'Fixture updated successfully',
            data: updatedFixture,
        });
    } catch (error) {
        return next(error);
    }
};

// View a single fixture by ID (Admin & User)
export const viewFixture = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid team ID' });
        }

        const fixtureId = req.params.id;
        const fixture = await FixtureModel.findById(fixtureId).populate('homeTeam awayTeam');

        if (!fixture) {
            return res.status(404).json({ message: 'Fixture not found' });
        }

        return res.status(200).json(fixture);
    } catch (error) {
        return next(error);
    }
};

// View completed or pending fixtures (User & Admin)
export const viewFixturesByStatus = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const { status } = req.query; // Expects 'pending' or 'completed'

        const fixtures = await FixtureModel.find({ status }).populate('homeTeam awayTeam');

        return res.status(200).json(fixtures);
    } catch (error) {
        return next(error);
    }
};

// Fetch all fixtures (Admin & User)
export const fetchAllFixtures = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        console.log("reacg gere")
        // Fetch all fixtures and populate the homeTeam and awayTeam fields
        const fixtures = await FixtureModel.find().populate('homeTeam awayTeam');

        console.log("reach here:", fixtures)

        if (!fixtures || fixtures.length === 0) {
            return res.status(404).json({
                message: 'No fixtures found',
            });
        }
        console.log("loading")
        return res.status(200).json({
            message: 'Fixtures retrieved successfully',
            data: fixtures,
        });
    } catch (error) {
        console.error('Error fetching fixtures:', error); // Log the actual error
        return next(error);
    }
};

  // Update the score of a fixture (Admin only)
export const updateFixtureScore = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Validate if the ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid fixture ID' });
        }

        const { score } = req.body;

        // Update the fixture with the score and mark it as completed
        const updatedFixture = await FixtureModel.findByIdAndUpdate(
            req.params.id,
            { score, status: 'completed' },
            { new: true }
        );

        if (!updatedFixture) {
            return res.status(404).json({ message: 'Fixture not found' });
        }

        return res.status(200).json({
            message: 'Fixture score updated successfully',
            data: updatedFixture,
        });
    } catch (error) {
        return next(error);
    }
};

// Search fixtures/teams robustly (User & Admin)
export const searchFixtures = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        // Ensure 'search' is a string, or set it to an empty string if undefined
        const search = typeof req.query.search === 'string' ? req.query.search : '';

        const fixtures = await FixtureModel.find({
            $or: [
                { 'homeTeam.name': new RegExp(search, 'i') }, // Case-insensitive regex search
                { 'awayTeam.name': new RegExp(search, 'i') },
                { link: new RegExp(search, 'i') },
            ],
        }).populate('homeTeam awayTeam');

        return res.status(200).json(fixtures);
    } catch (error) {
        return next(error);
    }
};
