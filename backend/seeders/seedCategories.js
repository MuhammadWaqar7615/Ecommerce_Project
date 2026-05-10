const Category = require('../models/Category');

const CATEGORIES = [
  'Traditional Snacks',
  'Sweets & Desserts',
  'Handmade Sandals',
  'Home Decor',
  'Textiles & Fabrics',
  'Wooden Crafts',
  'Pottery & Ceramics',
  'Jewelry',
  'Pickles & Preserves',
  'Gift Sets',
];

const seedCategories = async () => {
  try {
    console.log('🌱 Starting category seeding...');

    for (const categoryName of CATEGORIES) {
      const existingCategory = await Category.findOne({ name: categoryName });

      if (!existingCategory) {
        const category = await Category.create({ name: categoryName });
        console.log(`✅ Category created: ${categoryName}`);
      } else {
        console.log(`⏭️  Category already exists: ${categoryName}`);
      }
    }

    const totalCategories = await Category.countDocuments();
    console.log(`\n📊 Total categories in database: ${totalCategories}`);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
};

module.exports = seedCategories;