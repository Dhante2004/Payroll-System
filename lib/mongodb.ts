import { MongoClient } from 'mongodb';

const options = {};

type MongoGlobal = typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

export const mongoDatabaseName = process.env.MONGODB_DB_NAME || 'mit_payroll';

export function getMongoClientPromise() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Missing MONGODB_URI environment variable.');

  const globalWithMongo = globalThis as MongoGlobal;
  const clientPromise = globalWithMongo._mongoClientPromise ?? new MongoClient(uri, options).connect();
  if (process.env.NODE_ENV !== 'production') globalWithMongo._mongoClientPromise = clientPromise;
  return clientPromise;
}
