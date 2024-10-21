import mongoose, { Schema, Document } from 'mongoose';
import { ITeam } from './team.model';

export interface IFixture extends Document {
  homeTeam: ITeam;
  awayTeam: ITeam;
  date: Date;
  status: 'pending' | 'completed';
  score?: string;
  link: string;
}

const FixtureSchema: Schema = new Schema({
  homeTeam: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  awayTeam: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'completed'], required: true },
  score: { type: String },
  link: { type: String, required: true, unique: true },
});

export const FixtureModel = mongoose.model<IFixture>('Fixture', FixtureSchema);
