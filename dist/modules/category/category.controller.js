"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategoryBySlug = exports.getCategoryTree = exports.getCategories = exports.createCategory = void 0;
const category_service_1 = require("./category.service");
const http_constants_1 = require("../../shared/constants/http.constants");
const createCategory = async (req, res, next) => {
    try {
        const category = await category_service_1.categoryService.createCategory(req.body);
        res.status(http_constants_1.HTTP_STATUS.CREATED).json({
            success: true,
            data: category,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createCategory = createCategory;
const getCategories = async (req, res, next) => {
    try {
        const categories = await category_service_1.categoryService.getAllCategories();
        res.status(http_constants_1.HTTP_STATUS.OK).json({
            success: true,
            data: categories,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCategories = getCategories;
const getCategoryTree = async (req, res, next) => {
    try {
        const tree = await category_service_1.categoryService.getCategoryTree();
        res.status(http_constants_1.HTTP_STATUS.OK).json({
            success: true,
            data: tree,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCategoryTree = getCategoryTree;
const getCategoryBySlug = async (req, res, next) => {
    try {
        const category = await category_service_1.categoryService.findBySlug(req.params.slug);
        if (!category) {
            return res.status(http_constants_1.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'Category not found',
            });
        }
        res.status(http_constants_1.HTTP_STATUS.OK).json({
            success: true,
            data: category,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCategoryBySlug = getCategoryBySlug;
const updateCategory = async (req, res, next) => {
    try {
        const category = await category_service_1.categoryService.updateCategory(req.params.id, req.body);
        if (!category) {
            return res.status(http_constants_1.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'Category not found',
            });
        }
        res.status(http_constants_1.HTTP_STATUS.OK).json({
            success: true,
            data: category,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res, next) => {
    try {
        const category = await category_service_1.categoryService.deleteCategory(req.params.id);
        if (!category) {
            return res.status(http_constants_1.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'Category not found',
            });
        }
        res.status(http_constants_1.HTTP_STATUS.OK).json({
            success: true,
            data: {},
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCategory = deleteCategory;
