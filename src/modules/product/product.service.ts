import Product, { IProduct } from './product.model';

export class ProductService {
  // Create product
  async createProduct(data: Partial<IProduct>): Promise<IProduct> {
    const product = await Product.create(data);
    return product;
  }

  // Get all products (with advanced filters & pagination)
  async findAll(query: any): Promise<{ products: IProduct[]; count: number; totalPages: number; currentPage: number }> {
    const { category, minPrice, maxPrice, sort, page = 1, limit = 10, search } = query;

    // Build filter object
    const filter: any = {};
    if (category) {
      filter.category = category;
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
        filter.name = { $regex: search, $options: 'i' };
    }
    
    // Sort logic
    let sortOption: any = { createdAt: -1 }; // Default: Newest first
    if (sort) {
      if (sort === 'price_asc') sortOption = { price: 1 };
      else if (sort === 'price_desc') sortOption = { price: -1 };
      else if (sort === 'rating_desc') sortOption = { rating: -1 };
      else if (sort === 'newest') sortOption = { createdAt: -1 };
    }

    // Pagination
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 12; // Default 12 products per page
    const skip = (pageNum - 1) * limitNum;

    const count = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    return {
      products,
      count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum
    };
  }

  // Get single product
  async findById(id: string): Promise<IProduct | null> {
    return await Product.findById(id);
  }

  // Update product (Admin)
  async updateProduct(id: string, data: Partial<IProduct>): Promise<IProduct | null> {
    return await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  // Update Stock (Internal use mainly)
  async updateStock(id: string, quantityChange: number): Promise<void> {
    // quantityChange can be negative (decrease stock)
    const product = await Product.findById(id);
    if (!product) throw new Error('Product not found');
    
    const newStock = product.stockQuantity + quantityChange;
    if (newStock < 0) throw new Error(`Insufficient stock for product ${product.name}`);
    
    product.stockQuantity = newStock;
    product.inStock = newStock > 0;
    await product.save();
  }

  // Delete product
  async deleteProduct(id: string): Promise<IProduct | null> {
    return await Product.findByIdAndDelete(id);
  }

  // Get Categories
  async getCategories(): Promise<string[]> {
      return await Product.distinct('category');
  }
}

export const productService = new ProductService();
