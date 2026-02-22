"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productService = exports.ProductService = void 0;
const product_model_1 = __importDefault(require("./product.model"));
class ProductService {
    // Create product
    async createProduct(data) {
        const product = await product_model_1.default.create(data);
        return product;
    }
    // Get all products (with advanced filters & pagination)
    async findAll(query) {
        const { category, subcategory, minPrice, maxPrice, sort, page = 1, limit = 10, search, fabric, occasion, color, weave, border, pallu } = query;
        // Build filter object
        const filter = {};
        if (category && category !== 'All Sarees') {
            filter.category = category;
        }
        if (subcategory) {
            filter.subcategory = subcategory;
        }
        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.price = {};
            if (minPrice !== undefined)
                filter.price.$gte = Number(minPrice);
            if (maxPrice !== undefined)
                filter.price.$lte = Number(maxPrice);
        }
        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }
        // Add additional filters
        if (fabric)
            filter.fabric = fabric;
        if (occasion)
            filter.occasion = occasion;
        if (color)
            filter.color = color;
        if (weave)
            filter.weave = weave;
        if (border)
            filter.border = border;
        if (pallu)
            filter.pallu = pallu;
        // Sort logic
        let sortOption = { createdAt: -1 }; // Default: Newest first
        if (sort) {
            if (sort === 'price_asc')
                sortOption = { price: 1 };
            else if (sort === 'price_desc')
                sortOption = { price: -1 };
            else if (sort === 'rating_desc')
                sortOption = { rating: -1 };
            else if (sort === 'newest')
                sortOption = { createdAt: -1 };
        }
        // Pagination
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 12; // Default 12 products per page
        const skip = (pageNum - 1) * limitNum;
        const count = await product_model_1.default.countDocuments(filter);
        const products = await product_model_1.default.find(filter)
            .populate('category subcategory')
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
    async findById(id) {
        return await product_model_1.default.findById(id);
    }
    // Update product (Admin)
    async updateProduct(id, data) {
        return await product_model_1.default.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
    }
    // Update Stock (Internal use mainly)
    async updateStock(id, quantityChange) {
        // quantityChange can be negative (decrease stock)
        const product = await product_model_1.default.findById(id);
        if (!product)
            throw new Error('Product not found');
        const newStock = product.stockQuantity + quantityChange;
        if (newStock < 0)
            throw new Error(`Insufficient stock for product ${product.name}`);
        product.stockQuantity = newStock;
        product.inStock = newStock > 0;
        await product.save();
    }
    // Delete product
    async deleteProduct(id) {
        return await product_model_1.default.findByIdAndDelete(id);
    }
}
exports.ProductService = ProductService;
exports.productService = new ProductService();
