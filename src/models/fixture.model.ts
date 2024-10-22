import mongoose, { Schema, Document } from 'mongoose';
import { ITeam } from './team.model';

export interface IFixture extends Document {
  homeTeam: ITeam;
  awayTeam: ITeam;
  date: Date;
  status: 'pending' | 'ongoing' | 'completed';
  score?: string;
  link: string;
}

const FixtureSchema: Schema = new Schema({
  homeTeam: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  awayTeam: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  date: { type: Date, required: true },
  score: { type: String },
  link: { type: String, required: true, unique: true },
});

// Virtual field to dynamically calculate the status based on the current date and time
FixtureSchema.virtual('status').get(function (this: IFixture) {
  const now = new Date();
  const fixtureDate = new Date(this.date);
  const timeDifferenceInMinutes = (now.getTime() - fixtureDate.getTime()) / (1000 * 60);

  // Check if the fixture is pending
  if (fixtureDate > now) {
    return 'pending';
  }
  // Check if the fixture is ongoing (within 110 minutes of the start)
  else if (fixtureDate < now && timeDifferenceInMinutes <= 110) {
    return 'ongoing';
  }
  // If the fixture is older than 110 minutes, it's completed
  else if (timeDifferenceInMinutes > 110) {
    return 'completed';
  }
});

// Ensure that the virtual field is included when converting to JSON
FixtureSchema.set('toJSON', { virtuals: true });
FixtureSchema.set('toObject', { virtuals: true });

export const FixtureModel = mongoose.model<IFixture>('Fixture', FixtureSchema);
