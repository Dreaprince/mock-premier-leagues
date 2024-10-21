import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator'; // Import validation result to handle errors
import { FixtureModel } from '../models/fixture.model';
import { TeamModel } from '../models/team.model'; 
import { v4 as uuidv4 } from 'uuid'; 

// Add a new fixture (Admin only)
export const addFixture = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { homeTeamId, awayTeamId, date, status } = req.body;

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
