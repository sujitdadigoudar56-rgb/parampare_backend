import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Product from '../modules/product/product.model';

// Load env from one level up (parampare_backend/.env)
dotenv.config({ path: path.join(__dirname, '../../.env') });

const attributesToMigrate = ['fabric', 'color', 'occasion', 'weave', 'border', 'pallu', 'blouse'];

async function migrate() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected successfully.');

    const db = mongoose.connection.db;
    if (!db) throw new Error('Database connection failed');
    const collection = db.collection('products');

    const products = await collection.find({}).toArray();
    console.log(`Found ${products.length} products to check via Native Driver.`);
    
    if (products.length > 0) {
      console.log('\n--- DEBUG: Raw MongoDB Document (First) ---');
      const first = products[0];
      attributesToMigrate.forEach(attr => {
        const val = first[attr];
        console.log(`${attr}: type=${typeof val}, isArray=${Array.isArray(val)}, value=`, val);
      });
      console.log('-------------------------------------------\n');
    }

    let updatedCount = 0;

    for (const product of products) {
      let updateDoc: any = {};
      let needsUpdate = false;

      attributesToMigrate.forEach(attr => {
        const val = product[attr];
        // If it's a string, we MUST convert it
        if (val && typeof val === 'string') {
          updateDoc[attr] = [val];
          needsUpdate = true;
        }
      });

      if (needsUpdate) {
        await collection.updateOne(
          { _id: product._id },
          { $set: updateDoc }
        );
        updatedCount++;
        console.log(`Updated product: ${product.name}`);
      }
    }

    console.log('--------------------------------------------------');
    console.log(`Migration complete!`);
    console.log(`Products updated: ${updatedCount}`);
    console.log('--------------------------------------------------');
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Migration failed:');
    console.error(error.message);
    process.exit(1);
  }
}

migrate();
