"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("./category.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const router = (0, express_1.Router)();
router.route('/')
    .get(category_controller_1.getCategories)
    .post(auth_middleware_1.protect, category_controller_1.createCategory);
router.get('/tree', category_controller_1.getCategoryTree);
router.get('/slug/:slug', category_controller_1.getCategoryBySlug);
router.route('/:id')
    .put(auth_middleware_1.protect, category_controller_1.updateCategory)
    .delete(auth_middleware_1.protect, category_controller_1.deleteCategory);
exports.default = router;
