"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const address_model_1 = __importDefault(require("./address.model"));
class UserService {
    // Address Methods
    async getAddresses(userId) {
        return await address_model_1.default.find({ userId });
    }
    async addAddress(userId, data) {
        // If set as default, unset others 
        if (data.isDefault) {
            await address_model_1.default.updateMany({ userId }, { isDefault: false });
        }
        return await address_model_1.default.create({ ...data, userId });
    }
    async updateAddress(userId, addressId, data) {
        if (data.isDefault) {
            await address_model_1.default.updateMany({ userId }, { isDefault: false });
        }
        return await address_model_1.default.findOneAndUpdate({ _id: addressId, userId }, data, { new: true });
    }
    async deleteAddress(userId, addressId) {
        return await address_model_1.default.findOneAndDelete({ _id: addressId, userId });
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
