import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Category from '../modules/category/category.model';
import Product from '../modules/product/product.model';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const categories = [
  {
    name: 'Sarees',
    slug: 'sarees',
    subcategories: [
      { name: 'Tope Teni Ilkal Saree', slug: 'tope-teni-ilkal' },
      { name: 'Zari Pallu Ilkal Saree', slug: 'zari-pallu-ilkal' },
      { name: 'Simple Pallu Ilkal Saree', slug: 'simple-pallu-ilkal' },
      { name: 'Temple Border Ilkal Saree', slug: 'temple-border-ilkal' },
      { name: 'Cotton Ilkal Saree', slug: 'cotton-ilkal' },
      { name: 'Silk Ilkal Saree', slug: 'silk-ilkal' },
    ]
  },
  {
    name: 'Dress Materials',
    slug: 'dress-materials',
    subcategories: [
      { name: 'Cotton Dress Materials', slug: 'cotton-dress-materials' },
      { name: 'Silk Dress Materials', slug: 'silk-dress-materials' },
    ]
  },
  {
    name: 'Occasions',
    slug: 'occasions',
    subcategories: [
      { name: 'Traditional Events', slug: 'traditional-events' },
      { name: 'Wedding Wear', slug: 'wedding-wear' },
      { name: 'Festive Wear', slug: 'festive-wear' },
    ]
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    for (const cat of categories) {
      const parent = await Category.create({
        name: cat.name,
        slug: cat.slug,
        level: 0
      });
      console.log(`Created category: ${parent.name}`);

      for (const sub of cat.subcategories) {
        await Category.create({
          name: sub.name,
          slug: sub.slug,
          parent: parent._id,
          level: 1
        });
        console.log(`  Created subcategory: ${sub.name}`);
      }
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

seedData();
