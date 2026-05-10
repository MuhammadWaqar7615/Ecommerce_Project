# Database Seeder Guide

## Overview
The seeder system provides a modular way to initialize and populate the database with default data.

## Structure

### Main Seeder Entry Point
- **File**: `backend/seeders/run.js`
- **Purpose**: Orchestrates all individual seeders
- **Command**: `npm run seed`

### Individual Seeders

#### 1. Category Seeder
- **File**: `backend/seeders/seedCategories.js`
- **Purpose**: Seeds all product categories
- **Categories**:
  - Traditional Snacks
  - Sweets & Desserts
  - Handmade Sandals
  - Home Decor
  - Textiles & Fabrics
  - Wooden Crafts
  - Pottery & Ceramics
  - Jewelry
  - Pickles & Preserves
  - Gift Sets

#### 2. Admin User Seeder
- **Location**: In `run.js`
- **Credentials**:
  - Email: `admin@craftsdelights.com`
  - Password: `admin123`
- **Auto-created** if not exists

#### 3. Settings Seeder
- **Location**: In `run.js`
- **Includes**:
  - Commission percentage: 5%
  - Shipping base fee: 150 PKR
  - Shipping per km rate: 10 PKR
  - Max delivery distance: 50 km

## How to Add New Seeders

### Step 1: Create a Seeder File
Create a new file in `backend/seeders/` (e.g., `seedProducts.js`):

```javascript
const Model = require('../models/ModelName');

const SEED_DATA = [
  { field1: 'value1', field2: 'value2' },
  // ... more data
];

const seedModelName = async () => {
  try {
    console.log('🌱 Starting seeding...');
    
    for (const item of SEED_DATA) {
      const existing = await Model.findOne({ uniqueField: item.uniqueField });
      if (!existing) {
        await Model.create(item);
        console.log(`✅ Item created: ${item.name}`);
      } else {
        console.log(`⏭️  Item already exists: ${item.name}`);
      }
    }
    
    const total = await Model.countDocuments();
    console.log(`\n📊 Total items in database: ${total}`);
  } catch (error) {
    console.error('❌ Error seeding:', error);
    throw error;
  }
};

module.exports = seedModelName;
```

### Step 2: Import in `run.js`
Add to the imports section:
```javascript
const seedModelName = require('./seedModelName');
```

### Step 3: Call in `runSeeders` Function
Add after other seeders:
```javascript
// Seed model name
await seedModelName();
```

### Step 4: Run the Seeder
```bash
npm run seed
```

## Running Seeders

### Run All Seeders
```bash
cd backend
npm run seed
```

### Features
- ✅ Skips duplicates (checks if data already exists)
- ✅ Provides clear console feedback
- ✅ Counts total records after seeding
- ✅ Handles errors gracefully
- ✅ Auto-connects to MongoDB
- ✅ Auto-disconnects after completion

## Database Connection
The seeder automatically:
1. Loads environment variables from `.env`
2. Connects to MongoDB using `MONGODB_URI`
3. Runs all seeders in sequence
4. Disconnects after completion

## Notes
- Seeders are idempotent (safe to run multiple times)
- Existing data is never overwritten
- Console output shows what was created vs. what already existed
- All seeders must be async functions
- Export the seeder function using `module.exports`
