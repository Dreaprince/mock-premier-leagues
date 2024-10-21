import mongoose, { Schema, Document } from 'mongoose';

export interface ITeam extends Document {
  name: string;
}

const TeamSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true }
});

export const TeamModel = mongoose.model<ITeam>('Team', TeamSchema);
