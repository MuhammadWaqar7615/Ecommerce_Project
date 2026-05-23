const dotenv = require('dotenv');
dotenv.config();

console.log('Loading environment variables...');
console.log('MONGODB_URI:', process.env.MONGODB_URI);

const mongoose = require('mongoose');

// Import models
const User = require('../models/User');
const Setting = require('../models/Setting');

// Import seeders
const seedAdmin = require('./seedAdmin');
const seedCategories = require('./seedCategories');

const runSeeders = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Seed admin user from single source of truth in seedAdmin.js
    await seedAdmin();

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