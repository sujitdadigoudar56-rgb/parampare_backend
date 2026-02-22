import jwt from 'jsonwebtoken';
import User, { IUser } from '../user/user.model';

export class AuthService {
  // Generate JWT Token
  private generateToken(id: string): string {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in the environment variables');
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    } as jwt.SignOptions);
  }

  // Register user (Email/Password)
  async register(data: any): Promise<{ user: any; token: string }> {
    const { fullName, email, password, mobile, countryCode } = data;

    // Check availability
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) throw new Error('User already exists with this email');
    }
    if (mobile) {
      const existingUser = await User.findOne({ mobile });
      if (existingUser) throw new Error('User already exists with this mobile number');
    }

    const user = await User.create({
      fullName,
      email,
      password,
      mobile,
      countryCode
    });

    const token = this.generateToken(user._id.toString());
    
    // Return without password
    const userObj = user.toObject();
    const { password: _, ...userClean } = userObj as any;
    return { user: userClean, token };
  }

  // Login user (Email/Password)
  async login(data: any): Promise<{ user: any; token: string }> {
    const { email, password } = data;

    // Static Admin Bypass for Development
    if (email === 'admin@admin.com' && password === 'admin123') {
        const adminUser = await User.findOne({ role: 'ADMIN' });
        if (adminUser) {
            const token = this.generateToken(adminUser._id.toString());
            const userObj = adminUser.toObject();
            const { password: _, ...userClean } = userObj as any;
            return { user: userClean, token };
        }
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) throw new Error('Invalid credentials');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error('Invalid credentials');

    const token = this.generateToken(user._id.toString());
    
    const userObj = user.toObject();
    const { password: _, ...userClean } = userObj as any;
    return { user: userClean, token };
  }

  // Get current user by ID
  async getMe(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  // Generate OTP
  async generateOtp(mobile: string): Promise<string> {
    const user = await User.findOne({ mobile });

    const otp = '123456'; 
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (user) {
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();
    } else {
        await OtpModel.create({ mobile, otp, expires: otpExpires });
    }

    console.log(`OTP for ${mobile}: ${otp}`);
    return 'OTP sent successfully';
  }

  // Verify OTP
  async verifyOtp(mobile: string, otp: string, isLogin: boolean, userData?: { fullName: string, email?: string, countryCode?: string }): Promise<{ user: any; token: string }> {
    let user = await User.findOne({ mobile }).select('+otp +otpExpires');

    if (isLogin) {
        if (!user) {
            throw new Error('User not found');
        }
        if (user.otp !== otp) throw new Error('Invalid OTP');
        if (user.otpExpires && user.otpExpires < new Date()) throw new Error('OTP expired');
        
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

    } else {
        // Registration
        if (user) {
             if (user.otp !== otp) throw new Error('Invalid OTP');
        } else {
            const otpRecord = await OtpModel.findOne({ mobile, otp });
            if (!otpRecord) throw new Error('Invalid OTP'); 
            if (otpRecord.expires < new Date()) throw new Error('OTP expired');
            
            if (!userData || !userData.fullName) {
                throw new Error('User data (fullName) is required for registration');
            }
            
            user = await User.create({
                mobile,
                email: userData.email,
                fullName: userData.fullName,
                countryCode: userData.countryCode,
                role: 'USER',
            });
            
            await OtpModel.deleteOne({ _id: otpRecord._id });
        }
    }

    const token = this.generateToken(user._id.toString());
    const userObj = user.toObject();
    const { otp: _otp, otpExpires: _exp, ...userClean } = userObj as any;

    return { user: userClean, token };
  }
}

// Simple OTP Model
import { Schema, model } from 'mongoose';
const otpSchema = new Schema({
    mobile: { type: String, required: true },
    otp: { type: String, required: true },
    expires: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now, expires: 600 } 
});
const OtpModel = model('Otp', otpSchema);

export const authService = new AuthService();
