import mongoose from 'mongoose';

const MAX_RETRIES = 3;
const RETRY_INTERVAL = 1000; // Start with 1 second

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const dbName = process.env.MONGODB_DB_NAME || 'syncride-dev';

  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      await mongoose.connect(uri, {
        dbName,
      });
      console.log(`✅ MongoDB connected to ${dbName}`);
      return;
    } catch (error) {
      retries++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ MongoDB connection attempt ${retries}/${MAX_RETRIES} failed:`, errorMessage);
      
      if (retries >= MAX_RETRIES) {
        console.error('❌ Max retries reached. Exiting...');
        process.exit(1);
      }
      
      const delay = RETRY_INTERVAL * Math.pow(2, retries - 1);
      console.log(`⏳ Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Connection event handlers
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ Mongoose disconnected from MongoDB');
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n📴 ${signal} received. Closing MongoDB connection...`);
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
