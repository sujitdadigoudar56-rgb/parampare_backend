"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("./product.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
// import { admin } from '../../core/middleware/auth.middleware'; // TODO: Implement admin middleware
const router = (0, express_1.Router)();
router.route('/')
    .get(product_controller_1.getProducts)
    .post(auth_middleware_1.protect, product_controller_1.createProduct); // Add admin check later
router.route('/:id')
    .get(product_controller_1.getProduct)
    .put(auth_middleware_1.protect, product_controller_1.updateProduct) // Add admin check later
    .delete(auth_middleware_1.protect, product_controller_1.deleteProduct); // Add admin check later
exports.default = router;
