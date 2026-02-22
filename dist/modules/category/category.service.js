"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryService = exports.CategoryService = void 0;
const category_model_1 = __importDefault(require("./category.model"));
class CategoryService {
    async createCategory(data) {
        // Generate slug from name if not provided
        if (!data.slug && data.name) {
            data.slug = data.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        }
        // Determine level
        if (data.parent) {
            const parent = await category_model_1.default.findById(data.parent);
            if (parent) {
                data.level = parent.level + 1;
            }
        }
        else {
            data.level = 0;
        }
        return await category_model_1.default.create(data);
    }
    async getAllCategories() {
        return await category_model_1.default.find().populate('parent');
    }
    async getCategoryTree() {
        const categories = await category_model_1.default.find().lean();
        const buildTree = (parentId = null) => {
            return categories
                .filter(cat => String(cat.parent) === String(parentId) || (parentId === null && !cat.parent))
                .map(cat => ({
                ...cat,
                children: buildTree(cat._id)
            }));
        };
        return buildTree();
    }
    async findById(id) {
        return await category_model_1.default.findById(id).populate('parent');
    }
    async findBySlug(slug) {
        return await category_model_1.default.findOne({ slug }).populate('parent');
    }
    async updateCategory(id, data) {
        if (data.name && !data.slug) {
            data.slug = data.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        }
        return await category_model_1.default.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }
    async deleteCategory(id) {
        return await category_model_1.default.findByIdAndDelete(id);
    }
}
exports.CategoryService = CategoryService;
exports.categoryService = new CategoryService();
