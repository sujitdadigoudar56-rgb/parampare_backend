"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.protect); // All routes private
router.get('/profile', user_controller_1.getProfile);
router.patch('/profile', user_controller_1.updateProfile);
router.route('/addresses')
    .get(user_controller_1.getAddresses)
    .post(user_controller_1.addAddress);
router.route('/addresses/:id')
    .put(user_controller_1.updateAddress)
    .delete(user_controller_1.deleteAddress);
exports.default = router;
