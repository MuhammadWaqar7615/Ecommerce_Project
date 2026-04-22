const Setting = require('../models/Setting');

const seedCategories = async () => {
  const categories = ['Food', 'Crafts', 'Sandals', 'Home Decor', 'Other'];
  
  for (const category of categories) {
    await Setting.findOneAndUpdate(
      { key: `category_${category}` },
      { key: `category_${category}`, value: category, description: `Product category: ${category}` },
      { upsert: true }
    );
  }
  
  console.log('Categories seeded');
};

module.exports = seedCategories;