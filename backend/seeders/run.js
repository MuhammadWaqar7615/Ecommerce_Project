const dotenv = require('dotenv');
dotenv.config();

console.log('Loading environment variables...');
console.log('MONGODB_URI:', process.env.MONGODB_URI);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/User');
const Setting = require('../models/Setting');

// Import seeders
const seedCategories = require('./seedCategories');
const { hashPassword } = require('../utils/hashPassword');

const runSeeders = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create admin user
    let adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const hashedPassword = await hashPassword('hello@123');
      adminExists = await User.create({
        username: 'admin',
        email: 'admin@craftsdelights.com',
        password: hashedPassword,
        fullName: 'System Administrator',
        phone: '1234567890',
        role: 'admin',
        isActive: true,
        isVendorApproved: true,
        isEmailVerified: true,
      });
      console.log('✅ Admin user created');
      console.log('   Email: admin@craftsdelights.com');
      console.log('   Password: hello@123');
    } else {
      if (!adminExists.isEmailVerified) {
        adminExists.isEmailVerified = true;
      }
      if (!adminExists.provider) {
        adminExists.provider = 'local';
      }
      if (adminExists.isModified && adminExists.isModified()) {
        await adminExists.save();
        console.log('✅ Updated existing admin to verified local provider');
      }
      console.log('✅ Admin user already exists');
    }

    // Create default settings
    const settingsCount = await Setting.countDocuments();
    if (settingsCount === 0) {
      const settings = [
        { key: 'commission_percentage', value: 5, description: 'Platform commission percentage' },
        { key: 'shipping_base_fee', value: 150, description: 'Base delivery fee in PKR' },
        { key: 'shipping_per_km_rate', value: 10, description: 'Additional fee per kilometer' },
        { key: 'max_distance_for_delivery', value: 50, description: 'Maximum delivery distance in km' },
      ];

      for (const setting of settings) {
        await Setting.create(setting);
      }
      console.log('✅ Default settings created');
    } else {
      console.log('✅ Settings already exist');
    }

    // Seed categories
    await seedCategories();

    console.log('\n🎉 All seeders completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

runSeeders();