import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ffims';

const cleanup = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collections = ['users', 'assetcategories', 'assetlocations', 'assets', 'maintenancelogs', 'auditlogs'];

    console.log('\n🗑️ Clearing collections...');
    for (const collectionName of collections) {
      try {
        await db.collection(collectionName).deleteMany({});
        console.log(`  ✓ ${collectionName} cleared`);
      } catch (err) {
        console.log(`  ℹ️ ${collectionName} (not found or already empty)`);
      }
    }

    console.log('\n✨ Database cleaned and ready for fresh seed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup error:', error.message);
    process.exit(1);
  }
};

cleanup();
