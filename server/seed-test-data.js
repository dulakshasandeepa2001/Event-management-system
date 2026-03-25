// Seed test data into PendingStudent table
import mongoose from 'mongoose';
import PendingStudent from './models/PendingStudent.js';
import dotenv from 'dotenv';

dotenv.config();

const seedTestData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/event-management');
    console.log('✅ Connected to MongoDB');

    // Clear existing test records (be careful with this!)
    await PendingStudent.deleteMany({ u_regno: { $in: ['CS005', 'CS006', 'CS007', 'CS008'] } });
    console.log('🗑️  Cleared old test data');

    // Create test pending students (as if they were uploaded from Excel)
    

    const inserted = await PendingStudent.insertMany(testData);
    console.log(`\n✅ Inserted ${inserted.length} test records into PendingStudent:\n`);
    
    inserted.forEach(doc => {
      console.log(`  • ${doc.u_regno} | ${doc.u_email} | ${doc.u_name}`);
    });

    console.log('\n📋 Test Data Ready for Signup Tests:\n');
    console.log('CS005 - Already has User account (will fail at CHECK 4)');
    console.log('CS006 - Email mismatch (will fail at CHECK 2)');
    console.log('CS007 - Ready to signup (should succeed)\n');

    mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedTestData();
