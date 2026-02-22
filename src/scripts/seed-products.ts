import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../modules/product/product.model';

dotenv.config();

const products = [
  {
    name: "Ilkal Saree – Teni Pallu Red",
    description: "Authentic handloom Ilkal Saree from Karnataka featuring the traditional Teni Pallu in red. Perfect for festive occasions and weddings.",
    price: 2999,
    originalPrice: 4499,
    category: "Sarees",
    images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1587&auto=format&fit=crop"],
    fabric: "pure-cotton",
    color: "red",
    occasion: "festive",
    weave: "ilkal-traditional",
    border: "zari",
    pallu: "tope-teni",
    blouse: "running",
    careInstructions: ["Hand wash recommended", "Use mild detergent", "Dry in shade", "Iron on medium heat"],
    stockQuantity: 50,
    rating: 4.6,
    reviewCount: 128,
    badges: ["Best Seller", "GI Certified"],
    deliveryTimeDays: "5-7"
  },
  {
    name: "Traditional Kasuti Work Saree",
    description: "Elegant Ilkal saree with intricate Kasuti embroidery work. A masterpiece of traditional craftsmanship.",
    price: 3499,
    originalPrice: 5999,
    category: "Sarees",
    images: ["https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=1587&auto=format&fit=crop"],
    fabric: "cotton-silk",
    color: "green",
    occasion: "wedding",
    weave: "handloom",
    border: "temple",
    pallu: "zari",
    blouse: "contrast",
    careInstructions: ["Dry clean recommended", "Store in muslin cloth", "Avoid direct sunlight"],
    stockQuantity: 30,
    rating: 4.8,
    reviewCount: 89,
    badges: ["GI Certified"],
    deliveryTimeDays: "5-7"
  },
  {
    name: "Handwoven Silk Ilkal Saree",
    description: "Pure silk Ilkal saree handwoven by master weavers. Features a rich texture and vibrant colors.",
    price: 4299,
    category: "Sarees",
    images: ["https://images.unsplash.com/photo-1625910513397-a400cc099049?q=80&w=1587&auto=format&fit=crop"],
    fabric: "pure-silk",
    color: "maroon",
    occasion: "wedding",
    weave: "zari-border",
    border: "broad",
    pallu: "heavy",
    blouse: "attached",
    careInstructions: ["Dry clean only", "Store with silica gel packets", "Avoid perfumes"],
    stockQuantity: 20,
    rating: 4.5,
    reviewCount: 56,
    badges: ["New Arrival"],
    deliveryTimeDays: "5-7"
  },
  {
    name: "Cotton Ilkal Saree – Blue",
    description: "Comfortable and breathable cotton Ilkal saree in a beautiful royal blue shade. Ideal for daily wear.",
    price: 1999,
    originalPrice: 2999,
    category: "Sarees",
    images: ["https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1587&auto=format&fit=crop"],
    fabric: "pure-cotton",
    color: "blue",
    occasion: "daily",
    weave: "ilkal-traditional",
    border: "self",
    pallu: "simple",
    blouse: "running",
    careInstructions: ["Machine wash gentle", "Mild detergent", "Tumble dry low"],
    stockQuantity: 60,
    rating: 4.4,
    reviewCount: 234,
    badges: [],
    deliveryTimeDays: "3-5"
  },
  {
    name: "Festive Maroon Ilkal Saree",
    description: "Stunning maroon Ilkal saree with traditional motifs. Perfect for grand festivals.",
    price: 3799,
    originalPrice: 5499,
    category: "Sarees",
    images: ["https://images.unsplash.com/photo-1610030469668-935109680f3f?q=80&w=1587&auto=format&fit=crop"],
    fabric: "silk-blend",
    color: "maroon",
    occasion: "festive",
    weave: "tope-teni",
    border: "contrast",
    pallu: "tope-teni",
    blouse: "contrast",
    careInstructions: ["Dry clean recommended"],
    stockQuantity: 40,
    rating: 4.7,
    reviewCount: 167,
    badges: ["Best Seller"],
    deliveryTimeDays: "5-7"
  },
  {
    name: "Pure Silk Teni Border Saree",
    description: "Luxury pure silk saree with the iconic Teni border. A timeless classic.",
    price: 5499,
    category: "Sarees",
    images: ["https://images.unsplash.com/photo-1560502207-adea728cf12d?q=80&w=1521&auto=format&fit=crop"],
    fabric: "pure-silk",
    color: "yellow",
    occasion: "wedding",
    weave: "zari-border",
    border: "zari",
    pallu: "heavy",
    blouse: "attached",
    careInstructions: ["Dry clean only"],
    stockQuantity: 15,
    rating: 4.9,
    reviewCount: 45,
    badges: ["GI Certified"],
    deliveryTimeDays: "5-7"
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    await Product.deleteMany({});
    console.log('Deleted existing products');

    await Product.insertMany(products);
    console.log('Seeded products successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
