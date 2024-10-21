import { Request, Response } from 'express';
import { FixtureModel } from '../models/fixture.model';
import { TeamModel } from '../models/team.model';

export const searchTeamsAndFixtures = async (req: Request, res: Response) => {
  const { query } = req.query;

  try {
    const teams = await TeamModel.find({ name: { $regex: query, $options: 'i' } });
    const fixtures = await FixtureModel.find({ link: { $regex: query, $options: 'i' } });

    res.status(200).json({ teams, fixtures });
  } catch (err) {
    res.status(500).json({ message: 'Error searching teams and fixtures' });
  }
};
