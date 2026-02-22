import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../modules/user/user.model';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const makeAdmin = async () => {
  const identifier = process.argv[2];

  if (!identifier) {
    console.log('Usage: npx ts-node src/scripts/make-admin.ts <email_or_mobile>');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    const user = await User.findOne({
      $or: [{ email: identifier }, { mobile: identifier }]
    });

    if (!user) {
      console.log('User not found');
      process.exit(1);
    }

    user.role = 'ADMIN';
    await user.save();

    console.log(`Success! ${user.fullName} is now an ADMIN.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

makeAdmin();
