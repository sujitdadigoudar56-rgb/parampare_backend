import Category, { ICategory } from './category.model';

export class CategoryService {
  async createCategory(data: Partial<ICategory>): Promise<ICategory> {
    // Generate slug from name if not provided
    if (!data.slug && data.name) {
      data.slug = data.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }
    
    // Determine level
    if (data.parent) {
      const parent = await Category.findById(data.parent);
      if (parent) {
        data.level = parent.level + 1;
      }
    } else {
      data.level = 0;
    }
    
    return await Category.create(data);
  }

  async getAllCategories(): Promise<ICategory[]> {
    return await Category.find().populate('parent');
  }

  async getCategoryTree(): Promise<any[]> {
    const categories = await Category.find().lean();
    
    const buildTree = (parentId: any = null): any[] => {
      return categories
        .filter(cat => String(cat.parent) === String(parentId) || (parentId === null && !cat.parent))
        .map(cat => ({
          ...cat,
          children: buildTree(cat._id)
        }));
    };
    
    return buildTree();
  }

  async findById(id: string): Promise<ICategory | null> {
    return await Category.findById(id).populate('parent');
  }

  async findBySlug(slug: string): Promise<ICategory | null> {
    return await Category.findOne({ slug }).populate('parent');
  }

  async updateCategory(id: string, data: Partial<ICategory>): Promise<ICategory | null> {
    if (data.name && !data.slug) {
        data.slug = data.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }
    return await Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteCategory(id: string): Promise<ICategory | null> {
    return await Category.findByIdAndDelete(id);
  }
}

export const categoryService = new CategoryService();
