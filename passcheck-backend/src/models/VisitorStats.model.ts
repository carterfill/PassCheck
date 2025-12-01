import mongoose, { Schema, Document } from 'mongoose';

export interface IVisitorStats extends Document {
  totalVisits: number;
  todayVisits: number;
  lastVisitDate: string;
  uniqueVisitors: string[];
  createdAt: Date;
  updatedAt: Date;
}

const VisitorStatsSchema: Schema = new Schema(
  {
    totalVisits: {
      type: Number,
      required: true,
      default: 0,
    },
    todayVisits: {
      type: Number,
      required: true,
      default: 0,
    },
    lastVisitDate: {
      type: String,
      required: true,
      default: () => new Date().toDateString(),
    },
    uniqueVisitors: {
      type: [String],
      default: [],
      index: true, // Index for faster lookups
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Create indexes for better performance
VisitorStatsSchema.index({ lastVisitDate: 1 });

export default mongoose.model<IVisitorStats>('VisitorStats', VisitorStatsSchema);
