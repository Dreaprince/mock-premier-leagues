import mongoose, { Schema, Document } from 'mongoose';
import { ITeam } from './team.model';

// Define IFixture interface for the fixture document
export interface IFixture extends Document {
  homeTeam: ITeam;
  awayTeam: ITeam;
  date: Date;
  status: 'pending' | 'ongoing' | 'completed';
  score?: string;
  link: string;
}

// Define the FixtureSchema for MongoDB using Mongoose
const FixtureSchema: Schema = new Schema({
  homeTeam: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  awayTeam: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  date: { type: Date, required: true },
  score: { type: String },
  link: { type: String, required: true, unique: true },
});

// Pre-save hook to validate the 'date' field before saving the fixture
FixtureSchema.pre('save', function (next) {
  const fixture = this as unknown as mongoose.HydratedDocument<IFixture>; // Corrected typing for fixture
  const now = new Date();

  // Ensure the date is in the future when creating a new fixture or updating the date
  if (fixture.isNew || fixture.isModified('date')) {
    if (fixture.date <= now) {
      return next(new Error('Date cannot be in the past'));
    }
  }

  next();
});

// Virtual field to dynamically calculate the fixture status
FixtureSchema.virtual('status').get(function (this: mongoose.HydratedDocument<IFixture>) {
  const now = new Date();
  const fixtureDate = new Date(this.date);
  const timeDifferenceInMinutes = (now.getTime() - fixtureDate.getTime()) / (1000 * 60);

  if (fixtureDate > now) {
    return 'pending';
  } else if (timeDifferenceInMinutes <= 110) {
    return 'ongoing';
  } else {
    return 'completed';
  }
});

// Ensure that the virtual field is included when converting to JSON
FixtureSchema.set('toJSON', { virtuals: true });
FixtureSchema.set('toObject', { virtuals: true });

// Export the Fixture model
export const FixtureModel = mongoose.model<IFixture>('Fixture', FixtureSchema);
