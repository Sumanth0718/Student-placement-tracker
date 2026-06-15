import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  try {
    const connString = process.env.MONGODB_URI;

    // Connect to Atlas or external MongoDB if it is not localhost
    if (connString && !connString.includes('localhost') && !connString.includes('127.0.0.1')) {
      console.log('Attempting connection to MongoDB Atlas...');
      const conn = await mongoose.connect(connString);
      console.log(`MongoDB Connected (Atlas): ${conn.connection.host}/${conn.connection.name}`);
      return;
    }

    // Try local MongoDB first, fall back to in-memory MongoDB if offline
    try {
      const localString = connString || 'mongodb://localhost:27017/placement_tracker';
      console.log(`Attempting connection to local MongoDB (${localString})...`);
      const conn = await mongoose.connect(localString, {
        serverSelectionTimeoutMS: 2500, // Timeout quickly if service is down
      });
      console.log(`MongoDB Connected (Local): ${conn.connection.host}/${conn.connection.name}`);
    } catch (localErr) {
      console.log('Local MongoDB service is offline. Bootstrapping in-memory MongoDB database...');
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      console.log(`In-memory database initialized at: ${uri}`);
      const conn = await mongoose.connect(uri);
      console.log(`MongoDB Connected (Memory): ${conn.connection.host}/${conn.connection.name}`);
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${(error as Error).message}`);
    process.exit(1);
  }
};
