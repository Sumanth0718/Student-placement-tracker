import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedDemoData } from './config/seedData';

// Load environmental variables
dotenv.config();

const runSeed = async (): Promise<void> => {
  try {
    const connString = process.env.MONGODB_URI;
    if (!connString) {
      console.error('[SEED] MONGODB_URI is not set in .env. Cannot run seed script.');
      process.exit(1);
    }

    console.log('[SEED] Connecting to database...');
    await mongoose.connect(connString);
    console.log('[SEED] Database connected. Seeding sample data...');
    
    await seedDemoData();
    
    console.log('[SEED] Seeding completed.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[SEED] Seeding failed with error:', error);
    process.exit(1);
  }
};

runSeed();
