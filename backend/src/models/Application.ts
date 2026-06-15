import mongoose, { Schema } from 'mongoose';

export interface IApplication extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  companyName: string;
  role: string;
  ctc: string;
  applicationDate: Date;
  status: 'Applied' | 'OA Scheduled' | 'OA Completed' | 'Interview' | 'Offer' | 'Rejected';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Application must be associated with a user'],
      index: true,
    },
    companyName: {
      type: String,
      required: [true, 'Please provide a company name'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Please provide a job role'],
      trim: true,
    },
    ctc: {
      type: String,
      required: [true, 'Please provide the CTC package (e.g. 12 LPA, $130,000/yr)'],
      trim: true,
    },
    applicationDate: {
      type: Date,
      required: [true, 'Please provide the application date'],
    },
    status: {
      type: String,
      enum: {
        values: ['Applied', 'OA Scheduled', 'OA Completed', 'Interview', 'Offer', 'Rejected'],
        message: '{VALUE} is not a valid status',
      },
      default: 'Applied',
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IApplication>('Application', ApplicationSchema);
