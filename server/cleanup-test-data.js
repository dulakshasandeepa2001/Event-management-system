// Clean up test data from User table
import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const cleanupTestData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/event-management');
    console.log('✅ Connected to MongoDB');

    // Delete test users that were created during testing
    const deleted = await User.deleteMany({ u_regno: { $in: ['CS007', 'CS008'] } });
    console.log(`🗑️  Deleted ${deleted.deletedCount} test users from User table`);

    // Show all remaining test users
    const remaining = await User.find({ u_regno: { $in: ['CS005', 'CS006', 'CS007', 'CS008'] } });
    console.log(`\n📋 Remaining test users in User table:`);
    remaining.forEach(user => {
      console.log(`  • ${user.u_regno} | ${user.u_email} | ${user.u_name}`);
    });

    mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

cleanupTestData();
