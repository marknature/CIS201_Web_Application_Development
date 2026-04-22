import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

dotenv.config();

async function createManagers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const managers = [
      { firstName: 'John', lastName: 'Fleet', email: 'fleet@ffims.com', password: 'Fleet@123456', role: 'asset-manager' },
      { firstName: 'Jane', lastName: 'Facilities', email: 'facilities@ffims.com', password: 'Facilities@123456', role: 'asset-manager' },
      { firstName: 'Mike', lastName: 'Finance', email: 'finance@ffims.com', password: 'Finance@123456', role: 'asset-manager' },
      { firstName: 'Tom', lastName: 'Tech', email: 'tech@ffims.com', password: 'Tech@123456', role: 'technician' }
    ];

    for (const managerData of managers) {
      const exists = await User.findOne({ email: managerData.email });
      if (!exists) {
        const hashedPassword = await bcrypt.hash(managerData.password, Number(process.env.BCRYPT_ROUNDS || 10));
        await User.create({ ...managerData, password: hashedPassword });
        console.log(`? Created: ${managerData.email}`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('? Error:', error.message);
    process.exit(1);
  }
}

createManagers();
