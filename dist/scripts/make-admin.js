"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const user_model_1 = __importDefault(require("../modules/user/user.model"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
const makeAdmin = async () => {
    const identifier = process.argv[2];
    if (!identifier) {
        console.log('Usage: npx ts-node src/scripts/make-admin.ts <email_or_mobile>');
        process.exit(1);
    }
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        const user = await user_model_1.default.findOne({
            $or: [{ email: identifier }, { mobile: identifier }]
        });
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }
        user.role = 'ADMIN';
        await user.save();
        console.log(`Success! ${user.fullName} is now an ADMIN.`);
        process.exit(0);
    }
    catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};
makeAdmin();
