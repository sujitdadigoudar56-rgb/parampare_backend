"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("./product.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const router = (0, express_1.Router)();
router.route('/')
    .get(product_controller_1.getProducts)
    .post(auth_middleware_1.protect, auth_middleware_1.admin, product_controller_1.createProduct);
router.route('/:id')
    .get(product_controller_1.getProduct)
    .put(auth_middleware_1.protect, auth_middleware_1.admin, product_controller_1.updateProduct)
    .delete(auth_middleware_1.protect, auth_middleware_1.admin, product_controller_1.deleteProduct);
exports.default = router;
