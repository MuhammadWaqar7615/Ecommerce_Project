const User = require('../models/User');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  const adminExists = await User.findOne({ role: 'admin' });
  
  try {
  if (!adminExists) {
      const hashedPassword = await bcrypt.hash('hello@123', 10);
      await User.create({
        username: 'admin',
        email: 'admin@craftsdelights.com',
        password: hashedPassword,
        fullName: 'System Administrator',
      phone: '1234567890',
      role: 'admin',
      isActive: true,
    });
    console.log('Admin user created');
  } else {
    console.log('Admin user already exists');
  }
} catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};

module.exports = seedAdmin;