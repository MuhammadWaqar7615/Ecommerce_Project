const User = require('../models/User');

const ADMIN_SEED = {
  username: 'admin',
  email: 'admin@craftsdelights.com',
  password: 'hello@123',
  fullName: 'System Administrator',
  phone: '1234567890',
  role: 'admin',
  isActive: true,
  isVendorApproved: true,
  isEmailVerified: true,
  provider: 'local',
};

const seedAdmin = async () => {
  try {
    let adminUser = await User.findOne({ role: 'admin' });

    if (!adminUser) {
      await User.create(ADMIN_SEED);
      console.log('Admin user created');
      return;
    }

    const isPasswordMatch = await adminUser.comparePassword(ADMIN_SEED.password).catch(() => false);

    adminUser.username = ADMIN_SEED.username;
    adminUser.email = ADMIN_SEED.email;
    adminUser.fullName = ADMIN_SEED.fullName;
    adminUser.phone = ADMIN_SEED.phone;
    adminUser.role = ADMIN_SEED.role;
    adminUser.isActive = ADMIN_SEED.isActive;
    adminUser.isVendorApproved = ADMIN_SEED.isVendorApproved;
    adminUser.isEmailVerified = ADMIN_SEED.isEmailVerified;
    adminUser.provider = ADMIN_SEED.provider;

    // Only set plain text when changed; User model pre-save hook hashes it.
    if (!isPasswordMatch) {
      adminUser.password = ADMIN_SEED.password;
    }

    await adminUser.save();
    console.log('Admin user synced from seed');
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};

module.exports = seedAdmin;