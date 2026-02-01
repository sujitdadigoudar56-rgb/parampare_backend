"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../user/user.model"));
class AuthService {
    // Generate JWT Token
    generateToken(id) {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined in the environment variables');
        }
        return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE || '30d',
        });
    }
    // Register user (Email/Password or Mobile/OTP implicitly handled later, but this is explicit register)
    async register(data) {
        const { name, email, password, phoneNumber } = data; // map name->fullName, phoneNumber->mobile
        // Check availability
        if (email) {
            const existingUser = await user_model_1.default.findOne({ email });
            if (existingUser)
                throw new Error('User already exists with this email');
        }
        if (phoneNumber) {
            const existingUser = await user_model_1.default.findOne({ mobile: phoneNumber });
            if (existingUser)
                throw new Error('User already exists with this phone number');
        }
        const user = await user_model_1.default.create({
            fullName: name,
            email,
            password,
            mobile: phoneNumber
        });
        const token = this.generateToken(user._id.toString());
        // Return without password
        const userObj = user.toObject();
        const { password: _, ...userClean } = userObj;
        return { user: userClean, token };
    }
    // Login user (Email/Password)
    async login(data) {
        const { email, password } = data;
        const user = await user_model_1.default.findOne({ email }).select('+password');
        if (!user)
            throw new Error('Invalid credentials');
        const isMatch = await user.comparePassword(password);
        if (!isMatch)
            throw new Error('Invalid credentials');
        const token = this.generateToken(user._id.toString());
        const userObj = user.toObject();
        const { password: _, ...userClean } = userObj;
        return { user: userClean, token };
    }
    // Get current user by ID
    async getMe(userId) {
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            // Logic for not found?
            throw new Error('User not found');
        }
        return user;
    }
    // Generate OTP
    async generateOtp(identifier) {
        // 1. Check if identifier is mobile or email
        const isEmail = identifier.includes('@');
        const query = isEmail ? { email: identifier } : { mobile: identifier };
        // 2. Find user
        const user = await user_model_1.default.findOne(query);
        // 3. Generate OTP
        const otp = '123456'; // Default hardcoded for dev/demo
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        // 4. If user exists, update their OTP. 
        // If user does not exist, we still generate OTP but where do we store it?
        // For registration flow, usually we need to store it in a temporary store (Redis) 
        // or create a "ghost" user. 
        // However, the doc says "If isLogin is true, checks if user exists. If not, throws error."
        // "If isLogin is false (Registration), creates a temporary registration session..."
        // Since we don't have Redis setup mentioned, we might need a TemporaryAuth store or 
        // just allow "sendOtp" to succeed for known users, and for unknown users we might return success 
        // but effectively we need to verify it later.
        // Simpler approach for this specific task without Redis:
        // If user exists, save to user.
        // If user doesn't exist, we can't save to user collection unless we create a temp record.
        // Let's assume for this MVP we create the user record on "verifyOtp" for registration,
        // so where do we store the OTP for a non-existent user?
        // We can use a separate OtpStore collection or just assume the client sends the correct OTP (123456)
        // AND we trust the verify step to do the creation.
        // OR we create a user with "isVerified: false" or distinct "role: guest" if we really want to store OTP in DB.
        // Let's go with: Store in DB even for new users? No, `User` requires fullName which we don't have yet.
        // Let's use a "OTP" collection.
        // For simplicity given the constraints: 
        // If user found, update user. 
        // If user NOT found, we can't store it in User table.
        // I'll implementing a static in-memory map or simple hack for now if Redis isn't an option?
        // No, let's make a `OtpModel` if needed.
        // BUT, commonly, we can upsert a "PreUser" or just `Otp` collection.
        // Let's create an `Otp` schema inside this file or module for cleanliness?
        // Or just use the User model but make fields optional? The User model has required fullName.
        //
        // Let's follow the standard: Create an OTP collection.
        // But since I cannot easily add new files without checking, I will add an `OTP` model to this file for now or `otp.model.ts`.
        // Wait, the doc is just "Service: AuthService... generateOtp... Caches it...".
        // I will mock the persistence for non-existing users or use a global Mock Map since this is a demo?
        // OR best practice: Create `Otp` model.
        // Let's use `Otp` collection. I'll define it here for now or assuming it exists. 
        // Actually, I can just use a simple internal Mongoose model `Otp`.
        if (user) {
            user.otp = otp;
            user.otpExpires = otpExpires;
            await user.save();
        }
        else {
            // For new users, we need to store OTP somewhere.
            // Let's assume we maintain a collection "Otps"
            await OtpModel.create({ identifier, otp, expires: otpExpires });
        }
        console.log(`OTP for ${identifier}: ${otp}`);
        return 'OTP sent successfully';
    }
    // Verify OTP
    async verifyOtp(identifier, otp, isLogin, userData) {
        const isEmail = identifier.includes('@');
        const query = isEmail ? { email: identifier } : { mobile: identifier };
        let user = await user_model_1.default.findOne(query).select('+otp +otpExpires');
        if (isLogin) {
            if (!user) {
                throw new Error('User not found');
            }
            // Verify OTP from user record
            if (user.otp !== otp)
                throw new Error('Invalid OTP');
            if (user.otpExpires && user.otpExpires < new Date())
                throw new Error('OTP expired');
            // Clear OTP
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();
        }
        else {
            // Registration
            if (user) {
                // If user exists but trying to register, maybe just log them in?
                // Or throw error "User already exists".
                // Doc doesn't specify, but implies "If not exists... create".
                // Let's verify OTP then return token.
                if (user.otp !== otp)
                    throw new Error('Invalid OTP');
            }
            else {
                // Verify OTP from OtpStore
                const otpRecord = await OtpModel.findOne({ identifier, otp });
                if (!otpRecord)
                    throw new Error('Invalid OTP or expired');
                if (otpRecord.expires < new Date())
                    throw new Error('OTP expired');
                // Create User
                if (!userData || !userData.fullName) {
                    throw new Error('User data (fullName) is required for registration');
                }
                user = await user_model_1.default.create({
                    mobile: isEmail ? undefined : identifier, // Assuming identifier IS mobile if not email
                    email: isEmail ? identifier : userData.email,
                    fullName: userData.fullName,
                    role: 'USER',
                });
                // Clean up OTP
                await OtpModel.deleteOne({ _id: otpRecord._id });
            }
        }
        const token = this.generateToken(user._id.toString());
        const userObj = user.toObject();
        const { otp: _otp, otpExpires: _exp, ...userClean } = userObj;
        return { user: userClean, token };
    }
}
exports.AuthService = AuthService;
// Simple OTP Model for registration flow logic
const mongoose_1 = require("mongoose");
const otpSchema = new mongoose_1.Schema({
    identifier: { type: String, required: true },
    otp: { type: String, required: true },
    expires: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now, expires: 600 } // Auto-delete after 10 mins
});
const OtpModel = (0, mongoose_1.model)('Otp', otpSchema);
exports.authService = new AuthService();
