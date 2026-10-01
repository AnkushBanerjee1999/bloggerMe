import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User.js';
import { config } from '../config/index.js';

dotenv.config();

async function seedAdmin() {
  const adminName = process.env.ADMIN_NAME;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminName || !adminEmail || !adminPassword) {
    console.error('[seed:admin] Error: ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD environment variables are all required.');
    process.exit(1);
  }

  const normalizedEmail = adminEmail.trim().toLowerCase();

  try {
    await mongoose.connect(config.mongodbUri);

    const existingUser = await UserModel.findOne({ email: normalizedEmail });

    if (existingUser) {
      if (existingUser.role === 'admin') {
        console.log(`[seed:admin] Administrator account for '${normalizedEmail}' already exists with role 'admin'.`);
      } else {
        // Upgrade existing user to admin if appropriate
        existingUser.role = 'admin';
        await existingUser.save();
        console.log(`[seed:admin] User '${normalizedEmail}' existed and has been updated to role 'admin'.`);
      }
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      await UserModel.create({
        name: adminName.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: 'admin',
      });

      console.log(`[seed:admin] Administrator account created successfully for '${normalizedEmail}'.`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[seed:admin] Seeding failed:', message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seedAdmin();
