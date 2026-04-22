const Setting = require('../models/Setting');

const seedSettings = async () => {
  const settings = [
    { key: 'commission_percentage', value: 5, description: 'Platform commission percentage per order' },
    { key: 'shipping_base_fee', value: 150, description: 'Base delivery fee in PKR' },
    { key: 'shipping_per_km_rate', value: 10, description: 'Additional fee per kilometer in PKR' },
    { key: 'max_distance_for_delivery', value: 50, description: 'Maximum delivery distance in kilometers' },
  ];
  
  for (const setting of settings) {
    await Setting.findOneAndUpdate(
      { key: setting.key },
      setting,
      { upsert: true }
    );
  }
  
  console.log('Settings seeded');
};

module.exports = seedSettings;